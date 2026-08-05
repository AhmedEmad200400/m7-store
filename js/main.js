// ♦️𝑴7♦️ - Mock Database & Interactivity

const firebaseConfig = {
  apiKey: "AIzaSyATftkOg3-qIrCzlwDfSN2ozjZB3ZTWsxg",
  authDomain: "m7-store-91a9c.firebaseapp.com",
  databaseURL: "https://m7-store-91a9c-default-rtdb.firebaseio.com",
  projectId: "m7-store-91a9c",
  storageBucket: "m7-store-91a9c.firebasestorage.app",
  messagingSenderId: "838102550989",
  appId: "1:838102550989:web:c6c81e307ef6a51fef1c84"
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

let mockProducts = [];

window.db.ref('products').on('value', (snapshot) => {
    mockProducts = [];
    snapshot.forEach((child) => {
        mockProducts.unshift(child.val());
    });
    
    if (typeof renderCatalogTable === 'function') renderCatalogTable();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderProductDetails === 'function') renderProductDetails();
}, (error) => {
    console.error("Firebase Read Error:", error);
});

// Global State
let cartItems = JSON.parse(localStorage.getItem('m7_cart')) || [];
let wishlistItems = JSON.parse(localStorage.getItem('m7_wishlist')) || [];
let orders = JSON.parse(localStorage.getItem('m7_orders')) || [];

// ==========================================
// CART & CHECKOUT LOGIC
// ==========================================
function updateCartUI() {
    const count = cartItems.length;
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.innerText = count;
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });

    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    
    if (container) {
        container.innerHTML = '';
        let total = 0;

        if (cartItems.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--color-gray-dark);">Your bag is empty.</p>';
            if(totalEl) totalEl.innerText = `EGP 0`;
        } else {
            cartItems.forEach((item, index) => {
                total += item.price;
                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-info">
                            <div class="cart-item-brand">${item.brand}</div>
                            <div class="cart-item-title">${item.title} ${item.size ? `<strong style="color:var(--color-accent);">(Size: ${item.size})</strong>` : ''}</div>
                            <div class="cart-item-price">EGP ${item.price}</div>
                            <span class="cart-item-remove" onclick="removeFromCart(${index})">Remove</span>
                        </div>
                    </div>
                `;
            });
            if(totalEl) totalEl.innerText = `EGP ${total}`;
        }
    }
}

function saveCart() {
    localStorage.setItem('m7_cart', JSON.stringify(cartItems));
    updateCartUI();
}

function addToCart(productId) {
    let pId = productId;
    if (!pId) {
        const urlParams = new URLSearchParams(window.location.search);
        pId = urlParams.get('id');
    }
    const baseProduct = mockProducts.find(p => p.id == pId);
    if (baseProduct) {
        // Create a copy of the product so we can attach unique sizes
        const product = JSON.parse(JSON.stringify(baseProduct));
        
        // If adding from product page, require and grab the size
        if (!productId) {
            const activeSizeBtn = document.querySelector('.size-options .size-btn:not(.color-btn).active');
            if (activeSizeBtn) {
                product.size = activeSizeBtn.innerText;
            } else {
                const isPerfume = product.categories && product.categories.includes('perfumes');
                return alert(isPerfume ? "Please select a bottle size (50 ml, 100 ml, or 200 ml) before adding to bag!" : "Please select a size before adding to bag!");
            }

            // Grab selected color if product has available colors
            const activeColorBtn = document.querySelector('.color-btn.active');
            if (activeColorBtn) {
                product.selectedColor = activeColorBtn.innerText;
                product.title = `${product.title} (${product.selectedColor})`;
            } else if (product.colors && product.colors.length > 0) {
                return alert("Please select a color before adding to bag!");
            }
        }

        cartItems.push(product);
        saveCart();
        toggleCart(true);

        const btn = document.getElementById('add-to-cart-btn');
        if (btn) {
            const originalText = btn.innerText;
            btn.innerText = "ADDED TO BAG ✓";
            btn.style.background = "var(--color-accent)";
            btn.style.borderColor = "var(--color-accent)";
            btn.style.color = "var(--color-secondary)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "var(--color-primary)";
                btn.style.borderColor = "var(--color-primary)";
            }, 2000);
        }
    }
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCart();
}

function toggleCart(forceOpen = false) {
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');
    if (overlay && panel) {
        if (forceOpen) {
            overlay.classList.add('active');
            panel.classList.add('active');
        } else {
            overlay.classList.toggle('active');
            panel.classList.toggle('active');
        }
    }
}

// Checkout Form Toggles
function showCheckoutForm() {
    if(cartItems.length === 0) return alert("Your bag is empty!");
    document.getElementById('cart-view-items').style.display = 'none';
    document.getElementById('cart-view-checkout').style.display = 'flex';
}
function hideCheckoutForm() {
    document.getElementById('cart-view-checkout').style.display = 'none';
    document.getElementById('cart-view-items').style.display = 'block';
}

async function submitOrder(e) {
    e.preventDefault();
    if(cartItems.length === 0) return;

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    
    let total = cartItems.reduce((sum, item) => sum + item.price, 0);

    const order = {
        id: "ORD-" + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        customer: { name, phone, address },
        items: [...cartItems],
        total: total,
        status: "New"
    };

    // 1. Save locally for fallback
    orders.push(order);
    localStorage.setItem('m7_orders', JSON.stringify(orders));

    // 2. Push to Firebase Global Database
    try {
        window.db.ref('orders/' + order.id).set(order);
    } catch(err) {
        console.error("Firebase error", err);
    }
    
    // Clear cart
    cartItems = [];
    saveCart();
    hideCheckoutForm();
    toggleCart(false);
    
    alert(`Thank you, ${name}! Your order (${order.id}) has been received and will be paid via Cash on Delivery.`);
}


// ==========================================
// WISHLIST LOGIC
// ==========================================
function updateWishlistUI() {
    const count = wishlistItems.length;
    document.querySelectorAll('.wishlist-count').forEach(badge => {
        badge.innerText = count;
        badge.style.transform = 'scale(1.5)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    });

    const container = document.getElementById('wishlist-items-container');
    if (container) {
        container.innerHTML = '';
        if (wishlistItems.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--color-gray-dark);">Your wishlist is empty.</p>';
        } else {
            wishlistItems.forEach((item, index) => {
                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-info">
                            <div class="cart-item-brand">${item.brand}</div>
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">EGP ${item.price}</div>
                            <div style="margin-top: 8px;">
                                <span class="cart-item-remove" onclick="removeFromWishlist(${index})" style="color:var(--color-gray-dark); margin-right: 10px;">Remove</span>
                                <span class="cart-item-remove" onclick="addToCart(${item.id}); removeFromWishlist(${index});" style="color:var(--color-primary); font-weight: 700;">Move to Bag</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    }
}

function saveWishlist() {
    localStorage.setItem('m7_wishlist', JSON.stringify(wishlistItems));
    updateWishlistUI();
}

function toggleWishlist(event, element, isProductPage = false) {
    event.stopPropagation();
    
    let productId;
    if (isProductPage) {
        const urlParams = new URLSearchParams(window.location.search);
        productId = parseInt(urlParams.get('id'));
    } else {
        // Extract ID from parent card (requires passing ID to render function)
        // For simplicity in this static prototype, if we don't have ID easily available from the element
        // We'll rely on the global rendering function to pass it. 
        // Wait, the grid render function doesn't pass ID to toggleWishlist currently. Let's fix that.
    }
    
    if(!productId) {
        // Fallback if ID wasn't passed directly (used in old grid render)
        // I will update renderProducts to pass ID.
        return;
    }

    const index = wishlistItems.findIndex(p => p.id === productId);
    if (index > -1) {
        // Remove
        wishlistItems.splice(index, 1);
        if(element) {
            element.classList.remove('active');
            element.querySelector('i').className = 'fa-regular fa-heart';
        }
    } else {
        // Add
        const product = mockProducts.find(p => p.id === productId);
        if(product) {
            wishlistItems.push(product);
            if(element) {
                element.classList.add('active');
                element.querySelector('i').className = 'fa-solid fa-heart';
            }
        }
    }
    saveWishlist();
}

// Fixed toggle for grid cards
function toggleWishlistFromGrid(event, element, productId) {
    event.stopPropagation();
    const index = wishlistItems.findIndex(p => p.id === productId);
    if (index > -1) {
        wishlistItems.splice(index, 1);
        element.classList.remove('active');
        element.querySelector('i').className = 'fa-regular fa-heart';
    } else {
        const product = mockProducts.find(p => p.id === productId);
        if(product) {
            wishlistItems.push(product);
            element.classList.add('active');
            element.querySelector('i').className = 'fa-solid fa-heart';
        }
    }
    saveWishlist();
}

function removeFromWishlist(index) {
    wishlistItems.splice(index, 1);
    saveWishlist();
    // Re-render grid to update heart icons
    renderProducts();
}

function toggleWishlistPanel() {
    const overlay = document.getElementById('wishlist-overlay');
    const panel = document.getElementById('wishlist-panel');
    if (overlay && panel) {
        overlay.classList.toggle('active');
        panel.classList.toggle('active');
    }
}


// ==========================================
// RENDERING LOGIC
// ==========================================
function renderProducts() {
    const grid = document.getElementById('dynamic-product-grid');
    if (!grid) return;

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    let filteredProducts = mockProducts;

    if (category) {
        const sectionTitle = document.querySelector('.section-title');
        filteredProducts = mockProducts.filter(p => p.categories && p.categories.includes(category));
        if (heroTitle) heroTitle.innerText = `${category.toUpperCase()} COLLECTION`;
        if (heroSubtitle) heroSubtitle.innerText = `Explore the latest trends in ${category} fashion.`;
        if (sectionTitle) sectionTitle.innerText = `${category.toUpperCase()} PRODUCTS`;
    } else {
        const sectionTitle = document.querySelector('.section-title');
        if (sectionTitle) sectionTitle.innerText = "New Arrivals";
    }

    grid.innerHTML = ''; 

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%; padding:40px;">No products found in this category.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
        const badgeHTML = product.badge 
            ? `<span class="discount-badge" ${product.badge === 'NEW' || product.badge === 'BESTSELLER' ? 'style="background:#000"' : ''}>${product.badge}</span>` 
            : '';
            
        const oldPriceHTML = product.oldPrice 
            ? `<span class="price-old">EGP ${product.oldPrice}</span>` 
            : '';

        // Check if in wishlist
        const isWished = wishlistItems.find(p => p.id === product.id);
        const heartClass = isWished ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        const activeClass = isWished ? 'active' : '';

        const cardHTML = `
            <article class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="product-image-wrapper">
                    ${badgeHTML}
                    <div class="wishlist-btn ${activeClass}" onclick="toggleWishlistFromGrid(event, this, ${product.id})"><i class="${heartClass}"></i></div>
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">EGP ${product.price} ${oldPriceHTML}</div>
                </div>
            </article>
        `;
        grid.innerHTML += cardHTML;
    });
}

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) return; 
    
    const product = mockProducts.find(p => p.id == productId) || mockProducts[0];
    
    const mainImage = document.getElementById('pd-main-image');
    const brand = document.getElementById('pd-brand');
    const title = document.getElementById('pd-title');
    const price = document.getElementById('pd-price');
    const oldPrice = document.getElementById('pd-old-price');
    const wishBtn = document.getElementById('pd-wishlist-btn');
    
    const imageList = (product.images && Array.isArray(product.images) && product.images.length > 0) 
        ? product.images 
        : [product.image];
    
    if (mainImage) mainImage.src = imageList[0];
    const thumbContainer = document.querySelector('.gallery-thumbnails');
    if (thumbContainer) {
        thumbContainer.innerHTML = imageList.map((imgUrl, idx) => `
            <img src="${imgUrl}" class="${idx === 0 ? 'active' : ''}" alt="Thumb ${idx + 1}" onclick="switchGalleryImage('${imgUrl}', this)" style="width: 64px; height: 80px; object-fit: cover; cursor: pointer; border-radius: 4px; border: 2px solid ${idx === 0 ? 'var(--color-primary)' : 'transparent'};">
        `).join('');
    }
    if (brand) brand.innerText = product.brand;
    if (title) title.innerText = product.title;
    if (price) price.innerText = `EGP ${product.price}`;
    
    if (oldPrice && product.oldPrice) {
        oldPrice.innerText = `EGP ${product.oldPrice}`;
    } else if (oldPrice) {
        oldPrice.style.display = 'none';
    }

    if (wishBtn) {
        const isWished = wishlistItems.find(p => p.id === product.id);
        if(isWished) {
            wishBtn.classList.add('active');
            wishBtn.querySelector('i').className = 'fa-solid fa-heart';
        }
    }

    // Dynamic Size / Bottle Size Selector based on product category
    const sizeSelector = document.querySelector('.size-selector');
    if (sizeSelector) {
        const titleEl = sizeSelector.querySelector('h3');
        const optionsEl = sizeSelector.querySelector('.size-options');
        
        if (product.categories && product.categories.includes('perfumes')) {
            if (titleEl) titleEl.innerText = "Select Bottle Size";
            if (optionsEl) {
                optionsEl.innerHTML = `
                    <button class="size-btn" onclick="selectSize(this)">50 ml</button>
                    <button class="size-btn" onclick="selectSize(this)">100 ml</button>
                    <button class="size-btn" onclick="selectSize(this)">200 ml</button>
                `;
            }
        } else if (product.categories && product.categories.includes('accessories') && !product.categories.includes('women') && !product.categories.includes('men')) {
            if (titleEl) titleEl.innerText = "Size";
            if (optionsEl) {
                optionsEl.innerHTML = `
                    <button class="size-btn active" onclick="selectSize(this)">One Size</button>
                `;
            }
        } else {
            if (titleEl) titleEl.innerText = "Select Size";
            if (optionsEl) {
                optionsEl.innerHTML = `
                    <button class="size-btn" onclick="selectSize(this)">M</button>
                    <button class="size-btn" onclick="selectSize(this)">L</button>
                    <button class="size-btn" onclick="selectSize(this)">XL</button>
                    <button class="size-btn" onclick="selectSize(this)">XXL</button>
                `;
            }
        }
    }

    // Dynamic Color Selector based on product.colors
    const colorSelector = document.getElementById('pd-color-selector');
    const colorOptions = document.getElementById('pd-color-options');
    if (colorSelector && colorOptions) {
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
            colorSelector.style.display = 'block';
            colorOptions.innerHTML = product.colors.map((color, idx) => 
                `<button class="size-btn color-btn ${idx === 0 ? 'active' : ''}" onclick="selectColor(this)">${color.trim()}</button>`
            ).join('');
        } else {
            colorSelector.style.display = 'none';
            colorOptions.innerHTML = '';
        }
    }
}

function selectSize(element) {
    document.querySelectorAll('.size-options .size-btn:not(.color-btn)').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function selectColor(element) {
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function switchGalleryImage(url, thumbEl) {
    const mainImage = document.getElementById('pd-main-image');
    if (mainImage) mainImage.src = url;
    document.querySelectorAll('.gallery-thumbnails img').forEach(img => {
        img.classList.remove('active');
        img.style.borderColor = 'transparent';
    });
    if (thumbEl) {
        thumbEl.classList.add('active');
        thumbEl.style.borderColor = 'var(--color-primary)';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    adaptToDeviceScreen();
    renderProducts();
    loadProductDetails();
    updateCartUI(); 
    updateWishlistUI();
});

// ==========================================
// DEVICE & SCREEN RECOGNITION (PHONE VS COMPUTER)
// ==========================================
function adaptToDeviceScreen() {
    const width = window.innerWidth;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isPhone = width <= 768 || (width <= 1024 && isTouch && window.innerHeight > window.innerWidth);
    
    document.documentElement.classList.remove('is-phone', 'is-computer');
    document.body.classList.remove('is-phone', 'is-computer');

    if (isPhone) {
        document.documentElement.classList.add('is-phone');
        document.body.classList.add('is-phone');
    } else {
        document.documentElement.classList.add('is-computer');
        document.body.classList.add('is-computer');
    }
}

window.addEventListener('resize', adaptToDeviceScreen);
window.addEventListener('orientationchange', adaptToDeviceScreen);
