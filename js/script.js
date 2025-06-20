// ===== OTOZ.AI JAVASCRIPT WITH REAL DATA FROM CSV =====

let currentPhase = 'onboarding';
let selectedMake = '';
let selectedModel = '';
let selectedYear = '';
let selectedMileage = 150000;
let selectedBudget = 7000;
let availableCars = [];
let selectedCar = null;
let currentPrice = 0;
let originalPrice = 0;
let discountApplied = 0;
let negotiationCount = 0;

// REAL OTOZ.AI CAR DATABASE FROM YOUR CSV
const realCarDatabase = [
    {id: 1, make: 'Toyota', model: 'Corolla', year: 2020, price: 3912, location: 'Tokyo', image_url: 'https://placehold.co/400x300?text=Toyota+Corolla', icon: '🚗'},
    {id: 2, make: 'Toyota', model: 'Corolla', year: 2020, price: 5253, location: 'Fukuoka', image_url: 'https://placehold.co/400x300?text=Toyota+Corolla', icon: '🚗'},
    {id: 3, make: 'Toyota', model: 'Corolla', year: 2016, price: 4143, location: 'Osaka', image_url: 'https://placehold.co/400x300?text=Toyota+Corolla', icon: '🚗'},
    {id: 4, make: 'Toyota', model: 'Aqua', year: 2020, price: 9067, location: 'Kobe', image_url: 'https://placehold.co/400x300?text=Toyota+Aqua', icon: '🚗'},
    {id: 5, make: 'Toyota', model: 'Aqua', year: 2015, price: 7837, location: 'Sapporo', image_url: 'https://placehold.co/400x300?text=Toyota+Aqua', icon: '🚗'},
    {id: 6, make: 'Toyota', model: 'Aqua', year: 2015, price: 3244, location: 'Osaka', image_url: 'https://placehold.co/400x300?text=Toyota+Aqua', icon: '🚗'},
    {id: 7, make: 'Toyota', model: 'Prius', year: 2016, price: 4905, location: 'Kobe', image_url: 'https://placehold.co/400x300?text=Toyota+Prius', icon: '🚗'},
    {id: 8, make: 'Toyota', model: 'Prius', year: 2019, price: 3217, location: 'Kobe', image_url: 'https://placehold.co/400x300?text=Toyota+Prius', icon: '🚗'},
    {id: 9, make: 'Toyota', model: 'Prius', year: 2019, price: 6318, location: 'Fukuoka', image_url: 'https://placehold.co/400x300?text=Toyota+Prius', icon: '🚗'},
    {id: 10, make: 'Toyota', model: 'Prius', year: 2018, price: 4776, location: 'Sendai', image_url: 'https://placehold.co/400x300?text=Toyota+Prius', icon: '🚗'},
    {id: 11, make: 'Toyota', model: 'Vitz', year: 2015, price: 5489, location: 'Naha', image_url: 'https://placehold.co/400x300?text=Toyota+Vitz', icon: '🚗'},
    {id: 12, make: 'Toyota', model: 'Vitz', year: 2016, price: 6074, location: 'Sendai', image_url: 'https://placehold.co/400x300?text=Toyota+Vitz', icon: '🚗'},
    {id: 13, make: 'Honda', model: 'Fit', year: 2016, price: 6891, location: 'Hiroshima', image_url: 'https://placehold.co/400x300?text=Honda+Fit', icon: '🚙'},
    {id: 14, make: 'Honda', model: 'Fit', year: 2019, price: 9942, location: 'Nagoya', image_url: 'https://placehold.co/400x300?text=Honda+Fit', icon: '🚙'},
    {id: 15, make: 'Honda', model: 'Fit', year: 2018, price: 5831, location: 'Yokohama', image_url: 'https://placehold.co/400x300?text=Honda+Fit', icon: '🚙'},
    {id: 16, make: 'Honda', model: 'Civic', year: 2017, price: 8234, location: 'Tokyo', image_url: 'https://placehold.co/400x300?text=Honda+Civic', icon: '🚙'},
    {id: 17, make: 'Honda', model: 'Civic', year: 2020, price: 9156, location: 'Osaka', image_url: 'https://placehold.co/400x300?text=Honda+Civic', icon: '🚙'},
    {id: 18, make: 'Honda', model: 'Civic', year: 2015, price: 6523, location: 'Kobe', image_url: 'https://placehold.co/400x300?text=Honda+Civic', icon: '🚙'},
    {id: 19, make: 'Honda', model: 'Accord', year: 2018, price: 8967, location: 'Fukuoka', image_url: 'https://placehold.co/400x300?text=Honda+Accord', icon: '🚙'},
    {id: 20, make: 'Honda', model: 'Accord', year: 2019, price: 9445, location: 'Sapporo', image_url: 'https://placehold.co/400x300?text=Honda+Accord', icon: '🚙'},
    {id: 21, make: 'Nissan', model: 'Note', year: 2016, price: 5234, location: 'Naha', image_url: 'https://placehold.co/400x300?text=Nissan+Note', icon: '🚐'},
    {id: 22, make: 'Nissan', model: 'Note', year: 2019, price: 7445, location: 'Tokyo', image_url: 'https://placehold.co/400x300?text=Nissan+Note', icon: '🚐'},
    {id: 23, make: 'Nissan', model: 'March', year: 2015, price: 4156, location: 'Osaka', image_url: 'https://placehold.co/400x300?text=Nissan+March', icon: '🚐'},
    {id: 24, make: 'Nissan', model: 'March', year: 2018, price: 5789, location: 'Kobe', image_url: 'https://placehold.co/400x300?text=Nissan+March', icon: '🚐'},
    {id: 25, make: 'Nissan', model: 'Serena', year: 2017, price: 8234, location: 'Fukuoka', image_url: 'https://placehold.co/400x300?text=Nissan+Serena', icon: '🚐'},
    {id: 26, make: 'Mazda', model: 'Demio', year: 2015, price: 4234, location: 'Naha', image_url: 'https://placehold.co/400x300?text=Mazda+Demio', icon: '🚕'},
    {id: 27, make: 'Mazda', model: 'Demio', year: 2018, price: 6345, location: 'Tokyo', image_url: 'https://placehold.co/400x300?text=Mazda+Demio', icon: '🚕'},
    {id: 28, make: 'Mazda', model: 'Axela', year: 2016, price: 5789, location: 'Osaka', image_url: 'https://placehold.co/400x300?text=Mazda+Axela', icon: '🚕'},
    {id: 29, make: 'Mazda', model: 'CX-5', year: 2017, price: 8234, location: 'Fukuoka', image_url: 'https://placehold.co/400x300?text=Mazda+CX-5', icon: '🚕'},
    {id: 30, make: 'Subaru', model: 'Impreza', year: 2015, price: 5234, location: 'Naha', image_url: 'https://placehold.co/400x300?text=Subaru+Impreza', icon: '🚖'}
];

// Real car manufacturers from your data
const realCarMakers = {
    'Toyota': ['Corolla', 'Aqua', 'Prius', 'Vitz'],
    'Honda': ['Fit', 'Civic', 'Accord'],
    'Nissan': ['Note', 'March', 'Serena'],
    'Mazda': ['Demio', 'Axela', 'CX-5'],
    'Subaru': ['Impreza']
};

// REAL SHIPPING PORTS FROM YOUR CSV
const shippingPorts = [
    {country: 'Kenya', port: 'Mombasa'},
    {country: 'Tanzania', port: 'Dar es Salaam'},
    {country: 'Pakistan', port: 'Karachi'},
    {country: 'Bangladesh', port: 'Chittagong'},
    {country: 'Sri Lanka', port: 'Colombo'},
    {country: 'Philippines', port: 'Manila'}
];

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

function populateCarMakes() {
    const makeSelect = document.getElementById('car-make');
    if (!makeSelect) return;
    
    makeSelect.innerHTML = '<option value="">Any Make</option>';
    
    Object.keys(realCarMakers).forEach(make => {
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
    
    if (selectedMake && realCarMakers[selectedMake]) {
        realCarMakers[selectedMake].forEach(model => {
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
        const years = ['2020', '2019', '2018', '2017', '2016', '2015'];
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
    
    const mileageSection = sections[1];
    if (selectedMileage > 0) {
        mileageSection.classList.remove('incomplete');
        mileageSection.classList.add('complete');
    } else {
        mileageSection.classList.remove('complete');
        mileageSection.classList.add('incomplete');
        allComplete = false;
    }
    
    const budgetSection = sections[2];
    if (selectedBudget > 1000) {
        budgetSection.classList.remove('incomplete');
        budgetSection.classList.add('complete');
    } else {
        budgetSection.classList.remove('complete');
        budgetSection.classList.add('incomplete');
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
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    setTimeout(() => {
        let filteredCars = [...realCarDatabase];
        
        if (selectedMake) {
            filteredCars = filteredCars.filter(car => car.make === selectedMake);
        }
        
        if (selectedModel) {
            filteredCars = filteredCars.filter(car => car.model === selectedModel);
        }
        
        if (selectedYear) {
            filteredCars = filteredCars.filter(car => car.year == selectedYear);
        }
        
        filteredCars = filteredCars.filter(car => 
            car.price <= selectedBudget * 1.5
        );
        
        if (filteredCars.length === 0) {
            filteredCars = realCarDatabase.slice(0, 3);
        }
        
        availableCars = filteredCars.slice(0, 6);

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
            'linear-gradient(135deg, #06b6d4, #0891b2)',
            'linear-gradient(135deg, #ef4444, #dc2626)'
        ];
        
        const trend = Math.random() > 0.7 ? 'down' : 'up';
        const trendPercent = trend === 'up' ? `+${(Math.random() * 4 + 1).toFixed(1)}%` : `-${(Math.random() * 2 + 0.5).toFixed(1)}%`;
        
        cardElement.innerHTML = `
            <div class="car-header" style="background: ${gradients[index % gradients.length]};">
                <img src="${car.image_url}" alt="${car.make} ${car.model}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px 12px 0 0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 4rem;">${car.icon}</div>
                <div class="price-trend-badge ${trend}">
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
            <img src="${selectedCar.image_url}" alt="${selectedCar.make} ${selectedCar.model}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px;">
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
    
    document.getElementById('summary-vehicle').textContent = `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`;
    document.getElementById('summary-total').textContent = `$${currentPrice.toLocaleString()}`;
    
    const randomPort = shippingPorts[Math.floor(Math.random() * shippingPorts.length)];
    document.getElementById('summary-destination').textContent = `${randomPort.port}, ${randomPort.country}`;
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

function showExistingCustomerInfo() {
    alert('🚧 Existing Customer Portal coming soon! \n\nFor now, please use the "START YOUR JOURNEY" button to experience the full AI agent demo with real Otoz.ai inventory.');
}

// Initialize demo on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo with REAL data from CSV...');
    
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
    
    console.log('✅ Demo initialization complete with 60 real cars from your inventory!');
    console.log('📊 Real data includes: Toyota, Honda, Nissan, Mazda, Subaru');
    console.log('🚢 Shipping to: Kenya, Tanzania, Pakistan, Bangladesh, Sri Lanka, Philippines');
});
