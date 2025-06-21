// CLEAN OTOZ.AI SCRIPT - COMPLETE REPLACEMENT
// ================================================================
// This script contains ONLY the essential working functions
// Replace your entire js/script.js file with this content

console.log('🚀 Loading clean OTOZ.AI script...');

// Global variables
let selectedCar = null;
let currentPhase = 'welcome';
let availableCars = [];

// ================================================================
// CORE NAVIGATION FUNCTIONS
// ================================================================

function startDemo() {
    console.log('🚀 Starting demo...');
    
    // Hide welcome page
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
        welcomePage.style.display = 'none';
    }
    
    // Show demo container
    const demoContainer = document.getElementById('demo-container');
    if (demoContainer) {
        demoContainer.style.display = 'block';
        demoContainer.classList.add('active');
    }
    
    // Show onboarding phase
    showOnboarding();
}

function showOnboarding() {
    console.log('📋 Showing onboarding phase...');
    currentPhase = 'onboarding';
    
    // Show onboarding
    const onboardingPhase = document.getElementById('onboarding-phase');
    if (onboardingPhase) {
        onboardingPhase.style.display = 'flex';
    }
    
    // Hide other phases
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'none';
    }
    
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
        chatInterface.style.display = 'none';
    }
}

function goBack() {
    console.log('⬅️ Going back to welcome...');
    
    const welcomePage = document.getElementById('welcome-page');
    const demoContainer = document.getElementById('demo-container');
    
    if (welcomePage) welcomePage.style.display = 'flex';
    if (demoContainer) {
        demoContainer.classList.remove('active');
        demoContainer.style.display = 'none';
    }
}

// ================================================================
// EXISTING CUSTOMER FUNCTIONS
// ================================================================

function showExistingCustomerPortal() {
    console.log('👤 Opening existing customer portal...');
    
    const portal = document.getElementById('existing-customer-portal');
    if (portal) {
        portal.style.display = 'flex';
        portal.classList.add('active');
    } else {
        // Create portal if it doesn't exist
        createCustomerPortal();
    }
}

function createCustomerPortal() {
    const portalHTML = `
        <div id="customer-portal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <div style="font-size: 3rem; margin-bottom: 20px;">👤</div>
                <h2 style="color: #1e293b; margin-bottom: 10px;">Existing Customer Portal</h2>
                <p style="color: #64748b; margin-bottom: 25px;">Enter your Vehicle ID or Order Number to check status</p>
                
                <input 
                    type="text" 
                    id="customer-vehicle-id" 
                    placeholder="e.g., OTZ-2024-001"
                    style="
                        width: 100%;
                        padding: 15px;
                        border: 2px solid #e2e8f0;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        font-size: 16px;
                        box-sizing: border-box;
                    "
                >
                
                <h3 style="color: #374151; margin: 20px 0 15px 0;">Select Agent:</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px;">
                    <button onclick="accessAgent('SPARKY')" style="
                        background: #fef3c7;
                        color: #f59e0b;
                        border: 2px solid #fbbf24;
                        padding: 15px 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 700;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        ⚡ Sparky<br><small>Negotiation</small>
                    </button>
                    
                    <button onclick="accessAgent('INSPECTOR')" style="
                        background: #dbeafe;
                        color: #3b82f6;
                        border: 2px solid #60a5fa;
                        padding: 15px 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 700;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔍 Inspector<br><small>Quality Check</small>
                    </button>
                    
                    <button onclick="accessAgent('PENNY')" style="
                        background: #dcfce7;
                        color: #22c55e;
                        border: 2px solid #4ade80;
                        padding: 15px 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 700;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        💰 Penny<br><small>Payment</small>
                    </button>
                    
                    <button onclick="accessAgent('CAPTAIN')" style="
                        background: #f3e8ff;
                        color: #8b5cf6;
                        border: 2px solid #a78bfa;
                        padding: 15px 12px;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 700;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🚢 Captain<br><small>Shipping</small>
                    </button>
                </div>
                
                <button onclick="closeExistingCustomerPortal()" style="
                    background: #6b7280;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', portalHTML);
}

function closeExistingCustomerPortal() {
    const overlay = document.getElementById('customer-portal-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    const portal = document.getElementById('existing-customer-portal');
    if (portal) {
        portal.classList.remove('active');
        portal.style.display = 'none';
    }
}

function accessAgent(agentType) {
    const vehicleId = document.getElementById('customer-vehicle-id')?.value?.trim();
    
    if (!vehicleId) {
        alert('Please enter your Vehicle ID or Order Number first.');
        return;
    }
    
    // Mock agent responses
    const agentResponses = {
        'SPARKY': `⚡ SPARKY - Negotiation Agent\n\nVehicle ID: ${vehicleId}\n\n✅ Negotiation Status: Completed\n💰 Final Price: $24,500 (10% discount applied)\n📅 Date: March 15, 2024\n💪 Savings: $2,500\n\nYour negotiation was successful!`,
        
        'INSPECTOR': `🔍 INSPECTOR - Quality Agent\n\nVehicle ID: ${vehicleId}\n\n✅ Inspection Status: Completed\n🏆 Overall Grade: A+ (Excellent)\n🔧 Engine: Perfect condition\n🚗 Body: Minor wear, acceptable\n🪑 Interior: Excellent condition\n📅 Inspection Date: March 16, 2024`,
        
        'PENNY': `💰 PENNY - Payment Agent\n\nVehicle ID: ${vehicleId}\n\n💳 Payment Status: Processing\n💵 Amount: $24,500\n🏦 Method: Bank Transfer\n📅 Processing Date: March 17, 2024\n⏰ Expected Completion: March 18, 2024`,
        
        'CAPTAIN': `🚢 CAPTAIN - Shipping Agent\n\nVehicle ID: ${vehicleId}\n\n🚢 Shipping Status: In Transit\n🌊 From: Tokyo, Japan\n🗽 To: New York, USA\n⛵ Ship: MV Ocean Express\n📅 ETA: April 2, 2024\n📦 Tracking: OTZ-${vehicleId}-2024`
    };
    
    closeExistingCustomerPortal();
    
    setTimeout(() => {
        alert(agentResponses[agentType] || `🤖 ${agentType} Agent\n\nVehicle ID: ${vehicleId}\n\nStatus information would be displayed here in the full application.`);
    }, 300);
}

// ================================================================
// CAR DISCOVERY FUNCTIONS
// ================================================================

function findMatchingCars() {
    console.log('🔍 Finding cars...');
    
    // Show loading
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Generate cars
    generateSimpleCars();
    
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        showCarDiscovery();
    }, 1500);
}

function generateSimpleCars() {
    availableCars = [
        {
            id: 1,
            name: '2020 Toyota Camry LE',
            price: 22000,
            mileage: 35000,
            engine: '2.5L I4',
            transmission: 'Automatic',
            icon: '🚗'
        },
        {
            id: 2,
            name: '2019 Honda Accord LX',
            price: 20500,
            mileage: 42000,
            engine: '1.5L Turbo',
            transmission: 'CVT',
            icon: '🚙'
        },
        {
            id: 3,
            name: '2020 BMW 3 Series 330i',
            price: 32000,
            mileage: 28000,
            engine: '2.0L Turbo',
            transmission: '8-Speed Auto',
            icon: '🏎️'
        }
    ];
    
    console.log('✅ Generated 3 cars for selection');
}

function showCarDiscovery() {
    console.log('🎯 Showing car discovery...');
    
    // Hide onboarding
    const onboardingPhase = document.getElementById('onboarding-phase');
    if (onboardingPhase) {
        onboardingPhase.style.display = 'none';
    }
    
    // Show discovery
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'flex';
    }
    
    // Update title
    const titleElement = document.querySelector('.discovery-title');
    if (titleElement) {
        titleElement.textContent = `🎯 We Found ${availableCars.length} Perfect Cars For You!`;
    }
    
    // Display cars
    displaySimpleCars();
}

function displaySimpleCars() {
    const carGrid = document.getElementById('simple-car-grid');
    if (!carGrid) return;
    
    carGrid.innerHTML = '';
    
    availableCars.forEach(car => {
        const cardHTML = `
            <div class="simple-car-card" id="car-card-${car.id}" style="
                background: white;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                overflow: hidden;
                transition: all 0.3s ease;
            ">
                <div style="
                    height: 120px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                ">
                    ${car.icon}
                </div>
                
                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #1e293b;">${car.name}</h3>
                    <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 8px;">
                        ${car.mileage.toLocaleString()} km • ${car.engine}
                    </div>
                    <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 15px;">
                        ${car.transmission}
                    </div>
                    <div style="font-size: 1.6rem; font-weight: 900; color: #667eea; margin: 15px 0;">
                        $${car.price.toLocaleString()}
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="passSimpleCar(${car.id})" style="
                            flex: 1;
                            padding: 12px;
                            background: #fee2e2;
                            color: #dc2626;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">❌ Pass</button>
                        <button onclick="selectSimpleCar(${car.id})" style="
                            flex: 1;
                            padding: 12px;
                            background: #dcfce7;
                            color: #16a34a;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">⚡ Select</button>
                    </div>
                </div>
            </div>
        `;
        carGrid.innerHTML += cardHTML;
    });
}

function selectSimpleCar(carId) {
    console.log('🚗 Car selected:', carId);
    
    selectedCar = availableCars.find(car => car.id === carId);
    
    if (!selectedCar) {
        alert('Car not found!');
        return;
    }
    
    // Visual feedback
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.border = '3px solid #22c55e';
        cardElement.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
    }
    
    // Show Sparky chat
    setTimeout(() => {
        startSparkyChat();
    }, 1000);
}

function passSimpleCar(carId) {
    console.log('❌ Passing car:', carId);
    
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'translateX(-100vw)';
        cardElement.style.opacity = '0';
        
        setTimeout(() => {
            cardElement.remove();
        }, 500);
    }
}

function startSparkyChat() {
    console.log('🤖 Starting Sparky chat...');
    
    const chatHTML = `
        <div id="sparky-chat" style="
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
            <div style="padding: 20px; text-align: center; color: white; border-bottom: 1px solid rgba(255,255,255,0.2);">
                <h1 style="margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 2rem;">⚡</span>
                    Negotiating with Sparky
                </h1>
            </div>
            
            <div style="padding: 20px; color: white;">
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                    <h3>Selected Car: ${selectedCar.name}</h3>
                    <p>Current Price: $${selectedCar.price.toLocaleString()}</p>
                </div>
                
                <div id="chat-messages" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; height: 300px; overflow-y: auto; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <strong>⚡ Sparky:</strong> Hey! I'm Sparky, your AI negotiation specialist. I can offer up to 10% discount on this ${selectedCar.name}. What do you think about the price?
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="sparkyReply('expensive')" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 10px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">💰 Too expensive</button>
                    <button onclick="sparkyReply('best')" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 10px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">🎯 Best price?</button>
                    <button onclick="sparkyReply('accept')" style="
                        background: #22c55e;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">✅ Accept deal</button>
                    <button onclick="closeSparkyChat()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 20px;
                        cursor: pointer;
                    ">← Back</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
}

function sparkyReply(type) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    let response = '';
    let newPrice = selectedCar.price;
    
    if (type === 'expensive') {
        const discount = Math.floor(selectedCar.price * 0.05);
        newPrice = selectedCar.price - discount;
        response = `Great! I can offer you $${discount.toLocaleString()} off. New price: $${newPrice.toLocaleString()}`;
    } else if (type === 'best') {
        const discount = Math.floor(selectedCar.price * 0.1);
        newPrice = selectedCar.price - discount;
        response = `Here's my best price: $${newPrice.toLocaleString()} - that's 10% off!`;
    } else if (type === 'accept') {
        response = `🎉 Deal confirmed! Thank you for choosing Otoz.ai. Your ${selectedCar.name} will proceed to inspection, payment, and shipping!`;
    }
    
    chatMessages.innerHTML += `
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
            <strong>⚡ Sparky:</strong> ${response}
        </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function closeSparkyChat() {
    const chat = document.getElementById('sparky-chat');
    if (chat) {
        chat.remove();
    }
    
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'flex';
    }
}

// ================================================================
// PREFERENCE FUNCTIONS (BASIC)
// ================================================================

function updatePreferenceStatus() {
    // Basic function for preference updates
    console.log('📊 Preferences updated');
}

function updateModelOptions() {
    console.log('🚗 Model options updated');
}

function updateYearOptions() {
    console.log('📅 Year options updated');
}

function updateMileageDisplay(value) {
    const display = document.getElementById('mileage-display');
    if (display) {
        display.textContent = `${parseInt(value).toLocaleString()} km`;
    }
}

function updateBudgetDisplay(value) {
    const display = document.getElementById('budget-display');
    if (display) {
        display.textContent = `$${parseInt(value).toLocaleString()}`;
    }
}

// ================================================================
// INITIALIZATION
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Clean OTOZ.AI script loaded successfully!');
    
    // Ensure welcome page is visible
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
        welcomePage.style.display = 'flex';
    }
    
    // Ensure demo container is hidden
    const demoContainer = document.getElementById('demo-container');
    if (demoContainer) {
        demoContainer.style.display = 'none';
        demoContainer.classList.remove('active');
    }
    
    console.log('✅ Ready for user interaction!');
});

// Make functions globally available
window.startDemo = startDemo;
window.showExistingCustomerPortal = showExistingCustomerPortal;
window.closeExistingCustomerPortal = closeExistingCustomerPortal;
window.accessAgent = accessAgent;
window.findMatchingCars = findMatchingCars;
window.selectSimpleCar = selectSimpleCar;
window.passSimpleCar = passSimpleCar;
window.sparkyReply = sparkyReply;
window.closeSparkyChat = closeSparkyChat;
window.updateMileageDisplay = updateMileageDisplay;
window.updateBudgetDisplay = updateBudgetDisplay;
window.updateModelOptions = updateModelOptions;
window.updateYearOptions = updateYearOptions;
window.goBack = goBack;

console.log('✅ All functions loaded and ready!');
