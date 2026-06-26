/* ══════════════════════════════════════════════════════════════
   D-SWIFT  |  kscript.js
   - Merges built-in + seller products
   - Cart logic
   - Wishlist (heart button)
   - Product detail modal with description + extra images
   - Paystack checkout with 5% Swift fee display
   ══════════════════════════════════════════════════════════════ */

const SWIFT_FEE        = 0.05;
const PAYSTACK_PUB_KEY = 'pk_test_5c141c098cbdf209fcb1258ce762861f7573f8f7';

// ── Built-in products ──
const builtInProducts = [
    { id: 1,  name: "Perfume Set",     category: "Beauty",         price: 89.99,  image: "19.jpg",  sellerId: null, description: "A luxurious perfume set with long-lasting fragrance. Perfect gift for any occasion.", extraImages: [] },
    { id: 2,  name: "Nivea Set",       category: "Beauty",         price: 89.99,  image: "25.jpg",  sellerId: null, description: "Complete Nivea men's skincare set including body lotion, whitening cream and facial foam.", extraImages: [] },
    { id: 3,  name: "Nivea Sure",      category: "Beauty",         price: 45.00,  image: "27.jpg",  sellerId: null, description: "Nivea roll-on deodorant range. 48h protection, anti-perspirant, keeps you fresh all day.", extraImages: [] },
    { id: 4,  name: "Water Bottle",    category: "Home & Kitchen", price: 55.00,  image: "28.jpg",  sellerId: null, description: "Smart LED temperature display water bottle. Stainless steel vacuum insulated, keeps drinks hot or cold for hours.", extraImages: [] },
    { id: 5,  name: "Sport Watch",     category: "Sports",         price: 430.00, image: "37.jpg",  sellerId: null, description: "Feature-packed smart sports watch with heart rate monitor, step counter, and sleep tracking.", extraImages: [] },
    { id: 6,  name: "Marble Bottle",   category: "Home & Kitchen", price: 60.00,  image: "39.jpg",  sellerId: null, description: "Elegant marble-print vacuum flask. Keeps drinks hot for 12h and cold for 24h. Available in 4 designs.", extraImages: [] },
    { id: 7,  name: "Gaming Mouse",    category: "Electronics",    price: 89.99,  image: "42.jpg",  sellerId: null, description: "Professional RGB gaming mouse with adjustable DPI, 6 programmable buttons and ergonomic design.", extraImages: [] },
    { id: 8,  name: "Adidas Sneaker",  category: "Sports",         price: 120.00, image: "44.jpg",  sellerId: null, description: "Lightweight breathable running sneaker with cushioned sole. Keep running in style and comfort.", extraImages: [] },
    { id: 9,  name: "NB Sneaker",      category: "Fashion",        price: 150.00, image: "16.jpg",  sellerId: null, description: "New Balance 530 retro running shoe. White/navy colourway with mesh upper and ABZORB cushioning.", extraImages: [] },
    { id: 10, name: "Smart Bottle",    category: "Home & Kitchen", price: 75.00,  image: "28.jpg",  sellerId: null, description: "Insulated smart bottle with digital temperature display on cap. Perfect for gym, office or travel.", extraImages: [] },
    { id: 11, name: "Nivea Creme",     category: "Beauty",         price: 35.00,  image: "10.jpg",  sellerId: null, description: "The iconic Nivea Crème in the classic blue tin. Multi-purpose moisturiser for face, hands and body.", extraImages: [] },
    { id: 12, name: "Smart Watch",     category: "Electronics",    price: 350.00, image: "37.jpg",  sellerId: null, description: "Full-featured smartwatch with AMOLED display, health monitoring, notifications and 7-day battery life.", extraImages: [] },
];

function getAllProducts() {
    const sellerProducts = JSON.parse(localStorage.getItem('swiftAllProducts') || '[]');
    return [...builtInProducts, ...sellerProducts];
}

// ── Wishlist helpers ──
function getWishlist() { return JSON.parse(localStorage.getItem('swiftWishlist') || '[]'); }
function saveWishlist(list) { localStorage.setItem('swiftWishlist', JSON.stringify(list)); }
function isWishlisted(id) { return getWishlist().includes(id); }
function toggleWishlist(id) {
    const list = getWishlist();
    const idx  = list.indexOf(id);
    if (idx > -1) list.splice(idx, 1);
    else list.push(id);
    saveWishlist(list);
    updateWishlistBadge();
    return idx === -1; // true = now wishlisted
}

// ── DOM Elements ──
const productsGrid   = document.getElementById('productsGrid');
const cartIcon       = document.getElementById('cartIcon');
const mobileCartIcon = document.getElementById('mobileCartIcon');
const mobCartBtn     = document.getElementById('mobCartBtn');
const cartContainer  = document.getElementById('cartContainer');
const closeCart      = document.getElementById('closeCart');
const overlay        = document.getElementById('overlay');
const cartItemsEl    = document.getElementById('cartItems');
const cartTotalEl    = document.getElementById('cartTotal');
const checkoutBtn    = document.querySelector('.checkout-btn');

let cart = [];
let currentCategory = 'all';

function init() {
    renderProducts();
    setupEventListeners();
    startBannerSlider();
    startFlashTimer();
    updateNavForUser();
    injectPaystackScript();
    createProductModal();
    setupWishlistPanel();
    updateWishlistBadge();
}


function setupWishlistPanel() {
    const closeBtn = document.getElementById('closeWishlist');
    const overlay  = document.getElementById('wishlistOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeWishlistPanel);
    if (overlay)  overlay.addEventListener('click', closeWishlistPanel);
}

// ── Inject Paystack SDK ──
function injectPaystackScript() {
    if (document.getElementById('paystackScript')) return;
    const s  = document.createElement('script');
    s.id     = 'paystackScript';
    s.src    = 'https://js.paystack.co/v1/inline.js';
    s.async  = true;
    document.head.appendChild(s);
}

// ══════════════════════════════════════════════
//  PRODUCT DETAIL MODAL
// ══════════════════════════════════════════════
function createProductModal() {
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.innerHTML = `
    <div class="pm-backdrop" id="pmBackdrop"></div>
    <div class="pm-sheet" id="pmSheet">
        <button class="pm-close" id="pmClose"><i class="fas fa-times"></i></button>
        <div class="pm-gallery" id="pmGallery"></div>
        <div class="pm-thumbs" id="pmThumbs"></div>
        <div class="pm-body">
            <div class="pm-cat" id="pmCat"></div>
            <h2 class="pm-name" id="pmName"></h2>
            <div class="pm-price" id="pmPrice"></div>
            <div class="pm-seller" id="pmSeller"></div>
            <div class="pm-desc-label">Description</div>
            <div class="pm-desc" id="pmDesc"></div>
            <div class="pm-actions">
                <button class="pm-wishlist-btn" id="pmWishBtn"><i class="fas fa-heart"></i> <span>Wishlist</span></button>
                <button class="pm-cart-btn" id="pmCartBtn"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
            </div>
        </div>
    </div>`;
    document.body.appendChild(modal);

    document.getElementById('pmBackdrop').addEventListener('click', closeProductModal);
    document.getElementById('pmClose').addEventListener('click', closeProductModal);
}

let _currentModalProduct = null;

function openProductModal(product) {
    _currentModalProduct = product;
    const modal = document.getElementById('productModal');

    // Gallery — main image + extra images
    const allImages = [product.image, ...(product.extraImages || [])].filter(Boolean);
    const gallery   = document.getElementById('pmGallery');
    const thumbs    = document.getElementById('pmThumbs');

    gallery.innerHTML = allImages.length
        ? `<img src="${allImages[0]}" class="pm-main-img" id="pmMainImg" alt="${product.name}">`
        : `<div class="pm-no-img"><i class="fas fa-image"></i></div>`;

    thumbs.innerHTML = allImages.length > 1
        ? allImages.map((img, i) =>
            `<img src="${img}" class="pm-thumb ${i===0?'active':''}" onclick="switchModalImg(this,'${img}')" alt="img${i}">`
          ).join('')
        : '';

    // Info
    document.getElementById('pmCat').textContent    = product.category || '';
    document.getElementById('pmName').textContent   = product.name;
    document.getElementById('pmPrice').textContent  = `GH₵ ${parseFloat(product.price).toFixed(2)}`;
    document.getElementById('pmSeller').innerHTML   = product.sellerId
        ? `<i class="fas fa-store"></i> Sold by ${product.sellerName || 'Seller'}`
        : `<i class="fas fa-store"></i> Sold by D-Swift`;
    document.getElementById('pmDesc').textContent   = product.description || 'No description provided.';

    // Wishlist button state
    const wishBtn = document.getElementById('pmWishBtn');
    const wishlisted = isWishlisted(product.id);
    wishBtn.classList.toggle('active', wishlisted);
    wishBtn.querySelector('span').textContent = wishlisted ? 'Wishlisted' : 'Wishlist';

    wishBtn.onclick = () => {
        const now = toggleWishlist(product.id);
        wishBtn.classList.toggle('active', now);
        wishBtn.querySelector('span').textContent = now ? 'Wishlisted' : 'Wishlist';
        updateAllHearts();
        showNotification(now ? `${product.name} added to wishlist!` : `Removed from wishlist.`);
    };

    // Cart button
    document.getElementById('pmCartBtn').onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    // Show
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
    _currentModalProduct = null;
}

function switchModalImg(thumb, src) {
    document.getElementById('pmMainImg').src = src;
    document.querySelectorAll('.pm-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// ── Render products ──
function renderProducts(cat = 'all') {
    const all      = getAllProducts();
    const filtered = cat === 'all' ? all : all.filter(p => p.category === cat);
    productsGrid.innerHTML = '';
    filtered.forEach(product => {
        const wishlisted = isWishlisted(product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        const sellerBadge = product.sellerId
            ? `<div style="font-size:0.65rem;color:#888;margin-top:2px;">by ${product.sellerName || 'Seller'}</div>`
            : '';
        card.innerHTML = `
            <div class="product-image" style="position:relative; cursor:pointer;" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" loading="lazy"
                     onerror="this.style.background='#f0f0f0';this.src='';">
                <button class="heart-btn ${wishlisted ? 'active' : ''}" data-id="${product.id}" title="Wishlist">
                    <i class="${wishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="product-info" style="cursor:pointer;" data-id="${product.id}">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                ${sellerBadge}
                <div class="product-price">GH&#8373; ${parseFloat(product.price).toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>`;
        productsGrid.appendChild(card);
    });
}

function updateAllHearts() {
    document.querySelectorAll('.heart-btn').forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        const on = isWishlisted(id);
        btn.classList.toggle('active', on);
        btn.querySelector('i').className = on ? 'fas fa-heart' : 'far fa-heart';
    });
}

// ── Event listeners ──
function setupEventListeners() {
    [cartIcon, mobileCartIcon, mobCartBtn].forEach(el => {
        if (el) el.addEventListener('click', openCart);
    });
    if (closeCart) closeCart.addEventListener('click', closeCartFn);
    if (overlay)   overlay.addEventListener('click', closeCartFn);

    document.addEventListener('click', e => {
        // Heart / wishlist button
        const heartBtn = e.target.closest('.heart-btn');
        if (heartBtn) {
            e.stopPropagation();
            const id  = parseInt(heartBtn.getAttribute('data-id'));
            const product = getAllProducts().find(p => p.id === id);
            const now = toggleWishlist(id);
            heartBtn.classList.toggle('active', now);
            heartBtn.querySelector('i').className = now ? 'fas fa-heart' : 'far fa-heart';
            showNotification(now ? `${product?.name || 'Item'} added to wishlist!` : 'Removed from wishlist.');
            return;
        }

        // Add to cart button
        if (e.target.classList.contains('add-to-cart')) {
            e.stopPropagation();
            addToCart(parseInt(e.target.getAttribute('data-id')));
            return;
        }

        // Remove from cart
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) { removeFromCart(parseInt(removeBtn.getAttribute('data-id'))); return; }

        // Click on product image or info — open modal
        const imgArea  = e.target.closest('.product-image[data-id]');
        const infoArea = e.target.closest('.product-info[data-id]');
        const clickedId = (imgArea || infoArea)?.getAttribute('data-id');
        if (clickedId) {
            const product = getAllProducts().find(p => p.id === parseInt(clickedId));
            if (product) openProductModal(product);
        }
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-cat') || 'all';
            renderProducts(currentCategory);
        });
    });

    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);
}

function openCart()    { cartContainer.classList.add('active');    overlay.classList.add('active'); }
function closeCartFn() { cartContainer.classList.remove('active'); overlay.classList.remove('active'); }

// ── Cart ──
function addToCart(id) {
    const product = getAllProducts().find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCart();
    showNotification(`${product.name} added to cart!`);
}
function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}
function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(id);
    else updateCart();
}

function updateCart() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const total    = subtotal;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-cart"></i><p>Your cart is empty</p></div>`;
    } else {
        cartItemsEl.innerHTML = '';
        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-image"><img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'"></div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">GH&#8373; ${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus"  data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
            cartItemsEl.appendChild(el);
        });
        document.querySelectorAll('.quantity-btn.minus').forEach(btn =>
            btn.addEventListener('click', e => updateQuantity(parseInt(e.currentTarget.getAttribute('data-id')), -1)));
        document.querySelectorAll('.quantity-btn.plus').forEach(btn =>
            btn.addEventListener('click', e => updateQuantity(parseInt(e.currentTarget.getAttribute('data-id')), 1)));
    }

    if (cartTotalEl) cartTotalEl.textContent = `GH₵ ${total.toFixed(2)}`;
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

// ── Checkout with Paystack ──
function handleCheckout() {
    if (cart.length === 0) return;
    const loggedIn = localStorage.getItem('swiftLoggedIn') === 'true';
    if (!loggedIn) {
        showNotification('Please login to checkout!');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }
    const user = JSON.parse(localStorage.getItem('swiftCurrentUser') || 'null');
    if (!user) { showNotification('Session expired. Please login again.'); window.location.href = 'login.html'; return; }
    const total     = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalKobo = Math.round(total * 100);
    if (typeof PaystackPop === 'undefined') { showNotification('Payment system loading… please try again.'); return; }
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUB_KEY, email: user.email, amount: totalKobo, currency: 'GHS',
        ref: 'DSWIFT-' + Date.now(),
        metadata: { custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: user.name },
            { display_name: 'Items', variable_name: 'items', value: cart.map(i => `${i.name} x${i.quantity}`).join(', ') }
        ]},
        callback:  response => onPaymentSuccess(response, user, total),
        onClose:   () => showNotification('Payment cancelled.')
    });
    handler.openIframe();
}

function onPaymentSuccess(response, user, total) {
    const users = JSON.parse(localStorage.getItem('swiftUsers') || '[]');
    cart.forEach(item => {
        if (!item.sellerId) return;
        const sellerIdx = users.findIndex(u => u.id === item.sellerId);
        if (sellerIdx === -1) return;
        const gross = item.price * item.quantity;
        const fee   = gross * SWIFT_FEE;
        const net   = gross - fee;
        if (!users[sellerIdx].sales) users[sellerIdx].sales = [];
        users[sellerIdx].sales.push({ productName: item.name, qty: item.quantity, gross, fee, net, date: new Date().toLocaleDateString(), ref: response.reference });
        users[sellerIdx].totalEarnings = (users[sellerIdx].totalEarnings || 0) + net;
    });
    const buyerIdx = users.findIndex(u => u.id === user.id);
    if (buyerIdx > -1) {
        if (!users[buyerIdx].orders) users[buyerIdx].orders = [];
        users[buyerIdx].orders.push({ id: Date.now(), ref: response.reference, items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price })), total, date: new Date().toLocaleDateString(), status: 'Paid ✓' });
        localStorage.setItem('swiftCurrentUser', JSON.stringify(users[buyerIdx]));
    }
    localStorage.setItem('swiftUsers', JSON.stringify(users));
    showNotification('Payment successful! Order confirmed 🎉');
    cart = []; updateCart(); closeCartFn();
}

// ── Update nav based on login state ──
function updateNavForUser() {
    const loggedIn = localStorage.getItem('swiftLoggedIn') === 'true';
    const u        = JSON.parse(localStorage.getItem('swiftCurrentUser') || 'null');
    if (!loggedIn || !u) return;
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    if (loginLink) {
        loginLink.href      = u.role === 'seller' ? 'seller.html' : 'profile.html';
        loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${u.name.split(' ')[0]}`;
    }
    const mobAcc = document.querySelector('.mobile-bottom-nav a[href="profile.html"], .mobile-bottom-nav a[href="login.html"]');
    if (mobAcc) mobAcc.href = u.role === 'seller' ? 'seller.html' : 'profile.html';
}

// ── Notification toast ──
function showNotification(msg) {
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = `position:fixed;bottom:80px;right:16px;background:var(--primary);color:white;
        padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);
        z-index:3000;transform:translateY(60px);opacity:0;transition:all 0.3s;font-size:0.85rem;max-width:280px;`;
    document.body.appendChild(n);
    setTimeout(() => { n.style.transform = 'translateY(0)'; n.style.opacity = '1'; }, 10);
    setTimeout(() => { n.style.transform = 'translateY(60px)'; n.style.opacity = '0'; setTimeout(() => document.body.removeChild(n), 300); }, 3000);
}

// ── Banner slider ──
function startBannerSlider() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots   = document.querySelectorAll('.dot');
    if (!slides.length) return;
    let current = 0;
    function goTo(i) {
        slides[current].classList.remove('active'); dots[current] && dots[current].classList.remove('active');
        current = i % slides.length;
        slides[current].classList.add('active'); dots[current] && dots[current].classList.add('active');
    }
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    setInterval(() => goTo(current + 1), 3500);
}

// ── Flash sale countdown ──
function startFlashTimer() {
    const el = document.getElementById('flashTimer');
    if (!el) return;
    let secs = 6 * 3600;
    setInterval(() => {
        secs--;
        if (secs < 0) secs = 6 * 3600;
        const h = String(Math.floor(secs / 3600)).padStart(2, '0');
        const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        el.textContent = `${h}h : ${m}m : ${s}s`;
    }, 1000);
}


// ══════════════════════════════════════════════
//  WISHLIST PANEL
// ══════════════════════════════════════════════
function openWishlistPanel() {
    renderWishlistPanel();
    document.getElementById('wishlistPanel').classList.add('active');
    document.getElementById('wishlistOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeWishlistPanel() {
    document.getElementById('wishlistPanel').classList.remove('active');
    document.getElementById('wishlistOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function renderWishlistPanel() {
    const wishlistIds = getWishlist();
    const allProducts = getAllProducts();
    const items = allProducts.filter(p => wishlistIds.includes(p.id));
    const el = document.getElementById('wishlistItemsList');

    // Update badge
    updateWishlistBadge();

    if (!items.length) {
        el.innerHTML = `<div class="cart-empty">
            <i class="fas fa-heart" style="color:#ffcdd2;"></i>
            <p>Your wishlist is empty</p>
            <p style="font-size:0.8rem;color:#bbb;margin-top:4px;">Tap the ❤️ on any product to save it here</p>
        </div>`;
        return;
    }

    el.innerHTML = items.map(p => `
        <div class="wl-item" id="wl-${p.id}">
            <img class="wl-item-img" src="${p.image || ''}" alt="${p.name}"
                 onerror="this.style.background='#f0f0f0';this.src='';">
            <div class="wl-item-info">
                <div class="wl-item-cat">${p.category}</div>
                <div class="wl-item-name">${p.name}</div>
                <div class="wl-item-price">GH₵ ${parseFloat(p.price).toFixed(2)}</div>
            </div>
            <div class="wl-item-btns">
                <button class="wl-add-cart" onclick="addToCartFromWishlist(${p.id})">
                    <i class="fas fa-cart-plus"></i> Cart
                </button>
                <button class="wl-remove" onclick="removeFromWishlistPanel(${p.id})">
                    <i class="fas fa-heart-broken"></i> Remove
                </button>
            </div>
        </div>`).join('');
}

function addToCartFromWishlist(id) {
    addToCart(id);
    // Don't close — let user keep browsing wishlist
}

function removeFromWishlistPanel(id) {
    toggleWishlist(id); // toggles off since it's already in
    updateAllHearts();
    // Remove the row with animation
    const row = document.getElementById('wl-' + id);
    if (row) {
        row.style.transition = 'opacity 0.25s, transform 0.25s';
        row.style.opacity = '0';
        row.style.transform = 'translateX(40px)';
        setTimeout(() => renderWishlistPanel(), 260);
    }
}

function updateWishlistBadge() {
    const count = getWishlist().length;
    const badge = document.getElementById('wishlistBadge');
    if (!badge) return;
    if (count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
    else { badge.style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', init);
