// --- START OF EXPLORE NEARBY DATA/SCRIPT (Moved from HTML) ---
const places = [
    { id: 1, name: "Lodhi Garden (Hidden Corners)", category: "park", rating: 4.8, reviews: 124, distance: "0.8km", image: "https://placehold.co/600x400/a7f3d0/1e40af?text=Park", alt: "Quiet greenery with ancient monuments", description: "Quiet greenery, perfect for a morning walk or evening hangout.", hours: "Open 6 AM - 8 PM", safety: ["Solo Friendly", "Family Friendly"], coordinates: [28.5933, 77.2197] },
    { id: 2, name: "Majnu ka Tilla (Tibetan Colony)", category: "cafe", rating: 4.6, reviews: 89, distance: "1.2km", image: "https://placehold.co/600x400/fef08a/854d0e?text=Cafe", alt: "Tibetan cultural enclave with authentic food stalls", description: "Lesser-known food paradise with Tibetan cafes & peaceful vibes.", hours: "Open till late night", safety: ["Group Friendly", "Foodie Spot"], coordinates: [28.7156, 77.2396] },
    { id: 3, name: "Champa Gali, Saket", category: "cafe", rating: 4.9, reviews: 156, distance: "1.5km", image: "https://placehold.co/600x400/fbcfe8/86198f?text=Cafe", alt: "Hidden alleyway with artistic cafes, fairy lights, and boutique shops", description: "Hidden alley with artsy cafes, fairy lights, and indie shops.", hours: "11 AM - 11 PM", safety: ["Romantic Spot", "Instagram Worthy"], coordinates: [28.5207, 77.2046] },
    { id: 4, name: "Ridge Road, Civil Lines", category: "park", rating: 4.4, reviews: 67, distance: "0.5km", image: "https://placehold.co/600x400/d1fae5/065f46?text=Park", alt: "Scenic road through forested area perfect for cycling", description: "A peaceful, lesser-known stretch for night walks & cycling.", hours: "24 hours", safety: ["Solo Friendly", "Well Lit"], coordinates: [28.6863, 77.2286] },
    { id: 5, name: "Hauz Khas Village Rooftops", category: "nightlife", rating: 4.7, reviews: 92, distance: "0.3km", image: "https://placehold.co/600x400/c7d2fe/3730a3?text=Nightlife", alt: "Trendy rooftop bars with panoramic views", description: "Rooftop bars with stunning city views and great atmosphere.", hours: "5:00 PM - 2:00 AM", safety: ["Group Friendly", "Romantic Spot"], coordinates: [28.5545, 77.1947] },
    { id: 6, name: "Sunder Nursery Heritage Park", category: "historical", rating: 4.5, reviews: 78, distance: "1.8km", image: "https://placehold.co/600x400/fed7aa/9a3412?text=History", alt: "Restored Mughal-era gardens", description: "Beautifully restored heritage park with Mughal-era monuments.", hours: "7:00 AM - 7:00 PM", safety: ["Family Friendly", "Solo Friendly"], coordinates: [28.5937, 77.2431] }
];
let map;
let markers = [];
let userLocation = null;
let savedPlaces = new Set();
let userMarker = null;
let exploreInitialized = false;

// Exported function for use in HTML onclick (for 'Find Places Near Me' button)
window.getLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                map.setView([userLocation.lat, userLocation.lng], 14);
                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([userLocation.lat, userLocation.lng]).addTo(map).bindPopup("You are here!").openPopup();
                L.circle([userLocation.lat, userLocation.lng], { color: 'blue', fillColor: '#3388ff', fillOpacity: 0.2, radius: 100 }).addTo(map);
                updateDistances();
                const currentCategory = document.querySelector('.category-filter.active').getAttribute('data-category');
                renderPlaces(currentCategory);
                showNotification('Location found! Showing nearby places.', 'success');
            },
            error => {
                showNotification('Unable to get your location. Please enable permissions.', 'error');
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser.', 'error');
    }
}

function initExploreApp() {
    if (exploreInitialized) {
        // Fix Leaflet map rendering issues when hidden then shown
        setTimeout(() => { if(map) map.invalidateSize() }, 10); 
        return;
    };
    initMap();
    renderPlaces('all');
    setupExploreEventListeners();
    exploreInitialized = true;
}

function initMap() {
    if (document.getElementById('map') && !map) {
        map = L.map('map').setView([28.6139, 77.2090], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
        updateMapMarkers('all');
    }
}

function updateMapMarkers(category) {
    if(!map) return;
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    let filteredPlaces = places.filter(place => category === 'all' || place.category === category);
    filteredPlaces.forEach(place => {
        const marker = L.marker(place.coordinates).addTo(map)
            .bindPopup(`<div class='popup-title'>${place.name}</div><div class='popup-desc'>${place.description}</div><div class='popup-time'>Rating: ${generateStars(place.rating)}</div>`);
        markers.push(marker);
    });
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) { stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'; }
    return `<span class="text-yellow-400 text-xs">${stars}</span>`;
}

function updateDistances() {
    if (!userLocation) return;
    places.forEach(place => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, place.coordinates[0], place.coordinates[1]);
        place.distance = `${distance.toFixed(1)}km`;
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; const dLat = deg2rad(lat2 - lat1); const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

function renderPlaces(category) {
    const grid = document.getElementById('places-grid');
    if(!grid) return;
    grid.innerHTML = '';
    let filteredPlaces = places.filter(place => category === 'all' || place.category === category);
    if (userLocation) {
        filteredPlaces.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }
    filteredPlaces.forEach(place => {
        const card = createPlaceCard(place);
        grid.appendChild(card);
    });
}

function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'place-card bg-white rounded-xl shadow-md overflow-hidden';
    card.innerHTML = `<div class="relative"><img src="${place.image}" alt="${place.alt}" class="w-full h-48 object-cover"><div class="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-sm"><span class="text-sm font-semibold">${place.distance}</span></div></div><div class="p-4"><div class="flex justify-between items-start mb-2"><h4 class="font-semibold text-gray-800">${place.name}</h4><span class="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${place.category.charAt(0).toUpperCase() + place.category.slice(1)}</span></div><p class="text-gray-600 text-sm mb-3">${place.description}</p><div class="flex items-center text-sm">${generateStars(place.rating)}<span class="text-gray-500 ml-2">(${place.reviews})</span></div></div>`;
    return card;
}

function setupExploreEventListeners() {
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.category-filter').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            renderPlaces(category);
            updateMapMarkers(category);
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
}
// --- END OF EXPLORE NEARBY SCRIPT ---


document.addEventListener('DOMContentLoaded', () => {
    let currentUser = {};
    let currentImageUrl = '';
    let tripCounter = 0;
    const authPage = document.getElementById('page-auth');
    const mainApp = document.getElementById('main-app-content');
    const loginFormContainer = document.getElementById('login-form-container');
    const signupFormContainer = document.getElementById('signup-form-container');
    const showSignupLink = document.getElementById('show-signup-link');
    const showLoginLink = document.getElementById('show-login-link');
    const pages = document.querySelectorAll('.page');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

    const navMapping = {
        'nav-dashboard': 'page-dashboard',
        'nav-buddies': 'page-buddies',
        'nav-planner': 'page-planner',
        'nav-explore': 'page-explore',
        'nav-profile': 'page-profile',
    };
    
    const navElements = {
        'dashboard-messages-btn': 'page-messages',
        'dashboard-plan-card': 'page-planner',
        'dashboard-buddy-card': 'page-buddies',
        'dashboard-explore-card': 'page-explore',
    }

    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        bottomNavItems.forEach(item => {
            if (navMapping[item.id] === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (pageId === 'page-messages') {
            renderConversationsList();
            if(window.innerWidth >= 768) {
                loadConversation('Sarah');
            }
        }
        if(pageId === 'page-explore') {
            initExploreApp();
        }
    }
    
    // --- App Initialization ---
    Object.keys(navMapping).forEach(navId => {
        document.getElementById(navId).addEventListener('click', (e) => {
            e.preventDefault();
            showPage(navMapping[navId]);
        });
    });
    Object.keys(navElements).forEach(navId => {
        document.getElementById(navId).addEventListener('click', (e) => {
            e.preventDefault();
            showPage(navElements[navId]);
        });
    });


    // --- Authentication Toggle & Logic ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.classList.add('hidden');
        signupFormContainer.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.classList.add('hidden');
        loginFormContainer.classList.remove('hidden');
    });
    
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // --- AUTHENTICATION MOCK ---
        // In a real app, this is where you would call your backend API (e.g., /api/login)
        // to send the email and password, and the backend would verify them against MySQL.
        // If successful, the backend returns a user object and a security token.
        // --- MOCK DATA FOR DEMO ---
        
        // Simple name derivation for mock login
        const namePart = email.split('@')[0];
        const firstName = capitalize(namePart.split('.')[0] || namePart);
        
        currentUser = {
            name: firstName,
            email: email,
            bio: "Travel enthusiast and foodie exploring the world one city at a time. I believe the best way to experience a new place is through its culture, food, and people. Looking for buddies for my next adventure!",
            travelStyles: ["Adventurous", "Foodie", "Cultural", "Budget Traveler"],
            reviews: [],
            trips: []
        };
        addDefaultReview(); // Add default review for demonstration
        
        updateProfileDisplay();
        authPage.classList.remove('active');
        mainApp.classList.remove('hidden');
        showPage('page-dashboard');
    });
    
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        // --- AUTHENTICATION MOCK ---
        // In a real app, this is where you would call your backend API (e.g., /api/signup)
        // to send name, email, and the password hash to your MySQL database.
        // --- MOCK DATA FOR DEMO ---
        
        showNotification('Account created successfully! Please log in.', 'success');
        document.getElementById('email').value = document.getElementById('signup-email').value;
        document.getElementById('password').value = document.getElementById('signup-password').value;
        showLoginLink.click();
    });

    // --- Logout ---
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        currentUser = {};
        
        const tripsGrid = document.getElementById('my-trips-grid');
        tripsGrid.innerHTML = `<div class="flex-shrink-0 w-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center p-6 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 cursor-pointer" onclick="document.getElementById('nav-planner').click()"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><h3 class="font-semibold text-gray-700">Plan a New Trip</h3></div>`;

        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();

        mainApp.classList.add('hidden');
        authPage.classList.add('active');
        showPage('page-auth');
        showNotification("You've been logged out.", "success");
    });

    // --- AI Itinerary Planner ---
    const plannerForm = document.getElementById('planner-form');
    const plannerLoading = document.getElementById('planner-loading');
    const plannerResults = document.getElementById('planner-results');
    const itineraryContent = document.getElementById('itinerary-content');
    const saveItineraryBtn = document.getElementById('save-itinerary-btn');
    const regenerateBtn = document.getElementById('regenerate-itinerary-btn');
    const itineraryHeader = document.getElementById('itinerary-header');

    document.querySelectorAll('.interest-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });
    
    plannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        plannerForm.classList.add('hidden');
        plannerLoading.classList.remove('hidden');
        plannerResults.classList.add('hidden');
        
        // This is a placeholder for the Gemini API call. It will return a mock itinerary.
        try {
            const responseText = await generateItinerary(); 
            const keywordMatch = responseText.match(//);
            const keyword = keywordMatch ? keywordMatch[1] : 'travel';
            const htmlContent = responseText.replace(//, '').trim();

            currentImageUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(keyword)}`;
            itineraryHeader.style.backgroundImage = `url('${currentImageUrl}')`;
            
            itineraryContent.innerHTML = htmlContent;
            plannerLoading.classList.add('hidden');
            plannerResults.classList.remove('hidden');
        } catch (error) {
            console.error("Error generating itinerary:", error);
            itineraryContent.innerHTML = `<p class="text-center text-red-500">Sorry, something went wrong. Please try again.</p>`;
            plannerLoading.classList.add('hidden');
            plannerResults.classList.remove('hidden');
        }
    });

    regenerateBtn.addEventListener('click', () => {
        plannerResults.classList.add('hidden');
        plannerForm.classList.remove('hidden');
        itineraryContent.innerHTML = '';
    });

    saveItineraryBtn.addEventListener('click', () => {
        const destination = document.getElementById('destination').value;
        const tripData = { 
            destination, 
            imageUrl: currentImageUrl,
            itineraryHTML: itineraryContent.innerHTML,
            expenses: [],
            budget: 50000, // Default budget
        };
        // In a real app, this is where you would call your backend API (e.g., /api/trips)
        // to save the trip object to your MySQL database.
        
        addTripToDashboard(tripData);
        showNotification(`${destination} trip saved!`, 'success');
        showPage('page-dashboard');
        regenerateBtn.click();
    });

    async function generateItinerary() {
        // Mock function to simulate a long-running AI API call
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        const destination = document.getElementById('destination').value;
        const duration = document.getElementById('duration').value;
        const budgetEl = document.getElementById('budget');
        const budgetMap = { '1': 'Budget', '2': 'Moderate', '3': 'Luxury' };
        const budget = budgetMap[budgetEl.value];
        const activeInterests = [...document.querySelectorAll('.interest-btn.active')].map(btn => btn.dataset.interest);
        const interests = activeInterests.length > 0 ? activeInterests.join(', ') : 'general sightseeing';
        
        // Mock Itinerary Data based on inputs
        return `
            <h3>Your ${duration}-Day ${budget} Trip to ${destination}</h3>
            <ul>
                <h4>Day 1: Arrival & Local Exploration (${budget})</h4>
                <li class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-plane-arrival"></i></div>
                    <p class="timeline-time">Morning</p>
                    <p class="timeline-desc">Arrive, check into your accommodation, and find a local street food spot for lunch.</p>
                </li>
                <li class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-map-marked-alt"></i></div>
                    <p class="timeline-time">Afternoon</p>
                    <p class="timeline-desc">Take a self-guided walking tour of the nearest main square to get your bearings.</p>
                </li>
                <li class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-utensils"></i></div>
                    <p class="timeline-time">Evening</p>
                    <p class="timeline-desc">Dinner at a highly-rated local restaurant based on your interest: ${interests}.</p>
                </li>
            </ul>
            <ul>
                <h4>Day 2: Culture & Discovery</h4>
                <li class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-landmark"></i></div>
                    <p class="timeline-time">Morning</p>
                    <p class="timeline-desc">Visit the city's most famous museum or historical site, focusing on ${interests}.</p>
                </li>
                <li class="timeline-item">
                    <div class="timeline-icon"><i class="fas fa-bus"></i></div>
                    <p class="timeline-time">Afternoon</p>
                    <p class="timeline-desc">Explore an outlying neighborhood known for its unique culture and markets.</p>
                </li>
            </ul>
        `;
    }

    // --- Dynamic "My Trips" ---
    function addTripToDashboard(trip) {
        tripCounter++;
        const tripId = `trip-${tripCounter}`;
        trip.id = tripId;
        currentUser.trips.push(trip);

        const tripsGrid = document.getElementById('my-trips-grid');
        const newTripCard = document.createElement('div');
        newTripCard.id = tripId;
        newTripCard.className = "trip-card bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0 w-64";
        
        const imageUrl = trip.imageUrl || 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2011&auto=format&fit=crop';

        newTripCard.innerHTML = `
            <img src="${imageUrl}" alt="Trip to ${trip.destination}" class="w-full h-32 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-bold mb-1">${trip.destination}</h3>
                <div class="flex gap-2 mt-4">
                    <button class="view-trip-btn w-full text-sm bg-indigo-100 text-indigo-800 font-semibold py-2 rounded-lg hover:bg-indigo-200" data-trip-id="${tripId}">View Plan</button>
                    <button class="complete-trip-btn w-full text-sm bg-green-100 text-green-800 font-semibold py-2 rounded-lg hover:bg-green-200" data-trip-id="${tripId}" data-destination="${trip.destination}">Complete</button>
                </div>
            </div>`;
        tripsGrid.prepend(newTripCard);
    }
    
    // --- Buddy Filtering ---
    // Note: Buddy cards are currently not rendered in HTML and this JS section is incomplete, 
    // but the filtering setup is kept for future data.
    const buddyDestInput = document.getElementById('buddy-dest');
    const buddyInterestSelect = document.getElementById('buddy-interest');
    if(buddyDestInput) {
        buddyDestInput.addEventListener('input', filterBuddies);
        buddyInterestSelect.addEventListener('change', filterBuddies);
    }
    
    function filterBuddies() {
        // This function needs mock buddy data rendered in the HTML to work fully.
        // It's currently referencing non-existent elements (`.buddy-card`).
        // It remains here to handle the form inputs.
        console.log(`Filtering buddies by Destination: ${buddyDestInput.value}, Interest: ${buddyInterestSelect.value}`);
        // ... (Filtering logic would go here)
    }

    // --- Profile Page Logic ---
    const profileModal = document.getElementById('edit-profile-modal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
    const cancelProfileEditBtn = document.getElementById('cancel-profile-edit-btn');
    const profileEditForm = document.getElementById('profile-edit-form');
    const profilePicUpload = document.getElementById('profile-pic-upload');

    function openProfileModal() {
        document.getElementById('modal-profile-name').value = currentUser.name;
        document.getElementById('modal-profile-bio').value = currentUser.bio;
        populateTravelStyleModal();
        profileModal.classList.remove('hidden');
        setTimeout(() => profileModal.classList.remove('opacity-0'), 10);
    }
    
    function closeProfileModal() {
        profileModal.classList.add('opacity-0');
        setTimeout(() => profileModal.classList.add('hidden'), 250);
    }

    editProfileBtn.addEventListener('click', openProfileModal);
    closeProfileModalBtn.addEventListener('click', closeProfileModal);
    cancelProfileEditBtn.addEventListener('click', closeProfileModal);
    
    profilePicUpload.addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('profile-picture').src = event.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    const allTravelStyles = ["Adventurous", "Foodie", "Cultural", "Budget Traveler", "Luxury", "Relaxation", "Nightlife", "History Buff"];
    const travelStyleColors = {
        "Adventurous": "bg-teal-100 text-teal-800", "Foodie": "bg-amber-100 text-amber-800", "Cultural": "bg-sky-100 text-sky-800",
        "Budget Traveler": "bg-rose-100 text-rose-800", "Luxury": "bg-purple-100 text-purple-800", "Relaxation": "bg-green-100 text-green-800",
        "Nightlife": "bg-indigo-100 text-indigo-800", "History Buff": "bg-yellow-100 text-yellow-800"
    };

    function populateTravelStyleModal() {
        const container = document.getElementById('modal-travel-styles');
        container.innerHTML = '';
        allTravelStyles.forEach(style => {
            const isSelected = currentUser.travelStyles.includes(style);
            const tag = document.createElement('button');
            tag.type = 'button';
            tag.textContent = style;
            tag.dataset.style = style;
            tag.className = `travel-style-tag px-3 py-1.5 border rounded-full text-sm font-medium ${isSelected ? 'selected' : 'bg-gray-100 text-gray-700 border-gray-300'}`;
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                tag.classList.toggle('bg-gray-100');
                tag.classList.toggle('text-gray-700');
                tag.classList.toggle('border-gray-300');
            });
            container.appendChild(tag);
        });
    }

    profileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser.name = document.getElementById('modal-profile-name').value;
        currentUser.bio = document.getElementById('modal-profile-bio').value;

        const selectedStyles = [];
        document.querySelectorAll('#modal-travel-styles .travel-style-tag.selected').forEach(tag => {
            selectedStyles.push(tag.dataset.style);
        });
        currentUser.travelStyles = selectedStyles;
        
        // In a real app, this is where you would call your backend API to save profile changes.

        updateProfileDisplay();
        closeProfileModal();
        showNotification('Profile updated successfully!', 'success');
    });

    function updateProfileDisplay() {
        document.getElementById('welcome-message').textContent = `Welcome, ${currentUser.name}!`;
        document.getElementById('dashboard-avatar').textContent = currentUser.name.charAt(0);
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-bio-text').textContent = currentUser.bio;
        document.getElementById('profile-picture').src = `https://placehold.co/160x160/667eea/ffffff?text=${currentUser.name.charAt(0)}`;
        document.getElementById('profile-picture').alt = currentUser.name;

        const stylesContainer = document.getElementById('profile-travel-styles');
        stylesContainer.innerHTML = '';
        if(currentUser.travelStyles) {
            currentUser.travelStyles.forEach(style => {
                const tag = document.createElement('span');
                tag.textContent = style;
                const colors = travelStyleColors[style] || 'bg-gray-100 text-gray-800';
                tag.className = `${colors} text-sm font-medium px-3 py-1.5 rounded-full`;
                stylesContainer.appendChild(tag);
            });
        }
        renderReviews();
    }

    // --- Messages Feature ---
    const conversationData = {
        'Sarah': {
            pic: 'https://placehold.co/100x100/9f7aea/ffffff?text=S',
            messages: [
                { sender: 'Sarah', text: 'Hey! Are you excited for our Paris trip?' },
                { sender: 'You', text: 'Absolutely! I was just looking at some cafes in Le Marais.' },
                { sender: 'Sarah', text: 'Oh nice! We should definitely check them out.' }
            ]
        },
        'Mike': {
            pic: 'https://placehold.co/100x100/4299e1/ffffff?text=M',
            messages: [
                { sender: 'Mike', text: 'Have you booked your flight to Bali yet?' },
            ]
        },
        'Laura': {
            pic: 'https://placehold.co/100x100/ed8936/ffffff?text=L',
            messages: [
                { sender: 'Laura', text: 'I found a great resort in the Maldives. Thoughts?' },
                { sender: 'You', text: 'Sounds amazing! Send me the link.' },
            ]
        }
    };
    
    function renderConversationsList() {
        const listEl = document.getElementById('conversations-list');
        listEl.innerHTML = '';
        Object.keys(conversationData).forEach(name => {
            const data = conversationData[name];
            const lastMessage = data.messages[data.messages.length - 1];
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'conversation-item flex items-center p-4 hover:bg-gray-100 transition-colors duration-200';
            item.dataset.buddy = name;
            item.innerHTML = `
                <img src="${data.pic}" alt="${name}" class="w-12 h-12 rounded-full mr-4">
                <div class="flex-grow overflow-hidden">
                    <p class="font-semibold text-gray-800">${name}</p>
                    <p class="text-sm text-gray-500 truncate">${lastMessage.sender === 'You' ? 'You: ' : ''}${lastMessage.text}</p>
                </div>
            `;
            listEl.appendChild(item);
        });
        // Select the first one by default if on desktop or to initialize
        if (listEl.querySelector('.conversation-item') && window.innerWidth >= 768) {
            listEl.querySelector('.conversation-item').classList.add('active');
        }

        listEl.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('.conversation-item');
            if (target) {
                document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
                target.classList.add('active');
                loadConversation(target.dataset.buddy);
                if(window.innerWidth < 768) { // On mobile, show chat window as an overlay or new view
                document.getElementById('conversations-list').classList.add('hidden');
                document.getElementById('chat-window').classList.remove('hidden');
                document.getElementById('chat-window').classList.add('w-full');
                }
            }
        });
    }

    function loadConversation(buddyName) {
        const data = conversationData[buddyName];
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = `
            <div class="p-4 border-b border-gray-200 flex items-center">
                <button class="md:hidden mr-4 text-gray-600" id="back-to-conversations"><i class="fas fa-arrow-left"></i></button>
                <img src="${data.pic}" alt="${buddyName}" class="w-10 h-10 rounded-full mr-3">
                <h3 class="text-lg font-semibold text-gray-800">${buddyName}</h3>
            </div>
            <div id="chat-messages" class="flex-grow p-6 overflow-y-auto space-y-4">
                ${data.messages.map(msg => `
                    <div class="flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'You' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}">
                            <p>${msg.text}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-4 bg-gray-100 border-t border-gray-200">
                <form id="message-form" class="flex items-center space-x-3">
                    <input type="text" id="message-input" placeholder="Type a message..." class="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" autocomplete="off">
                    <button type="submit" class="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 hover:bg-indigo-700">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>`;

        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const backBtn = document.getElementById('back-to-conversations');
        if(backBtn) {
            backBtn.addEventListener('click', () => {
                document.getElementById('conversations-list').classList.remove('hidden');
                document.getElementById('chat-window').classList.add('hidden');
                document.getElementById('chat-window').classList.remove('w-full');
            });
        }


        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('message-input');
            const text = input.value.trim();
            if (text) {
                const newMessage = { sender: 'You', text };
                data.messages.push(newMessage);
                
                const msgBubble = document.createElement('div');
                msgBubble.className = 'flex justify-end';
                msgBubble.innerHTML = `<div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-indigo-600 text-white"><p>${text}</p></div>`;
                chatMessages.appendChild(msgBubble);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                input.value = '';
                renderConversationsList();
                document.querySelector(`.conversation-item[data-buddy="${buddyName}"]`).classList.add('active');


                setTimeout(() => {
                    const reply = { sender: buddyName, text: 'Sounds good!' };
                    data.messages.push(reply);
                    const replyBubble = document.createElement('div');
                    replyBubble.className = 'flex justify-start';
                    replyBubble.innerHTML = `<div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 text-gray-800"><p>${reply.text}</p></div>`;
                    chatMessages.appendChild(replyBubble);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    renderConversationsList();
                    document.querySelector(`.conversation-item[data-buddy="${buddyName}"]`).classList.add('active');
                }, 1500);
            }
        });
    }

    // --- Review & Rating Logic ---
    const reviewModal = document.getElementById('review-modal');
    const reviewForm = document.getElementById('review-form');
    const tripsGrid = document.getElementById('my-trips-grid');
    let currentTripToReview = null;

    tripsGrid.addEventListener('click', (e) => {
        const completeButton = e.target.closest('.complete-trip-btn');
        const viewButton = e.target.closest('.view-trip-btn');
        
        if (completeButton) {
            currentTripToReview = {
                id: completeButton.dataset.tripId,
                destination: completeButton.dataset.destination
            };
            document.getElementById('review-destination').textContent = currentTripToReview.destination;
            openInfoModal(reviewModal);
        } else if (viewButton) {
            const tripId = viewButton.dataset.tripId;
            const tripData = currentUser.trips.find(t => t.id === tripId);
            if(tripData) {
                openViewTripModal(tripData);
            }
        }
    });

    document.getElementById('cancel-review-btn').addEventListener('click', () => {
        closeInfoModal(reviewModal);
    });
    
    const reviewStars = document.getElementById('review-stars');
    reviewStars.addEventListener('click', (e) => {
        if(e.target.tagName === 'I') {
            const rating = e.target.dataset.rating;
            document.getElementById('review-rating-value').value = rating;
            
            reviewStars.querySelectorAll('i').forEach(star => {
                star.classList.remove('active', 'text-yellow-400');
                star.classList.add('text-gray-300');
            });
            
            for(let i=1; i <= rating; i++) {
                reviewStars.querySelector(`[data-rating="${i}"]`).classList.add('active', 'text-yellow-400');
            }
        }
    });

    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newReview = {
            from: "A Travel Buddy", // This would be dynamic in a real app
            pic: "https://placehold.co/40x40/fbbf24/ffffff?text=T",
            rating: document.getElementById('review-rating-value').value,
            text: document.getElementById('review-text').value
        };
        
        // In a real app, this is where you would save the review to your backend.
        currentUser.reviews.unshift(newReview);
        updateProfileDisplay();

        document.getElementById(currentTripToReview.id)?.remove();
        
        closeInfoModal(reviewModal);
        reviewForm.reset();
        reviewStars.querySelectorAll('i').forEach(star => star.classList.remove('active', 'text-yellow-400'));
        
        showNotification('Review submitted!', 'success');
    });
    
    function addDefaultReview() {
        if (!currentUser.reviews) currentUser.reviews = [];
        currentUser.reviews.push({
            from: 'Sarah',
            pic: 'https://placehold.co/40x40/9f7aea/ffffff?text=S',
            rating: 5,
            text: `"${currentUser.name} was an amazing travel buddy in Paris! So knowledgeable and fun."`
        });
    }
    
    function renderReviews() {
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = '';
        if(currentUser.reviews && currentUser.reviews.length > 0) {
            currentUser.reviews.forEach(review => {
                const reviewEl = document.createElement('div');
                reviewEl.className = 'bg-white p-4 rounded-2xl shadow-lg';
                reviewEl.innerHTML = `
                    <div class="flex items-center mb-2">
                        <img src="${review.pic}" alt="${review.from}" class="w-10 h-10 rounded-full mr-3">
                        <div>
                            <p class="font-semibold">Review from ${review.from}</p>
                            ${generateStars(review.rating)}
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm">${review.text}</p>`;
                reviewsList.appendChild(reviewEl);
            });
        } else {
            reviewsList.innerHTML = `<p class="text-gray-500 text-sm text-center">No reviews yet.</p>`;
        }
    }


    // --- Profile Info Modals ---
    const aboutModal = document.getElementById('about-modal');
    const contactModal = document.getElementById('contact-modal');
    const helpModal = document.getElementById('help-modal');
    const viewTripModal = document.getElementById('view-trip-modal');

    document.getElementById('about-us-link').addEventListener('click', (e) => { e.preventDefault(); openInfoModal(aboutModal); });
    document.getElementById('contact-support-link').addEventListener('click', (e) => { e.preventDefault(); openInfoModal(contactModal); });
    document.getElementById('help-center-link').addEventListener('click', (e) => { e.preventDefault(); openInfoModal(helpModal); });

    document.querySelectorAll('.close-info-modal-btn, #close-view-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeInfoModal(btn.closest('.modal'));
        });
    });

    function openInfoModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }

    function closeInfoModal(modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 250);
    }
    
    // --- View Trip Modal ---
    function openViewTripModal(tripData) {
        document.getElementById('view-trip-title').textContent = `Trip to ${tripData.destination}`;
        document.getElementById('view-trip-header').style.backgroundImage = `url('${tripData.imageUrl}')`;
        document.getElementById('view-trip-itinerary').innerHTML = tripData.itineraryHTML;
        
        // Budget tracker logic
        const expenseForm = document.getElementById('expense-form');
        const expenseList = document.getElementById('expense-list');
        const budgetSpentEl = document.getElementById('budget-spent');
        const budgetTotalEl = document.getElementById('budget-total');
        const budgetProgress = document.getElementById('budget-progress');

        budgetTotalEl.textContent = `₹${tripData.budget}`;
        
        function updateBudget() {
            const totalSpent = tripData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
            budgetSpentEl.textContent = `₹${totalSpent}`;
            const percentage = Math.min((totalSpent / tripData.budget) * 100, 100);
            budgetProgress.style.width = `${percentage}%`;
            budgetProgress.style.backgroundColor = percentage > 80 ? '#ef4444' : '#22c55e';
        }

        function renderExpenses() {
            expenseList.innerHTML = '';
            tripData.expenses.forEach(expense => {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center text-sm';
                li.innerHTML = `<span>${expense.desc}</span><span>₹${expense.amount}</span>`;
                expenseList.appendChild(li);
            });
        }
        
        const onExpenseSubmit = (e) => {
            e.preventDefault();
            const descInput = document.getElementById('expense-desc');
            const amountInput = document.getElementById('expense-amount');
            const amount = parseFloat(amountInput.value);

            // In a real app, this is where you'd save the expense to your backend/DB
            if(descInput.value.trim() && amount > 0) {
                tripData.expenses.push({ desc: descInput.value, amount: amount });
                renderExpenses();
                updateBudget();
                descInput.value = '';
                amountInput.value = '';
            }
        };

        expenseForm.onsubmit = onExpenseSubmit;

        renderExpenses();
        updateBudget();
        openInfoModal(viewTripModal);
    }
    
    // Initial Load
    showPage('page-auth');
});