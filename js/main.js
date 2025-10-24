/**
 * 🚀 UnityXhub Core Engine + Floating Chat
 * main.js - The heart of your digital ecosystem
 * Built by Filipinos. For global impact.
 */

// 🔍 Helper Functions (safe querySelector)
function $(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
        return null;
    }
}

function $$(selector) {
    try {
        return document.querySelectorAll(selector);
    } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
        return [];
    }
}

// 🎖️ Unlock Badge System (with visual feedback)
function unlockBadge(sellerId, badgeName) {
    const key = `badges_unlocked_${sellerId}`;
    let unlocked = JSON.parse(localStorage.getItem(key)) || [];

    if (!unlocked.includes(badgeName)) {
        unlocked.push(badgeName);
        localStorage.setItem(key, JSON.stringify(unlocked));

        // Show notification
        const notification = $('#cartNotification');
        if (notification) {
            const span = notification.querySelector('span');
            if (span) {
                span.textContent = `🎖️ New Badge Unlocked: ${badgeName}!`;
            }
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 5000);
        }

        console.log("✅ Badge unlocked:", { sellerId, badgeName });
    }
}

// 🌟 Update Wishlist Icons (safe update)
window.updateWishlistIcons = function() {
    const wishlist = JSON.parse(localStorage.getItem('unityxhub_wishlist')) || [];
    const buttons = $$('.wishlist-btn');

    buttons.forEach(btn => {
        const productId = btn.getAttribute('data-product-id') ||
                         btn.getAttribute('onclick')?.match(/'(.+?)'/)?.[1];

        if (!productId) return;

        const icon = btn.querySelector('i');
        if (!icon) return;

        if (wishlist.includes(productId)) {
            icon.className = 'fas fa-heart';
            icon.style.color = '#d32f2f'; // Red for active
        } else {
            icon.className = 'far fa-heart';
            icon.style.color = ''; // Reset
        }
    });
};

// 🔔 Update Cart Badge (with quantity support)
window.updateCartBadge = function() {
    const badge = $('#cartBadge');
    if (!badge) return;

    const cart = JSON.parse(localStorage.getItem('unityxhub_cart')) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
};

// 🌀 Unified Auto-Scroll Engine (only if scrollable)
window.createAutoScroll = function(containerSelector, itemWidth = 180, gap = 15, speed = 40) {
    const container = $(containerSelector);
    if (!container) return;

    // Only start if content overflows
    if (container.scrollWidth <= container.clientWidth) return;

    let isHovered = false;
    container.addEventListener('mouseenter', () => isHovered = true);
    container.addEventListener('mouseleave', () => isHovered = false);

    const interval = setInterval(() => {
        if (isHovered) return;

        container.scrollLeft += (speed > 0) ? 1 : -1;

        // Loop back smoothly
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
            container.scrollLeft = 0;
        } else if (container.scrollLeft <= 0 && speed < 0) {
            container.scrollLeft = container.scrollWidth - container.clientWidth;
        }
    }, Math.max(10, 100 - Math.abs(speed)));

    // Stop if element removed
    const observer = new MutationObserver(mutations => {
        if (!document.contains(container)) clearInterval(interval);
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

// ✉️ Send Verification Email (Simulated)
async function sendEmail(to, subject, html) {
    console.log('📧 Sending email...', { to, subject, html });
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 800));
}

// 📱 Send SMS (Simulated)
async function sendSMS(phone, message) {
    console.log('📱 Sending SMS...', { phone, message });
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 600));
}

// 🔐 Handle Account Verification (from /verify?token=abc123)
function handleVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        console.warn("No token found in URL");
        return;
    }

    const storedToken = localStorage.getItem('verification_token');
    const application = localStorage.getItem('seller_application');

    if (token === storedToken && application) {
        try {
            const data = JSON.parse(application);
            data.status = 'verified';
            data.verifiedAt = new Date().toISOString();

            if (data.isPWD) {
                unlockBadge(data.sellerId || 'user', 'Verified PWD Seller');
            }

            localStorage.setItem('seller_application', JSON.stringify(data));
            localStorage.setItem('account_status', 'verified');

            alert("✅ Success! Your account has been verified.\nWelcome to UnityXhub!");
            setTimeout(() => {
                window.location.href = '../pages/shopping.html';
            }, 1000);
        } catch (e) {
            console.error("Verification failed:", e);
            alert("❌ Invalid application data.");
        }
    } else {
        alert("❌ Invalid or expired verification link.");
        console.warn("Token mismatch or no application found");
    }
}

// 💬 Save Support Ticket to Backend (fallback to localStorage)
async function saveSupportTicket(message) {
    const ticket = {
        name: "User",
        email: "anonymous@unityxhub.com",
        message: message.trim() || 'User requested human support.',
        status: 'open'
    };

    try {
        const res = await fetch('http://localhost:3000/api/support/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
        });

        const data = await res.json();
        if (data.success) {
            console.log("✅ Ticket saved to server:", data.id);
        }
    } catch (err) {
        console.warn("📡 Server unreachable – saving locally");
        const tickets = JSON.parse(localStorage.getItem('unityxhub_support_tickets') || '[]');
        tickets.push({
            ...ticket,
            id: 'local_' + Date.now(),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('unityxhub_support_tickets', JSON.stringify(tickets));
    }
}

// 🌙 Dark Mode Toggle (improved)
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    const isDark = localStorage.getItem('darkMode') === 'enabled';
    if (isDark) {
        document.body.classList.add('dark-mode');
        updateToggleUI(true);
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const enabled = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
        updateToggleUI(enabled);
    });

    function updateToggleUI(isDark) {
        toggle.innerHTML = isDark ? '☀️' : '🌙';
        toggle.style.borderColor = isDark ? '#fff' : 'var(--primary)';
        toggle.style.color = isDark ? '#fff' : 'var(--primary)';
    }
}

/**
 * ✅ Unified Floating Chat Engine
 * Integrated into main.js — no conflicts
 */
function initFloatingChat() {
    const chatToggle = document.getElementById('chatToggle');
    const chatBox = document.getElementById('chatBox');
    const chatMinimize = document.getElementById('chatMinimize');
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userMessageInput');
    const humanSupportCTA = document.getElementById('humanSupportCTA');

    if (!chatToggle || !chatBox || !chatMinimize) return;

    // ✅ Show chat box
    chatToggle.addEventListener('click', () => {
        chatBox.style.display = 'block';
        chatToggle.style.display = 'none';
    });

    // ✅ Minimize chat
    chatMinimize.addEventListener('click', () => {
        chatBox.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    // ✅ Full FAQ Replies
    const faqReplies = {
        "what is unityxhub": `UnityXhub is a digital ecosystem where anyone can:\n• Buy and sell products\n• Offer or find services\n• Post or apply for jobs\n• Share classified ads (rentals, used goods, vehicles)\n• Rent dedicated business space\nWe’re not a seller — we’re a platform.\nYou connect, grow, and succeed — on your terms.`,
        
        "payment methods": `✅ Cash on Delivery (COD)\n✅ GCash / PayMaya\n✅ Bank Transfer\n✅ PayPal\nAll payments go directly to the seller.`,

        "is my data safe": `Yes! We use HTTPS encryption.\nWe never store your full card details.\nYour personal data is protected under the Data Privacy Act.`,

        "contact unityxhub": `📧 Email: support@unityxhub.com\n📞 Hotline: (02) XXX-XXXX\n📍 Manila, Philippines\n💬 Or just type “Agent” to talk to a real person.`,

        "agent": `✅ Request sent! A support agent will respond within 5 minutes.\nYour ticket has been logged securely.`,

        "default": `I'm not sure I understand. But I can connect you to a real human support agent who can help.`
    };

    // ✅ Send user message
    function sendUserMessage() {
        const text = userInput.value.trim();
        if (!text || !userInput) return;

        addMessage(text, 'user');
        userInput.value = '';

        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            chatBody.removeChild(typing);
            let reply = faqReplies.default;
            const lowerText = text.toLowerCase();

            for (const key in faqReplies) {
                if (lowerText.includes(key)) {
                    reply = faqReplies[key];
                    break;
                }
            }

            addMessage(reply, 'bot');

            if (lowerText.includes('agent')) {
                if (humanSupportCTA) humanSupportCTA.style.display = 'block';
            }
        }, 1200);
    }

    // ✅ Request human support
    window.requestHumanSupport = function() {
        if (!humanSupportCTA) return;
        humanSupportCTA.style.display = 'none';

        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            chatBody.removeChild(typing);
            addMessage("👋 Hi! This is Maria from UnityXhub Support.\nHow can I help you today?", "bot");

            const ticket = {
                id: 'TKT-' + Date.now(),
                status: 'open',
                timestamp: new Date().toISOString()
            };
            let tickets = JSON.parse(localStorage.getItem('unityxhub_support_tickets') || '[]');
            tickets.push(ticket);
            localStorage.setItem('unityxhub_support_tickets', JSON.stringify(tickets));
        }, 1200);
    };

    // ✅ Add message to chat
    function addMessage(text, sender) {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${sender}`;
        msgEl.textContent = text;
        chatBody.appendChild(msgEl);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // ✅ Allow Enter to send
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendUserMessage();
            }
        });
    }

    // ✅ Mobile: Full screen mode
    if (window.innerWidth <= 768) {
        chatToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('supportChatWidget').classList.add('active');
            chatBox.style.display = 'flex';
        });

        chatMinimize.addEventListener('click', () => {
            document.getElementById('supportChatWidget').classList.remove('active');
            chatBox.style.display = 'none';
            chatToggle.style.display = 'flex';
        });
    }
}

// 🛠️ Initialize on Page Load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core systems
    updateCartBadge();
    updateWishlistIcons();
    initDarkMode();
    createAutoScroll('.trending-carousel', 160, 20, 60);
    createAutoScroll('.sales-carousel', 180, 15, 50);

    // Initialize chat
    initFloatingChat();

    // Handle verification page
    if (window.location.pathname.includes('verify.html')) {
        handleVerification();
    }

    console.log("🚀 UnityXhub Core Engine Loaded");
});