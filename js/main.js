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

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUAl3hs0HcsECjy-X3rLBiY85ynFjfmLD1ALPGsakDUoNSOlbubXi4e57cdw2zIG8mjg/exec';

window.db.ref('products').on('value', (snapshot) => {
    mockProducts = [];
    snapshot.forEach((child) => {
        mockProducts.unshift(child.val());
    });
    
    if (typeof renderCatalogTable === 'function') renderCatalogTable();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof loadProductDetails === 'function') loadProductDetails();
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

            const activeColorBtn = document.querySelector('.size-options .color-btn.active');
            if (activeColorBtn) {
                product.color = activeColorBtn.innerText;
            }
        }

        cartItems.push(product);
        saveCart();
        
        // Visual feedback
        const btn = document.getElementById('add-to-cart-btn') || document.querySelector(`button[onclick="addToCart(${productId})"]`);
        if(btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> ADDED';
            btn.style.background = "transparent";
            btn.style.borderColor = "var(--color-accent)";
            btn.style.color = "var(--color-secondary)";
            setTimeout(() => {
                btn.innerHTML = originalText;
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

    // Group identical items to prevent typing the name twice
    let groupedItems = {};
    cartItems.forEach(item => {
        let key = item.id + "_" + (item.size || 'N/A') + "_" + (item.color || 'Standard');
        if (!groupedItems[key]) {
            groupedItems[key] = { ...item, quantity: 1, unitPrice: item.price };
        } else {
            groupedItems[key].quantity++;
            groupedItems[key].price += item.unitPrice;
        }
    });
    let groupedArray = Object.values(groupedItems);

    // Format items into a readable string for the spreadsheet
    let itemsString = groupedArray.map(item => {
        if (item.quantity > 1) {
            return `${item.title} x${item.quantity} (EGP ${item.price})`;
        } else {
            return `${item.title} (EGP ${item.price})`;
        }
    }).join(', ');
    
    // Format sizes into a comma-separated string for the new Google Sheets column
    let sizesString = groupedArray.map(item => item.size || 'N/A').join(', ');

    // Format colors into a comma-separated string for the new Google Sheets column
    let colorsString = groupedArray.map(item => item.color || 'Standard').join(', ');

    const order = {
        id: "ORD-" + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        customer: { name, phone, address },
        items: [...cartItems],
        sizes: sizesString,
        colors: colorsString,
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

    // 3. Send to Google Sheets
    if (GOOGLE_APP_SCRIPT_URL && GOOGLE_APP_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        const payload = {
            id: order.id,
            date: order.date,
            name: name,
            phone: phone,
            address: address,
            items: itemsString,
            sizes: sizesString,
            colors: colorsString,
            total: total
        };

        try {
            fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error("Error sending to Google Sheets:", error);
        }
    }
    
    // Clear cart
    cartItems = [];
    saveCart();
    hideCheckoutForm();
    toggleCart(false);
    
    // Success Toast
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4cd137;"></i> Order Placed Successfully! We will contact you soon.`;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 5000);
}


// ==========================================
// WISHLIST LOGIC
// ==========================================
function updateWishlistUI() {
    const count = wishlistItems.length;
    document.querySelectorAll('.wishlist-count').forEach(badge => {
        badge.innerText = count;
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
                                <span class="cart-item-remove" onclick="removeFromWishlist(${index})" style="color:var(--color-gray-dark); margin-right: 15px; cursor: pointer; text-decoration: underline;">Remove</span>
                                <span class="cart-item-remove" onclick="moveToCartFromWishlist(${index})" style="color:var(--color-primary); cursor: pointer; text-decoration: underline; font-weight: 700;">Move to Bag</span>
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

function toggleWishlist(event, productId, fromProductPage = false) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    let pId = productId;
    if (fromProductPage) {
        const urlParams = new URLSearchParams(window.location.search);
        pId = urlParams.get('id');
    }

    const index = wishlistItems.findIndex(p => p.id == pId);
    if (index > -1) {
        wishlistItems.splice(index, 1);
        if (event && event.currentTarget) {
            event.currentTarget.classList.remove('active');
            event.currentTarget.querySelector('i').className = 'fa-regular fa-heart';
        }
    } else {
        const product = mockProducts.find(p => p.id == pId);
        if (product) {
            wishlistItems.push(product);
            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
                event.currentTarget.querySelector('i').className = 'fa-solid fa-heart';
            }
        }
    }
    saveWishlist();
}

function removeFromWishlist(index) {
    wishlistItems.splice(index, 1);
    saveWishlist();
    renderProducts();
}

function moveToCartFromWishlist(index) {
    const item = wishlistItems[index];
    if (item) {
        const product = JSON.parse(JSON.stringify(item));
        
        // Provide defaults for required fields so checkout works smoothly
        if (!product.size) {
            if (product.categories && product.categories.includes('perfumes')) product.size = "100 ml";
            else if (product.categories && product.categories.includes('accessories') && !product.categories.includes('women') && !product.categories.includes('men')) product.size = "One Size";
            else product.size = "L"; // Default fallback
        }
        if (!product.color && product.colors && product.colors.length > 0) {
            product.color = product.colors[0]; // Default color
        }
        
        cartItems.push(product);
        saveCart();
        
        // Remove from wishlist
        wishlistItems.splice(index, 1);
        saveWishlist();
        renderProducts();
        
        // Switch view to Cart
        toggleWishlistPanel();
        toggleCart(true);
    }
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

    // Optional: if mockProducts is empty, show a nice loading state instead of "No products found"
    // We assume if length is 0, we might still be loading from Firebase.
    // However, if they truly have no products, it will just show "No products found".

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
        const isWished = wishlistItems.some(p => p.id === product.id);
        const heartClass = isWished ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        const wishActive = isWished ? 'active' : '';

        const badgeHTML = product.badge 
            ? `<span class="discount-badge" ${product.badge === 'NEW' || product.badge === 'BESTSELLER' ? 'style="background:#000"' : ''}>${product.badge}</span>` 
            : '';
        const oldPriceHTML = product.oldPrice ? `<span class="price-old">EGP ${product.oldPrice}</span>` : '';

        const cardHTML = `
            <article class="product-card">
                <div class="product-image-wrapper">
                    ${badgeHTML}
                    <div class="wishlist-btn ${wishActive}" onclick="toggleWishlist(event, ${product.id})"><i class="${heartClass}"></i></div>
                    <img src="${product.image}" alt="${product.title}" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand}</div>
                    <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">${product.title}</h3>
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
    
    const product = mockProducts.find(p => p.id == productId);
    if (!product) return; // Wait for Firebase data to arrive if empty
    
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
        oldPrice.style.display = 'inline-block';
    } else if (oldPrice) {
        oldPrice.style.display = 'none';
    }

    if (wishBtn) {
        const isWished = wishlistItems.find(p => p.id === product.id);
        if(isWished) {
            wishBtn.classList.add('active');
            wishBtn.querySelector('i').className = 'fa-solid fa-heart';
        }
        wishBtn.setAttribute('onclick', `toggleWishlist(event, ${product.id}, true)`);
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

    // Dynamic Colors Selector
    const colorSelector = document.getElementById('pd-color-selector');
    const colorOptions = document.getElementById('pd-color-options');
    if (colorSelector && colorOptions) {
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
            colorSelector.style.display = 'block';
            colorOptions.innerHTML = product.colors.map(color => {
                let hex = '#fff';
                if (color.toLowerCase() === 'black') hex = '#000';
                if (color.toLowerCase() === 'red') hex = '#D40000';
                if (color.toLowerCase() === 'white') hex = '#fff';
                
                return `
                    <button class="size-btn color-btn" onclick="selectColor(this)" style="display: flex; align-items: center; gap: 6px;">
                        <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${hex}; border: 1px solid #ccc;"></span>
                        ${color}
                    </button>
                `;
            }).join('');
        } else {
            colorSelector.style.display = 'none';
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
    // Do NOT render products/productDetails immediately to prevent empty state flash. 
    // They will be rendered automatically via Firebase .on('value') listener when data loads.
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
