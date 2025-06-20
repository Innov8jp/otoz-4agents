// ===== PART 1B: CORE DATA & SETUP WITH EXACT MODAL =====

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
            sparky: { status: 'completed', date: '2024-12-15', name: 'Sparky' },
            inspector: { status: 'in-progress', date: '2024-12-18', name: 'Inspector' },
            penny: { status: 'pending', date: null, name: 'Penny' },
            captain: { status: 'pending', date: null, name: 'Captain' }
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
            sparky: { status: 'completed', date: '2024-12-10', name: 'Sparky' },
            inspector: { status: 'completed', date: '2024-12-12', name: 'Inspector' },
            penny: { status: 'in-progress', date: '2024-12-16', name: 'Penny' },
            captain: { status: 'pending', date: null, name: 'Captain' }
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
            sparky: { status: 'completed', date: '2024-12-05', name: 'Sparky' },
            inspector: { status: 'completed', date: '2024-12-07', name: 'Inspector' },
            penny: { status: 'completed', date: '2024-12-09', name: 'Penny' },
            captain: { status: 'in-progress', date: '2024-12-12', name: 'Captain' }
        }
    }
};

// AI AGENTS WITH MALE/FEMALE AVATARS
const aiAgents = {
    sparky: {
        name: 'Sparky',
        role: 'Negotiation Status',
        tagline: 'Your energetic car finder!',
        avatar: '👨‍💼',
        color: '#f59e0b',
        emoji: '⚡'
    },
    inspector: {
        name: 'Inspector',
        role: 'Quality Report',
        tagline: 'Quality guarantee expert',
        avatar: '👩‍🔬',
        color: '#06b6d4',
        emoji: '🔍'
    },
    penny: {
        name: 'Penny',
        role: 'Payment Status',
        tagline: 'Financial wizard',
        avatar: '👩‍💰',
        color: '#8b5cf6',
        emoji: '💎'
    },
    captain: {
        name: 'Captain',
        role: 'Shipping Tracker',
        tagline: 'Global shipping expert',
        avatar: '👨‍✈️',
        color: '#059669',
        emoji: '🌊'
    }
};

// MAIN DEMO FUNCTIONS
function startDemo() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
}

function showExistingCustomerInfo() {
    // Create and show existing customer modal
    showExistingCustomerModal();
}

function showExistingCustomerModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('existing-customer-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML to match your screenshot exactly
    const modalHTML = `
        <div id="existing-customer-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 50px;
                border-radius: 20px;
                max-width: 650px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                position: relative;
            ">
                <!-- Close button -->
                <button onclick="closeExistingCustomerModal()" style="
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    font-size: 18px;
                    color: #64748b;
                ">×</button>
                
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🎯</div>
                    <h2 style="color: #1e293b; margin-bottom: 10px; font-size: 2rem; font-weight: 700;">Existing Customer Portal</h2>
                    <p style="color: #64748b; font-size: 1.1rem;">Access your AI agents for order updates and support</p>
                </div>
                
                <!-- Vehicle ID Input -->
                <div style="margin-bottom: 40px;">
                    <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 1.3rem; font-weight: 600;">Vehicle ID / Order Number</h3>
                    <input type="text" id="modal-invoice-input" placeholder="Enter your vehicle ID or order number" style="
                        width: 100%;
                        padding: 18px 20px;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        font-size: 16px;
                        margin-bottom: 15px;
                        outline: none;
                        box-sizing: border-box;
                    ">
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="fillModalInvoice('001')" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 14px;">001</button>
                        <button onclick="fillModalInvoice('002')" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 14px;">002</button>
                        <button onclick="fillModalInvoice('003')" style="padding: 8px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; font-size: 14px;">003</button>
                    </div>
                </div>
                
                <!-- AI Agent Selection -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e293b; margin-bottom: 20px; font-size: 1.3rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                        🤖 Select Your AI Agent
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <!-- Sparky -->
                        <div onclick="selectAgentFromModal('sparky')" style="
                            background: linear-gradient(135deg, #f59e0b, #d97706);
                            color: white;
                            padding: 30px 20px;
                            border-radius: 20px;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.3s ease;
                            border: none;
                            box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
                        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(245, 158, 11, 0.4)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 25px rgba(245, 158, 11, 0.3)'">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">⚡</div>
                            <div style="font-weight: bold; margin-bottom: 8px; font-size: 1.3rem;">Sparky</div>
                            <div style="font-size: 1rem; opacity: 0.9;">Negotiation Status</div>
                        </div>
                        
                        <!-- Inspector -->
                        <div onclick="selectAgentFromModal('inspector')" style="
                            background: linear-gradient(135deg, #06b6d4, #0891b2);
                            color: white;
                            padding: 30px 20px;
                            border-radius: 20px;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.3s ease;
                            border: none;
                            box-shadow: 0 8px 25px rgba(6, 182, 212, 0.3);
                        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(6, 182, 212, 0.4)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 25px rgba(6, 182, 212, 0.3)'">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">👩‍🔬</div>
                            <div style="font-weight: bold; margin-bottom: 8px; font-size: 1.3rem;">Inspector</div>
                            <div style="font-size: 1rem; opacity: 0.9;">Quality Report</div>
                        </div>
                        
                        <!-- Penny -->
                        <div onclick="selectAgentFromModal('penny')" style="
                            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                            color: white;
                            padding: 30px 20px;
                            border-radius: 20px;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.3s ease;
                            border: none;
                            box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
                        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(139, 92, 246, 0.4)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 25px rgba(139, 92, 246, 0.3)'">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">👩‍💰</div>
                            <div style="font-weight: bold; margin-bottom: 8px; font-size: 1.3rem;">Penny</div>
                            <div style="font-size: 1rem; opacity: 0.9;">Payment Status</div>
                        </div>
                        
                        <!-- Captain -->
                        <div onclick="selectAgentFromModal('captain')" style="
                            background: linear-gradient(135deg, #059669, #047857);
                            color: white;
                            padding: 30px 20px;
                            border-radius: 20px;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.3s ease;
                            border: none;
                            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
                        " onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(5, 150, 105, 0.4)'" onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 8px 25px rgba(5, 150, 105, 0.3)'">
                            <div style="font-size: 2.5rem; margin-bottom: 15px;">👨‍✈️</div>
                            <div style="font-weight: bold; margin-bottom: 8px; font-size: 1.3rem;">Captain</div>
                            <div style="font-size: 1rem; opacity: 0.9;">Shipping Tracker</div>
                        </div>
                    </div>
                </div>
                
                <!-- Close Button -->
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="closeExistingCustomerModal()" style="
                        background: #9ca3af;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                    ">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function fillModalInvoice(invoiceNumber) {
    document.getElementById('modal-invoice-input').value = invoiceNumber;
}

function selectAgentFromModal(agentKey) {
    const invoiceNumber = document.getElementById('modal-invoice-input').value.trim();
    
    if (!invoiceNumber) {
        alert('Please enter your invoice number first');
        return;
    }
    
    const customerData = customerOrders[invoiceNumber];
    
    if (!customerData) {
        alert('Invoice number not found. Please check your invoice number or contact support.');
        return;
    }
    
    currentInvoice = customerData;
    currentAgent = agentKey;
    
    closeExistingCustomerModal();
    showAgentChat();
}

function closeExistingCustomerModal() {
    const modal = document.getElementById('existing-customer-modal');
    if (modal) {
        modal.remove();
    }
}

function showOnboarding() {
    document.getElementById('onboarding-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'none';
    
    populateCarMakes();
    updatePreferenceStatus();
}
// ===== PART 2/3: AGENT CHAT & CORE FUNCTIONS =====

function showAgentChat() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    document.getElementById('onboarding-phase').style.display = 'none';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    const agent = aiAgents[currentAgent];
    updateAgentStatus(currentAgent, true);
    document.getElementById('current-agent-title').textContent = `💬 Chat with ${agent.name} - ${agent.role}`;
    
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
            <div class="customer-order-summary" id="customer-order-summary" style="
                background: white;
                border-radius: 16px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            ">
                <!-- Order summary will be populated here -->
            </div>
            
            <div class="agent-chat-messages" id="agent-chat-messages" style="
                background: white;
                border-radius: 16px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                max-height: 400px;
                overflow-y: auto;
            ">
                <!-- Chat messages will be populated here -->
            </div>
            
            <div class="chat-input-container" style="
                display: flex;
                gap: 10px;
                padding: 15px 20px;
                background: #f8fafc;
                border-radius: 16px;
                margin-bottom: 20px;
            ">
                <input type="text" class="chat-input" id="agent-chat-input" placeholder="Type your message..." style="
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    font-size: 14px;
                    outline: none;
                    background: white;
                " />
                <button class="send-btn" onclick="sendAgentMessage()" style="
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: #667eea;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">➤</button>
            </div>
            
            <div class="action-buttons" style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="goBackToWelcome()" style="
                    background: #f1f5f9;
                    color: #334155;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    cursor: pointer;
                    font-weight: 600;
                ">← Back to Home</button>
                <button class="btn btn-primary" onclick="requestStatusUpdate()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    cursor: pointer;
                    font-weight: 600;
                ">📋 Request Update</button>
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
    const statusColor = service.status === 'completed' ? '#22c55e' : 
                       service.status === 'in-progress' ? '#f59e0b' : '#94a3b8';
    const statusIcon = service.status === 'completed' ? '✅' : 
                      service.status === 'in-progress' ? '⏳' : '⏸️';
    
    orderSummary.innerHTML = `
        <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: center;">
            <div style="
                width: 80px;
                height: 80px;
                background: ${agent.color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: white;
            ">
                ${agent.avatar}
            </div>
            <div>
                <h3 style="margin: 0 0 5px 0; color: #1e293b;">${agent.name}</h3>
                <p style="margin: 0 0 10px 0; color: #64748b;">${agent.role}</p>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: ${statusColor}; font-weight: 600;">${statusIcon} ${service.status.toUpperCase()}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="margin-bottom: 5px;"><strong>Order:</strong> #${currentInvoice.invoice}</div>
                <div style="margin-bottom: 5px;"><strong>Vehicle:</strong> ${currentInvoice.vehicle}</div>
                <div><strong>Date:</strong> ${service.date || 'Not started'}</div>
            </div>
        </div>
    `;
    
    // Reset and populate chat messages
    const chatMessages = document.getElementById('agent-chat-messages');
    chatMessages.innerHTML = '';
    
    // Add agent greeting
    setTimeout(() => {
        addAgentChatMessage(getAgentGreeting());
    }, 500);
    
    // Add Enter key listener
    const chatInput = document.getElementById('agent-chat-input');
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendAgentMessage();
        }
    });
}

function getAgentGreeting() {
    const greetings = {
        sparky: `Hey there! I'm Sparky, your car-hunting champion! ⚡ Thanks for choosing Otoz.ai! I helped you secure this amazing ${currentInvoice.vehicle} deal. How can I help you today?`,
        inspector: `Hello! I'm Inspector, your quality assurance specialist. 🔍 I ensure every vehicle meets our premium standards. What would you like to know about your ${currentInvoice.vehicle} inspection?`,
        penny: `Hi! I'm Penny, your personal financial advisor! 💎 I handle all payments and documentation with care. How can I assist you with your ${currentInvoice.vehicle} transaction today?`,
        captain: `Greetings! Captain here, your logistics commander! 🌊 I coordinate global shipping operations for your ${currentInvoice.vehicle}. What shipping questions can I answer?`
    };
    return greetings[currentAgent];
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
        <div style="
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
        ">
            <div style="
                background: #667eea;
                color: white;
                padding: 12px 16px;
                border-radius: 16px;
                max-width: 70%;
                font-size: 14px;
            ">${message}</div>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addAgentChatMessage(message, delay = 1000) {
    setTimeout(() => {
        const messagesContainer = document.getElementById('agent-chat-messages');
        const agent = aiAgents[currentAgent];
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <div style="
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 15px;
            ">
                <div style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: ${agent.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    flex-shrink: 0;
                ">${agent.avatar}</div>
                <div style="
                    background: #f1f5f9;
                    padding: 12px 16px;
                    border-radius: 16px;
                    max-width: 70%;
                    font-size: 14px;
                    color: #1e293b;
                ">${message}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, delay);
}

function handleAgentMessage(message) {
    const service = currentInvoice.services[currentAgent];
    const lowerMessage = message.toLowerCase();
    
    let response = '';
    
    if (lowerMessage.includes('status') || lowerMessage.includes('update')) {
        response = getStatusResponse();
    } else if (lowerMessage.includes('when') || lowerMessage.includes('time')) {
        response = getTimelineResponse();
    } else if (lowerMessage.includes('help') || lowerMessage.includes('issue')) {
        response = getHelpResponse();
    } else if (lowerMessage.includes('thank')) {
        response = getPositiveResponse();
    } else {
        response = getGeneralResponse();
    }
    
    addAgentChatMessage(response);
}

function getStatusResponse() {
    const service = currentInvoice.services[currentAgent];
    
    const responses = {
        sparky: `Great question! Your car discovery and negotiation are complete! ⚡ I secured you an excellent deal on your ${currentInvoice.vehicle}. The vehicle has been reserved and handed over to our Inspector for quality checks.`,
        inspector: `Thanks for checking in! 🔍 Your ${currentInvoice.vehicle} ${service.status === 'completed' ? 'has passed our comprehensive 127-point inspection!' : 'is currently undergoing detailed quality inspection.'} ${service.status === 'completed' ? 'All documentation sent to Penny for payment.' : 'I\'ll update you once complete.'}`,
        penny: `Hello! 💎 ${service.status === 'completed' ? 'Your payment of ' + currentInvoice.totalPaid + ' has been successfully processed!' : service.status === 'in-progress' ? 'I\'m currently processing your payment. Everything should be completed shortly.' : 'I\'m ready to handle payment once inspection completes.'}`,
        captain: `Ahoy! 🌊 ${service.status === 'completed' ? 'Your ' + currentInvoice.vehicle + ' has been successfully shipped!' : service.status === 'in-progress' ? 'Your vehicle is being prepared for shipment to ' + currentInvoice.destination + '.' : 'Standing by for shipping coordination once payment confirms.'}`
    };
    
    return responses[currentAgent];
}

function getTimelineResponse() {
    const service = currentInvoice.services[currentAgent];
    
    const responses = {
        sparky: `I completed your discovery on ${service.date}! ⚡ Found your perfect match super quickly!`,
        inspector: service.status === 'completed' ? `Finished inspection on ${service.date}! 🔍 Your car was in excellent condition!` : `Started inspection on ${service.date}. 🔍 Should complete within 24-48 hours.`,
        penny: service.status === 'completed' ? `Payment processed on ${service.date}! 💎 Everything went smoothly.` : service.status === 'in-progress' ? `Processing started on ${service.date}. 💎 Almost complete!` : `Will start immediately after inspection! 💎`,
        captain: service.status === 'completed' ? `Shipped on ${service.date}! 🌊 Transit time to ${currentInvoice.destination} is 10-15 days.` : `Will begin after payment confirmation! 🌊 Ready for ${currentInvoice.destination}.`
    };
    
    return responses[currentAgent];
}

function getHelpResponse() {
    const responses = {
        sparky: `I'm here to help! ⚡ Any questions about your vehicle choice or negotiation, just ask!`,
        inspector: `Happy to help! 🔍 I can provide detailed reports and photos. Quality is my priority!`,
        penny: `I'm here to assist! 💎 Questions about payments or documentation? I can clarify everything!`,
        captain: `At your service! 🌊 Need shipping info, insurance, or tracking details? I've got you covered!`
    };
    
    return responses[currentAgent];
}

function getPositiveResponse() {
    const responses = {
        sparky: `Thank you! ⚡ I love helping customers find perfect cars!`,
        inspector: `So kind! 🔍 I take pride in quality standards!`,
        penny: `You're welcome! 💎 Happy to make payments smooth!`,
        captain: `Much appreciated! 🌊 Love delivering satisfied customers worldwide!`
    };
    
    return responses[currentAgent];
}

function getGeneralResponse() {
    const responses = {
        sparky: `Interesting! ⚡ What else about your ${currentInvoice.vehicle}?`,
        inspector: `I understand! 🔍 Anything specific about inspection process?`,
        penny: `I see! 💎 Any payment or documentation questions?`,
        captain: `Got it! 🌊 Any shipping or delivery questions?`
    };
    
    return responses[currentAgent];
}

function requestStatusUpdate() {
    addUserChatMessage("Can you give me a detailed status update on my order?");
    
    setTimeout(() => {
        const detailedUpdate = `Here's your comprehensive status for Order #${currentInvoice.invoice}:

📋 Current Phase: ${currentInvoice.currentStatus.charAt(0).toUpperCase() + currentInvoice.currentStatus.slice(1)}
🚗 Vehicle: ${currentInvoice.vehicle}
💰 Total Paid: ${currentInvoice.totalPaid}
🌍 Destination: ${currentInvoice.destination}

Service Progress:
✅ Discovery: Completed by Sparky
${currentInvoice.services.inspector.status === 'completed' ? '✅' : currentInvoice.services.inspector.status === 'in-progress' ? '⏳' : '⏸️'} Inspection: ${currentInvoice.services.inspector.status} by Inspector
${currentInvoice.services.penny.status === 'completed' ? '✅' : currentInvoice.services.penny.status === 'in-progress' ? '⏳' : '⏸️'} Payment: ${currentInvoice.services.penny.status} by Penny
${currentInvoice.services.captain.status === 'completed' ? '✅' : currentInvoice.services.captain.status === 'in-progress' ? '⏳' : '⏸️'} Shipping: ${currentInvoice.services.captain.status} by Captain

Everything progressing smoothly! 🎉`;
        
        addAgentChatMessage(detailedUpdate);
    }, 1500);
}

function goBackToWelcome() {
    document.getElementById('demo-container').classList.remove('active');
    document.getElementById('welcome-page').style.display = 'flex';
    
    // Reset state
    currentInvoice = null;
    currentAgent = null;
}
// ===== PART 3/3: ALL REMAINING FUNCTIONS =====

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
    document.getElementById('budget-display').textContent = '$' + selectedBudget.toLocaleString();
    updatePreferenceStatus();
}

function updatePreferenceStatus() {
    const sections = document.querySelectorAll('.preference-section');
    const findButton = document.querySelector('.find-cars-btn');
    let allComplete = true;
    
    selectedYear = document.getElementById('car-year')?.value || '';
    
    if (selectedMake || selectedModel || selectedYear) {
        sections[0]?.classList.add('complete');
        sections[0]?.classList.remove('incomplete');
    } else {
        sections[0]?.classList.add('incomplete');
        sections[0]?.classList.remove('complete');
        allComplete = false;
    }
    
    if (selectedMileage > 0) {
        sections[1]?.classList.add('complete');
        sections[1]?.classList.remove('incomplete');
    } else {
        sections[1]?.classList.add('incomplete');
        sections[1]?.classList.remove('complete');
        allComplete = false;
    }
    
    if (selectedBudget > 1000) {
        sections[2]?.classList.add('complete');
        sections[2]?.classList.remove('incomplete');
    } else {
        sections[2]?.classList.add('incomplete');
        sections[2]?.classList.remove('complete');
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
                    $${car.price.toLocaleString()}
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
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
}

function addInitialSparkyMessage() {
    setTimeout(() => {
        const messagesContainer = document.getElementById('negotiation-messages');
        if (!messagesContainer) return;
        
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
    if (!container) return;
    
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
            <div class="current-price" id="current-price-display">$${currentPrice.toLocaleString()}</div>
            <div class="original-price" id="original-price-display" style="display: none;">$${originalPrice.toLocaleString()}</div>
            <div class="discount-badge" id="discount-badge-display" style="display: none;">DISCOUNT</div>
        </div>
    `;
}

function sendNegotiationMessage() {
    const input = document.getElementById('negotiation-input');
    if (!input) return;
    
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
    if (!messagesContainer) return;
    
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
        if (!messagesContainer) return;
        
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
        response = `I hear you! Let me apply my AI magic for this ${selectedCar.location} car... ✨ I can offer you a $${newDiscount.toLocaleString()} discount! That brings it down to $${(currentPrice - newDiscount).toLocaleString()}. This is a really good deal for a Japanese export!`;
    } else if (type === 'expensive' && negotiationCount === 2) {
        newDiscount = Math.floor(maxDiscount * 0.6);
        response = `Wow, you're a tough negotiator! 💪 My AI algorithms are working overtime for this ${selectedCar.year} ${selectedCar.make}... I can go as low as $${(originalPrice - newDiscount).toLocaleString()}. That's $${newDiscount.toLocaleString()} off!`;
    } else if (type === 'best' || negotiationCount >= 3) {
        newDiscount = maxDiscount;
        response = `Alright, you've convinced me! 🤝 Here's my ABSOLUTE best price for this ${selectedCar.location} beauty - $${(originalPrice - newDiscount).toLocaleString()}! That's 10% off the original price. This is as low as I can go for this quality Japanese car!`;
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
        currentPriceEl.textContent = '$' + currentPrice.toLocaleString();
    }
    
    if (discountApplied > 0) {
        if (originalPriceEl) {
            originalPriceEl.style.display = 'block';
            originalPriceEl.textContent = '$' + originalPrice.toLocaleString();
        }
        if (discountBadgeEl) {
            discountBadgeEl.style.display = 'inline-block';
            discountBadgeEl.textContent = '$' + discountApplied.toLocaleString() + ' OFF';
        }
    }
}

function updateNegotiationInfo() {
    const minPrice = originalPrice - Math.floor(originalPrice * 0.1);
    const minPriceEl = document.getElementById('min-price');
    const maxPriceEl = document.getElementById('max-price');
    
    if (minPriceEl) minPriceEl.textContent = '$' + minPrice.toLocaleString();
    if (maxPriceEl) maxPriceEl.textContent = '$' + originalPrice.toLocaleString();
}

function acceptCurrentPrice() {
    addUserMessage("Perfect! I'll take it at this price.");
    addAIResponse(`Fantastic! 🎉 You've made an excellent choice with this ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} from ${selectedCar.location}! Your car is now reserved. Let me connect you with our other AI agents to complete your purchase!`, 1000);
    
    setTimeout(() => {
        showSuccess();
    }, 2500);
}

function showSuccess() {
    const negotiationPhase = document.getElementById('negotiation-phase');
    const successPhase = document.getElementById('success-phase');
    
    if (negotiationPhase) negotiationPhase.style.display = 'none';
    if (successPhase) successPhase.style.display = 'block';
    
    updateAgentStatus('captain', true);
    updateProgress(100);
    document.getElementById('current-agent-title').textContent = '🎉 Mission Complete! All Agents Successful';
    
    const summaryVehicle = document.getElementById('summary-vehicle');
    const summaryTotal = document.getElementById('summary-total');
    
    if (summaryVehicle) summaryVehicle.textContent = selectedCar.year + ' ' + selectedCar.make + ' ' + selectedCar.model;
    if (summaryTotal) summaryTotal.textContent = '$' + currentPrice.toLocaleString();
}

function updateAgentStatus(activeAgent, isActive) {
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active', 'completed');
    });
    
    if (activeAgent === 'inspector' || activeAgent === 'penny' || activeAgent === 'captain') {
        const sparkyCard = document.getElementById('agent-sparky');
        if (sparkyCard) sparkyCard.classList.add('completed');
    }
    if (activeAgent === 'penny' || activeAgent === 'captain') {
        const inspectorCard = document.getElementById('agent-inspector');
        if (inspectorCard) inspectorCard.classList.add('completed');
    }
    if (activeAgent === 'captain') {
        const pennyCard = document.getElementById('agent-penny');
        if (pennyCard) pennyCard.classList.add('completed');
    }
    
    if (isActive) {
        const activeCard = document.getElementById('agent-' + activeAgent);
        if (activeCard) activeCard.classList.add('active');
    }
}

function updateProgress(percentage) {
    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.style.width = percentage + '%';
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
    
    const mileageRange = document.getElementById('mileage-range');
    const budgetRange = document.getElementById('budget-range');
    
    if (mileageRange) mileageRange.value = 150000;
    if (budgetRange) budgetRange.value = 7000;
    
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
    console.log('👥 AI Agents: Sparky (👨‍💼), Inspector (👩‍🔬), Penny (👩‍💰), Captain (👨‍✈️)');
});
