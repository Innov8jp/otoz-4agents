// OTOZ.AI SHORT SCRIPT - 10 CARS ONLY

let selectedMake = '', selectedModel = '', selectedYear = '';
let selectedMileage = 150000, selectedBudget = 7000;
let availableCars = [], selectedCar = null;
let currentPrice = 0, originalPrice = 0, discountApplied = 0, negotiationCount = 0;

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

function startDemo() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
}

function showOnboarding() {
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
            <div class="message-avatar sparky-avatar">⚡</div>
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
    document.getElementById('min-price').textContent = '$' + minPrice.toLocaleString();
    document.getElementById('max-price').textContent = '$' + originalPrice.toLocaleString();
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
    document.getElementById('summary-total').textContent = '$' + currentPrice.toLocaleString();
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

function showExistingCustomerInfo() {
    alert('🚧 Existing Customer Portal coming soon! \n\nFor now, please use the "START YOUR JOURNEY" button to experience the full AI agent demo with real Otoz.ai inventory.');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo with 10 real cars...');
    
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
    
    console.log('✅ Demo ready with Toyota, Honda, Nissan, Mazda, Subaru!');
});
