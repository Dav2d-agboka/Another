const products = [
            {
                id: 9,
                name: "Perfume",
                category: "Beauty",
                price: 89.99,
                image: "19.jpg"
            },
            {
                id: 10,
                name: "Nivea Set",
                category: "Beauty",
                price: 89.99,
                image: "25.jpg"
            },
            {
                id: 11,
                name: "Nivea Sure",
                category: "Beauty",
                price: 89.99,
                image: "27.jpg"
            },
            {
                id: 12,
                name: "Water Bottle",
                category: "Home & Kitchen",
                price: 89.99,
                image: "28.jpg"
            },
            {
                id: 13,
                name: "Sport Watch",
                category: "Sports",
                price: 430,
                image: "37.jpg"
            },
            {
                id: 14,
                name: "Water Bottle",
                category: "Home & Kitchen",
                price: 89.99,
                image: "39.jpg"
            },
            {
                id: 15,
                name: "Gaming Mouse",
                category: "Electronics",
                price: 89.99,
                image: "42.jpg"
            },
            {
                id: 16,
                name: "Adidas Snicker",
                category: "Sports",
                price: 89.99,
                image: "44.jpg"
            },
            {
                id: 9,
                name: "Perfume",
                category: "Beauty",
                price: 89.99,
                image: "19.jpg"
            },
            {
                id: 10,
                name: "Nivea Set",
                category: "Beauty",
                price: 89.99,
                image: "25.jpg"
            },
            {
                id: 11,
                name: "Nivea Sure",
                category: "Beauty",
                price: 89.99,
                image: "27.jpg"
            },
            {
                id: 12,
                name: "Water Bottle",
                category: "Home & Kitchen",
                price: 89.99,
                image: "28.jpg"
            },
        ];
        // DOM Elements
        const productsGrid = document.getElementById('productsGrid');
        const btnPopup = document.querySelector('.btnLogin-popup');
        const cartIcon = document.getElementById('cartIcon');
        const cartContainer = document.getElementById('cartContainer');
        const closeCart = document.getElementById('closeCart');
        const overlay = document.getElementById('overlay');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartCount = document.querySelector('.cart-count');
        // Cart state
        let cart = [];
        // Initialize the page
        function init() {
            renderProducts();
            setupEventListeners();
        }
        // Render products to the page
        function renderProducts() {
            productsGrid.innerHTML = '';
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-actions">
                            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                        </div>
                    </div>
                `;
                productsGrid.appendChild(productCard);
            });
        }
        // Set up event listeners
        function setupEventListeners() {
            // Open cart
            cartIcon.addEventListener('click', () => {
                cartContainer.classList.add('active');
                overlay.classList.add('active');
            });
            // Close cart
            closeCart.addEventListener('click', () => {
                cartContainer.classList.remove('active');
                overlay.classList.remove('active');
            });
            // Close cart when clicking overlay
            overlay.addEventListener('click', () => {
                cartContainer.classList.remove('active');
                overlay.classList.remove('active');
            });
            // Add to cart buttons
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart')) {
                    const productId = parseInt(e.target.getAttribute('data-id'));
                    addToCart(productId);
                }
               
                // Remove item from cart
                if (e.target.classList.contains('remove-item')) {
                    const productId = parseInt(e.target.getAttribute('data-id'));
                    removeFromCart(productId);
                }
            });
            // Category buttons
            const categoryBtns = document.querySelectorAll('.category-btn');
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // In a real app, you would filter products here
                });
            });
        }
        // Add item to cart
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            // Check if product is already in cart
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            updateCart();
            showNotification(`${product.name} added to cart!`);
        }
        // Remove item from cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCart();
        }
        // Update cart UI
        function updateCart() {
            // Update cart items
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = '';
                cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                                <button class="remove-item" data-id="${item.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    cartItems.appendChild(cartItem);
                });
                // Add event listeners for quantity buttons
                document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.getAttribute('data-id'));
                        updateQuantity(id, -1);
                    });
                });
                document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.getAttribute('data-id'));
                        updateQuantity(id, 1);
                    });
                });
            }
            // Calculate total
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `$${total.toFixed(2)}`;
            // Update cart count
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = count;
        }
        // Update item quantity
        function updateQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    updateCart();
                }
            }
        }
        // Show notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--primary);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1001;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateY(0)';
                notification.style.opacity = '1';
            }, 10);
            // Remove after delay
            setTimeout(() => {
                notification.style.transform = 'translateY(100px)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
        // Initialize the application
        document.addEventListener('DOMContentLoaded', init);

        btnPopup.addEventListener('click', ()=> {
            wrapper.classList.add('active-popup');
        });