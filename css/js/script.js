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

// Top 50 Car Manufacturers and their models
const carMakers = {
    'Toyota': ['Camry', 'Corolla', 'Prius', 'RAV4', 'Highlander', 'Sienna', 'Tacoma', 'Tundra', 'Land Cruiser', 'Avalon'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline', 'HR-V', 'Passport', 'Fit', 'Insight'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Focus', 'Fusion'],
    'Chevrolet': ['Silverado', 'Camaro', 'Corvette', 'Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Malibu', 'Cruze', 'Impala'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'Z4', 'i3', 'i8', 'M3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'AMG GT'],
    'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8']
};

// Generate comprehensive car database
function initializeCarDatabase() {
    carDatabase.length = 0;
    let carIdCounter = 1;

    const guaranteedCars = [
        {
            id: carIdCounter++, make: 'Toyota', model: 'Camry', year: '2020', name: '2020 Toyota Camry',
            icon: '🚗', mileage: 35000, price: 22000, vin: 'TC2020001',
            engine: '2.5L I4', transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.2%', location: 'Tokyo, Japan', condition: 'Excellent'
        },
        {
            id: carIdCounter++, make: 'Honda', model: 'Accord', year: '2019', name: '2019 Honda Accord',
            icon: '🚗', mileage: 42000, price: 20500, vin: 'HA2019002',
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

    carDatabase.push(...guaranteedCars);
    console.log(`✅ Car database initialized with ${carDatabase.length} vehicles`);
}

// Start demo function
function startDemo() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('demo-container').classList.add('active');
    showOnboarding();
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

// Find matching cars
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
            
            if (selectedMake) {
                filteredCars = filteredCars.filter(car => car.make === selectedMake);
            }
            if (selectedModel) {
                filteredCars = filteredCars.filter(car => car.model === selectedModel);
            }
            if (selectedYear) {
                filteredCars = filteredCars.filter(car => car.year === selectedYear);
            }
            
            filteredCars = filteredCars.filter(car => 
                car.price <= selectedBudget * 1.5 && 
                car.mileage <= selectedMileage * 1.5
            );
            
            if (filteredCars.length === 0) {
                filteredCars = carDatabase.slice(0, 3);
            }
            
            availableCars = filteredCars.slice(0, 3);
            currentCarIndex = 0;
            
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

// ===== FIXED: Car Discovery Function =====
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
        titleElement.textContent = `🎯 We Found Perfect Matches For You!`;
    }
    
    const simpleGrid = document.getElementById('simple-car-grid');
    if (simpleGrid) {
        simpleGrid.style.display = 'grid';
        console.log('✅ Car grid is now visible');
    } else {
        console.error('❌ Car grid not found!');
    }
}

// Start negotiation phase
function startNegotiation() {
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
    if (container) {
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
        const activeCard = document.getElementById(`agent-${activeAgent}`);
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
}

function goBackToPreferences() {
    showOnboarding();
}

// ===== CRITICAL FIX: Add Missing selectSimpleCar Function =====
function selectSimpleCar(carId) {
    console.log('🚗 Selecting simple car:', carId);
    
    const simpleCars = {
        1: {
            id: 1, make: 'Toyota', model: 'Camry', year: '2020', 
            name: '2020 Toyota Camry', icon: '🚗', mileage: 35000, 
            price: 22000, vin: 'TC2020001', engine: '2.5L I4', 
            transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+3.2%', location: 'Tokyo, Japan', condition: 'Excellent'
        },
        2: {
            id: 2, make: 'Honda', model: 'Accord', year: '2019',
            name: '2019 Honda Accord', icon: '🚙', mileage: 42000,
            price: 20500, vin: 'HA2019002', engine: '1.5L Turbo',
            transmission: 'CVT', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+2.8%', location: 'Tokyo, Japan', condition: 'Excellent'
        },
        3: {
            id: 3, make: 'BMW', model: '3 Series', year: '2020',
            name: '2020 BMW 3 Series', icon: '🏎️', mileage: 28000,
            price: 32000, vin: 'BMW2020003', engine: '2.0L Turbo',
            transmission: 'Automatic', fuelType: 'Gasoline', seats: '5 Seats',
            trend: 'up', trendPercent: '+4.1%', location: 'Tokyo, Japan', condition: 'Excellent'
        }
    };
    
    selectedCar = simpleCars[carId];
    if (!selectedCar) {
        console.error('❌ Car not found:', carId);
        alert('Car not found! Please try again.');
        return;
    }
    
    originalPrice = selectedCar.price;
    currentPrice = selectedCar.price;
    discountApplied = 0;
    
    console.log('✅ Selected car:', selectedCar);
    startNegotiation();
}

function passSimpleCar(carId) {
    console.log('❌ Passed car:', carId);
    alert('Car passed! Try selecting another one.');
}

// Initialize demo on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo...');
    initializeCarDatabase();
    updatePreferenceStatus();
});
