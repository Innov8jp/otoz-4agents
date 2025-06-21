// 🔧 ENHANCED EVENT HANDLERS - Add this to the end of your js/main.js file

// 🔧 CRITICAL: Enhanced DOMContentLoaded with ALL event handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Otoz.ai demo with enhanced event handlers...');
    
    try {
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
            demoContainer.style.display = 'none';
        }
        
        // 🔧 FIX 1: START DEMO BUTTON EVENT HANDLER
        const startDemoBtn = document.getElementById('start-demo-btn');
        if (startDemoBtn) {
            startDemoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Start demo button clicked');
                startDemo();
            });
            console.log('✅ Start demo button event handler attached');
        } else {
            console.error('❌ Start demo button not found');
        }
        
        // 🔧 FIX 2: EXISTING CUSTOMER BUTTON EVENT HANDLER
        const existingCustomerBtn = document.getElementById('existing-customer-btn');
        if (existingCustomerBtn) {
            existingCustomerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Existing customer button clicked');
                showExistingCustomerPortal();
            });
            console.log('✅ Existing customer button event handler attached');
        } else {
            console.error('❌ Existing customer button not found');
        }
        
        // 🔧 FIX 3: FIND CARS BUTTON EVENT HANDLER
        const findCarsBtn = document.getElementById('find-cars-btn');
        if (findCarsBtn) {
            findCarsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Find cars button clicked');
                findMatchingCars();
            });
            console.log('✅ Find cars button event handler attached');
        } else {
            console.error('❌ Find cars button not found');
        }
        
        // 🔧 FIX 4: CAR SELECTION EVENT HANDLERS
        const carCards = document.querySelectorAll('.simple-car-card');
        carCards.forEach((card, index) => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const carId = card.getAttribute('data-car-id') || (index + 1);
                console.log('🔧 Car card clicked:', carId);
                selectSimpleCar(parseInt(carId));
            });
        });
        console.log(`✅ Car selection event handlers attached to ${carCards.length} cars`);
        
        // 🔧 FIX 5: BACK NAVIGATION BUTTON EVENT HANDLERS
        const backToPreferencesBtn = document.getElementById('back-to-preferences-btn');
        if (backToPreferencesBtn) {
            backToPreferencesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Back to preferences button clicked');
                goBackToPreferences();
            });
        }
        
        const backToHomeBtn = document.getElementById('back-to-home-btn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Back to home button clicked');
                goBack();
            });
        }
        
        // 🔧 FIX 6: EXISTING CUSTOMER PORTAL EVENT HANDLERS
        const closeCustomerPortalBtn = document.getElementById('close-customer-portal-btn');
        if (closeCustomerPortalBtn) {
            closeCustomerPortalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Close customer portal button clicked');
                closeExistingCustomerPortal();
            });
        }
        
        // Agent access buttons
        const agentAccessBtns = document.querySelectorAll('.agent-access-btn');
        agentAccessBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const agentType = btn.getAttribute('data-agent');
                console.log('🔧 Agent access button clicked:', agentType);
                accessAgent(agentType);
            });
        });
        console.log(`✅ Agent access event handlers attached to ${agentAccessBtns.length} buttons`);
        
        // 🔧 FIX 7: CHAT INTERFACE EVENT HANDLERS
        const sendMessageBtn = document.getElementById('send-message-btn');
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Send message button clicked');
                sendNegotiationMessage();
            });
        }
        
        // Quick reply buttons
        const tooExpensiveBtn = document.getElementById('too-expensive-btn');
        if (tooExpensiveBtn) {
            tooExpensiveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Too expensive button clicked');
                quickReply('That seems too expensive. Can you do better?');
            });
        }
        
        const bestPriceBtn = document.getElementById('best-price-btn');
        if (bestPriceBtn) {
            bestPriceBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Best price button clicked');
                quickReply('What is your absolute best price?');
            });
        }
        
        const acceptDealBtn = document.getElementById('accept-deal-btn');
        if (acceptDealBtn) {
            acceptDealBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Accept deal button clicked');
                acceptCurrentPrice();
            });
        }
        
        // 🔧 FIX 8: FORM EVENT HANDLERS
        const cancelFormBtn = document.getElementById('cancel-form-btn');
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔧 Cancel form button clicked');
                closeCustomerInfoForm();
            });
        }
        
        // 🔧 FIX 9: DROPDOWN CHANGE EVENT HANDLERS
        const carMakeSelect = document.getElementById('car-make');
        if (carMakeSelect) {
            carMakeSelect.addEventListener('change', function(e) {
                console.log('🔧 Car make changed:', e.target.value);
                updateModelOptions();
            });
        }
        
        const carModelSelect = document.getElementById('car-model');
        if (carModelSelect) {
            carModelSelect.addEventListener('change', function(e) {
                console.log('🔧 Car model changed:', e.target.value);
                updateYearOptions();
            });
        }
        
        const carYearSelect = document.getElementById('car-year');
        if (carYearSelect) {
            carYearSelect.addEventListener('change', function(e) {
                console.log('🔧 Car year changed:', e.target.value);
                updatePreferenceStatus();
            });
        }
        
        // 🔧 FIX 10: RANGE SLIDER EVENT HANDLERS
        const mileageRange = document.getElementById('mileage-range');
        if (mileageRange) {
            mileageRange.addEventListener('input', function(e) {
                console.log('🔧 Mileage range changed:', e.target.value);
                updateMileageDisplay(e.target.value);
            });
        }
        
        const budgetRange = document.getElementById('budget-range');
        if (budgetRange) {
            budgetRange.addEventListener('input', function(e) {
                console.log('🔧 Budget range changed:', e.target.value);
                updateBudgetDisplay(e.target.value);
            });
        }
        
        // Populate car makes dropdown
        populateCarMakes();
        
        // Initialize preference status indicators
        updatePreferenceStatus();
        
        // Enhanced Enter key handling for chat
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
                    name: document.getElementById('customer-name')?.value || '',
                    email: document.getElementById('customer-email')?.value || ''
                };
                
                // Validate required fields
                if (!customerInfo.name || !customerInfo.email) {
                    alert('⚠️ Please fill in all required customer information fields.');
                    return;
                }
                
                // Close popup and show success
                closeCustomerInfoForm();
                alert('✅ Customer information collected successfully!\n\nIn the full app, this would generate a detailed invoice and proceed to payment processing.');
            });
        }
        
        console.log('✅ Demo initialization complete with all event handlers!');
        
        // 🔧 DIAGNOSTIC: Check all critical elements
        const criticalElements = {
            'start-demo-btn': document.getElementById('start-demo-btn'),
            'existing-customer-btn': document.getElementById('existing-customer-btn'),
            'find-cars-btn': document.getElementById('find-cars-btn'),
            'existing-customer-portal': document.getElementById('existing-customer-portal'),
            'demo-container': document.getElementById('demo-container'),
            'welcome-page': document.getElementById('welcome-page')
        };
        
        console.log('🔧 Critical Elements Check:', Object.keys(criticalElements).map(key => ({
            name: key,
            exists: !!criticalElements[key]
        })));
        
        // Show success message
        setTimeout(() => {
            console.log('🎉 Otoz.ai demo is ready! All buttons should now work properly.');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        alert('❌ Error initializing demo. Please check the console for details.');
    }
});


// ===== CRITICAL FIX: Add Missing selectSimpleCar Function =====
function selectSimpleCar(carId) {
    console.log('🚗 Selecting simple car:', carId);
    
    // Define the cars that match your HTML
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

// ===== FIX: Add Pass Function =====
function passSimpleCar(carId) {
    console.log('❌ Passed car:', carId);
    alert('Car passed! Try selecting another one.');
}
