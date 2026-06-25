const SWIFT_FEE = 0.05;

// ── Built-in products ──
const builtInProducts = [
    { id: 1,  name: "Perfume Set",     category: "Beauty",         price: 89.99,  image: "19.jpg",  sellerId: null },
    { id: 2,  name: "Nivea Set",       category: "Beauty",         price: 89.99,  image: "25.jpg",  sellerId: null },
    { id: 3,  name: "Nivea Sure",      category: "Beauty",         price: 45.00,  image: "27.jpg",  sellerId: null },
    { id: 4,  name: "Water Bottle",    category: "Home & Kitchen", price: 55.00,  image: "28.jpg",  sellerId: null },
    { id: 5,  name: "Sport Watch",     category: "Sports",         price: 430.00, image: "37.jpg",  sellerId: null },
    { id: 6,  name: "Marble Bottle",   category: "Home & Kitchen", price: 60.00,  image: "39.jpg",  sellerId: null },
    { id: 7,  name: "Gaming Mouse",    category: "Electronics",    price: 89.99,  image: "42.jpg",  sellerId: null },
    { id: 8,  name: "Adidas Sneaker",  category: "Sports",         price: 120.00, image: "44.jpg",  sellerId: null },
    { id: 9,  name: "NB Sneaker",      category: "Fashion",        price: 150.00, image: "16.jpg",  sellerId: null },
    { id: 10, name: "Smart Bottle",    category: "Home & Kitchen", price: 75.00,  image: "28.jpg",  sellerId: null },
    { id: 11, name: "Nivea Creme",     category: "Beauty",         price: 35.00,  image: "10.jpg",  sellerId: null },
    { id: 12, name: "Smart Watch",     category: "Electronics",    price: 350.00, image: "37.jpg",  sellerId: null },
];

// Merge built-in + seller products
function getAllProducts() {
    const sellerProducts = JSON.parse(localStorage.getItem('swiftAllProducts') || '[]');
    return [...builtInProducts, ...sellerProducts];
}

// DOM Elements
const productsGrid   = document.getElementById('productsGrid');
const cartIcon       = document.getElementById('cartIcon');
const mobileCartIcon = document.getElementById('mobileCartIcon');
const mobCartBtn     = document.getElementById('mobCartBtn');
const cartContainer  = document.getElementById('cartContainer');
const closeCart      = document.getElementById('closeCart');
const overlay        = document.getElementById('overlay');
const cartItemsEl    = document.getElementById('cartItems');
const cartTotalEl    = document.getElementById('cartTotal');

let cart = [];
let currentCategory = 'all';

function init() {
    renderProducts();
    setupEventListeners();
    startBannerSlider();
    startFlashTimer();
    updateNavForUser();
}

// ── Render products ──
function renderProducts(cat = 'all') {
    const all      = getAllProducts();
    const filtered = cat === 'all' ? all : all.filter(p => p.category === cat);
    productsGrid.innerHTML = '';
    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const sellerBadge = product.sellerId
            ? `<div style="font-size:0.65rem;color:#888;margin-top:2px;">by ${product.sellerName || 'Seller'}</div>`
            : '';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy"
                     onerror="this.style.background='#f0f0f0';this.style.display='none'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                ${sellerBadge}
                <div class="product-price">GH&#8373; ${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>`;
        productsGrid.appendChild(card);
    });
}

// ── Event listeners ──
function setupEventListeners() {
    [cartIcon, mobileCartIcon, mobCartBtn].forEach(el => {
        if (el) el.addEventListener('click', openCart);
    });
    closeCart.addEventListener('click', closeCartFn);
    overlay.addEventListener('click', closeCartFn);

    document.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            addToCart(parseInt(e.target.getAttribute('data-id')));
        }
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) removeFromCart(parseInt(removeBtn.getAttribute('data-id')));
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-cat') || 'all';
            renderProducts(currentCategory);
        });
    });
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

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    cartTotalEl.textContent = `GH₵ ${total.toFixed(2)}`;
    const count = cart.reduce((s, i) => s + i.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

// ── Checkout — records sale to seller ──
document.querySelector('.checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) return;

    const loggedIn = localStorage.getItem('swiftLoggedIn') === 'true';
    if (!loggedIn) {
        showNotification('Please login to checkout!');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }

    const users = JSON.parse(localStorage.getItem('swiftUsers') || '[]');

    cart.forEach(item => {
        if (!item.sellerId) return; // built-in product, no seller to credit
        const sellerIdx = users.findIndex(u => u.id === item.sellerId);
        if (sellerIdx === -1) return;

        const gross = item.price * item.quantity;
        const fee   = gross * SWIFT_FEE;
        const net   = gross - fee;

        if (!users[sellerIdx].sales) users[sellerIdx].sales = [];
        users[sellerIdx].sales.push({
            productName: item.name,
            qty:   item.quantity,
            gross: gross,
            net:   net,
            date:  new Date().toLocaleDateString()
        });
        users[sellerIdx].totalEarnings = (users[sellerIdx].totalEarnings || 0) + net;
    });

    localStorage.setItem('swiftUsers', JSON.stringify(users));

    // Save order to buyer's history
    const currentUser = JSON.parse(localStorage.getItem('swiftCurrentUser') || 'null');
    if (currentUser) {
        const allUsers = JSON.parse(localStorage.getItem('swiftUsers') || '[]');
        const buyerIdx = allUsers.findIndex(u => u.id === currentUser.id);
        if (buyerIdx > -1) {
            if (!allUsers[buyerIdx].orders) allUsers[buyerIdx].orders = [];
            allUsers[buyerIdx].orders.push({
                id:    Date.now(),
                items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
                total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
                date:  new Date().toLocaleDateString(),
                status: 'Processing'
            });
            localStorage.setItem('swiftUsers', JSON.stringify(allUsers));
            localStorage.setItem('swiftCurrentUser', JSON.stringify(allUsers[buyerIdx]));
        }
    }

    showNotification('Order placed successfully! 🎉');
    cart = [];
    updateCart();
    closeCartFn();
});

// ── Update nav based on login state ──
function updateNavForUser() {
    const loggedIn = localStorage.getItem('swiftLoggedIn') === 'true';
    const u        = JSON.parse(localStorage.getItem('swiftCurrentUser') || 'null');
    if (!loggedIn || !u) return;

    // Desktop nav — change Login to user's name
    const loginLink = document.querySelector('.nav-links a[href="login.html"]');
    if (loginLink) {
        loginLink.href = u.role === 'seller' ? 'seller.html' : 'profile.html';
        loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${u.name.split(' ')[0]}`;
    }

    // Mobile account tab
    const mobAcc = document.querySelector('.mobile-bottom-nav a[href="profile.html"], .mobile-bottom-nav a[href="login.html"]');
    if (mobAcc) mobAcc.href = u.role === 'seller' ? 'seller.html' : 'profile.html';
}

// ── Notification ──
function showNotification(msg) {
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.cssText = `position:fixed;bottom:80px;right:16px;background:var(--primary);color:white;
        padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);
        z-index:2000;transform:translateY(60px);opacity:0;transition:all 0.3s;font-size:0.85rem;`;
    document.body.appendChild(n);
    setTimeout(() => { n.style.transform = 'translateY(0)'; n.style.opacity = '1'; }, 10);
    setTimeout(() => {
        n.style.transform = 'translateY(60px)'; n.style.opacity = '0';
        setTimeout(() => document.body.removeChild(n), 300);
    }, 2500);
}

// ── Banner slider ──
function startBannerSlider() {
    const slides = document.querySelectorAll('.banner-slide');
    const dots   = document.querySelectorAll('.dot');
    if (!slides.length) return;
    let current = 0;
    function goTo(i) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = i % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
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

document.addEventListener('DOMContentLoaded', init);
