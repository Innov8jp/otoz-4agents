// ===== PART 1: DATA & SETUP =====

let selectedMake = '', selectedModel = '', selectedYear = '';
let selectedMileage = 150000, selectedBudget = 7000;
let availableCars = [], selectedCar = null;
let currentPrice = 0, originalPrice = 0, discountApplied = 0, negotiationCount = 0;
let currentInvoice = null, currentAgent = null;

// 10 REAL CARS FROM YOUR CSV
const cars = [
    {id: 1, make: 'Toyota', model: 'Corolla', year: 2020, price: 3912, location: 'Tokyo', image: 'https://images.unsplash.com/photo-1623869675781-80aa31e436d1?w=400&h=300&fit=crop', icon: '🚗'},
    {id: 2, make: 'Toyota', model: 'Aqua', year: 2020, price: 9067, location: 'Kobe', image: 'https://images.unsplash.com/photo-1549399504-84c2a8a4b71a?w=400&h=300&fit=crop', icon: '🚗'},
    {id: 3, make: 'Toyota', model: 'Prius', year: 2019, price: 6318, location: 'Fukuoka', image: 'https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=400&h=300&fit=crop', icon: '🚗'},
    {id: 4, make: 'Honda', model: 'Fit', year: 2019, price: 9942, location: 'Nagoya', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', icon: '🚙'},
    {id: 5, make: 'Honda', model: 'Civic', year: 2020, price: 9156, location: 'Osaka', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop', icon: '🚙'},
    {id: 6, make: 'Honda', model: 'Accord', year: 2018, price: 8967, location: 'Fukuoka', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop', icon: '🚙'},
    {id: 7, make: 'Nissan', model: 'Note', year: 2019, price: 7445, location: 'Tokyo', image: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=400&h=300&fit=crop', icon: '🚐'},
    {id: 8, make: 'Nissan', model: 'March', year: 2018, price: 5789, location: 'Kobe', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop', icon: '🚐'},
    {id: 9, make: 'Mazda', model: 'Demio', year: 2018, price: 6345, location: 'Tokyo', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop', icon: '🚕'},
    {id: 10, make: 'Subaru', model: 'Impreza', year: 2018, price: 7345, location: 'Tokyo', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop', icon: '🚖'}
];

const carMakers = {
    'Toyota': ['Corolla', 'Aqua', 'Prius'],
    'Honda': ['Fit', 'Civic', 'Accord'],
    'Nissan': ['Note', 'March'],
    'Mazda': ['Demio'],
    'Subaru': ['Impreza']
};

// EXISTING CUSTOMER DATABASE
const customerOrders = {
    '001': {
        invoice: '001',
        customer: 'John Smith',
        vehicle: '2020 Toyota Corolla',
        purchaseDate: '2024-12-15',
        totalPaid: '$3,525',
        destination: 'Mombasa, Kenya',
        currentStatus: 'inspection',
        services: {
            discovery: { status: 'completed', date: '2024-12-15', agent: 'Sparky' },
            inspection: { status: 'in-progress', date: '2024-12-18', agent: 'Inspector' },
            payment: { status: 'pending', date: null, agent: 'Penny' },
            shipping: { status: 'pending', date: null, agent: 'Captain' }
        }
    },
    '002': {
        invoice: '002',
        customer: 'Sarah Johnson',
        vehicle: '2019 Honda Civic',
        purchaseDate: '2024-12-10',
        totalPaid: '$8,240',
        destination: 'Karachi, Pakistan',
        currentStatus: 'payment',
        services: {
            discovery: { status: 'completed', date: '2024-12-10', agent: 'Sparky' },
            inspection: { status: 'completed', date: '2024-12-12', agent: 'Inspector' },
            payment: { status: 'in-progress', date: '2024-12-16', agent: 'Penny' },
            shipping: { status: 'pending', date: null, agent: 'Captain' }
        }
    },
    '003': {
        invoice: '003',
        customer: 'Ahmed Hassan',
        vehicle: '2020 Nissan Note',
        purchaseDate: '2024-12-05',
        totalPaid: '$6,701',
        destination: 'Chittagong, Bangladesh',
        currentStatus: 'shipping',
        services: {
            discovery: { status: 'completed', date: '2024-12-05', agent: 'Sparky' },
            inspection: { status: 'completed', date: '2024-12-07', agent: 'Inspector' },
            payment: { status: 'completed', date: '2024-12-09', agent: 'Penny' },
            shipping: { status: 'in-progress', date: '2024-12-12', agent: 'Captain' }
        }
    }
};

// AI AGENTS WITH MALE/FEMALE AVATARS
const aiAgents = {
    sparky: {
        name: 'Sparky',
        role: 'Discovery & Negotiation Expert',
        tagline: 'Your energetic car finder!',
        avatar: '👨‍💼',
        color: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        gender: 'male',
        personality: 'Enthusiastic and energetic negotiator'
    },
    inspector: {
        name: 'Inspector Luna',
        role: 'Quality Assurance Specialist',
        tagline: 'Quality guarantee expert',
        avatar: '👩‍🔬',
        color: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        gender: 'female',
        personality: 'Meticulous and thorough professional'
    },
    penny: {
        name: 'Penny',
        role: 'Payment & Billing Wizard',
        tagline: 'Financial wizard',
        avatar: '👩‍💰',
        color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        gender: 'female',
        personality: 'Friendly and helpful financial expert'
    },
    captain: {
        name: 'Captain Rodriguez',
        role: 'Logistics & Delivery Commander',
        tagline: 'Global shipping expert',
        avatar: '👨‍✈️',
        color: 'linear-gradient(135deg, #059669, #047857)',
        gender: 'male',
        personality: 'Reliable and experienced logistics professional'
    }
};

// ENHANCED GREETINGS FOR EACH AGENT
const agentGreetings = {
    sparky: "Hey there! I'm Sparky, your car-hunting champion! ⚡ Thanks for choosing Otoz.ai! I'm the one who helped you find this amazing deal. How can I help you today?",
    inspector: "Hello! I'm Inspector Luna, your quality assurance specialist. 🔬 I ensure every vehicle meets our premium standards. What would you like to know about your car's inspection?",
    penny: "Hi! I'm Penny, your personal financial advisor! 💎 I handle all payments and documentation with care. How can I assist you with your transaction today?",
    captain: "Greetings! Captain Rodriguez here, your logistics commander! 🌊 I coordinate global shipping operations. What shipping questions can I answer for you?"
};

function startDemo() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
}

function showExistingCustomerPortal() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showExistingCustomerLogin();
}

function showExistingCustomerLogin() {
    // Hide all other phases
    document.getElementById('onboarding-phase').style.display = 'none';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'none';
    
    // Show existing customer phase
    let existingCustomerPhase = document.getElementById('existing-customer-phase');
    if (!existingCustomerPhase) {
        createExistingCustomerPhase();
        existingCustomerPhase = document.getElementById('existing-customer-phase');
    }
    existingCustomerPhase.style.display = 'flex';
}

function createExistingCustomerPhase() {
    const demoContainer = document.getElementById('demo-container');
    
    const existingCustomerHTML = `
        <div class="existing-customer-container" id="existing-customer-phase">
            <div class="existing-customer-content">
                <div class="customer-login-section" id="customer-login-section">
                    <div class="login-title">
                        <h2>👋 Welcome Back to Otoz.ai!</h2>
                        <p>Enter your invoice number to check your order status and chat with our AI agents</p>
                    </div>
                    
                    <div class="invoice-input-container">
                        <div class="invoice-form">
                            <label for="invoice-input">📋 Invoice Number</label>
                            <input type="text" id="invoice-input" placeholder="Enter your invoice number (e.g., 001)" maxlength="10">
                            <button class="login-btn" onclick="loginCustomer()">🔍 Check Status</button>
                        </div>
                        
                        <div class="demo-invoices">
                            <h4>Demo Invoice Numbers:</h4>
                            <div class="demo-invoice-list">
                                <span class="demo-invoice" onclick="fillInvoice('001')">001</span>
                                <span class="demo-invoice" onclick="fillInvoice('002')">002</span>
                                <span class="demo-invoice" onclick="fillInvoice('003')">003</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="customer-dashboard-section" id="customer-dashboard-section" style="display: none;">
                    <!-- Dashboard content will be populated here -->
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-secondary" onclick="goBackToHome()">← Back to Home</button>
            </div>
        </div>
    `;
    
    demoContainer.insertAdjacentHTML('beforeend', existingCustomerHTML);
}

function fillInvoice(invoiceNumber) {
    document.getElementById('invoice-input').value = invoiceNumber;
}

function loginCustomer() {
    const invoiceNumber = document.getElementById('invoice-input').value.trim();
    
    if (!invoiceNumber) {
        alert('Please enter your invoice number');
        return;
    }
    
    const customerData = customerOrders[invoiceNumber];
    
    if (!customerData) {
        alert('Invoice number not found. Please check your invoice number or contact support.');
        return;
    }
    
    currentInvoice = customerData;
    showCustomerDashboard();
}

function showCustomerDashboard() {
    document.getElementById('customer-login-section').style.display = 'none';
    document.getElementById('customer-dashboard-section').style.display = 'block';
    
    populateCustomerDashboard();
}

function populateCustomerDashboard() {
    const dashboardSection = document.getElementById('customer-dashboard-section');
    
    const dashboardHTML = `
        <div class="customer-header">
            <h2>📊 Order Status Dashboard</h2>
            <div class="customer-info">
                <div class="customer-detail">
                    <strong>Customer:</strong> ${currentInvoice.customer}
                </div>
                <div class="customer-detail">
                    <strong>Invoice:</strong> #${currentInvoice.invoice}
                </div>
                <div class="customer-detail">
                    <strong>Vehicle:</strong> ${currentInvoice.vehicle}
                </div>
                <div class="customer-detail">
                    <strong>Total Paid:</strong> ${currentInvoice.totalPaid}
                </div>
                <div class="customer-detail">
                    <strong>Destination:</strong> ${currentInvoice.destination}
                </div>
            </div>
        </div>
        
        <div class="service-status-grid">
            ${Object.entries(currentInvoice.services).map(([serviceKey, service]) => {
                const agent = aiAgents[serviceKey];
                const statusColor = service.status === 'completed' ? '#22c55e' : 
                                  service.status === 'in-progress' ? '#f59e0b' : '#94a3b8';
                const statusIcon = service.status === 'completed' ? '✅' : 
                                 service.status === 'in-progress' ? '⏳' : '⏸️';
                
                return `
                    <div class="service-status-card ${service.status}" onclick="chatWithAgent('${serviceKey}')">
                        <div class="agent-avatar-large" style="background: ${agent.color};">
                            ${agent.avatar}
                        </div>
                        <div class="service-info">
                            <h3>${agent.name}</h3>
                            <p class="agent-role">${agent.role}</p>
                            <div class="service-status" style="color: ${statusColor};">
                                ${statusIcon} ${service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                            </div>
                            ${service.date ? `<div class="service-date">📅 ${service.date}</div>` : ''}
                        </div>
                        <div class="chat-action">
                            💬 Chat Now
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="handoff-showcase">
            <h3>🤝 Seamless AI Handoff System</h3>
            <p>Watch how our AI agents coordinate your order through each stage:</p>
            <div class="handoff-flow">
                <div class="handoff-step ${currentInvoice.currentStatus === 'discovery' ? 'active' : 'completed'}">
                    <div class="handoff-agent" style="background: ${aiAgents.sparky.color};">👨‍💼</div>
                    <div class="handoff-label">Discovery</div>
                </div>
                <div class="handoff-arrow">→</div>
                <div class="handoff-step ${currentInvoice.currentStatus === 'inspection' ? 'active' : currentInvoice.services.inspection.status === 'completed' ? 'completed' : 'pending'}">
                    <div class="handoff-agent" style="background: ${aiAgents.inspector.color};">👩‍🔬</div>
                    <div class="handoff-label">Inspection</div>
                </div>
                <div class="handoff-arrow">→</div>
                <div class="handoff-step ${currentInvoice.currentStatus === 'payment' ? 'active' : currentInvoice.services.payment.status === 'completed' ? 'completed' : 'pending'}">
                    <div class="handoff-agent" style="background: ${aiAgents.penny.color};">👩‍💰</div>
                    <div class="handoff-label">Payment</div>
                </div>
                <div class="handoff-arrow">→</div>
                <div class="handoff-step ${currentInvoice.currentStatus === 'shipping' ? 'active' : currentInvoice.services.shipping.status === 'completed' ? 'completed' : 'pending'}">
                    <div class="handoff-agent" style="background: ${aiAgents.captain.color};">👨‍✈️</div>
                    <div class="handoff-label">Shipping</div>
                </div>
            </div>
        </div>
    `;
    
    dashboardSection.innerHTML = dashboardHTML;
}
// ===== PART 2: MAIN FUNCTIONS =====

function chatWithAgent(agentKey) {
    currentAgent = agentKey;
    showAgentChat();
}

function showAgentChat() {
    document.getElementById('existing-customer-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    const agent = aiAgents[currentAgent];
    updateAgentStatus(currentAgent, true);
    document.getElementById('current-agent-title').textContent = `💬 Chat with ${agent.name}`;
    
    // Hide negotiation phase, show agent chat
    document.getElementById('negotiation-phase').style.display = 'none';
    
    let agentChatPhase = document.getElementById('agent-chat-phase');
    if (!agentChatPhase) {
        createAgentChatPhase();
        agentChatPhase = document.getElementById('agent-chat-phase');
    }
    agentChatPhase.style.display = 'block';
    
    populateAgentChat();
}

function createAgentChatPhase() {
    const chatArea = document.querySelector('.chat-area');
    
    const agentChatHTML = `
        <div class="agent-chat-phase" id="agent-chat-phase" style="display: none;">
            <div class="customer-order-summary" id="customer-order-summary">
                <!-- Order summary will be populated here -->
            </div>
            
            <div class="agent-chat-messages" id="agent-chat-messages">
                <!-- Chat messages will be populated here -->
            </div>
            
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="agent-chat-input" placeholder="Type your message..." />
                <button class="send-btn" onclick="sendAgentMessage()">➤</button>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="goBackToDashboard()">← Back to Dashboard</button>
                <button class="btn btn-primary" onclick="requestStatusUpdate()">📋 Request Update</button>
            </div>
        </div>
    `;
    
    chatArea.insertAdjacentHTML('beforeend', agentChatHTML);
}

function populateAgentChat() {
    const agent = aiAgents[currentAgent];
    const service = currentInvoice.services[currentAgent];
    
    // Populate order summary
    const orderSummary = document.getElementById('customer-order-summary');
    orderSummary.innerHTML = `
        <div class="order-summary-header">
            <div class="agent-info">
                <div class="agent-avatar-chat" style="background: ${agent.color};">
                    ${agent.avatar}
                </div>
                <div class="agent-details">
                    <h3>${agent.name}</h3>
                    <p>${agent.role}</p>
                    <span class="service-status-badge ${service.status}">${service.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="order-info">
                <div><strong>Order:</strong> #${currentInvoice.invoice}</div>
                <div><strong>Vehicle:</strong> ${currentInvoice.vehicle}</div>
                <div><strong>Service Date:</strong> ${service.date || 'Not started'}</div>
            </div>
        </div>
    `;
    
    // Reset and populate chat messages
    const chatMessages = document.getElementById('agent-chat-messages');
    chatMessages.innerHTML = '';
    
    // Add agent greeting
    setTimeout(() => {
        addAgentChatMessage(agentGreetings[currentAgent]);
    }, 500);
    
    // Add Enter key listener
    const chatInput = document.getElementById('agent-chat-input');
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAgentMessage();
        }
    });
}

function sendAgentMessage() {
    const input = document.getElementById('agent-chat-input');
    const message = input.value.trim();
    if (message) {
        addUserChatMessage(message);
        input.value = '';
        handleAgentMessage(message);
    }
}

function addUserChatMessage(message) {
    const messagesContainer = document.getElementById('agent-chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar" style="background: #667eea; color: white;">👤</div>
        <div class="message-content">${message}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addAgentChatMessage(message, delay = 1000) {
    setTimeout(() => {
        const messagesContainer = document.getElementById('agent-chat-messages');
        const agent = aiAgents[currentAgent];
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: ${agent.color}; color: white;">${agent.avatar}</div>
            <div class="message-content">${message}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, delay);
}

function handleAgentMessage(message) {
    const agent = aiAgents[currentAgent];
    const service = currentInvoice.services[currentAgent];
    const lowerMessage = message.toLowerCase();
    
    let response = '';
    
    if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
        response = getStatusResponse();
    } else if (lowerMessage.includes('when') || lowerMessage.includes('time')) {
        response = getTimelineResponse();
    } else if (lowerMessage.includes('help') || lowerMessage.includes('issue') || lowerMessage.includes('problem')) {
        response = getHelpResponse();
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
        response = getPositiveResponse();
    } else {
        response = getGeneralResponse();
    }
    
    addAgentChatMessage(response);
}

function getStatusResponse() {
    const agent = aiAgents[currentAgent];
    const service = currentInvoice.services[currentAgent];
    
    const statusResponses = {
        sparky: `Great question! Your car discovery and negotiation are complete! ⚡ I secured you an excellent deal on your ${currentInvoice.vehicle}. The vehicle has been reserved and I've handed everything over to Inspector Luna for the quality check phase.`,
        inspector: `Thanks for checking in! 🔬 Your ${currentInvoice.vehicle} ${service.status === 'completed' ? 'has passed our comprehensive 127-point inspection with flying colors!' : 'is currently undergoing our detailed quality inspection. Everything looks great so far!'} ${service.status === 'completed' ? 'I\'ve forwarded all documentation to Penny for payment processing.' : 'I\'ll update you once the inspection is complete.'}`,
        penny: `Hello! 💎 ${service.status === 'completed' ? 'Your payment of ' + currentInvoice.totalPaid + ' has been successfully processed!' : service.status === 'in-progress' ? 'I\'m currently processing your payment. All documents are in order and everything should be completed shortly.' : 'I\'m ready to handle your payment once Inspector Luna completes the vehicle inspection.'} ${service.status === 'completed' ? 'All documentation has been sent to Captain Rodriguez for shipping arrangements.' : ''}`,
        captain: `Ahoy! 🌊 ${service.status === 'completed' ? 'Your ' + currentInvoice.vehicle + ' has been successfully shipped!' : service.status === 'in-progress' ? 'Your vehicle is currently being prepared for shipment to ' + currentInvoice.destination + '. Estimated departure is within 2-3 business days.' : 'I\'m standing by to coordinate shipping once payment is confirmed.'} I'll keep you updated on the shipping progress!`
    };
    
    return statusResponses[currentAgent];
}

function getTimelineResponse() {
    const agent = aiAgents[currentAgent];
    const service = currentInvoice.services[currentAgent];
    
    const timelineResponses = {
        sparky: "I completed your car discovery and negotiation on " + service.date + "! ⚡ The whole process was super quick - I found your perfect match and secured a great deal in no time!",
        inspector: service.status === 'completed' ? "I finished the complete inspection on " + service.date + "! 🔬 Typically takes 2-3 business days, but your car was in such excellent condition!" : "I started the inspection process on " + service.date + ". 🔬 Should be completed within 24-48 hours. I'm being extra thorough!",
        penny: service.status === 'completed' ? "Payment was processed successfully on " + service.date + "! 💎 Everything went smoothly with all documentation." : service.status === 'in-progress' ? "Payment processing started on " + service.date + ". 💎 Should be completed within 24 hours!" : "I'll begin payment processing immediately once inspection is complete! 💎",
        captain: service.status === 'completed' ? "Shipping commenced on " + service.date + "! 🌊 Typical transit time to " + currentInvoice.destination + " is 10-15 business days." : "Shipping preparation will begin immediately after payment confirmation! 🌊 I have vessels ready for " + currentInvoice.destination + "."
    };
    
    return timelineResponses[currentAgent];
}

function getHelpResponse() {
    const helpResponses = {
        sparky: "I'm here to help! ⚡ If you have any questions about your vehicle choice or the negotiation process, just ask! I made sure you got the best possible deal on your " + currentInvoice.vehicle + "!",
        inspector: "No worries, I'm here to help! 🔬 If you have any concerns about the vehicle condition or inspection process, I can provide detailed reports and photos. Quality is my top priority!",
        penny: "I'm here to assist! 💎 If you have questions about payment methods, documentation, or billing, I can help clarify everything. Your financial security is important to me!",
        captain: "I'm at your service! 🌊 If you need information about shipping routes, insurance, or delivery tracking, I can provide all the details. Safe delivery is my mission!"
    };
    
    return helpResponses[currentAgent];
}

function getPositiveResponse() {
    const positiveResponses = {
        sparky: "Aww, thank you! ⚡ I absolutely love helping customers find their perfect cars! Your enthusiasm makes my job so much fun!",
        inspector: "Thank you so much! 🔬 I take great pride in ensuring every vehicle meets our highest quality standards. Your satisfaction means everything!",
        penny: "You're so kind! 💎 I really enjoy making the payment process smooth and transparent for our customers. Happy to help!",
        captain: "Much appreciated! 🌊 Nothing makes me happier than successfully delivering vehicles to satisfied customers worldwide!"
    };
    
    return positiveResponses[currentAgent];
}

function getGeneralResponse() {
    const agent = aiAgents[currentAgent];
    const generalResponses = {
        sparky: "That's interesting! ⚡ I'm always excited to chat about cars and deals! What else would you like to know about your " + currentInvoice.vehicle + "?",
        inspector: "I understand! 🔬 Is there anything specific about the inspection process or vehicle quality you'd like me to explain further?",
        penny: "I see! 💎 Feel free to ask me anything about payments, invoicing, or documentation. I'm here to make things clear!",
        captain: "Understood! 🌊 If you have any questions about shipping logistics or delivery, I'm your go-to expert!"
    };
    
    return generalResponses[currentAgent];
}

function requestStatusUpdate() {
    const agent = aiAgents[currentAgent];
    addUserChatMessage("Can you give me a detailed status update on my order?");
    
    setTimeout(() => {
        const detailedUpdate = `Absolutely! Here's your comprehensive status update for Order #${currentInvoice.invoice}: 
        
📋 **Current Phase:** ${currentInvoice.currentStatus.charAt(0).toUpperCase() + currentInvoice.currentStatus.slice(1)}
🚗 **Vehicle:** ${currentInvoice.vehicle}
💰 **Total Paid:** ${currentInvoice.totalPaid}
🌍 **Destination:** ${currentInvoice.destination}

**Service Progress:**
✅ Discovery: Completed by Sparky
${currentInvoice.services.inspection.status === 'completed' ? '✅' : currentInvoice.services.inspection.status === 'in-progress' ? '⏳' : '⏸️'} Inspection: ${currentInvoice.services.inspection.status} by Inspector Luna
${currentInvoice.services.payment.status === 'completed' ? '✅' : currentInvoice.services.payment.status === 'in-progress' ? '⏳' : '⏸️'} Payment: ${currentInvoice.services.payment.status} by Penny
${currentInvoice.services.shipping.status === 'completed' ? '✅' : currentInvoice.services.shipping.status === 'in-progress' ? '⏳' : '⏸️'} Shipping: ${currentInvoice.services.shipping.status} by Captain Rodriguez

Everything is progressing smoothly! 🎉`;
        
        addAgentChatMessage(detailedUpdate);
    }, 1500);
}

function goBackToDashboard() {
    document.getElementById('chat-interface').style.display = 'none';
    document.getElementById('existing-customer-phase').style.display = 'flex';
    document.getElementById('customer-login-section').style.display = 'none';
    document.getElementById('customer-dashboard-section').style.display = 'block';
}

function goBackToHome() {
    document.getElementById('demo-container').classList.remove('active');
    document.getElementById('welcome-page').style.display = 'flex';
    
    // Reset existing customer state
    currentInvoice = null;
    currentAgent = null;
    
    // Hide all phases
    const existingCustomerPhase = document.getElementById('existing-customer-phase');
    if (existingCustomerPhase) {
        existingCustomerPhase.style.display = 'none';
    }
}

// UPDATE THE ORIGINAL FUNCTIONS

function showExistingCustomerInfo() {
    showExistingCustomerPortal();
}

function showOnboarding() {
    document.getElementById('onboarding-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'none';
    
    // Hide existing customer phase
    const existingCustomerPhase = document.getElementById('existing-customer-phase');
    if (existingCustomerPhase) {
        existingCustomerPhase.style.display = 'none';
    }
    
    populateCarMakes();
    updatePreferenceStatus();
}

function populateCarMakes() {
    const makeSelect = document.getElementById('car-make');
    if (!makeSelect) return;
    makeSelect.innerHTML = '<option value="">Any Make</option>';
    Object.keys(carMakers).forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make;
        makeSelect.appendChild(option);
    });
}

function updateModelOptions() {
    selectedMake = document.getElementById('car-make').value;
    const modelSelect = document.getElementById('car-model');
    const yearSelect = document.getElementById('car-year');
    modelSelect.innerHTML = '<option value="">Any Model</option>';
    yearSelect.innerHTML = '<option value="">Any Year</option>';
    selectedModel = '';
    selectedYear = '';
    
    if (selectedMake && carMakers[selectedMake]) {
        carMakers[selectedMake].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
    updatePreferenceStatus();
}

function updateYearOptions() {
    selectedModel = document.getElementById('car-model').value;
    const yearSelect = document.getElementById('car-year');
    yearSelect.innerHTML = '<option value="">Any Year</option>';
    selectedYear = '';
    if (selectedMake && selectedModel) {
        ['2020', '2019', '2018', '2017', '2016'].forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
    updatePreferenceStatus();
}

function updateMileageDisplay(value) {
    selectedMileage = parseInt(value);
    document.getElementById('mileage-display').textContent = selectedMileage.toLocaleString() + ' km';
    updatePreferenceStatus();
}

function updateBudgetDisplay(value) {
    selectedBudget = parseInt(value);
    document.getElementById('budget-display').textContent = ' + selectedBudget.toLocaleString();
    updatePreferenceStatus();
}

function updatePreferenceStatus() {
    const sections = document.querySelectorAll('.preference-section');
    const findButton = document.querySelector('.find-cars-btn');
    let allComplete = true;
    
    selectedYear = document.getElementById('car-year')?.value || '';
    
    if (selectedMake || selectedModel || selectedYear) {
        sections[0].classList.add('complete');
        sections[0].classList.remove('incomplete');
    } else {
        sections[0].classList.add('incomplete');
        sections[0].classList.remove('complete');
        allComplete = false;
    }
    
    if (selectedMileage > 0) {
        sections[1].classList.add('complete');
        sections[1].classList.remove('incomplete');
    } else {
        sections[1].classList.add('incomplete');
        sections[1].classList.remove('complete');
        allComplete = false;
    }
    
    if (selectedBudget > 1000) {
        sections[2].classList.add('complete');
        sections[2].classList.remove('incomplete');
    } else {
        sections[2].classList.add('incomplete');
        sections[2].classList.remove('complete');
        allComplete = false;
    }
    
    if (findButton) {
        if (allComplete) {
            findButton.classList.remove('incomplete');
            findButton.textContent = '⚡ Find My Perfect Cars';
        } else {
            findButton.classList.add('incomplete');
            findButton.textContent = '⚠️ Complete Preferences First';
        }
    }
}

function findMatchingCars() {
    selectedMake = document.getElementById('car-make').value;
    selectedModel = document.getElementById('car-model').value;
    selectedYear = document.getElementById('car-year').value;
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    setTimeout(() => {
        let filteredCars = [...cars];
        
        if (selectedMake) {
            filteredCars = filteredCars.filter(car => car.make === selectedMake);
        }
        if (selectedModel) {
            filteredCars = filteredCars.filter(car => car.model === selectedModel);
        }
        if (selectedYear) {
            filteredCars = filteredCars.filter(car => car.year == selectedYear);
        }
        
        filteredCars = filteredCars.filter(car => car.price <= selectedBudget * 1.5);
        
        if (filteredCars.length === 0) {
            filteredCars = cars.slice(0, 3);
        }
        
        availableCars = filteredCars.slice(0, 6);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        showCarDiscovery();
    }, 1000);
}

function showCarDiscovery() {
    document.getElementById('onboarding-phase').style.display = 'none';
    document.getElementById('car-discovery-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').classList.add('active');
    document.getElementById('chat-interface').style.display = 'none';
    generateCarCards();
}

function generateCarCards() {
    const container = document.getElementById('simple-car-grid');
    container.innerHTML = '';

    availableCars.forEach((car, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'simple-car-card';
        cardElement.onclick = () => selectSimpleCar(index);
        
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #22c55e, #16a34a)', 
            'linear-gradient(135deg, #f59e0b, #d97706)',
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'linear-gradient(135deg, #06b6d4, #0891b2)',
            'linear-gradient(135deg, #ef4444, #dc2626)'
        ];
        
        const trend = Math.random() > 0.7 ? 'down' : 'up';
        const trendPercent = trend === 'up' ? '+' + (Math.random() * 4 + 1).toFixed(1) + '%' : '-' + (Math.random() * 2 + 0.5).toFixed(1) + '%';
        
        cardElement.innerHTML = `
            <div class="car-header" style="background: ${gradients[index % gradients.length]}; position: relative; overflow: hidden;">
                <img src="${car.image}" alt="${car.make} ${car.model}" 
                     style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4rem; position: absolute; top: 0; left: 0;">${car.icon}</div>
                <div class="price-trend-badge ${trend}" style="position: absolute; top: 15px; right: 15px; z-index: 10;">
                    ${trend === 'up' ? '📈' : '📉'} ${trendPercent}
                </div>
            </div>
            
            <div class="car-info-section">
                <h3 class="car-title">${car.year} ${car.make} ${car.model}</h3>
                <div class="car-specs">
                    📍 ${car.location}, Japan<br>
                    📅 ${car.year} • ⭐ Excellent Condition
                </div>
                <div class="car-price" style="color: ${gradients[index % gradients.length].split(',')[0].split('(')[1]};">
                    ${car.price.toLocaleString()}
                </div>
                <div class="car-cta" style="background: ${gradients[index % gradients.length].replace('135deg', '45deg').replace(')', ', 0.1)')}; color: ${gradients[index % gradients.length].split(',')[0].split('(')[1]};">
                    ⚡ Negotiate with Sparky!
                </div>
            </div>
        `;
        
        container.appendChild(cardElement);
    });
}

function selectSimpleCar(index) {
    selectedCar = availableCars[index];
    originalPrice = selectedCar.price;
    currentPrice = selectedCar.price;
    
    const cards = document.querySelectorAll('.simple-car-card');
    cards[index].classList.add('selected');
    
    setTimeout(() => {
        startNegotiation();
    }, 500);
}

function startNegotiation() {
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    updateAgentStatus('sparky', true);
    updateProgress(25);
    document.getElementById('current-agent-title').textContent = '⚡ Discovery & Negotiation with Sparky';
    document.getElementById('negotiation-phase').style.display = 'block';
    
    // Hide agent chat phase if it exists
    const agentChatPhase = document.getElementById('agent-chat-phase');
    if (agentChatPhase) {
        agentChatPhase.style.display = 'none';
    }
    
    populateSelectedCarDisplay();
    resetChatMessages();
    addInitialSparkyMessage();
    negotiationCount = 0;
    discountApplied = 0;
    updatePriceDisplay();
    updateNegotiationInfo();
}

function resetChatMessages() {
    const messagesContainer = document.getElementById('negotiation-messages');
    messagesContainer.innerHTML = '';
}

function addInitialSparkyMessage() {
    setTimeout(() => {
        const messagesContainer = document.getElementById('negotiation-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-avatar sparky-avatar">👨‍💼</div>
            <div class="message-content">Hey there! I'm Sparky, your personal car-hunting AI! ⚡ I'm absolutely THRILLED you picked this amazing ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} from ${selectedCar.location}! This beauty is already at a great price, but here's the exciting part - I've got some AI magic up my sleeve and might be able to work out an even better deal for you! What do you think about the current price? Let's make some sparks fly! 🚗✨</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
}

function populateSelectedCarDisplay() {
    const container = document.getElementById('selected-car-display');
    container.innerHTML = `
        <div class="selected-car-image" style="position: relative; overflow: hidden; border-radius: 12px;">
            <img src="${selectedCar.image}" alt="${selectedCar.make} ${selectedCar.model}" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px; position: absolute; top: 0; left: 0;">
                ${selectedCar.icon}
            </div>
        </div>
        <div class="selected-car-info">
            <h3>${selectedCar.year} ${selectedCar.make} ${selectedCar.model}</h3>
            <div class="quick-specs">
                <div><strong>Year:</strong> ${selectedCar.year}</div>
                <div><strong>Location:</strong> ${selectedCar.location}</div>
                <div><strong>Condition:</strong> Excellent</div>
                <div><strong>Market:</strong> Japan Export</div>
            </div>
        </div>
        <div class="price-display">
            <div class="current-price" id="current-price-display">${currentPrice.toLocaleString()}</div>
            <div class="original-price" id="original-price-display" style="display: none;">${originalPrice.toLocaleString()}</div>
            <div class="discount-badge" id="discount-badge-display" style="display: none;">DISCOUNT</div>
        </div>
    `;
}

function sendNegotiationMessage() {
    const input = document.getElementById('negotiation-input');
    const message = input.value.trim();
    if (message) {
        addUserMessage(message);
        input.value = '';
        handleUserMessage(message);
    }
}

function quickReply(message) {
    addUserMessage(message);
    handleUserMessage(message);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('negotiation-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar" style="background: #667eea; color: white;">👤</div>
        <div class="message-content">${message}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addAIResponse(message, delay = 1000) {
    const typingIndicator = document.getElementById('typing-negotiation');
    if (typingIndicator) {
        typingIndicator.classList.add('active');
    }
    
    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.classList.remove('active');
        }
        
        const messagesContainer = document.getElementById('negotiation-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-avatar sparky-avatar">👨‍💼</div>
            <div class="message-content">${message}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, delay);
}

function handleUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('expensive') || lowerMessage.includes('too much') || lowerMessage.includes('cheaper') || lowerMessage.includes('lower')) {
        handleNegotiation('expensive');
    } else if (lowerMessage.includes('best price') || lowerMessage.includes('lowest') || lowerMessage.includes('final')) {
        handleNegotiation('best');
    } else if (lowerMessage.includes('accept') || lowerMessage.includes('deal') || lowerMessage.includes('buy')) {
        acceptCurrentPrice();
    } else {
        const responses = [
            `I understand! This ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} from ${selectedCar.location} is a fantastic deal! Let me see what I can do for you. 💪`,
            `Great question! This Japanese car has excellent history and quality. But I'm here to negotiate the best price for you! ⚡`,
            `I appreciate your interest! Let me check my pricing algorithms for this ${selectedCar.location} vehicle... 🤖`
        ];
        addAIResponse(responses[Math.floor(Math.random() * responses.length)]);
    }
}

function handleNegotiation(type) {
    negotiationCount++;
    let newDiscount = 0;
    let response = '';
    const maxDiscount = Math.floor(originalPrice * 0.1);

    if (type === 'expensive' && negotiationCount === 1) {
        newDiscount = Math.floor(maxDiscount * 0.3);
        response = `I hear you! Let me apply my AI magic for this ${selectedCar.location} car... ✨ I can offer you a ${newDiscount.toLocaleString()} discount! That brings it down to ${(currentPrice - newDiscount).toLocaleString()}. This is a really good deal for a Japanese export!`;
    } else if (type === 'expensive' && negotiationCount === 2) {
        newDiscount = Math.floor(maxDiscount * 0.6);
        response = `Wow, you're a tough negotiator! 💪 My AI algorithms are working overtime for this ${selectedCar.year} ${selectedCar.make}... I can go as low as ${(originalPrice - newDiscount).toLocaleString()}. That's ${newDiscount.toLocaleString()} off!`;
    } else if (type === 'best' || negotiationCount >= 3) {
        newDiscount = maxDiscount;
        response = `Alright, you've convinced me! 🤝 Here's my ABSOLUTE best price for this ${selectedCar.location} beauty - ${(originalPrice - newDiscount).toLocaleString()}! That's 10% off the original price. This is as low as I can go for this quality Japanese car!`;
    }

    if (newDiscount > discountApplied) {
        discountApplied = newDiscount;
        currentPrice = originalPrice - discountApplied;
        updatePriceDisplay();
        updateNegotiationInfo();
    }

    addAIResponse(response);
}

function updatePriceDisplay() {
    const currentPriceEl = document.getElementById('current-price-display');
    const originalPriceEl = document.getElementById('original-price-display');
    const discountBadgeEl = document.getElementById('discount-badge-display');
    
    if (currentPriceEl) {
        currentPriceEl.textContent = ' + currentPrice.toLocaleString();
    }
    
    if (discountApplied > 0) {
        if (originalPriceEl) {
            originalPriceEl.style.display = 'block';
            originalPriceEl.textContent = ' + originalPrice.toLocaleString();
        }
        if (discountBadgeEl) {
            discountBadgeEl.style.display = 'inline-block';
            discountBadgeEl.textContent = ' + discountApplied.toLocaleString() + ' OFF';
        }
    }
}

function updateNegotiationInfo() {
    const minPrice = originalPrice - Math.floor(originalPrice * 0.1);
    document.getElementById('min-price').textContent = ' + minPrice.toLocaleString();
    document.getElementById('max-price').textContent = ' + originalPrice.toLocaleString();
}

function acceptCurrentPrice() {
    addUserMessage("Perfect! I'll take it at this price.");
    addAIResponse(`Fantastic! 🎉 You've made an excellent choice with this ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} from ${selectedCar.location}! Your car is now reserved. Let me connect you with our other AI agents to complete your purchase!`, 1000);
    
    setTimeout(() => {
        showSuccess();
    }, 2500);
}

function showSuccess() {
    document.getElementById('negotiation-phase').style.display = 'none';
    document.getElementById('success-phase').style.display = 'block';
    
    updateAgentStatus('captain', true);
    updateProgress(100);
    document.getElementById('current-agent-title').textContent = '🎉 Mission Complete! All Agents Successful';
    
    document.getElementById('summary-vehicle').textContent = selectedCar.year + ' ' + selectedCar.make + ' ' + selectedCar.model;
    document.getElementById('summary-total').textContent = ' + currentPrice.toLocaleString();
}

function updateAgentStatus(activeAgent, isActive) {
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active', 'completed');
    });
    
    if (activeAgent === 'inspector' || activeAgent === 'penny' || activeAgent === 'captain') {
        document.getElementById('agent-sparky').classList.add('completed');
    }
    if (activeAgent === 'penny' || activeAgent === 'captain') {
        document.getElementById('agent-inspector').classList.add('completed');
    }
    if (activeAgent === 'captain') {
        document.getElementById('agent-penny').classList.add('completed');
    }
    
    if (isActive) {
        document.getElementById('agent-' + activeAgent).classList.add('active');
    }
}

function updateProgress(percentage) {
    document.getElementById('progress').style.width = percentage + '%';
}

function goBack() {
    document.getElementById('welcome-page').style.display = 'flex';
    document.getElementById('demo-container').classList.remove('active');
    resetDemo();
}

function goBackToPreferences() {
    showOnboarding();
}

function restartDemo() {
    resetDemo();
    showOnboarding();
}

function resetDemo() {
    selectedMake = '';
    selectedModel = '';
    selectedYear = '';
    selectedMileage = 150000;
    selectedBudget = 7000;
    availableCars = [];
    selectedCar = null;
    currentPrice = 0;
    originalPrice = 0;
    discountApplied = 0;
    negotiationCount = 0;
    
    const makeSelect = document.getElementById('car-make');
    const modelSelect = document.getElementById('car-model');
    const yearSelect = document.getElementById('car-year');
    
    if (makeSelect) makeSelect.value = '';
    if (modelSelect) {
        modelSelect.innerHTML = '<option value="">Any Model</option>';
        modelSelect.value = '';
    }
    if (yearSelect) {
        yearSelect.innerHTML = '<option value="">Any Year</option>';
        yearSelect.value = '';
    }
    
    document.getElementById('mileage-range').value = 150000;
    document.getElementById('budget-range').value = 7000;
    updateMileageDisplay(150000);
    updateBudgetDisplay(7000);
    updatePreferenceStatus();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo with Existing Customer Portal...');
    
    document.getElementById('welcome-page').style.display = 'flex';
    document.getElementById('demo-container').classList.remove('active');
    
    populateCarMakes();
    updatePreferenceStatus();
    
    const negotiationInput = document.getElementById('negotiation-input');
    if (negotiationInput) {
        negotiationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendNegotiationMessage();
            }
        });
    }
    
    console.log('✅ Demo ready with Existing Customer Portal!');
    console.log('📋 Invoice numbers: 001, 002, 003');
    console.log('👥 AI Agents: Sparky (👨‍💼), Inspector Luna (👩‍🔬), Penny (👩‍💰), Captain Rodriguez (👨‍✈️)');
});
