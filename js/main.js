// ♦️𝑴7♦️ - Mock Database & Interactivity

let mockProducts = JSON.parse(localStorage.getItem('m7_cached_products')) || [];

const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUAl3hs0HcsECjy-X3rLBiY85ynFjfmLD1ALPGsakDUoNSOlbubXi4e57cdw2zIG8mjg/exec';

// Initial fast render from cache
if (mockProducts.length > 0) {
    if (typeof renderCatalogTable === 'function') renderCatalogTable();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof loadProductDetails === 'function') loadProductDetails();
}

// Defer Firebase initialization until the async scripts are fully loaded
function initFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        const firebaseConfig = {
            apiKey: "AIzaSyATftkOg3-qIrCzlwDfSN2ozjZB3ZTWsxg",
            authDomain: "m7-store-91a9c.firebaseapp.com",
            databaseURL: "https://m7-store-91a9c-default-rtdb.firebaseio.com",
            projectId: "m7-store-91a9c",
            storageBucket: "m7-store-91a9c.firebasestorage.app",
            messagingSenderId: "838102550989",
            appId: "1:838102550989:web:c6c81e307ef6a51fef1c84",
            measurementId: "G-EDES65GG0T"
        };
        
        // Prevent double initialization
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        window.db = firebase.database();

        window.db.ref('products').on('value', (snapshot) => {
            mockProducts = [];
            snapshot.forEach((child) => {
                mockProducts.unshift(child.val());
            });
            localStorage.setItem('m7_cached_products', JSON.stringify(mockProducts));
            
            // Auto-restore old custom products from localStorage to Firebase
            try {
                const oldCustomProducts = JSON.parse(localStorage.getItem('m7_custom_products')) || [];
                if (oldCustomProducts.length > 0) {
                    console.log(`Migrating ${oldCustomProducts.length} old custom products to Firebase...`);
                    oldCustomProducts.forEach(prod => {
                        window.db.ref('products/' + prod.id).set(prod);
                    });
                    localStorage.removeItem('m7_custom_products');
                }
            } catch (e) {
                console.error("Migration Error:", e);
            }
            
            if (typeof renderCatalogTable === 'function') renderCatalogTable();
            if (typeof renderProducts === 'function') renderProducts();
            if (typeof loadProductDetails === 'function') loadProductDetails();
        }, (error) => {
            console.error("Firebase Read Error:", error);
        });
    } else {
        setTimeout(initFirebase, 50); // check again shortly
    }
}

initFirebase();

function resetAllDefaults() {
    if (!confirm("Are you sure you want to reset the global catalog to default products? This will overwrite the current list in the database.")) {
        return;
    }
    
    const defaultProducts = [
        { id: 1, categories: ['women'], brand: "MANGO", title: "Pleated Midi Dress with Belt", price: 1450, oldPrice: 2100, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", badge: "-30%", colors: ['White', 'Black'] },
        { id: 4, categories: ['women', 'accessories'], brand: "CALVIN KLEIN", title: "Monogram Crossbody Bag", price: 2990, oldPrice: null, image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop", badge: null, colors: ['Black'] },
        { id: 8, categories: ['women'], brand: "ALDO", title: "Stiletto Heel Pumps", price: 2500, oldPrice: null, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['Black', 'White'] },
        { id: 2, categories: ['men'], brand: "♦️𝑴7♦️", title: "Oversized 'Believe' Graphic T-Shirt", price: 450, oldPrice: null, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['Black', 'Red', 'White'] },
        { id: 9, categories: ['kids'], brand: "MOTHERCARE", title: "Printed Cotton Pajamas", price: 650, oldPrice: null, image: "https://images.unsplash.com/photo-1519272365922-0a1501c6fc82?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['White'] },
        { id: 11, categories: ['kids'], brand: "GAP KIDS", title: "Denim Overalls", price: 1400, oldPrice: 1900, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop", badge: "-26%", colors: ['Blue'] },
        { id: 12, categories: ['kids'], brand: "ADIDAS", title: "Kids Stan Smith Sneakers", price: 2500, oldPrice: null, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1000&auto=format&fit=crop", badge: null, colors: ['White'] },
        { id: 13, categories: ['perfumes'], brand: "DIOR", title: "Sauvage Eau De Parfum 100ml", price: 5800, oldPrice: null, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop", badge: "BESTSELLER", colors: ['Standard'] },
        { id: 14, categories: ['women'], brand: "MAC", title: "Matte Lipstick - Ruby Woo", price: 1100, oldPrice: 1400, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop", badge: "-21%", colors: ['Red'] },
        { id: 16, categories: ['perfumes'], brand: "CHANEL", title: "Bleu De Chanel Eau De Parfum 100ml", price: 6500, oldPrice: 7200, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop", badge: "BESTSELLER", colors: ['Standard'] },
        { id: 17, categories: ['perfumes', 'women'], brand: "YVES SAINT LAURENT", title: "Black Opium Eau De Parfum 90ml", price: 6200, oldPrice: null, image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['Standard'] },
        { id: 21, categories: ['perfumes', 'women'], brand: "TOM FORD", title: "Black Orchid Eau De Parfum 100ml", price: 7900, oldPrice: null, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop", badge: "BESTSELLER", colors: ['Standard'] },
        { id: 18, categories: ['accessories', 'women'], brand: "RAY-BAN", title: "Classic Aviator Sunglasses", price: 3800, oldPrice: 4500, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop", badge: "-15%", colors: ['Black', 'Gold'] },
        { id: 19, categories: ['accessories', 'women'], brand: "MICHAEL KORS", title: "Parker Chronograph Rose Gold Watch", price: 7500, oldPrice: null, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['Rose Gold'] },
        { id: 20, categories: ['accessories'], brand: "TOMMY HILFIGER", title: "Genuine Leather Wallet", price: 1800, oldPrice: 2200, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop", badge: "-18%", colors: ['Black', 'Brown'] },
        { id: 6, categories: ['women'], brand: "PUMA", title: "Classic Suede Sneakers", price: 2100, oldPrice: 3000, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop", badge: "-30%", colors: ['Black', 'White'] },
        { id: 15, categories: ['women'], brand: "UNDER ARMOUR", title: "HeatGear Compression Leggings", price: 1900, oldPrice: null, image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1000&auto=format&fit=crop", badge: "NEW", colors: ['Black'] },
        { id: 3, categories: ['women'], brand: "GINGER", title: "Ribbed Long Sleeve Top", price: 450, oldPrice: 900, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop", badge: "-50%", colors: ['White', 'Black'] }
    ];

    window.db.ref('products').set(null).then(() => {
        const promises = defaultProducts.map(prod => {
            return window.db.ref('products/' + prod.id).set(prod);
        });
        Promise.all(promises).then(() => {
            alert("Catalog successfully reset to default products!");
            if (typeof renderCatalogTable === 'function') renderCatalogTable();
        }).catch(err => {
            alert("Error setting default products: " + err.message);
        });
    }).catch(err => {
        alert("Error resetting catalog: " + err.message);
    });
}

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
                            <div class="cart-item-title">${item.title} ${item.size ? `<strong style="color:var(--color-accent);">(Size: ${item.size})</strong>` : ''} ${item.color ? `<strong style="color:var(--color-accent);">(Color: ${item.color})</strong>` : ''}</div>
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
        
        // If adding from product page
        if (!productId) {
            // Enforce Size Selection (if applicable)
            if (product.categories && product.categories.includes('perfumes')) {
                const activeSize = document.querySelector('.size-options .size-btn:not(.color-btn).active');
                if(!activeSize) {
                    alert('Please select a size before adding to cart.');
                    return;
                }
                product.size = activeSize.innerText;
            } else if (product.categories && product.categories.includes('accessories') && !product.categories.includes('women') && !product.categories.includes('men')) {
                product.size = "One Size";
            } else {
                const activeSize = document.querySelector('.size-options .size-btn:not(.color-btn).active');
                if(!activeSize) {
                    alert('Please select a size before adding to cart.');
                    return;
                }
                product.size = activeSize.innerText;
            }
            
            // Enforce Color Selection
            if (product.colors && product.colors.length > 0) {
                const activeColor = document.querySelector('.size-options .color-btn.active');
                if (!activeColor) {
                    alert('Please select a color before adding to cart.');
                    return;
                }
                product.color = activeColor.innerText;
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
    if (!product) return; 
    
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

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.setAttribute('onclick', `addToCart(${product.id})`);
    }

    let selectedSize = null;
    let selectedColor = null;

    const sizeEl = document.querySelector('.size-options .size-btn:not(.color-btn).active');
    if (sizeEl) selectedSize = sizeEl.innerText.trim();

    const colorEl = document.querySelector('#pd-color-options .color-btn.active');
    if (colorEl) selectedColor = colorEl.innerText.trim();

    // Dynamic Size Selector
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
            
            // Set first color active by default
            const firstColorBtn = colorOptions.querySelector('.color-btn');
            if (firstColorBtn) firstColorBtn.classList.add('active');
            
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
