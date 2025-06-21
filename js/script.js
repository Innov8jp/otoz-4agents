// 🔧 OTOZ.AI CRITICAL FIXES - ADD TO END OF YOUR SCRIPT.JS
// ================================================================

// ================================================================
// FIX 1: CAR DISCOVERY WITH PROPER CARDS AND BUTTONS
// ================================================================

function findMatchingCars() {
    console.log('🔍 Finding matching cars...');
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Simulate search delay
    setTimeout(() => {
        // Hide loading
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // Generate cars with proper data
        generateAvailableCars();
        
        // Show car discovery phase
        showCarDiscovery();
        
        // Generate car cards with Pass/Select buttons
        displayCarCards();
        
    }, 1000);
}

function generateAvailableCars() {
    // Create realistic car data that always works
    window.availableCars = [
        {
            id: 1,
            name: '2020 Toyota Camry LE',
            make: 'Toyota',
            model: 'Camry', 
            year: '2020',
            icon: '🚗',
            mileage: 35000,
            price: 22000,
            engine: '2.5L I4',
            transmission: 'Automatic',
            color: 'Silver',
            trim: 'LE',
            condition: 'Excellent',
            trend: 'up',
            trendPercent: '+3.2%'
        },
        {
            id: 2,
            name: '2019 Honda Accord LX',
            make: 'Honda',
            model: 'Accord',
            year: '2019', 
            icon: '🚙',
            mileage: 42000,
            price: 20500,
            engine: '1.5L Turbo',
            transmission: 'CVT',
            color: 'White',
            trim: 'LX',
            condition: 'Good',
            trend: 'up',
            trendPercent: '+2.8%'
        },
        {
            id: 3,
            name: '2020 BMW 3 Series 330i',
            make: 'BMW',
            model: '3 Series',
            year: '2020',
            icon: '🏎️',
            mileage: 28000,
            price: 32000,
            engine: '2.0L Turbo',
            transmission: '8-Speed Auto',
            color: 'White',
            trim: '330i',
            condition: 'Excellent', 
            trend: 'up',
            trendPercent: '+4.1%'
        }
    ];
    
    console.log('✅ Generated 3 cars for discovery phase');
}

function displayCarCards() {
    const carGrid = document.getElementById('simple-car-grid');
    if (!carGrid) {
        console.error('❌ Car grid element not found!');
        return;
    }
    
    // Clear existing content
    carGrid.innerHTML = '';
    
    // Add title
    const titleElement = document.querySelector('.discovery-title');
    if (titleElement) {
        titleElement.textContent = `🎯 We Found ${window.availableCars.length} Perfect Matches For You!`;
    }
    
    // Generate car cards with proper buttons
    window.availableCars.forEach((car) => {
        const cardHTML = `
            <div class="simple-car-card" id="car-card-${car.id}" style="
                background: white;
                border-radius: 15px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                overflow: hidden;
                transition: all 0.3s ease;
                margin: 10px;
            ">
                <!-- Car Image/Icon Section -->
                <div style="
                    height: 140px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3.5rem;
                    position: relative;
                ">
                    ${car.icon}
                    <!-- Trend Badge -->
                    <div style="
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        background: rgba(34, 197, 94, 0.9);
                        color: white;
                        padding: 6px 10px;
                        border-radius: 15px;
                        font-size: 11px;
                        font-weight: 600;
                    ">
                        📈 ${car.trendPercent}
                    </div>
                    <!-- Color Badge -->
                    <div style="
                        position: absolute;
                        top: 12px;
                        left: 12px;
                        background: rgba(0,0,0,0.7);
                        color: white;
                        padding: 6px 10px;
                        border-radius: 15px;
                        font-size: 10px;
                        font-weight: 600;
                    ">
                        ${car.color}
                    </div>
                </div>
                
                <!-- Car Details Section -->
                <div style="padding: 25px 20px;">
                    <!-- Car Name -->
                    <h3 style="
                        margin: 0 0 12px 0;
                        font-size: 1.2rem;
                        font-weight: 700;
                        color: #1e293b;
                        text-align: center;
                    ">
                        ${car.name}
                    </h3>
                    
                    <!-- Specs -->
                    <div style="
                        color: #64748b;
                        font-size: 0.9rem;
                        margin-bottom: 10px;
                        text-align: center;
                    ">
                        ${car.mileage.toLocaleString()} km • ${car.engine}
                    </div>
                    
                    <!-- Transmission & Condition -->
                    <div style="
                        color: #64748b;
                        font-size: 0.85rem;
                        margin-bottom: 12px;
                        text-align: center;
                    ">
                        ${car.transmission} • ${car.condition}
                    </div>
                    
                    <!-- Trim Level -->
                    <div style="
                        color: #667eea;
                        font-size: 0.8rem;
                        font-weight: 600;
                        margin-bottom: 15px;
                        text-align: center;
                    ">
                        Trim: ${car.trim}
                    </div>
                    
                    <!-- Price -->
                    <div style="
                        font-size: 1.8rem;
                        font-weight: 900;
                        color: #667eea;
                        margin: 20px 0;
                        text-align: center;
                    ">
                        $${car.price.toLocaleString()}
                    </div>
                    
                    <!-- Action Buttons - FIXED -->
                    <div style="
                        display: flex;
                        gap: 12px;
                        justify-content: space-between;
                        margin-top: 20px;
                    ">
                        <button 
                            onclick="passSimpleCar(${car.id})" 
                            style="
                                flex: 1;
                                padding: 14px 12px;
                                background: #fee2e2;
                                color: #dc2626;
                                border: none;
                                border-radius: 10px;
                                font-weight: 700;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            "
                            onmouseover="this.style.background='#fecaca'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='#fee2e2'; this.style.transform='translateY(0)'"
                        >
                            ❌ Pass
                        </button>
                        
                        <button 
                            onclick="selectSimpleCar(${car.id})" 
                            style="
                                flex: 1;
                                padding: 14px 12px;
                                background: #dcfce7;
                                color: #16a34a;
                                border: none;
                                border-radius: 10px;
                                font-weight: 700;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-size: 0.9rem;
                            "
                            onmouseover="this.style.background='#bbf7d0'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='#dcfce7'; this.style.transform='translateY(0)'"
                        >
                            ⚡ Select
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        carGrid.innerHTML += cardHTML;
    });
    
    console.log('✅ Car cards displayed with Pass/Select buttons');
}

// ================================================================
// FIX 2: IMPROVED CAR SELECTION → SPARKY CHAT
// ================================================================

function selectSimpleCar(carId) {
    console.log('🚗 Selecting car with ID:', carId);
    
    // Find the selected car
    const car = window.availableCars.find(c => c.id === carId);
    if (!car) {
        alert('Car not found! Please try again.');
        return;
    }
    
    // Store selected car globally
    window.selectedCar = car;
    
    // Visual feedback on card
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.border = '4px solid #22c55e';
        cardElement.style.boxShadow = '0 15px 40px rgba(34, 197, 94, 0.4)';
    }
    
    // Show selection confirmation
    setTimeout(() => {
        const confirmed = confirm(`Great choice! You selected:\n\n${car.name}\nPrice: $${car.price.toLocaleString()}\n\nProceed to negotiate with Sparky? 🤖⚡`);
        
        if (confirmed) {
            startNegotiationWithSparky();
        } else {
            // Reset card styling if user cancels
            if (cardElement) {
                cardElement.style.transform = 'scale(1)';
                cardElement.style.border = 'none';
                cardElement.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }
        }
    }, 500);
}

function startNegotiationWithSparky() {
    console.log('🤖 Starting negotiation with Sparky...');
    
    // Hide car discovery phase
    const discoveryPhase = document.getElementById('car-discovery-phase');
    if (discoveryPhase) {
        discoveryPhase.style.display = 'none';
    }
    
    // Show chat interface
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) {
        chatInterface.style.display = 'flex';
    }
    
    // Update UI for Sparky
    updateAgentStatus('sparky', true);
    updateProgress(25);
    
    const agentTitle = document.getElementById('current-agent-title');
    if (agentTitle) {
        agentTitle.textContent = '🤖⚡ Negotiation with Sparky';
    }
    
    // Show negotiation phase if it exists
    const negotiationPhase = document.getElementById('negotiation-phase');
    if (negotiationPhase) {
        negotiationPhase.style.display = 'block';
    }
    
    // Add welcome message from Sparky
    setTimeout(() => {
        addSparkyMessage(`🤖⚡ Hey there! I'm Sparky, your AI negotiation specialist!\n\nI see you've chosen the ${window.selectedCar.name} for $${window.selectedCar.price.toLocaleString()}.\n\nLet's see if we can get you a better deal! I can offer discounts up to 10% based on our conversation. Ready to negotiate? 💪`);
    }, 500);
}

function addSparkyMessage(message) {
    // Find messages container (try multiple possible IDs)
    let messagesContainer = document.getElementById('negotiation-messages') || 
                           document.getElementById('chat-messages') ||
                           document.querySelector('.messages-container');
    
    if (!messagesContainer) {
        // Create messages container if it doesn't exist
        const chatInterface = document.getElementById('chat-interface');
        if (chatInterface) {
            messagesContainer = document.createElement('div');
            messagesContainer.id = 'negotiation-messages';
            messagesContainer.style.cssText = `
                height: 300px;
                overflow-y: auto;
                padding: 20px;
                background: #f8fafc;
                border-radius: 10px;
                margin: 20px;
            `;
            chatInterface.appendChild(messagesContainer);
        }
    }
    
    if (messagesContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        messageDiv.style.cssText = `
            margin: 15px 0;
            padding: 15px;
            background: #fef3c7;
            border-radius: 15px;
            border-left: 4px solid #f59e0b;
        `;
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
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
                    background: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    white-space: pre-line;
                    line-height: 1.5;
                ">${message}</div>
            </div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ================================================================
// FIX 3: EXISTING CUSTOMER PORTAL WITH RESULTS
// ================================================================

function accessAgent(agentType) {
    console.log(`🤖 Accessing ${agentType} agent...`);
    
    const vehicleId = document.getElementById('customer-vehicle-id')?.value?.trim();
    
    if (!vehicleId) {
        alert('Please enter your Vehicle ID or Order Number first.');
        return;
    }
    
    // Generate mock results based on vehicle ID
    const mockResults = generateMockCustomerResults(vehicleId, agentType);
    
    // Show results instead of just closing
    showCustomerResults(mockResults, agentType);
}

function generateMockCustomerResults(vehicleId, agentType) {
    const agentData = {
        'SPARKY': {
            emoji: '⚡',
            title: 'Negotiation Status',
            status: 'Completed',
            details: [
                `Vehicle ID: ${vehicleId}`,
                'Final Price: $24,500 (10% discount applied)',
                'Negotiation completed on: March 15, 2024',
                'Savings achieved: $2,500'
            ]
        },
        'INSPECTOR': {
            emoji: '🔍', 
            title: 'Quality Inspection',
            status: 'Passed',
            details: [
                `Vehicle ID: ${vehicleId}`,
                'Inspection Date: March 16, 2024',
                'Overall Grade: A+ (Excellent)',
                'Engine: ✅ Perfect condition',
                'Body: ✅ Minor wear, acceptable',
                'Interior: ✅ Excellent condition'
            ]
        },
        'PENNY': {
            emoji: '💰',
            title: 'Payment Processing',
            status: 'Processing',
            details: [
                `Vehicle ID: ${vehicleId}`,
                'Payment Method: Bank Transfer',
                'Amount: $24,500',
                'Processing Date: March 17, 2024',
                'Expected Completion: March 18, 2024'
            ]
        },
        'CAPTAIN': {
            emoji: '🚢',
            title: 'Shipping & Logistics',
            status: 'In Transit', 
            details: [
                `Vehicle ID: ${vehicleId}`,
                'Departure Port: Tokyo, Japan',
                'Destination: New York, USA',
                'Ship: MV Ocean Express',
                'Estimated Arrival: April 2, 2024',
                'Tracking: OTZ-${vehicleId}-2024'
            ]
        }
    };
    
    return agentData[agentType.toUpperCase()] || {
        emoji: '🤖',
        title: 'Agent Status',
        status: 'Available',
        details: [`Vehicle ID: ${vehicleId}`, 'No specific data available']
    };
}

function showCustomerResults(results, agentType) {
    // Close the input portal first
    closeExistingCustomerPortal();
    
    // Create and show results popup
    const resultsHTML = `
        <div id="customer-results-popup" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 25px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">${results.emoji}</div>
                    <h2 style="margin: 0; color: #1e293b;">${results.title}</h2>
                    <div style="
                        display: inline-block;
                        background: ${results.status === 'Completed' || results.status === 'Passed' ? '#dcfce7' : '#fef3c7'};
                        color: ${results.status === 'Completed' || results.status === 'Passed' ? '#16a34a' : '#f59e0b'};
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: 600;
                        margin-top: 10px;
                    ">
                        ${results.status}
                    </div>
                </div>
                
                <!-- Details -->
                <div style="margin-bottom: 25px;">
                    ${results.details.map(detail => `
                        <div style="
                            background: #f8fafc;
                            padding: 12px 16px;
                            border-radius: 8px;
                            margin: 8px 0;
                            border-left: 4px solid #667eea;
                        ">${detail}</div>
                    `).join('')}
                </div>
                
                <!-- Actions -->
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="closeCustomerResults()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                    ">Close</button>
                    <button onclick="alert('Full tracking details would be shown in the complete app!')" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                    ">View Details</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to page
    document.body.insertAdjacentHTML('beforeend', resultsHTML);
}

function closeCustomerResults() {
    const popup = document.getElementById('customer-results-popup');
    if (popup) {
        popup.remove();
    }
}

// ================================================================
// FIX 4: UTILITY FUNCTIONS
// ================================================================

function updateAgentStatus(activeAgent, isActive) {
    // Update agent status if elements exist
    document.querySelectorAll('.agent-card').forEach(card => {
        card.classList.remove('active', 'completed');
    });
    
    if (isActive) {
        const activeCard = document.getElementById(`agent-${activeAgent}`);
        if (activeCard) activeCard.classList.add('active');
    }
}

function updateProgress(percentage) {
    const progressEl = document.getElementById('progress');
    if (progressEl) progressEl.style.width = percentage + '%';
}

// ================================================================
// CONSOLE TESTING FUNCTIONS
// ================================================================

window.testCarDiscovery = function() {
    console.log('🧪 Testing car discovery...');
    generateAvailableCars();
    showCarDiscovery();
    displayCarCards();
};

window.testSparkyChat = function() {
    console.log('🧪 Testing Sparky chat...');
    window.selectedCar = {name: 'Test Car', price: 25000};
    startNegotiationWithSparky();
};

window.testExistingCustomerResults = function() {
    console.log('🧪 Testing existing customer results...');
    const results = generateMockCustomerResults('TEST123', 'SPARKY');
    showCustomerResults(results, 'SPARKY');
};

console.log('✅ OTOZ.AI fixes loaded! Ready for testing.');
