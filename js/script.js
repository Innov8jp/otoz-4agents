// 🔥 SPARKY NAVIGATION FIX - REPLACE THE selectSimpleCar FUNCTION
// ================================================================

// STEP 1: Replace the selectSimpleCar function with this updated version
function selectSimpleCar(carId) {
    console.log('🚗 Car selected, transitioning to Sparky...', carId);
    
    // Find the selected car from our available cars
    const car = window.availableCars ? window.availableCars.find(c => c.id === carId) : null;
    
    if (!car) {
        // Fallback car data if availableCars not found
        const fallbackCars = {
            1: {id: 1, name: '2020 Toyota Camry LE', price: 22000, make: 'Toyota'},
            2: {id: 2, name: '2019 Honda Accord LX', price: 20500, make: 'Honda'},
            3: {id: 3, name: '2020 BMW 3 Series 330i', price: 32000, make: 'BMW'}
        };
        window.selectedCar = fallbackCars[carId];
    } else {
        window.selectedCar = car;
    }
    
    if (!window.selectedCar) {
        alert('Car not found! Please try again.');
        return;
    }
    
    // Add visual feedback to the selected card
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.border = '4px solid #22c55e';
        cardElement.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.4)';
    }
    
    // IMMEDIATE transition to Sparky (no alert popup)
    console.log('🤖 Transitioning to Sparky chat...');
    setTimeout(() => {
        transitionToSparkyChat();
    }, 800);
}

// STEP 2: Add the transition function
function transitionToSparkyChat() {
    console.log('🚀 Starting Sparky chat interface...');
    
    try {
        // Hide car discovery phase
        const discoveryPhase = document.getElementById('car-discovery-phase');
        if (discoveryPhase) {
            discoveryPhase.style.display = 'none';
            console.log('✅ Hidden car discovery phase');
        }
        
        // Show chat interface
        const chatInterface = document.getElementById('chat-interface');
        if (chatInterface) {
            chatInterface.style.display = 'flex';
            console.log('✅ Showing chat interface');
        } else {
            // Create chat interface if it doesn't exist
            createSparkyChat();
            return;
        }
        
        // Update agent status
        updateAgentStatus('sparky', true);
        updateProgress(25);
        
        // Update title
        const agentTitle = document.getElementById('current-agent-title');
        if (agentTitle) {
            agentTitle.textContent = '🤖⚡ Negotiating with Sparky';
        }
        
        // Show negotiation phase
        const negotiationPhase = document.getElementById('negotiation-phase');
        if (negotiationPhase) {
            negotiationPhase.style.display = 'block';
            console.log('✅ Showing negotiation phase');
        }
        
        // Initialize Sparky conversation
        setTimeout(() => {
            initializeSparkyConversation();
        }, 500);
        
    } catch (error) {
        console.error('❌ Error transitioning to Sparky:', error);
        // Fallback: Create a simple Sparky interface
        createSparkyChat();
    }
}

// STEP 3: Create Sparky chat if interface doesn't exist
function createSparkyChat() {
    console.log('🛠️ Creating Sparky chat interface...');
    
    // Hide discovery phase
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'none';
    }
    
    // Create chat interface HTML
    const chatHTML = `
        <div id="sparky-chat-container" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            z-index: 1000;
        ">
            <!-- Header -->
            <div style="
                background: rgba(255,255,255,0.1);
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid rgba(255,255,255,0.2);
            ">
                <h1 style="
                    color: white;
                    margin: 0;
                    font-size: 1.8rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <span style="font-size: 2.5rem;">⚡</span>
                    Negotiating with Sparky
                </h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">
                    AI-Powered Car Price Negotiation
                </p>
            </div>
            
            <!-- Selected Car Display -->
            <div style="
                background: rgba(255,255,255,0.1);
                margin: 20px;
                padding: 20px;
                border-radius: 15px;
                display: flex;
                align-items: center;
                gap: 20px;
            ">
                <div style="
                    font-size: 3rem;
                    background: rgba(255,255,255,0.2);
                    padding: 15px;
                    border-radius: 50%;
                ">🚗</div>
                <div style="color: white;">
                    <h3 style="margin: 0 0 5px 0;">${window.selectedCar.name}</h3>
                    <p style="margin: 0; opacity: 0.9;">Current Price: $${window.selectedCar.price.toLocaleString()}</p>
                </div>
            </div>
            
            <!-- Chat Messages -->
            <div id="sparky-messages" style="
                flex: 1;
                background: rgba(255,255,255,0.05);
                margin: 0 20px;
                border-radius: 15px;
                padding: 20px;
                overflow-y: auto;
                max-height: 400px;
            ">
                <!-- Messages will be added here -->
            </div>
            
            <!-- Quick Actions -->
            <div style="
                padding: 20px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                justify-content: center;
            ">
                <button onclick="sparkyQuickReply('That seems expensive')" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    💰 "That seems expensive"
                </button>
                <button onclick="sparkyQuickReply('What is your best price?')" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🎯 "Best price?"
                </button>
                <button onclick="sparkyQuickReply('I accept this deal')" style="
                    background: #22c55e;
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">
                    ✅ "Accept Deal"
                </button>
            </div>
            
            <!-- Back Button -->
            <div style="padding: 0 20px 20px 20px; text-align: center;">
                <button onclick="goBackToCarSelection()" style="
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                ">
                    ← Back to Car Selection
                </button>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Initialize conversation
    setTimeout(() => {
        initializeSparkyConversation();
    }, 500);
}

// STEP 4: Initialize Sparky conversation
function initializeSparkyConversation() {
    console.log('💬 Starting Sparky conversation...');
    
    const messages = [
        "🤖⚡ Hey there! I'm Sparky, your AI negotiation specialist!",
        `I see you've chosen the ${window.selectedCar.name} for $${window.selectedCar.price.toLocaleString()}.`,
        "Let me see what I can do to get you a better deal! I can offer discounts up to 10% based on our conversation.",
        "What do you think about the current price? Ready to negotiate? 💪"
    ];
    
    messages.forEach((message, index) => {
        setTimeout(() => {
            addSparkyMessage(message);
        }, index * 1000);
    });
}

// STEP 5: Add Sparky message function
function addSparkyMessage(message) {
    const messagesContainer = document.getElementById('sparky-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        margin: 15px 0;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideInLeft 0.5s ease;
    `;
    
    messageDiv.innerHTML = `
        <div style="
            background: #f59e0b;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        ">⚡</div>
        <div style="
            background: rgba(255,255,255,0.9);
            color: #1e293b;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 70%;
            line-height: 1.5;
        ">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// STEP 6: Quick reply functions
function sparkyQuickReply(message) {
    console.log('💬 User said:', message);
    
    // Add user message
    addUserMessage(message);
    
    // Generate Sparky response
    setTimeout(() => {
        handleSparkyNegotiation(message);
    }, 1000);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('sparky-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        margin: 15px 0;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex-direction: row-reverse;
        animation: slideInRight 0.5s ease;
    `;
    
    messageDiv.innerHTML = `
        <div style="
            background: #667eea;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        ">👤</div>
        <div style="
            background: rgba(255,255,255,0.95);
            color: #1e293b;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 70%;
            line-height: 1.5;
        ">${message}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleSparkyNegotiation(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let newPrice = window.selectedCar.price;
    
    if (lowerMessage.includes('expensive') || lowerMessage.includes('much')) {
        const discount = Math.floor(window.selectedCar.price * 0.05); // 5% discount
        newPrice = window.selectedCar.price - discount;
        response = `I hear you! Let me work my AI magic... ✨ I can offer you a $${discount.toLocaleString()} discount! New price: $${newPrice.toLocaleString()}. How does that sound?`;
    } else if (lowerMessage.includes('best') || lowerMessage.includes('lowest')) {
        const discount = Math.floor(window.selectedCar.price * 0.1); // 10% discount
        newPrice = window.selectedCar.price - discount;
        response = `Here's my ABSOLUTE best price! $${newPrice.toLocaleString()} - that's 10% off! This is as low as I can go with my AI algorithms! 🤖⚡`;
    } else if (lowerMessage.includes('accept') || lowerMessage.includes('deal')) {
        response = `🎉 Fantastic! Deal confirmed at $${window.selectedCar.price.toLocaleString()}! In the full app, you would now proceed to Inspector for quality check, then Penny for payment, and finally Captain for shipping. Thank you for choosing Otoz.ai! ⚡`;
    } else {
        response = `Great question! This ${window.selectedCar.name} is really worth every penny, but I'm here to negotiate! What specific concerns do you have about the price? 💪`;
    }
    
    addSparkyMessage(response);
}

// STEP 7: Back to car selection
function goBackToCarSelection() {
    const sparkyContainer = document.getElementById('sparky-chat-container');
    if (sparkyContainer) {
        sparkyContainer.remove();
    }
    
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'flex';
    }
}

// STEP 8: Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInLeft {
        from { transform: translateX(-50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInRight {
        from { transform: translateX(50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log('✅ Sparky navigation fix loaded! Car selection will now lead to Sparky chat.');
