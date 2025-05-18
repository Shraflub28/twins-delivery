// Restaurant data (in a real application, this would come from a backend)
const restaurants = [
    {
        id: 1,
        name: "Quick",
        cuisine: "Fast Food",
        rating: 4.2,
        reviews: 800,
        deliveryTime: "15-25 min",
        price: 2,
        image: "pictures/quick.jpeg",
        badge: "20% OFF",
        badgeIcon: "percent",
        dietary: ["Halal"]
    },
    {
        id: 2,
        name: "KFC",
        cuisine: "Chicken",
        rating: 4.4,
        reviews: 1700,
        deliveryTime: "20-30 min",
        price: 2,
        image: "pictures/kfc.jpeg",
        badge: "Fast",
        badgeIcon: "bolt",
        dietary: ["Halal"]
    },
    {
        id: 3,
        name: "Pizza Hut",
        cuisine: "Pizza",
        rating: 4.3,
        reviews: 1500,
        deliveryTime: "25-35 min",
        price: 3,
        image: "pictures/pizza hut.jpeg",
        badge: "Popular",
        badgeIcon: "fire",
        dietary: ["Vegetarian"]
    },
    {
        id: 4,
        name: "L'adresse",
        cuisine: "Gourmet",
        rating: 4.8,
        reviews: 950,
        deliveryTime: "30-40 min",
        price: 4,
        image: "pictures/ladress.jpeg",
        badge: "Premium",
        badgeIcon: "gem",
        dietary: ["Vegetarian", "Gluten-Free"]
    }
];

// DOM Elements
const searchInput = document.querySelector('.search-bar input');
const searchButton = document.querySelector('.search-bar button');
const cuisineFilter = document.querySelector('select[value=""]');
const priceRange = document.querySelector('input[type="range"]');
const deliveryTimeFilter = document.querySelector('select[value=""]');
const ratingFilter = document.querySelector('.rating-filter');
const dietaryFilters = document.querySelectorAll('.checkbox-group input');
const sortSelect = document.querySelector('select[value="popularity"]');
const restaurantGrid = document.querySelector('.restaurant-grid');
const resultsCount = document.querySelector('.results-count');
const applyFiltersButton = document.querySelector('.apply-filters');

// State
let currentFilters = {
    search: '',
    cuisine: '',
    price: 5,
    deliveryTime: '',
    rating: 0,
    dietary: [],
    sort: 'popularity'
};

// Initialize the page
function initializePage() {
    displayRestaurants(restaurants);
    setupEventListeners();
    updateResultsCount(restaurants.length);
}

// Display restaurants
function displayRestaurants(restaurants) {
    restaurantGrid.innerHTML = '';
    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        restaurantGrid.appendChild(card);
    });
}

// Create restaurant card
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    
    // Create a link to the menu page
    const menuLink = document.createElement('a');
    menuLink.href = `../../menu.html?restaurant=${restaurant.name}`;
    
    menuLink.innerHTML = `
        <img src="${restaurant.image}" alt="${restaurant.name}">
        <div class="restaurant-info">
            <h3>${restaurant.name}</h3>
            <p><i class="fas fa-utensils"></i> ${restaurant.cuisine} • <i class="fas fa-star"></i> ${restaurant.rating} (${restaurant.reviews}+)</p>
            <span class="delivery-time"><i class="fas fa-clock"></i> ${restaurant.deliveryTime}</span>
        </div>
    `;
    
    // Create the badge separately since it should be outside the link
    const badge = document.createElement('div');
    badge.className = 'card-badge';
    badge.innerHTML = `<i class="fas fa-${restaurant.badgeIcon}"></i> ${restaurant.badge}`;
    
    // Add badge and link to the card
    card.appendChild(badge);
    card.appendChild(menuLink);
    
    return card;
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
    });

    // Search button
    searchButton.addEventListener('click', applyFilters);

    // Cuisine filter
    cuisineFilter.addEventListener('change', (e) => {
        currentFilters.cuisine = e.target.value;
    });

    // Price range
    priceRange.addEventListener('input', (e) => {
        currentFilters.price = parseInt(e.target.value);
    });

    // Delivery time
    deliveryTimeFilter.addEventListener('change', (e) => {
        currentFilters.deliveryTime = e.target.value;
    });

    // Rating filter
    ratingFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('fa-star')) {
            const stars = Array.from(ratingFilter.children);
            const index = stars.indexOf(e.target);
            currentFilters.rating = index + 1;
            updateRatingDisplay(index + 1);
        }
    });

    // Dietary filters
    dietaryFilters.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            currentFilters.dietary = Array.from(dietaryFilters)
                .filter(cb => cb.checked)
                .map(cb => cb.parentElement.textContent.trim());
        });
    });

    // Sort select
    sortSelect.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
    });

    // Apply filters button
    applyFiltersButton.addEventListener('click', applyFilters);
}

// Update rating display
function updateRatingDisplay(rating) {
    const stars = Array.from(ratingFilter.children);
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#ffd700' : '#ccc';
    });
}

// Apply filters
function applyFilters() {
    let filteredRestaurants = [...restaurants];

    // Apply search filter
    if (currentFilters.search) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(currentFilters.search.toLowerCase())
        );
    }

    // Apply cuisine filter
    if (currentFilters.cuisine) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
            restaurant.cuisine.toLowerCase() === currentFilters.cuisine.toLowerCase()
        );
    }

    // Apply price filter
    filteredRestaurants = filteredRestaurants.filter(restaurant =>
        restaurant.price <= currentFilters.price
    );

    // Apply delivery time filter
    if (currentFilters.deliveryTime) {
        filteredRestaurants = filteredRestaurants.filter(restaurant => {
            const maxTime = parseInt(currentFilters.deliveryTime);
            const restaurantTime = parseInt(restaurant.deliveryTime.split('-')[1]);
            return restaurantTime <= maxTime;
        });
    }

    // Apply rating filter
    if (currentFilters.rating > 0) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
            restaurant.rating >= currentFilters.rating
        );
    }

    // Apply dietary filters
    if (currentFilters.dietary.length > 0) {
        filteredRestaurants = filteredRestaurants.filter(restaurant =>
            currentFilters.dietary.every(diet => restaurant.dietary.includes(diet))
        );
    }

    // Apply sorting
    switch (currentFilters.sort) {
        case 'rating':
            filteredRestaurants.sort((a, b) => b.rating - a.rating);
            break;
        case 'delivery_time':
            filteredRestaurants.sort((a, b) => {
                const timeA = parseInt(a.deliveryTime.split('-')[0]);
                const timeB = parseInt(b.deliveryTime.split('-')[0]);
                return timeA - timeB;
            });
            break;
        case 'price_low':
            filteredRestaurants.sort((a, b) => a.price - b.price);
            break;
        case 'price_high':
            filteredRestaurants.sort((a, b) => b.price - a.price);
            break;
        default: // popularity (reviews)
            filteredRestaurants.sort((a, b) => b.reviews - a.reviews);
    }

    displayRestaurants(filteredRestaurants);
    updateResultsCount(filteredRestaurants.length);
}

// Update results count
function updateResultsCount(count) {
    resultsCount.textContent = `Showing ${count} restaurants`;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 