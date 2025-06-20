// ===== OTOZ.AI JAVASCRIPT FUNCTIONALITY =====

// Global state management
let currentPhase = 'onboarding';
let selectedMake = '';
let selectedModel = '';
let selectedYear = '';
let selectedMileage = 50000;
let selectedBudget = 25000;
let availableCars = [];
let selectedCar = null;
let currentPrice = 0;
let originalPrice = 0;
let discountApplied = 0;
let negotiationCount = 0;

// Enhanced car database with real car data
const carDatabase = [
    {
        id: 1, make: 'Toyota', model: 'Camry', year: '2020', name: '2020 Toyota Camry',
        icon: '🚗', mileage: 35000, price: 22000, vin: 'TC2020001',
        engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
        trend: 'up', trendPercent: '+3.2%', location: 'Tokyo, Japan', condition: 'Excellent'
    },
    {
        id: 2, make: 'Honda', model: 'Accord', year: '2019', name: '2019 Honda Accord',
        icon: '🚗', mileage: 42000, price: 20500, vin: 'HA2019002',
        engine: '1.5L Turbo', transmission: 'CVT', fuelType: 'Gasoline', seats: '5 Seats',
        trend: 'up', trendPercent: '+2.8%', location: 'Tokyo, Japan', condition: 'Excellent'
    },
    {
        id: 3, make: 'BMW', model: '3 Series', year: '2020', name: '2020 BMW 3 Series',
        icon: '🏎️', mileage: 28000, price: 32000, vin: 'BMW2020003',
        engine: '2.0L Turbo', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
        trend: 'up', trendPercent: '+4.1%', location: 'Tokyo, Japan', condition: 'Excellent'
    },
    {
        id: 4, make: 'Mercedes-Benz', model: 'C-Class', year: '2020', name: '2020 Mercedes-Benz C-Class',
        icon: '🚗', mileage: 32000, price: 35000, vin: 'MBC2020004',
        engine: '2.0L Turbo', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
        trend: 'down', trendPercent: '-1.2%', location: 'Tokyo, Japan', condition: 'Excellent'
    },
    {
        id: 5, make: 'Audi', model: 'A4', year: '2019', name: '2019 Audi A4',
        icon: '🚗', mileage: 38000, price: 29000, vin: 'AA42019005',
        engine: '2.0L Turbo', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
        trend: 'up', trendPercent: '+2.1%', location: 'Tokyo, Japan', condition: 'Excellent'
    }
];

// Top car manufacturers and their models
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

// ===== MAIN DEMO FUNCTIONS =====

function startDemo() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
}

function showOnboarding() {
    currentPhase = 'onboarding';
    document.getElementById('onboarding-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'none';
    
    populateCarMakes();
    updatePreferenceStatus();
}

// ===== CAR SELECTION FUNCTIONS =====

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
        const years = ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
        years.forEach(year => {
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
    document.getElementById('mileage-display').textContent = `${selectedMileage.toLocaleString()} km`;
    updatePreferenceStatus();
}

function updateBudgetDisplay(value) {
    selectedBudget = parseInt(value);
    document.getElementById('budget-display').textContent = `$${selectedBudget.toLocaleString()}`;
    updatePreferenceStatus();
}

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

// ===== CAR DISCOVERY FUNCTIONS =====

function findMatchingCars() {
    selectedMake = document.getElementById('car-make').value;
    selectedModel = document.getElementById('car-model').value;
    selectedYear = document.getElementById('car-year').value;
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    setTimeout(() => {
        // Filter cars based on preferences
        let filteredCars = [...carDatabase];
        
        if (selectedMake) {
            filteredCars = filteredCars.filter(car => car.make === selectedMake);
        }
        
        if (selectedModel) {
            filteredCars = filteredCars.filter(car => car.model === selectedModel);
        }
        
        if (selectedYear) {
            filteredCars = filteredCars.filter(car => car.year === selectedYear);
        }
        
        // Apply budget and mileage filters (more lenient)
        filteredCars = filteredCars.filter(car => 
            car.price <= selectedBudget * 1.5 && car.mileage <= selectedMileage * 1.5
        );
        
        // If no matches, show all cars
        if (filteredCars.length === 0) {
            filteredCars = carDatabase.slice(0, 3);
        }
        
        availableCars = filteredCars.slice(0, 3);

        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        showCarDiscovery();
    }, 1000);
}

function showCarDiscovery() {
    currentPhase = 'discovery';
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
            'linear-gradient(135deg, #06b6d4, #0891b2)'
        ];
        
        cardElement.innerHTML = `
            <div class="car-header" style="background: ${gradients[index % gradients.length]};">
                ${car.icon}
                <div class="price-trend-badge ${car.trend}">
                    ${car.trend === 'up' ? '📈' : '📉'} ${car.trendPercent}
                </div>
            </div>
            
            <div class="car-info-section">
                <h3 class="car-title">${car.name}</h3>
                <div class="car-specs">
                    ${car.mileage.toLocaleString()} km • ${car.engine} • ${car.transmission}
                </div>
                <div class="car-price" style="color: ${gradients[index % gradients.length].split(',')[0].split('(')[1]};">
                    $${car.price.toLocaleString()}
                </div>
                <div class="car-cta" style="background: ${gradients[index % gradients.length].replace('135deg', '45deg').replace(')', ', 0.1)')}; color: ${gradients[index % gradients.length].split(',')[0].split('(')[1]};">
                    ⚡ Click to negotiate with Sparky!
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
    
    // Add selection animation
    const cards = document.querySelectorAll('.simple-car-card');
    cards[index].classList.add('selected');
    
    setTimeout(() => {
        startNegotiation();
    }, 500);
}

// ===== NEGOTIATION FUNCTIONS =====

function startNegotiation() {
    currentPhase = 'negotiation';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    updateAgentStatus('sparky', true);
    updateProgress(25);
    document.getElementById('current-agent-title').textContent = '⚡ Discovery & Negotiation with Sparky';
    
    document.getElementById('negotiation-phase').style.display = 'block';
    
    populateSelectedCarDisplay();
    negotiationCount = 0;
    discountApplied = 0;
    updatePriceDisplay();
    updateNegotiationInfo();
}

function populateSelectedCarDisplay() {
    const container = document.getElementById('selected-car-display');
    container.innerHTML = `
        <div class="selected-car-image">
            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px;">
                ${selectedCar.icon}
            </div>
        </div>
        <div class="selected-car-info">
            <h3>${selectedCar.name}</h3>
            <div class="quick-specs">
                <div><strong>Mileage:</strong> ${selectedCar.mileage.toLocaleString()} km</div>
                <div><strong>Engine:</strong> ${selectedCar.engine}</div>
                <div><strong>Transmission:</strong> ${selectedCar.transmission}</div>
                <div><strong>Condition:</strong> ${selectedCar.condition}</div>
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
            <div class="message-avatar sparky-avatar">⚡</div>
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
            "I understand! Let me see what I can do to make this work for you. 💪",
            "Great question! This " + selectedCar.name + " is really worth every penny, but I'm here to negotiate! ⚡",
            "I appreciate your interest! Let me check my pricing algorithms... 🤖"
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
        response = `I hear you! Let me apply my AI magic... ✨ I can offer you a $${newDiscount.toLocaleString()} discount! That brings it down to $${(currentPrice - newDiscount).toLocaleString()}. This is a really good deal!`;
    } else if (type === 'expensive' && negotiationCount === 2) {
        newDiscount = Math.floor(maxDiscount * 0.6);
        response = `Wow, you're a tough negotiator! 💪 My AI algorithms are working overtime... I can go as low as $${(originalPrice - newDiscount).toLocaleString()}. That's $${newDiscount.toLocaleString()} off!`;
    } else if (type === 'best' || negotiationCount >= 3) {
        newDiscount = maxDiscount;
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

function updatePriceDisplay() {
    const currentPriceEl = document.getElementById('current-price-display');
    const originalPriceEl = document.getElementById('original-price-display');
    const discountBadgeEl = document.getElementById('discount-badge-display');
    
    if (currentPriceEl) {
        currentPriceEl.textContent = `$${currentPrice.toLocaleString()}`;
    }
    
    if (discountApplied > 0) {
        if (originalPriceEl) {
            originalPriceEl.style.display = 'block';
            originalPriceEl.textContent = `$${originalPrice.toLocaleString()}`;
        }
        if (discountBadgeEl) {
            discountBadgeEl.style.display = 'inline-block';
            discountBadgeEl.textContent = `$${discountApplied.toLocaleString()} OFF`;
        }
    }
}

function updateNegotiationInfo() {
    const minPrice = originalPrice - Math.floor(originalPrice * 0.1);
    document.getElementById('min-price').textContent = `$${minPrice.toLocaleString()}`;
    document.getElementById('max-price').textContent = `$${originalPrice.toLocaleString()}`;
}

function acceptCurrentPrice() {
    addUserMessage("Perfect! I'll take it at this price.");
    addAIResponse("Fantastic! 🎉 You've made an excellent choice! Your " + selectedCar.name + " is now reserved. Let me show you the complete success summary of this amazing deal!", 1000);
    
    setTimeout(() => {
        showSuccess();
    }, 2500);
}

// ===== SUCCESS & NAVIGATION FUNCTIONS =====

function showSuccess() {
    document.getElementById('negotiation-phase').style.display = 'none';
    document.getElementById('success-phase').style.display = 'block';
    
    updateAgentStatus('captain', true);
    updateProgress(100);
    document.getElementById('current-agent-title').textContent = '🎉 Mission Complete! All Agents Successful';
    
    // Update summary details
    document.getElementById('summary-vehicle').textContent = selectedCar.name;
    document.getElementById('summary-total').textContent = `$${currentPrice.toLocaleString()}`;
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
        document.getElementById(`agent-${activeAgent}`).classList.add('active');
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
    currentPhase = 'onboarding';
    selectedMake = '';
    selectedModel = '';
    selectedYear = '';
    selectedMileage = 50000;
    selectedBudget = 25000;
    availableCars = [];
    selectedCar = null;
    currentPrice = 0;
    originalPrice = 0;
    discountApplied = 0;
    negotiationCount = 0;
    
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
    
    document.getElementById('mileage-range').value = 50000;
    document.getElementById('budget-range').value = 25000;
    updateMileageDisplay(50000);
    updateBudgetDisplay(25000);
    updatePreferenceStatus();
}

function showExistingCustomerInfo() {
    alert('🚧 Existing Customer Portal coming soon! \n\nFor now, please use the "START YOUR JOURNEY" button to experience the full AI agent demo.');
}

// ===== INITIALIZATION =====

// Initialize demo on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Enhanced Otoz.ai demo...');
    
    document.getElementById('welcome-page').style.display = 'flex';
    document.getElementById('demo-container').classList.remove('active');
    
    populateCarMakes();
    updatePreferenceStatus();
    
    // Handle Enter key in negotiation input
    const negotiationInput = document.getElementById('negotiation-input');
    if (negotiationInput) {
        negotiationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendNegotiationMessage();
            }
        });
    }
    
    console.log('✅ Enhanced demo initialization complete!');
});
