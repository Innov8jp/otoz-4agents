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
    'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8']
};

// Generate comprehensive car database with multiple variants
function initializeCarDatabase() {
    carDatabase.length = 0;
    let carIdCounter = 1;

    const guaranteedCars = [
        // Toyota Camry Variants (3 different options)
        {
            id: carIdCounter++, make: 'Toyota', model: 'Camry', year: '2020', name: '2020 Toyota Camry LE (Silver)',
            icon: '🚗', mileage: 35000, price: 22000, vin: 'TC2020001',
            engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.2%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Silver', trim: 'LE'
        },
        {
            id: carIdCounter++, make: 'Toyota', model: 'Camry', year: '2021', name: '2021 Toyota Camry SE (Red)',
            icon: '🚗', mileage: 28000, price: 24500, vin: 'TC2021002',
            engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+2.8%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Red', trim: 'SE'
        },
        {
            id: carIdCounter++, make: 'Toyota', model: 'Camry', year: '2022', name: '2022 Toyota Camry XLE (Blue)',
            icon: '🚗', mileage: 15000, price: 27500, vin: 'TC2022003',
            engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+4.1%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Blue', trim: 'XLE'
        },
        
        // Honda Accord Variants (3 different options)
        {
            id: carIdCounter++, make: 'Honda', model: 'Accord', year: '2019', name: '2019 Honda Accord LX (White)',
            icon: '🚙', mileage: 42000, price: 20500, vin: 'HA2019004',
            engine: '1.5L Turbo', transmission: 'CVT', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+2.8%', location: 'Tokyo, Japan', condition: 'Good', color: 'White', trim: 'LX'
        },
        {
            id: carIdCounter++, make: 'Honda', model: 'Accord', year: '2020', name: '2020 Honda Accord Sport (Black)',
            icon: '🚙', mileage: 35000, price: 23000, vin: 'HA2020005',
            engine: '1.5L Turbo', transmission: 'CVT', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.5%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Black', trim: 'Sport'
        },
        {
            id: carIdCounter++, make: 'Honda', model: 'Accord', year: '2021', name: '2021 Honda Accord Touring (Gray)',
            icon: '🚙', mileage: 25000, price: 26000, vin: 'HA2021006',
            engine: '2.0L Turbo', transmission: '10-Speed Auto', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.9%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Gray', trim: 'Touring'
        },
        
        // BMW 3 Series Variants (3 different options)
        {
            id: carIdCounter++, make: 'BMW', model: '3 Series', year: '2020', name: '2020 BMW 330i (White)',
            icon: '🏎️', mileage: 28000, price: 32000, vin: 'BMW2020007',
            engine: '2.0L Turbo', transmission: '8-Speed Auto', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+4.1%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'White', trim: '330i'
        },
        {
            id: carIdCounter++, make: 'BMW', model: '3 Series', year: '2021', name: '2021 BMW 330i xDrive (Blue)',
            icon: '🏎️', mileage: 22000, price: 35500, vin: 'BMW2021008',
            engine: '2.0L Turbo', transmission: '8-Speed Auto', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.7%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Blue', trim: '330i xDrive'
        },
        {
            id: carIdCounter++, make: 'BMW', model: '3 Series', year: '2022', name: '2022 BMW M340i (Black)',
            icon: '🏎️', mileage: 12000, price: 42000, vin: 'BMW2022009',
            engine: '3.0L Turbo I6', transmission: '8-Speed Auto', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+5.2%', location: 'Tokyo, Japan', condition: 'Excellent', color: 'Black', trim: 'M340i'
        }
    ];

    carDatabase.push(...guaranteedCars);
    console.log(`✅ Car database initialized with ${carDatabase.length} vehicles (${guaranteedCars.length} variants)`);
}

// Start demo function
function startDemo() {
    console.log('🚀 Starting demo...');
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
}

// Show onboarding phase
function showOnboarding() {
    currentPhase = 'onboarding';
    document.getElementById('onboarding-phase').style.display = 'flex';
    document.getElementById('car-discovery-phase').style.display = 'none';
    const chatInterface = document.getElementById('chat-interface');
    if (chatInterface) chatInterface.style.display = 'none';
    
    setTimeout(() => {
        updatePreferenceStatus();
    }, 100);
}

// Populate car makes dropdown
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
        const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
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
    const display = document.getElementById('mileage-display');
    if (display) {
        display.textContent = `${selectedMileage.toLocaleString()} km`;
    }
    updatePreferenceStatus();
}

function updateBudgetDisplay(value) {
    selectedBudget = parseInt(value);
    const display = document.getElementById('budget-display');
    if (display) {
        display.textContent = `$${selectedBudget.toLocaleString()}`;
    }
    updatePreferenceStatus();
}

// Update preference section visual indicators
function updatePreferenceStatus() {
    const sections = document.querySelectorAll('.preference-section');
    const findButton = document.querySelector('.find-cars-btn');
    let allComplete = true;
    
    if (sections.length >= 3) {
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

// Find matching cars with enhanced filtering for multiple variants
function findMatchingCars() {
    console.log('🔍 Starting car search...');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }

    setTimeout(() => {
        try {
            selectedMake = document.getElementById('car-make')?.value || '';
            selectedModel = document.getElementById('car-model')?.value || '';
            selectedYear = document.getElementById('car-year')?.value || '';
            
            if (carDatabase.length === 0) {
                initializeCarDatabase();
            }
            
            let filteredCars = [...carDatabase];
            
            // Apply filters
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
            
            // Apply budget and mileage filters (more lenient to show variety)
            filteredCars = filteredCars.filter(car => 
                car.price <= selectedBudget * 1.8 && 
                car.mileage <= selectedMileage * 2
            );
            
            console.log(`💰 After budget/mileage filter:`, filteredCars.length);
            
            // If we have exact matches, use them. Otherwise, show all available cars for testing
            if (filteredCars.length === 0) {
                console.log('📋 No exact matches, showing all available cars for demo');
                availableCars = shuffleArray(carDatabase);
            } else if (filteredCars.length < 3) {
                console.log('📋 Few matches found, adding similar cars for better testing');
                // Add similar cars to ensure we have enough for testing
                const additionalCars = carDatabase.filter(car => !filteredCars.includes(car));
                availableCars = [...filteredCars, ...additionalCars.slice(0, 6 - filteredCars.length)];
            } else {
                availableCars = shuffleArray(filteredCars);
            }
            
            // Ensure we have at least 3 cars for good testing experience
            if (availableCars.length < 3) {
                availableCars = shuffleArray(carDatabase);
            }
            
            // Limit to 6 cars maximum for good UX
            availableCars = availableCars.slice(0, 6);
            currentCarIndex = 0;
            
            console.log(`✅ Final cars for display: ${availableCars.length}`);
            console.log('🚗 Cars to show:', availableCars.map(car => `${car.name} - ${car.price.toLocaleString()}`));
            
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            showCarDiscovery();
            
        } catch (error) {
            console.error('❌ Error in findMatchingCars:', error);
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            alert('Sorry, there was an error finding cars. Please try again.');
        }
    }, 800);
}

// Show car discovery phase with dynamic car generation
function showCarDiscovery() {
    console.log('🎯 Showing car discovery phase...');
    
    currentPhase = 'discovery';
    
    const onboardingPhase = document.getElementById('onboarding-phase');
    const discoveryPhase = document.getElementById('car-discovery-phase');
    const chatInterface = document.getElementById('chat-interface');
    
    if (onboardingPhase) onboardingPhase.style.display = 'none';
    if (chatInterface) chatInterface.style.display = 'none';
    
    if (discoveryPhase) {
        discoveryPhase.style.display = 'flex';
        discoveryPhase.classList.add('active');
    }
    
    const titleElement = document.querySelector('.discovery-title');
    if (titleElement) {
        titleElement.textContent = `🎯 We Found ${availableCars.length} Perfect Matches For You!`;
    }
    
    // Generate dynamic car grid
    generateDynamicCarGrid();
}

// Generate dynamic car grid from available cars
function generateDynamicCarGrid() {
    const simpleGrid = document.getElementById('simple-car-grid');
    if (!simpleGrid) {
        console.error('❌ Car grid not found!');
        return;
    }
    
    // Clear existing content
    simpleGrid.innerHTML = '';
    
    // Use available cars or fallback to first 6 cars from database
    const carsToShow = availableCars.length > 0 ? availableCars : carDatabase.slice(0, 6);
    
    if (carsToShow.length === 0) {
        simpleGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: rgba(255,255,255,0.1); border-radius: 15px; color: white;">
                <h3>🔍 No cars match your criteria!</h3>
                <p>Try adjusting your preferences to see more options.</p>
                <button onclick="goBackToPreferences()" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; margin-top: 15px;">
                    ← Adjust Preferences
                </button>
            </div>
        `;
        return;
    }
    
    carsToShow.forEach((car, index) => {
        const cardHTML = `
            <div class="simple-car-card dynamic-car-card" data-car-id="${car.id}" id="car-card-${car.id}">
                <div style="height: 120px; background: ${getCarGradient(car.make, index)}; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; position: relative;">
                    ${car.icon}
                    <div style="position: absolute; top: 10px; right: 10px; background: ${car.trend === 'up' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                        ${car.trend === 'up' ? '📈' : '📉'} ${car.trendPercent}
                    </div>
                    ${car.color ? `<div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">${car.color}</div>` : ''}
                </div>
                
                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">
                        ${car.name}
                    </h3>
                    <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 8px;">
                        ${car.mileage?.toLocaleString() || '0'} km • ${car.engine} • ${car.transmission}
                    </div>
                    ${car.trim ? `<div style="color: #667eea; font-size: 0.8rem; font-weight: 600; margin-bottom: 8px;">Trim: ${car.trim}</div>` : ''}
                    <div style="font-size: 1.6rem; font-weight: 900; color: ${getCarPriceColor(car.make, index)}; margin: 15px 0;">
                        ${car.price?.toLocaleString() || '0'}
                    </div>
                    <div class="action-buttons" style="display: flex; gap: 8px; justify-content: space-between;">
                        <button onclick="passSimpleCar(${car.id})" style="flex: 1; padding: 10px 8px; background: #fee2e2; color: #dc2626; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.8rem;">
                            ❌ Pass
                        </button>
                        <button onclick="selectSimpleCar(${car.id})" style="flex: 1; padding: 10px 8px; background: #dcfce7; color: #16a34a; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; font-size: 0.8rem;">
                            ⚡ Select
                        </button>
                    </div>
                </div>
            </div>
        `;
        simpleGrid.innerHTML += cardHTML;
    });
    
    console.log(`✅ Generated dynamic car grid with ${carsToShow.length} cars`);
}

// Helper function to get car gradient based on make
function getCarGradient(make, index) {
    const gradients = {
        'Toyota': 'linear-gradient(135deg, #667eea, #764ba2)',
        'Honda': 'linear-gradient(135deg, #22c55e, #16a34a)', 
        'BMW': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'Ford': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'Mercedes-Benz': 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    };
    return gradients[make] || `linear-gradient(135deg, #64748b, #475569)`;
}

// Helper function to get car price color
function getCarPriceColor(make, index) {
    const colors = {
        'Toyota': '#667eea',
        'Honda': '#22c55e',
        'BMW': '#f59e0b',
        'Ford': '#3b82f6',
        'Mercedes-Benz': '#8b5cf6'
    };
    return colors[make] || '#64748b';
}

// Start negotiation phase
function startNegotiation() {
    console.log('🚀 Starting negotiation...');
    currentPhase = 'negotiation';
    document.getElementById('car-discovery-phase').style.display = 'none';
    document.getElementById('chat-interface').style.display = 'flex';
    
    updateAgentStatus('sparky', true);
    updateProgress(25);
    document.getElementById('current-agent-title').textContent = '🚀 Discovering with Sparky';
    
    document.getElementById('negotiation-phase').style.display = 'block';
    populateSelectedCarDisplay();
    
    negotiationCount = 0;
    discountApplied = 0;
    updatePriceDisplay();
    updateNegotiationInfo();
}

function populateSelectedCarDisplay() {
    const container = document.getElementById('selected-car-display');
    if (container && selectedCar) {
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
                    <div><strong>Condition:</strong> Excellent</div>
                </div>
            </div>
            <div class="price-display">
                <div class="current-price" id="current-price-display">$${currentPrice.toLocaleString()}</div>
                <div class="original-price" id="original-price-display" style="display: none;">$${originalPrice.toLocaleString()}</div>
                <div class="discount-badge" id="discount-badge-display" style="display: none;">DISCOUNT</div>
            </div>
        `;
    }
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
    const minPriceEl = document.getElementById('min-price');
    const maxPriceEl = document.getElementById('max-price');
    if (minPriceEl) minPriceEl.textContent = `$${minPrice.toLocaleString()}`;
    if (maxPriceEl) maxPriceEl.textContent = `$${originalPrice.toLocaleString()}`;
}

// Negotiation functions
function sendNegotiationMessage() {
    const input = document.getElementById('negotiation-input');
    const message = input?.value?.trim();
    if (message) {
        addUserMessage(message, 'negotiation-messages');
        input.value = '';
        handleUserMessage(message);
    }
}

function quickReply(message) {
    addUserMessage(message, 'negotiation-messages');
    handleUserMessage(message);
}

function addUserMessage(message, containerId) {
    const messagesContainer = document.getElementById(containerId);
    if (messagesContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: #667eea; color: white;">👤</div>
            <div class="message-content">${message}</div>
        `;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function addAIResponse(message, containerId = 'negotiation-messages', delay = 1000) {
    setTimeout(() => {
        const messagesContainer = document.getElementById(containerId);
        if (messagesContainer) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <div class="message-avatar" style="background: #fef3c7; color: #f59e0b;">⚡</div>
                <div class="message-content">${message}</div>
            `;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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

function acceptCurrentPrice() {
    addUserMessage("Perfect! I'll take it at this price.", 'negotiation-messages');
    addAIResponse("Fantastic! 🎉 Thank you for choosing Otoz.ai! In the full app, you would now proceed to Inspector for quality check, then to Penny for payment, and finally to Captain for shipping. This demo shows the AI negotiation capabilities! ⚡", 'negotiation-messages', 1000);
}

function updateAgentStatus(activeAgent, isActive) {
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

// Navigation functions
function goBack() {
    document.getElementById('welcome-page').style.display = 'flex';
    document.getElementById('demo-container').classList.remove('active');
}

function goBackToPreferences() {
    showOnboarding();
}

// Existing customer functions
function showExistingCustomerPortal() {
    const portal = document.getElementById('existing-customer-portal');
    if (portal) portal.classList.add('active');
}

function closeExistingCustomerPortal() {
    const portal = document.getElementById('existing-customer-portal');
    if (portal) portal.classList.remove('active');
    const vehicleIdInput = document.getElementById('customer-vehicle-id');
    if (vehicleIdInput) vehicleIdInput.value = '';
}

function accessAgent(agentType) {
    const vehicleId = document.getElementById('customer-vehicle-id')?.value?.trim();
    
    if (!vehicleId) {
        alert('Please enter your Vehicle ID or Order Number first.');
        return;
    }
    
    closeExistingCustomerPortal();
    alert(`🤖 ${agentType.toUpperCase()} Agent accessed for Vehicle ID: ${vehicleId}\n\nIn the full app, this would show detailed status information for your order.`);
}

// Form functions
function closeCustomerInfoForm() {
    const popup = document.getElementById('customer-info-popup');
    if (popup) popup.classList.remove('active');
}

function closeNotification() {
    const overlay = document.getElementById('notification-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ===== ENHANCED: selectSimpleCar Function with Dynamic Car Database =====
function selectSimpleCar(carId) {
    console.log('🚗 Selecting car with ID:', carId);
    
    // Find car from database by ID
    selectedCar = carDatabase.find(car => car.id === carId);
    
    if (!selectedCar) {
        // Fallback to availableCars if not found in database
        selectedCar = availableCars.find(car => car.id === carId);
    }
    
    if (!selectedCar) {
        console.error('❌ Car not found with ID:', carId);
        alert('Car not found! Please try again.');
        return;
    }
    
    originalPrice = selectedCar.price;
    currentPrice = selectedCar.price;
    discountApplied = 0;
    
    console.log('✅ Selected car:', selectedCar);
    
    // Add visual feedback
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.border = '3px solid #22c55e';
        cardElement.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
        
        setTimeout(() => {
            startNegotiation();
        }, 500);
    } else {
        startNegotiation();
    }
}

// ===== ENHANCED: passSimpleCar Function with Dynamic Removal =====
function passSimpleCar(carId) {
    console.log('❌ Passing car with ID:', carId);
    
    // Find the car element
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (!cardElement) {
        console.error('❌ Card element not found for car ID:', carId);
        return;
    }
    
    // Add exit animation
    cardElement.style.transform = 'translateX(-100vw) rotate(-15deg)';
    cardElement.style.opacity = '0';
    cardElement.style.transition = 'all 0.5s ease';
    
    // Remove from available cars array
    availableCars = availableCars.filter(car => car.id !== carId);
    
    setTimeout(() => {
        // Remove from DOM
        cardElement.remove();
        
        // Update title to reflect remaining cars
        const titleElement = document.querySelector('.discovery-title');
        if (titleElement) {
            titleElement.textContent = `🎯 ${availableCars.length} Cars Remaining - Choose Your Favorite!`;
        }
        
        // Check if any cars left
        const remainingCards = document.querySelectorAll('.dynamic-car-card');
        if (remainingCards.length === 0) {
            showNoMoreCarsMessage();
        }
        
        console.log(`✅ Car ${carId} removed. ${availableCars.length} cars remaining.`);
        
    }, 500);
}

// Show message when no more cars are available
function showNoMoreCarsMessage() {
    const simpleGrid = document.getElementById('simple-car-grid');
    if (simpleGrid) {
        simpleGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                color: white;
                animation: slideInUp 0.5s ease;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">😅</div>
                <h3 style="margin-bottom: 15px;">Oops! You've passed all the cars!</h3>
                <p style="margin-bottom: 20px; opacity: 0.9;">Don't worry - let's find you more options by adjusting your preferences.</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="goBackToPreferences()" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔄 Adjust Preferences
                    </button>
                    <button onclick="findMoreCars()" style="
                        background: #22c55e;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔍 Find More Cars
                    </button>
                </div>
            </div>
        `;
    }
}

// Find more cars function
function findMoreCars() {
    console.log('🔍 Finding more cars...');
    
    // Reset available cars to show different ones
    const allCars = [...carDatabase];
    availableCars = shuffleArray(allCars).slice(0, 6); // Show 6 random cars
    
    // Update title
    const titleElement = document.querySelector('.discovery-title');
    if (titleElement) {
        titleElement.textContent = `🎯 Found ${availableCars.length} More Amazing Cars!`;
    }
    
    // Regenerate the grid
    generateDynamicCarGrid();
    
    // Add some visual feedback
    const simpleGrid = document.getElementById('simple-car-grid');
    if (simpleGrid) {
        simpleGrid.style.animation = 'slideInUp 0.5s ease';
    }
}

// Shuffle array utility function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize demo on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo...');
    
    try {
        initializeCarDatabase();
        
        const welcomePage = document.getElementById('welcome-page');
        const demoContainer = document.getElementById('demo-container');
        
        if (welcomePage) welcomePage.style.display = 'flex';
        if (demoContainer) {
            demoContainer.classList.remove('active');
            demoContainer.style.display = 'none';
        }
        
        populateCarMakes();
        updatePreferenceStatus();
        
        console.log('✅ Demo initialization complete!');
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        alert('❌ Error initializing demo. Please check the console for details.');
    }
});
