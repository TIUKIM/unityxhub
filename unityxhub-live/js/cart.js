// cart.js - UnityXhub Shopping Cart
class UnityXhubCart {
    constructor() {
        this.cartKey = 'unityxhub_cart';
        this.cart = this.getCartFromStorage();
        this.init();
    }

    // Get cart from localStorage
    getCartFromStorage() {
        const saved = localStorage.getItem(this.cartKey);
        return saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
        this.updateCartUI();
    }

    // Add item to cart
    addItem(product) {
        const existing = this.cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`);
    }

    // Remove item from cart
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification("Item removed from cart!");
    }

    // Update quantity
    updateQuantity(productId, newQty) {
        if (newQty < 1) return;
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQty;
            this.saveCart();
        }
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0).toFixed(2);
    }

    // Get total items count
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Show cart notification
    showNotification(message) {
        const notification = document.getElementById('cartNotification');
        if (notification) {
            notification.querySelector('span').textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }

    // Update cart UI (badge, etc.)
    updateCartUI() {
        const count = this.getItemCount();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Render cart items on cart page
    renderCartItems() {
        const container = document.querySelector('.cart-items');
        if (!container) return;

        if (this.cart.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#777;">
                    <i class="fas fa-shopping-cart" style="font-size:3rem; margin-bottom:10px; opacity:0.3;"></i>
                    <h3>Your cart is empty</h3>
                    <a href="index.html" class="btn btn-primary" style="margin-top:20px;">Continue Shopping</a>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-img">${item.name.split(' ')[0]}</div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="cart.removeItem('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(itemEl);
        });

        // Update order summary
        this.updateOrderSummary();
    }

    // Update order summary
    updateOrderSummary() {
        const summary = document.querySelector('.order-summary');
        if (!summary) return;

        const subtotal = this.getTotal();
        const shipping = 0; // Free shipping
        const total = (parseFloat(subtotal) + shipping).toFixed(2);

        // Remove old summary
        const old = summary.querySelector('.summary-rows');
        if (old) old.remove();

        // Insert new
        const rows = document.createElement('div');
        rows.className = 'summary-rows';
        rows.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${this.getItemCount()} items)</span>
                <span>$${subtotal}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
            </div>
            <div class="summary-total">
                <strong>Total</strong>
                <strong>$${total}</strong>
            </div>
        `;
        summary.insertBefore(rows, summary.querySelector('button'));
    }

    // Initialize
    init() {
        this.updateCartUI();
        if (window.location.pathname.includes('cart.html')) {
            this.renderCartItems();
        }
    }
}

// Initialize cart
const cart = new UnityXhubCart();