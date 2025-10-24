-- Add this INSIDE the .chat-body or .quick-replies section -->
<div id="humanSupportSection" style="display:none; text-align:center; padding:15px; color:#666;">
    <div style="margin-bottom:10px;">💬 <strong>Connecting you to a live agent...</strong></div>
    <div class="typing-indicator">
        <span></span><span></span><span></span>
    </div>
    <p style="font-size:0.9rem; margin-top:10px;">Please describe your issue. An agent will reply within 24 hours.</p>
    <textarea 
        id="humanMessageInput" 
        placeholder="Type your message to support..." 
        rows="3" 
        style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:10px; resize:none;">
    </textarea>
    <button onclick="sendToHumanSupport()" style="background:#ff6b00; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
        Send Message
    </button>
    <button onclick="cancelHumanSupport()" style="background:#f44336; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; margin-left:10px;">
        Cancel
    </button>
</div>

<!-- Add this CSS for typing indicator -->
<style>
    .typing-indicator {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin: 10px 0;
    }
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: bounce 1.5s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(1) { animation-delay: 0s; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
    }
</style>

<script>
    // Detect if user needs human help
    function askQuestion(question) {
        const lowerQ = question.toLowerCase();
        const botReply = getBotReply(lowerQ);

        addMessage(question, 'user');
        addMessage(botReply.text, 'bot');

        // If bot couldn't answer, show "Talk to Human" option
        if (botReply.isDefault) {
            setTimeout(showHumanSupportOption, 1000);
        }
    }

    // Show "Talk to Human" button after fallback reply
    function showHumanSupportOption() {
        const chatBody = document.getElementById('chatBody');
        const humanBtn = document.createElement('div');
        humanBtn.id = 'humanSupportBtn';
        humanBtn.style = 'text-align:center; margin:15px 0;';
        humanBtn.innerHTML = `
            <button onclick="requestHumanSupport()" style="
                background: #d32f2f; 
                color: white; 
                border: none; 
                padding: 12px 20px; 
                border-radius: 30px; 
                font-size: 1rem; 
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(211, 47, 47, 0.3);
            ">
                <i class="fas fa-user-friends"></i> Talk to Human Support
            </button>
        `;
        chatBody.appendChild(humanBtn);
    }

    // Request human support
    function requestHumanSupport() {
        const humanBtn = document.getElementById('humanSupportBtn');
        if (humanBtn) humanBtn.remove();

        const greeting = document.createElement('div');
        greeting.className = 'message bot';
        greeting.textContent = "✅ You're now connected to our support team. Please describe your issue below.";
        document.getElementById('chatBody').appendChild(greeting);

        document.getElementById('humanSupportSection').style.display = 'block';
        document.getElementById('chatBody').scrollTop = document.getElementById('chatBody').scrollHeight;
    }

    // Send message to human support
    function sendToHumanSupport() {
        const input = document.getElementById('humanMessageInput');
        const message = input.value.trim();
        if (!message) return;

        // Save to localStorage as support ticket
        const ticket = {
            id: 'ticket_' + Date.now(),
            timestamp: new Date().toLocaleString(),
            message: message,
            status: 'pending',
            replied: false
        };

        let tickets = JSON.parse(localStorage.getItem('unityxhub_support_tickets') || '[]');
        tickets.push(ticket);
        localStorage.setItem('unityxhub_support_tickets', JSON.stringify(tickets));

        // Show confirmation
        addMessage("Your message has been sent to our support team.", 'bot');
        addMessage("📧 You'll receive a reply via email within 24–48 hours.", 'bot');
        addMessage("Thank you for contacting UnityXhub Support! 🙏", 'bot');

        // Clear & hide
        document.getElementById('humanMessageInput').value = '';
        document.getElementById('humanSupportSection').style.display = 'none';

        // Scroll to bottom
        document.getElementById('chatBody').scrollTop = document.getElementById('chatBody').scrollHeight;
    }

    // Cancel human support
    function cancelHumanSupport() {
        document.getElementById('humanSupportSection').style.display = 'none';
        addMessage("You canceled the human support request.", 'bot');
    }

    // Enhanced bot reply logic
    function getBotReply(question) {
        const faqReplies = {
            "what is unityxhub": `UnityXhub is a digital ecosystem where anyone can:
• Buy and sell products
• Offer or find services
• Post or apply for jobs
• Share classified ads (rentals, used goods, vehicles)
• Rent dedicated business space

We’re not a seller — we’re a platform.
You connect, grow, and succeed — on your terms.`,

            "do you sell products directly": `❌ No.
We only provide the platform.
All transactions are user-to-user — between buyers and sellers, employers and freelancers, renters and tenants.
You control your business. We just give you the stage.`,

            "payment methods": `✅ Cash on Delivery (COD)
✅ E-wallets (GCash, GrabPay, MAYA)
✅ Debit/Credit Cards (Visa, Mastercard)
✅ Bank Transfers

Payments go through secure third-party providers.
Funds are released after delivery or completion.`,

            "is posting free": `Some posts are free — like basic product listings or job applications.
But if you want:
• Premium visibility
• Featured placement
• Business space rental
Then a small fee applies.

💬 Free to start. Paid to grow.`,

            "who is responsible if something goes wrong": `Users are responsible for their own transactions.
UnityXhub is not liable for:
• Disputes
• Fraud
• Scams
• Defective items
• Failed services

We encourage:
• Clear communication
• Secure payments
• Record-keeping
Report any suspicious activity — we’ll help investigate.`,

            "can anyone use unityxhub": `Yes — if you’re:
• 18 years old or older
• Committed to honesty and fairness
• Willing to follow our rules

No one is excluded — only those who break trust.`,

            "is my data safe": `✅ Yes.
We comply with:
• Philippine Data Privacy Act (RA 10173)
• GDPR (for global users)
Your information is encrypted, stored securely, and never sold.
You control your profile. You decide what to share.`,

            "how to resolve disputes": `Disputes must be handled directly between users.
Steps:
1. Communicate via UnityXhub messaging
2. Keep records of all transactions
3. If unresolved, report to admin
4. Use COD or escrow for high-value items

💬 We’re here to help — but not to fix every problem.`,

            "contact unityxhub": `Need help?
We’re here for you:
📧 support@unityxhub.com
📞 +63 9XX XXX XXXX
📍 Manila, Philippines
We respond within 24–48 hours.`,

            "default": `I'm sorry, I didn't understand that.
I'm still learning. But I can connect you with a real human support agent who can help.`,

            "talk to human": `I'll connect you with a live support agent.`,
            "human support": `I'll connect you with a live support agent.`,
            "speak to agent": `I'll connect you with a live support agent.`,
            "real person": `I'll connect you with a live support agent.`
        };

        let reply = faqReplies.default;
        let isDefault = true;

        for (const key in faqReplies) {
            if (question.includes(key)) {
                reply = faqReplies[key];
                isDefault = key === 'default';
                break;
            }
        }

        return { text: reply, isDefault: isDefault };
    }

    // Update askQuestion to use getBotReply
    function askQuestion(question) {
        const lowerQ = question.toLowerCase();
        const botReply = getBotReply(lowerQ);

        addMessage(question, 'user');
        addMessage(botReply.text, 'bot');

        // If bot couldn't answer, show "Talk to Human" option
        if (botReply.isDefault && !lowerQ.includes('connect')) {
            setTimeout(showHumanSupportOption, 1000);
        }
    }

    // Make sure addMessage is defined
    function addMessage(text, sender) {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${sender}`;
        msgEl.textContent = text;
        const chatBody = document.getElementById('chatBody');
        chatBody.appendChild(msgEl);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
</script>