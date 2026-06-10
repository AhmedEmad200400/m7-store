// ♦️𝑴7♦️ - Mock Database & Interactivity

const mockProducts = [
    // WOMEN
    { id: 1, categories: ['women'], brand: "MANGO", title: "Pleated Midi Dress with Belt", price: 1450, oldPrice: 2100, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", badge: "-30%" },
    { id: 4, categories: ['women'], brand: "CALVIN KLEIN", title: "Monogram Crossbody Bag", price: 2990, oldPrice: null, image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=1000&auto=format&fit=crop", badge: null },
    { id: 8, categories: ['women'], brand: "ALDO", title: "Stiletto Heel Pumps", price: 2500, oldPrice: null, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop", badge: "NEW" },
    
    // MEN
    { id: 2, categories: ['men', 'sports'], brand: "NIKE", title: "Air Force 1 '07 Sneakers", price: 4990, oldPrice: null, image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000&auto=format&fit=crop", badge: "NEW" },
    { id: 7, categories: ['men'], brand: "TOMMY HILFIGER", title: "Logo Print T-Shirt", price: 1200, oldPrice: null, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop", badge: null },

    // KIDS
    { id: 9, categories: ['kids'], brand: "MOTHERCARE", title: "Printed Cotton Pajamas", price: 650, oldPrice: null, image: "https://images.unsplash.com/photo-1519272365922-0a1501c6fc82?q=80&w=1000&auto=format&fit=crop", badge: "NEW" },
    { id: 11, categories: ['kids'], brand: "GAP KIDS", title: "Denim Overalls", price: 1400, oldPrice: 1900, image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1000&auto=format&fit=crop", badge: "-26%" },
    { id: 12, categories: ['kids', 'sports'], brand: "ADIDAS", title: "Kids Stan Smith Sneakers", price: 2500, oldPrice: null, image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=1000&auto=format&fit=crop", badge: null },

    // BEAUTY
    { id: 13, categories: ['beauty', 'men'], brand: "DIOR", title: "Sauvage Eau De Parfum 100ml", price: 5800, oldPrice: null, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop", badge: "BESTSELLER" },
    { id: 14, categories: ['beauty', 'women'], brand: "MAC", title: "Matte Lipstick - Ruby Woo", price: 1100, oldPrice: 1400, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop", badge: "-21%" },

    // SPORTS
    { id: 6, categories: ['sports', 'men', 'women'], brand: "PUMA", title: "Classic Suede Sneakers", price: 2100, oldPrice: 3000, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1000&auto=format&fit=crop", badge: "-30%" },
    { id: 15, categories: ['sports', 'women'], brand: "UNDER ARMOUR", title: "HeatGear Compression Leggings", price: 1900, oldPrice: null, image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=1000&auto=format&fit=crop", badge: "NEW" },
    
    // MIXED FOR ALL/DEFAULT
    { id: 3, categories: ['women'], brand: "GINGER", title: "Ribbed Long Sleeve Top", price: 450, oldPrice: 900, image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000&auto=format&fit=crop", badge: "-50%" },
];

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
            const activeSizeBtn = document.querySelector('.size-btn.active');
            if (activeSizeBtn) {
                product.size = activeSizeBtn.innerText;
            } else {
                return alert("Please select a size before adding to bag!");
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

// Replace this with your Google Apps Script Web App URL once deployed
const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUAl3hs0HcsECjy-X3rLBiY85ynFjfmLD1ALPGsakDUoNSOlbubXi4e57cdw2zIG8mjg/exec';

async function submitOrder(e) {
    e.preventDefault();
    if(cartItems.length === 0) return;

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    
    let total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Format items into a readable string for the spreadsheet
    let itemsString = cartItems.map(item => `${item.title} (EGP ${item.price})`).join(', ');
    
    // Format sizes into a comma-separated string for the new Google Sheets column
    let sizesString = cartItems.map(item => item.size || 'N/A').join(', ');

    const order = {
        id: "ORD-" + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString(),
        customer: { name, phone, address },
        items: [...cartItems],
        sizes: sizesString,
        total: total,
        status: "New"
    };

    // 1. Save locally so the admin.html Dashboard works flawlessly
    orders.push(order);
    localStorage.setItem('m7_orders', JSON.stringify(orders));

    // 2. Send to Google Sheets (if URL is configured)
    if (GOOGLE_APP_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        const payload = {
            id: order.id,
            date: order.date,
            name: name,
            phone: phone,
            address: address,
            items: itemsString,
            sizes: sizesString,
            total: total
        };

        try {
            // Using no-cors because Google Apps Script handles redirecting
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
        
        if (category === 'sale') {
            filteredProducts = mockProducts.filter(p => p.oldPrice !== null);
            if (heroTitle) heroTitle.innerText = "The Big Summer Sale";
            if (heroSubtitle) heroSubtitle.innerText = "Up to 70% off. Exclusive to ♦️𝑴7♦️";
            if (sectionTitle) sectionTitle.innerText = "Sale Items";
        } else {
            filteredProducts = mockProducts.filter(p => p.categories && p.categories.includes(category));
            if (heroTitle) heroTitle.innerText = `${category.toUpperCase()} COLLECTION`;
            if (heroSubtitle) heroSubtitle.innerText = `Explore the latest trends in ${category} fashion.`;
            if (sectionTitle) sectionTitle.innerText = `${category.toUpperCase()} PRODUCTS`;
        }
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
    
    if (mainImage) mainImage.src = product.image;
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
}

function selectSize(element) {
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    loadProductDetails();
    updateCartUI(); 
    updateWishlistUI();
});
