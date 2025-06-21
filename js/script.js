// OTOZ.AI FIXED SCRIPT - ESSENTIAL FUNCTIONS ONLY
// ================================================================

// Global variables
let selectedCar = null;
let currentPhase = 'onboarding';
let selectedMake = '';
let selectedModel = '';
let selectedYear = '';
let selectedMileage = 50000;
let selectedBudget = 25000;

// ================================================================
// CRITICAL FIX #1: START JOURNEY FUNCTION
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

// ================================================================
// CRITICAL FIX #2: ONBOARDING FUNCTIONS
// ================================================================
function showOnboarding() {
    console.log('📋 Showing onboarding...');
    currentPhase = 'onboarding';
    
    // Show onboarding phase
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
    
    // Initialize preferences
    updatePreferenceStatus();
}

// ================================================================
// CRITICAL FIX #3: EXISTING CUSTOMER FUNCTIONS
// ================================================================
function showExistingCustomerPortal() {
    console.log('👤 Opening existing customer portal...');
    const portal = document.getElementById('existing-customer-portal');
    if (portal) {
        portal.classList.add('active');
        portal.style.display = 'flex';
    } else {
        console.error('❌ Existing customer portal element not found!');
        alert('Existing customer portal is not available. Please use the main demo instead.');
    }
}

function closeExistingCustomerPortal() {
    console.log('❌ Closing existing customer portal...');
    const portal = document.getElementById('existing-customer-portal');
    if (portal) {
        portal.classList.remove('active');
        portal.style.display = 'none';
    }
    
    // Clear vehicle ID input
    const vehicleIdInput = document.getElementById('customer-vehicle-id');
    if (vehicleIdInput) {
        vehicleIdInput.value = '';
    }
}

function accessAgent(agentType) {
    console.log(`🤖 Accessing ${agentType} agent...`);
    
    const vehicleId = document.getElementById('customer-vehicle-id')?.value?.trim();
    
    if (!vehicleId) {
        alert('Please enter your Vehicle ID or Order Number first.');
        return;
    }
    
    // Close portal
    closeExistingCustomerPortal();
    
    // Show agent access message
    alert(`🤖 ${agentType.toUpperCase()} Agent accessed for Vehicle ID: ${vehicleId}\n\nIn the full app, this would show detailed status information for your order.`);
}

// ================================================================
// CRITICAL FIX #4: CAR SELECTION FUNCTIONS
// ================================================================
function selectSimpleCar(carId) {
    console.log('🚗 Selecting car with ID:', carId);
    
    // Simple car data for demo
    const carData = {
        1: {name: '2020 Toyota Camry LE', price: 22000, make: 'Toyota'},
        2: {name: '2019 Honda Accord LX', price: 20500, make: 'Honda'}, 
        3: {name: '2020 BMW 3 Series', price: 32000, make: 'BMW'},
        4: {name: '2021 Toyota Camry SE', price: 24500, make: 'Toyota'},
        5: {name: '2020 Honda Accord Sport', price: 23000, make: 'Honda'},
        6: {name: '2021 BMW 330i', price: 35500, make: 'BMW'}
    };
    
    selectedCar = carData[carId];
    
    if (!selectedCar) {
        alert('Car not found! Please try again.');
        return;
    }
    
    // Visual feedback
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'scale(1.05)';
        cardElement.style.border = '3px solid #22c55e';
        cardElement.style.boxShadow = '0 10px 30px rgba(34, 197, 94, 0.3)';
    }
    
    // Show success message and continue
    alert(`Great choice! You selected the ${selectedCar.name} for $${selectedCar.price.toLocaleString()}.\n\nDemo will continue here in the full version!`);
}

function passSimpleCar(carId) {
    console.log('❌ Passing car with ID:', carId);
    
    // Find and animate the card
    const cardElement = document.getElementById(`car-card-${carId}`);
    if (cardElement) {
        cardElement.style.transform = 'translateX(-100vw) rotate(-15deg)';
        cardElement.style.opacity = '0';
        cardElement.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            cardElement.remove();
        }, 500);
    }
    
    alert('Car passed! In the full app, this would show the next available car.');
}

// ================================================================
// PREFERENCE FUNCTIONS
// ================================================================
function updatePreferenceStatus() {
    console.log('📊 Updating preference status...');
    
    const sections = document.querySelectorAll('.preference-section');
    const findButton = document.querySelector('.find-cars-btn');
    let allComplete = true;
    
    // Check if basic preferences are set
    if (selectedMake || selectedModel || selectedYear || selectedMileage > 0 || selectedBudget > 1000) {
        // Mark as having some preferences
        sections.forEach(section => {
            section.classList.remove('incomplete');
            section.classList.add('complete');
        });
    } else {
        allComplete = false;
        sections.forEach(section => {
            section.classList.remove('complete');
            section.classList.add('incomplete');
        });
    }
    
    // Update find button
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
    console.log('🔍 Finding cars...');
    
    // Show loading
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Simulate search
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        showCarDiscovery();
    }, 1000);
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
}

// ================================================================
// NAVIGATION FUNCTIONS
// ================================================================
function goBack() {
    console.log('⬅️ Going back...');
    const welcomePage = document.getElementById('welcome-page');
    const demoContainer = document.getElementById('demo-container');
    
    if (welcomePage) welcomePage.style.display = 'flex';
    if (demoContainer) {
        demoContainer.classList.remove('active');
        demoContainer.style.display = 'none';
    }
}

function goBackToPreferences() {
    console.log('⬅️ Going back to preferences...');
    showOnboarding();
}

// ================================================================
// DROPDOWN FUNCTIONS
// ================================================================
function updateModelOptions() {
    selectedMake = document.getElementById('car-make')?.value || '';
    updatePreferenceStatus();
}

function updateYearOptions() {
    selectedModel = document.getElementById('car-model')?.value || '';
    updatePreferenceStatus();
}

function updateMileageDisplay(value) {
    selectedMileage = parseInt(value) || 50000;
    const display = document.getElementById('mileage-display');
    if (display) {
        display.textContent = `${selectedMileage.toLocaleString()} km`;
    }
    updatePreferenceStatus();
}

function updateBudgetDisplay(value) {
    selectedBudget = parseInt(value) || 25000;
    const display = document.getElementById('budget-display');
    if (display) {
        display.textContent = `$${selectedBudget.toLocaleString()}`;
    }
    updatePreferenceStatus();
}

// ================================================================
// INITIALIZATION
// ================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 OTOZ.AI Script Loaded Successfully!');
    
    // Ensure welcome page is visible
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
        welcomePage.style.display = 'flex';
    }
    
    // Ensure demo container is hidden initially  
    const demoContainer = document.getElementById('demo-container');
    if (demoContainer) {
        demoContainer.style.display = 'none';
        demoContainer.classList.remove('active');
    }
    
    console.log('✅ Ready for user interaction!');
});

// Test functions (for debugging)
window.testStartDemo = function() {
    console.log('🧪 Testing startDemo function...');
    startDemo();
};

window.testExistingCustomer = function() {
    console.log('🧪 Testing existing customer portal...');
    showExistingCustomerPortal();
};
