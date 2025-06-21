// 🔧 CORRECTED OTOZ.AI MAIN JAVASCRIPT - WITH WORKING BUTTONS + FIXED CHAT

// Global state management
let currentPhase = 'onboarding';
let selectedMake = '';
let selectedModel = '';
let selectedYear = '';
let selectedMileage = 50000;
let selectedBudget = 25000;
let availableCars = [];
let currentCarIndex = 0;
let selectedCar = null;
let currentPrice = 0;
let originalPrice = 0;
let discountApplied = 0;
let negotiationCount = 0;
let selectedShippingTerms = 'FOB';
let customerInfo = {};
let isExistingCustomer = false;

// Initialize car database
const carDatabase = [];

// Top Car Manufacturers and their models
const carMakers = {
    'Toyota': ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Sienna', 'Tacoma', 'Tundra', 'Land Cruiser', 'Avalon'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 'HR-V', 'Passport', 'Fit', 'Insight'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Focus', 'Fusion'],
    'Chevrolet': ['Silverado', 'Camaro', 'Corvette', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Malibu', 'Cruze', 'Impala'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'Z4', 'i3', 'i8', 'M3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'AMG GT'],
    'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
    'Nissan': ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan', '370Z'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Accent', 'Veloster', 'Genesis'],
    'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Rio', 'Stinger', 'Niro', 'Cadenza']
};

// Initialize comprehensive car database
function initializeCarDatabase() {
    carDatabase.length = 0; // Clear existing
    let carIdCounter = 1;

    // Core cars that will always be available
    const guaranteedCars = [
        {
            id: carIdCounter++, make: 'Toyota', model: 'Camry', year: '2020', name: '2020 Toyota Camry',
            icon: '🚗', mileage: 35000, price: 22000, vin: 'TC2020001',
            engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.2%', location: 'Tokyo, Japan', condition: 'Excellent'
        },
        {
            id: carIdCounter++, make: 'Honda', model: 'Accord', year: '2019', name: '2019 Honda Accord',
            icon: '🚙', mileage: 42000, price: 20500, vin: 'HA2019002',
            engine: '1.5L Turbo', transmission: 'CVT', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+2.8%', location: 'Tokyo, Japan', condition: 'Excellent'
        },
        {
            id: carIdCounter++, make: 'BMW', model: '3 Series', year: '2020', name: '2020 BMW 3 Series',
            icon: '🏎️', mileage: 28000, price: 32000, vin: 'BMW2020003',
            engine: '2.0L Turbo', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+4.1%', location: 'Tokyo, Japan', condition: 'Excellent'
        }
    ];

    // Add guaranteed cars to database
    carDatabase.push(...guaranteedCars);

    console.log(`✅ Car database initialized with ${carDatabase.length} vehicles`);
}

// 🔧 FIXED: Start demo function - MUST WORK
function startDemo() {
    console.log('🚀 Starting demo...');
    
    try {
        const welcomePage = document.getElementById('welcome-page');
        const demoContainer = document.getElementById('demo-container');
        
        if (welcomePage) {
            welcomePage.style.display = 'none';
        } else {
            console.error('Welcome page element not found!');
        }
        
        if (demoContainer) {
            demoContainer.classList.add('active');
        } else {
            console.error('Demo container element not found!');
        }
        
        showOnboarding();
        console.log('✅ Demo started successfully');
    } catch (error) {
        console.error('❌ Error starting demo:', error);
        alert('Demo failed to start. Please refresh the page and try again.');
    }
}

// 🔧 FIXED: Show existing customer portal - MUST WORK
function showExistingCustomerPortal() {
    console.log('👤 Opening existing customer portal...');
    
    try {
        const portal = document.getElementById('existing-customer-portal');
        if (portal) {
            portal.classList.add('active');
            console.log('✅ Existing customer portal opened');
        } else {
            console.error('❌ Existing customer portal element not found!');
            alert('Customer portal not available. Please refresh the page.');
        }
    } catch (error) {
        console.error('❌ Error opening customer portal:', error);
        alert('Error opening customer portal. Please try again.');
    }
}

// Show onboarding phase
function showOnboarding() {
    currentPhase = 'onboarding';
    document.getElementById('onboarding-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'none';
    
    setTimeout(() => {
        updatePreferenceStatus();
    }, 100);
}

// Vehicle selection functions
function populateCarMakes() {
    const makeSelect = document.getElementById('car-make');
    if (!makeSelect) return;
    
    // Clear existing options except "Any Make"
    makeSelect.innerHTML = '<option value="">Any Make</option>';
    
    // Add all car makes from our database
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
    
    // Clear model and year options
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
    
    // Clear year options
    yearSelect.innerHTML = '<option value="">Any Year</option>';
    selectedYear = '';
    
    if (selectedMake && selectedModel) {
        // Get available years from database for this make/model combo
        const years = [...new Set(carDatabase.filter(car => 
            car.make === selectedMake && car.model === selectedModel
        ).map(car => car.year))].sort((a, b) => b - a);
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
    
    updatePreferenceStatus();
}

// Update range displays
function updateMileageDisplay(value) {
    selectedMileage = parseInt(value);
    document.getElementById('mileage-display').textContent = `${selectedMileage.toLocaleString()} km`;
    updatePreferenceStatus();
}

function updateBudgetDisplay(value) {
    selectedBudget = parseInt(value);
    document.getElementById('budget-display').textContent = `$${selectedBudget.toLocaleString()}`;
    updatePreferenceStatus();
}

// Update preference section visual indicators
function updatePreferenceStatus() {
    const sections = document.querySelectorAll('.preference-section');
    const findButton = document.querySelector('.find-cars-btn');
    let allComplete = true;
    
    // Vehicle selection section
    const vehicleSection = sections[0];
    selectedYear = document.getElementById('car-year')?.value || '';
    
    if (selectedMake || selectedModel || selectedYear) {
        vehicleSection.classList.remove('incomplete');
        vehicleSection.classList.add('complete');
    } else {
        vehicleSection.classList.remove('complete');
        vehicleSection.classList.add('incomplete');
        allComplete = false;
    }
    
    // Mileage section
    const mileageSection = sections[1];
    if (selectedMileage > 0) {
        mileageSection.classList.remove('incomplete');
        mileageSection.classList.add('complete');
    } else {
        mileageSection.classList.remove('complete');
        mileageSection.classList.add('incomplete');
        allComplete = false;
    }
    
    // Budget section
    const budgetSection = sections[2];
    if (selectedBudget > 1000) {
        budgetSection.classList.remove('incomplete');
        budgetSection.classList.add('complete');
    } else {
        budgetSection.classList.remove('complete');
        budgetSection.classList.add('incomplete');
        allComplete = false;
    }
    
    // Update button state
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

// Find matching cars function
function findMatchingCars() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    setTimeout(() => {
        console.log('🔍 Searching cars with filters:', { selectedMake, selectedModel, selectedYear, selectedMileage, selectedBudget });
        
        // Start with all cars
        let filteredCars = [...carDatabase];
        console.log('📊 Total cars in database:', filteredCars.length);
        
        // Apply filters progressively
        if (selectedMake) {
            filteredCars = filteredCars.filter(car => car.make === selectedMake);
            console.log(`🏭 After make filter (${selectedMake}):`, filteredCars.length);
        }
        
        if (selectedModel) {
            filteredCars = filteredCars.filter(car => car.model === selectedModel);
            console.log(`🚗 After model filter (${selectedModel}):`, filteredCars.length);
        }
        
        if (selectedYear) {
            filteredCars = filteredCars.filter(car => car.year === selectedYear);
            console.log(`📅 After year filter (${selectedYear}):`, filteredCars.length);
        }
        
        // Apply budget filter (more lenient)
        filteredCars = filteredCars.filter(car => car.price <= selectedBudget * 1.5);
        console.log(`💰 After budget filter (${selectedBudget}):`, filteredCars.length);
        
        // Apply mileage filter (more lenient)
        filteredCars = filteredCars.filter(car => car.mileage <= selectedMileage * 1.5);
        console.log(`📏 After mileage filter (${selectedMileage}):`, filteredCars.length);

        // If still no cars, get the first 3 cars from database
        if (filteredCars.length === 0) {
            console.log('⚠️ No matches found, showing popular cars');
            filteredCars = carDatabase.slice(0, 3);
        }

        availableCars = shuffleArray(filteredCars).slice(0, 3);
        currentCarIndex = 0;
        
        console.log('✅ Final cars for display:', availableCars.length);

        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        showCarDiscovery();
    }, 800);
}

// Show car discovery phase
function showCarDiscovery() {
    currentPhase = 'discovery';
    document.getElementById('onboarding-phase').style.display = 'none';
    document.getElementById('car-discovery-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').classList.add('active');
    document.getElementById('chat-interface').style.display = 'none';
    
    // Update the title with actual number of cars found
    const titleElement = document.querySelector('.discovery-title');
    if (titleElement) {
        titleElement.textContent = `🎯 We Found ${availableCars.length} Perfect Match${availableCars.length !== 1 ? 'es' : ''}!`;
    }
    
    console.log('Showing car discovery phase...');
    console.log('Available cars for display:', availableCars);
}

// Handle car selection from simple car grid
function selectSimpleCar(carId) {
    const cars = [
        { 
            id: 1, 
            name: '2020 Toyota Camry', 
            price: 22000, 
            icon: '🚗',
            mileage: 35000,
            engine: '2.5L I4',
            transmission: 'Automatic',
            vin: 'TC2020001'
        },
        { 
            id: 2, 
            name: '2019 Honda Accord', 
            price: 20500, 
            icon: '🚙',
            mileage: 42000,
            engine: '1.5L Turbo',
            transmission: 'CVT',
            vin: 'HA2019002'
        },
        { 
            id: 3, 
            name: '2020 BMW 3 Series', 
            price: 32000, 
            icon: '🏎️',
            mileage: 28000,
            engine: '2.0L Turbo',
            transmission: 'Automatic',
            vin: 'BMW2020003'
        }
    ];
    
    selectedCar = cars[carId - 1];
    currentPrice = selectedCar.price;
    originalPrice = selectedCar.price;
    discountApplied = 0;
    negotiationCount = 0;
    
    // Start negotiation with smooth transition
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    // Populate selected car display
    populateSelectedCarDisplay();
    
    // Focus on input field for better UX
    setTimeout(() => {
        const chatInput = document.getElementById('negotiation-input');
        if (chatInput) {
            chatInput.focus();
        }
    }, 500);
}

// Populate selected car display
function populateSelectedCarDisplay() {
    const container = document.getElementById('selected-car-display');
    container.innerHTML = `
        <div class="selected-car-image">
            ${selectedCar.icon}
        </div>
        <div class="selected-car-info">
            <h3>${selectedCar.name}</h3>
            <div class="quick-specs">
                <div><strong>Mileage:</strong> ${selectedCar.mileage.toLocaleString()} km</div>
                <div><strong>Engine:</strong> ${selectedCar.engine}</div>
                <div><strong>Transmission:</strong> ${selectedCar.transmission}</div>
                <div><strong>Condition:</strong> Excellent</div>
            </div>
        </div>
        <div class="price-display">
            <div class="current-price" id="current-price-display">$${currentPrice.toLocaleString()}</div>
            <div class="original-price" id="original-price-display" style="display: none;">$${originalPrice.toLocaleString()}</div>
            <div class="discount-badge" id="discount-badge-display" style="display: none;">DISCOUNT</div>
        </div>
    `;
    
    updateNegotiationInfo();
}

// 🔧 FIXED: Enhanced message adding with better scrolling
function addUserMessage(message, containerId) {
    const messagesContainer = document.getElementById(containerId);
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
        <div class="message-avatar" style="background: #667eea; color: white;">👤</div>
        <div class="message-content">${message}</div>
    `;
    
    // Remove typing indicator if exists
    const typingIndicator = messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
    
    // Re-add typing indicator
    const newTypingIndicator = document.createElement('div');
    newTypingIndicator.className = 'typing-indicator';
    newTypingIndicator.id = 'typing-negotiation';
    newTypingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    messagesContainer.appendChild(newTypingIndicator);
}

// 🔧 FIXED: Enhanced AI response with loading states
function addAIResponse(message, containerId = 'negotiation-messages', delay = 1000) {
    const typingIndicator = document.getElementById('typing-negotiation');
    const sendBtn = document.querySelector('.send-btn');
    
    // Show typing indicator and disable send button
    if (typingIndicator) {
        typingIndicator.classList.add('active');
    }
    if (sendBtn) {
        sendBtn.classList.add('loading');
        sendBtn.disabled = true;
    }
    
    setTimeout(() => {
        if (typingIndicator) {
            typingIndicator.classList.remove('active');
        }
        if (sendBtn) {
            sendBtn.classList.remove('loading');
            sendBtn.disabled = false;
        }
        
        const messagesContainer = document.getElementById(containerId);
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white;">⚡</div>
            <div class="message-content">${message}</div>
        `;
        
        // Insert before typing indicator
        const existingTyping = messagesContainer.querySelector('.typing-indicator');
        if (existingTyping) {
            messagesContainer.insertBefore(messageDiv, existingTyping);
        } else {
            messagesContainer.appendChild(messageDiv);
        }
        
        // Smooth scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }, delay);
}

// 🔧 FIXED: Enhanced negotiation message sending
function sendNegotiationMessage() {
    const input = document.getElementById('negotiation-input');
    const message = input.value.trim();
    const sendBtn = document.querySelector('.send-btn');
    
    if (message && !sendBtn.disabled) {
        // Add visual feedback
        sendBtn.classList.add('loading');
        sendBtn.disabled = true;
        
        addUserMessage(message, 'negotiation-messages');
        input.value = '';
        
        // Re-enable send button after user message is processed
        setTimeout(() => {
            sendBtn.classList.remove('loading');
            sendBtn.disabled = false;
            handleUserMessage(message);
        }, 500);
    }
}

// 🔧 FIXED: Enhanced quick reply with visual feedback
function quickReply(message) {
    const buttons = document.querySelectorAll('.action-buttons .btn');
    
    // Add loading state to all buttons
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });
    
    addUserMessage(message, 'negotiation-messages');
    
    setTimeout(() => {
        // Re-enable buttons
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        handleUserMessage(message);
    }, 800);
}

// Handle user messages in negotiation
function handleUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('expensive') || lowerMessage.includes('too much') || lowerMessage.includes('cheaper') || lowerMessage.includes('lower')) {
        handleNegotiation('expensive');
    } else if (lowerMessage.includes('best price') || lowerMessage.includes('lowest') || lowerMessage.includes('final')) {
        handleNegotiation('best');
    } else if (lowerMessage.includes('accept') || lowerMessage.includes('deal') || lowerMessage.includes('buy')) {
        acceptCurrentPrice();
    } else {
        // Generic response
        const responses = [
            "I understand! Let me see what I can do to make this work for you. 💪",
            "Great question! This " + selectedCar.name + " is really worth every penny, but I'm here to negotiate! ⚡",
            "I appreciate your interest! Let me check my pricing algorithms... 🤖"
        ];
        addAIResponse(responses[Math.floor(Math.random() * responses.length)]);
    }
}

// Handle negotiation logic
function handleNegotiation(type) {
    negotiationCount++;
    let newDiscount = 0;
    let response = '';
    const maxDiscount = Math.floor(originalPrice * 0.1); // 10% max discount

    if (type === 'expensive' && negotiationCount === 1) {
        newDiscount = Math.floor(maxDiscount * 0.3); // 3% discount
        response = `I hear you! Let me apply my AI magic... ✨ I can offer you a $${newDiscount.toLocaleString()} discount! That brings it down to $${(currentPrice - newDiscount).toLocaleString()}. This is a really good deal!`;
    } else if (type === 'expensive' && negotiationCount === 2) {
        newDiscount = Math.floor(maxDiscount * 0.6); // 6% discount
        response = `Wow, you're a tough negotiator! 💪 My AI algorithms are working overtime... I can go as low as $${(originalPrice - newDiscount).toLocaleString()}. That's $${newDiscount.toLocaleString()} off!`;
    } else if (type === 'best' || negotiationCount >= 3) {
        newDiscount = maxDiscount; // Full 10% discount
        response = `Alright, you've convinced me! 🤝 Here's my ABSOLUTE best price - $${(originalPrice - newDiscount).toLocaleString()}! That's 10% off the original price. This is as low as I can go!`;
    }

    if (newDiscount > discountApplied) {
        discountApplied = newDiscount;
        currentPrice = originalPrice - discountApplied;
        updatePriceDisplay();
        updateNegotiationInfo();
    }

    addAIResponse(response);
}

// 🔧 FIXED: Enhanced price display updates with animations
function updatePriceDisplay() {
    const currentPriceEl = document.getElementById('current-price-display');
    const originalPriceEl = document.getElementById('original-price-display');
    const discountBadgeEl = document.getElementById('discount-badge-display');
    
    if (currentPriceEl) {
        // Add pulse animation for price changes
        currentPriceEl.style.transform = 'scale(1.1)';
        currentPriceEl.style.transition = 'all 0.3s ease';
        currentPriceEl.textContent = `$${currentPrice.toLocaleString()}`;
        
        setTimeout(() => {
            currentPriceEl.style.transform = 'scale(1)';
        }, 300);
    }
    
    if (discountApplied > 0) {
        if (originalPriceEl) {
            originalPriceEl.style.display = 'block';
            originalPriceEl.textContent = `$${originalPrice.toLocaleString()}`;
        }
        if (discountBadgeEl) {
            discountBadgeEl.style.display = 'inline-block';
            discountBadgeEl.textContent = `$${discountApplied.toLocaleString()} OFF`;
            // Add entrance animation
            discountBadgeEl.style.transform = 'scale(0)';
            discountBadgeEl.style.transition = 'all 0.4s ease';
            setTimeout(() => {
                discountBadgeEl.style.transform = 'scale(1)';
            }, 100);
        }
    }
}

function updateNegotiationInfo() {
    const minPrice = originalPrice - Math.floor(originalPrice * 0.1);
    const maxPriceEl = document.getElementById('max-price');
    const minPriceEl = document.getElementById('min-price');
    
    if (maxPriceEl) maxPriceEl.textContent = `$${originalPrice.toLocaleString()}`;
    if (minPriceEl) minPriceEl.textContent = `$${minPrice.toLocaleString()}`;
}

function acceptCurrentPrice() {
    addUserMessage("Perfect! I'll take it at this price.", 'negotiation-messages');
    addAIResponse("Fantastic! 🎉 You've got an amazing deal! I've saved you $" + discountApplied.toLocaleString() + "! Let me hand you over to Inspector for a quality check before we finalize everything. Sparky out! ⚡", 'negotiation-messages', 1000);
    
    setTimeout(() => {
        showSuccessMessage();
    }, 3000);
}

function showSuccessMessage() {
    alert(`🎉 Demo Complete! 

Congratulations! You successfully negotiated with Sparky and saved $${discountApplied.toLocaleString()}!

In the full app, you would now proceed to:
• Inspector for quality check
• Penny for payment processing  
• Captain for shipping coordination

Final Price: $${currentPrice.toLocaleString()}
You Saved: $${discountApplied.toLocaleString()}
Vehicle: ${selectedCar.name}`);
}

// 🔧 FIXED: Existing Customer Portal Functions
function closeExistingCustomerPortal() {
    console.log('Closing existing customer portal...');
    const portal = document.getElementById('existing-customer-portal');
    if (portal) {
        portal.classList.remove('active');
    }
    const vehicleIdInput = document.getElementById('customer-vehicle-id');
    if (vehicleIdInput) {
        vehicleIdInput.value = '';
    }
}

function accessAgent(agentType) {
    const vehicleId = document.getElementById('customer-vehicle-id').value.trim();
    
    if (!vehicleId) {
        showValidationMessage(['Please enter your Vehicle ID or Order Number first.']);
        return;
    }
    
    // Close portal and show appropriate agent status
    closeExistingCustomerPortal();
    alert(`✅ Access granted to ${agentType.toUpperCase()} agent for Vehicle ID: ${vehicleId}

In the full application, you would see:
• Real-time status updates
• Agent conversation history
• Detailed progress reports
• Next steps information`);
}

// Notification functions
function showValidationMessage(errors) {
    const overlay = document.getElementById('notification-overlay');
    const popup = document.getElementById('notification-popup');
    const icon = document.getElementById('notification-icon');
    const title = document.getElementById('notification-title');
    const message = document.getElementById('notification-message');
    const validationList = document.getElementById('validation-list');
    
    // Set error styling
    popup.className = 'notification-popup error';
    icon.textContent = '⚠️';
    title.textContent = 'Please Complete Your Preferences';
    message.textContent = 'We need a few more details to find your perfect cars:';
    
    // Show validation list
    validationList.style.display = 'block';
    validationList.innerHTML = errors.map(error => 
        `<div class="validation-item">${error}</div>`
    ).join('');
    
    overlay.classList.add('active');
}

function closeNotification() {
    document.getElementById('notification-overlay').classList.remove('active');
}

// Customer info functions (simplified for demo)
function closeCustomerInfoForm() {
    document.getElementById('customer-info-popup').classList.remove('active');
}

// Navigation functions
function goBack() {
    document.getElementById('welcome-page').style.display = 'flex';
    document.getElementById('demo-container').classList.remove('active');
    resetDemo();
}

function goBackToPreferences() {
    showOnboarding();
}

function resetDemo() {
    currentPhase = 'onboarding';
    selectedMake = '';
    selectedModel = '';
    selectedYear = '';
    selectedMileage = 50000;
    selectedBudget = 25000;
    availableCars = [];
    currentCarIndex = 0;
    selectedCar = null;
    currentPrice = 0;
    originalPrice = 0;
    discountApplied = 0;
    negotiationCount = 0;
    selectedShippingTerms = 'FOB';
    customerInfo = {};
    
    // Reset form elements
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
    
    // Reset range sliders
    const mileageRange = document.getElementById('mileage-range');
    const budgetRange = document.getElementById('budget-range');
    if (mileageRange) {
        mileageRange.value = 50000;
        updateMileageDisplay(50000);
    }
    if (budgetRange) {
        budgetRange.value = 25000;
        updateBudgetDisplay(25000);
    }
    
    // Reset preference status indicators
    document.querySelectorAll('.preference-section').forEach(section => {
        section.classList.remove('complete', 'incomplete');
        section.classList.add('incomplete');
    });
    
    // Close any open notifications
    closeNotification();
}

// Utility functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 🔧 FIXED: Enhanced form initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo...');
    
    // Initialize car database first
    initializeCarDatabase();
    
    // Ensure welcome page is visible initially
    const welcomePage = document.getElementById('welcome-page');
    const demoContainer = document.getElementById('demo-container');
    
    if (welcomePage) {
        welcomePage.style.display = 'flex';
    }
    if (demoContainer) {
        demoContainer.classList.remove('active');
    }
    
    // Populate car makes dropdown
    populateCarMakes();
    
    // Initialize preference status indicators
    updatePreferenceStatus();
    
    // 🔧 FIXED: Enhanced Enter key handling for chat
    const negotiationInput = document.getElementById('negotiation-input');
    if (negotiationInput) {
        negotiationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendNegotiationMessage();
            }
        });
        
        // Add input validation for better UX
        negotiationInput.addEventListener('input', function(e) {
            const sendBtn = document.querySelector('.send-btn');
            if (sendBtn) {
                if (e.target.value.trim()) {
                    sendBtn.style.opacity = '1';
                    sendBtn.style.transform = 'scale(1)';
                } else {
                    sendBtn.style.opacity = '0.6';
                    sendBtn.style.transform = 'scale(0.95)';
                }
            }
        });
    }
    
    // Customer info form handling (simplified for demo)
    const form = document.getElementById('customer-info-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            customerInfo = {
                name: document.getElementById('customer-name').value,
                email: document.getElementById('customer-email').value
            };
            
            // Validate required fields
            if (!customerInfo.name || !customerInfo.email) {
                showValidationMessage(['Please fill in all required customer information fields.']);
                return;
            }
            
            // Close popup and show success
            closeCustomerInfoForm();
            alert('✅ Customer information collected successfully!\n\nIn the full app, this would generate a detailed invoice and proceed to payment processing.');
        });
    }
    
    // 🔧 FIXED: Test button functionality on page load
    setTimeout(() => {
        console.log('🔧 Testing button elements...');
        const startBtn = document.querySelector('.start-game-btn');
        const existingBtn = document.querySelector('.existing-customer-btn');
        
        if (startBtn) {
            console.log('✅ Start button found');
        } else {
            console.error('❌ Start button NOT found');
        }
        
        if (existingBtn) {
            console.log('✅ Existing customer button found');
        } else {
            console.error('❌ Existing customer button NOT found');
        }
        
        // Add click event listeners as backup
        if (startBtn) {
            startBtn.addEventListener('click', startDemo);
        }
        if (existingBtn) {
            existingBtn.addEventListener('click', showExistingCustomerPortal);
        }
    }, 1000);
    
    console.log('✅ Demo initialization complete!');
});
