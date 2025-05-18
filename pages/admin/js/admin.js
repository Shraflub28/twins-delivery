document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const currentDate = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', dateOptions);

    // Navigation functionality
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.admin-section');
    const viewAllLinks = document.querySelectorAll('.view-all');
    
    // Function to switch active section
    function switchSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load content if not already loaded
            loadSection(sectionId);
        }
        
        // Update active navigation link
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }
    
    // Add click event to sidebar links
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Add click event to "View All" links
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            switchSection(sectionId);
        });
    });
    
    // Load sections dynamically when needed
    function loadSection(sectionId) {
        // Check if section is already loaded
        const section = document.getElementById(sectionId);
        if (section && section.getAttribute('data-loaded') !== 'true') {
            // Simulate loading with a promise
            return new Promise((resolve) => {
                // Show loading
                if (section.innerHTML.trim() === '') {
                    section.innerHTML = '<div class="section-loading"><div class="loading-spinner"></div><p>Loading...</p></div>';
                }
                
                // Load content (in a real app, you would fetch from the server)
                setTimeout(() => {
                    // Set data loaded attribute to prevent reloading
                    section.setAttribute('data-loaded', 'true');
                    
                    // For demonstration, we'll load the content here
                    // In a real app, you would use fetch() to get content from the server
                    if (sectionId === 'orders') {
                        loadOrdersSection(section);
                    } else if (sectionId === 'products') {
                        loadProductsSection(section);
                    } else if (sectionId === 'customers') {
                        loadCustomersSection(section);
                    } else if (sectionId === 'delivery-zones') {
                        loadDeliveryZonesSection(section);
                    } else if (sectionId === 'analytics') {
                        loadAnalyticsSection(section);
                    }
                    
                    resolve();
                }, 500);
            });
        }
        return Promise.resolve();
    }
    
    // Handle refresh button click
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Add rotation animation
            this.classList.add('rotating');
            
            // Find active section
            const activeSection = document.querySelector('.admin-section.active');
            if (activeSection) {
                const sectionId = activeSection.id;
                // Reset loaded state
                activeSection.setAttribute('data-loaded', 'false');
                // Reload the section content
                loadSection(sectionId).then(() => {
                    // Remove rotation class after loading
                    setTimeout(() => {
                        refreshBtn.classList.remove('rotating');
                    }, 500);
                });
            } else {
                setTimeout(() => {
                    refreshBtn.classList.remove('rotating');
                }, 500);
            }
        });
    }
    
    // Add CSS for rotation animation
    const style = document.createElement('style');
    style.textContent = `
        .rotating {
            animation: rotate-refresh 1s linear;
        }
        @keyframes rotate-refresh {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .section-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 50px;
            gap: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Preload the active section on page load
    sidebarLinks.forEach(link => {
        if (link.classList.contains('active')) {
            const sectionId = link.getAttribute('data-section');
            loadSection(sectionId);
        }
    });
    
    // Section Content Loaders
    function loadOrdersSection(section) {
        section.innerHTML = `
            <div class="section-header">
                <h1>Order Management</h1>
                <div class="section-actions">
                    <button class="btn-filter"><i class="fas fa-filter"></i> Filter</button>
                    <button class="btn-export"><i class="fas fa-download"></i> Export</button>
                </div>
            </div>
            
            <div class="orders-container">
                <div class="orders-filters">
                    <div class="filter-group">
                        <label>Status:</label>
                        <select class="filter-select">
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="out-for-delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Date Range:</label>
                        <div class="date-range">
                            <input type="date" class="date-input">
                            <span>to</span>
                            <input type="date" class="date-input">
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <div class="search-box">
                            <input type="text" placeholder="Order ID, Customer...">
                            <button><i class="fas fa-search"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="orders-table-container">
                    <table class="data-table orders-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox"></th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Address</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="checkbox"></td>
                                <td>#ORD-8924</td>
                                <td>Emily Johnson</td>
                                <td>2 items</td>
                                <td>123 Main St, Apt 4B</td>
                                <td>$45.80</td>
                                <td>
                                    <select class="status-select delivered">
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="out-for-delivery">Out for Delivery</option>
                                        <option value="delivered" selected>Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>Today, 14:35</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-view" title="View Details"><i class="fas fa-eye"></i></button>
                                        <button class="btn-assign" title="Assign Driver"><i class="fas fa-motorcycle"></i></button>
                                        <button class="btn-track" title="Track Location"><i class="fas fa-map-marker-alt"></i></button>
                                    </div>
                                </td>
                            </tr>
                            <!-- More order rows would go here -->
                        </tbody>
                    </table>
                </div>
                
                <div class="pagination">
                    <button class="page-btn prev"><i class="fas fa-chevron-left"></i></button>
                    <div class="page-numbers">
                        <button class="page-btn active">1</button>
                        <button class="page-btn">2</button>
                        <button class="page-btn">3</button>
                        <span>...</span>
                        <button class="page-btn">10</button>
                    </div>
                    <button class="page-btn next"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        
        // Initialize any event listeners for this section
        initOrdersEventListeners(section);
    }
    
    function loadProductsSection(section) {
        section.innerHTML = `
            <div class="section-header">
                <h1>Product Management</h1>
                <div class="section-actions">
                    <button class="btn-add-product"><i class="fas fa-plus"></i> Add Product</button>
                </div>
            </div>
            
            <div class="products-container">
                <div class="products-filters">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select class="filter-select">
                            <option value="all">All Categories</option>
                            <option value="burgers">Burgers</option>
                            <option value="pizza">Pizza</option>
                            <option value="sushi">Sushi</option>
                            <option value="salads">Salads</option>
                            <option value="drinks">Drinks</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Sort By:</label>
                        <select class="filter-select">
                            <option value="name">Name</option>
                            <option value="price-asc">Price (Low to High)</option>
                            <option value="price-desc">Price (High to Low)</option>
                            <option value="popular">Popularity</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <div class="search-box">
                            <input type="text" placeholder="Product name...">
                            <button><i class="fas fa-search"></i></button>
                        </div>
                    </div>
                </div>
                
                <div class="products-grid">
                    <!-- Product Cards -->
                    <div class="product-card">
                        <div class="product-actions">
                            <button class="btn-edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete"><i class="fas fa-trash"></i></button>
                        </div>
                        <div class="product-image">
                            <img src="../../pictures/quick.jpeg" alt="Giant Burger">
                        </div>
                        <div class="product-details">
                            <h3>Giant Burger</h3>
                            <div class="product-meta">
                                <span class="product-category">Burgers</span>
                                <span class="product-price">$12.99</span>
                            </div>
                            <p class="product-description">Delicious beef patty with cheese, lettuce, tomato, and special sauce.</p>
                        </div>
                    </div>
                    
                    <!-- More product cards would go here -->
                </div>
                
                <div class="pagination">
                    <button class="page-btn prev"><i class="fas fa-chevron-left"></i></button>
                    <div class="page-numbers">
                        <button class="page-btn active">1</button>
                        <button class="page-btn">2</button>
                        <button class="page-btn">3</button>
                        <span>...</span>
                        <button class="page-btn">8</button>
                    </div>
                    <button class="page-btn next"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        
        // Initialize any event listeners for this section
        initProductsEventListeners(section);
    }
    
    // Initialize Orders section event listeners
    function initOrdersEventListeners(section) {
        // Add any specific event listeners for the orders section
        const statusSelects = section.querySelectorAll('.status-select');
        statusSelects.forEach(select => {
            select.addEventListener('change', function() {
                this.className = 'status-select ' + this.value;
            });
        });
    }
    
    // Initialize Products section event listeners
    function initProductsEventListeners(section) {
        // Add any specific event listeners for the products section
    }
    
    // Add other section loading functions
    function loadCustomersSection(section) {
        section.innerHTML = `
            <div class="section-header">
                <h1>Customer Management</h1>
                <div class="section-actions">
                    <button class="btn-export"><i class="fas fa-download"></i> Export</button>
                </div>
            </div>
            
            <div class="customers-container">
                <!-- Customer content would go here -->
                <div class="customers-table-container">
                    <table class="data-table customers-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Orders</th>
                                <th>Last Order</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Customer rows would go here -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    function loadDeliveryZonesSection(section) {
        section.innerHTML = `
            <div class="section-header">
                <h1>Delivery Zones</h1>
                <div class="section-actions">
                    <button class="btn-add-zone"><i class="fas fa-plus"></i> Add Zone</button>
                </div>
            </div>
            
            <div class="zones-container">
                <!-- Delivery zones content would go here -->
            </div>
        `;
    }
    
    function loadAnalyticsSection(section) {
        section.innerHTML = `
            <div class="section-header">
                <h1>Analytics & Reports</h1>
                <div class="section-actions">
                    <div class="date-filter">
                        <button class="btn-date active">Today</button>
                        <button class="btn-date">This Week</button>
                        <button class="btn-date">This Month</button>
                        <button class="btn-date">Custom</button>
                    </div>
                </div>
            </div>
            
            <div class="analytics-container">
                <!-- Analytics content would go here -->
            </div>
        `;
    }
});

// CSS for new sections
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .section-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-filter, .btn-export, .btn-add-product, .btn-add-zone {
            background-color: white;
            border: 1px solid var(--admin-gray);
            padding: 8px 15px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: var(--admin-transition);
        }
        
        .btn-add-product, .btn-add-zone {
            background-color: var(--admin-primary);
            color: white;
            border: none;
        }
        
        .btn-filter:hover, .btn-export:hover {
            background-color: var(--admin-gray);
        }
        
        .btn-add-product:hover, .btn-add-zone:hover {
            background-color: var(--admin-dark);
        }
        
        .orders-filters, .products-filters {
            display: flex;
            gap: 20px;
            background-color: white;
            padding: 15px;
            border-radius: var(--admin-card-radius);
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 200px;
        }
        
        .filter-group label {
            font-size: 0.8rem;
            color: #6c757d;
            font-weight: 500;
        }
        
        .filter-select {
            padding: 8px 12px;
            border: 1px solid var(--admin-gray);
            border-radius: 5px;
            outline: none;
        }
        
        .date-range {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .date-input {
            padding: 8px;
            border: 1px solid var(--admin-gray);
            border-radius: 5px;
            outline: none;
        }
        
        .search-box {
            display: flex;
            border: 1px solid var(--admin-gray);
            border-radius: 5px;
            overflow: hidden;
        }
        
        .search-box input {
            padding: 8px 12px;
            border: none;
            outline: none;
            flex: 1;
        }
        
        .search-box button {
            background-color: var(--admin-light);
            border: none;
            padding: 0 12px;
            cursor: pointer;
        }
        
        .search-box button:hover {
            background-color: var(--admin-gray);
        }
        
        .orders-table-container, .customers-table-container {
            background-color: white;
            border-radius: var(--admin-card-radius);
            overflow: hidden;
            margin-bottom: 20px;
        }
        
        .orders-table, .customers-table {
            width: 100%;
        }
        
        .status-select {
            padding: 5px 8px;
            border-radius: 20px;
            border: none;
            font-size: 0.75rem;
            font-weight: 600;
            appearance: none;
            background-color: transparent;
            cursor: pointer;
            text-align: center;
        }
        
        .status-select.pending {
            background-color: rgba(255, 193, 7, 0.2);
            color: #ffc107;
        }
        
        .status-select.processing {
            background-color: rgba(23, 162, 184, 0.2);
            color: #17a2b8;
        }
        
        .status-select.out-for-delivery {
            background-color: rgba(0, 55, 255, 0.2);
            color: var(--admin-primary);
        }
        
        .status-select.delivered {
            background-color: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        
        .status-select.cancelled {
            background-color: rgba(220, 53, 69, 0.2);
            color: #dc3545;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .btn-view, .btn-assign, .btn-track, .btn-edit, .btn-delete {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--admin-light);
            cursor: pointer;
            transition: var(--admin-transition);
        }
        
        .btn-view:hover, .btn-assign:hover, .btn-track:hover {
            background-color: var(--admin-gray);
        }
        
        .btn-edit:hover {
            background-color: rgba(0, 55, 255, 0.1);
            color: var(--admin-primary);
        }
        
        .btn-delete:hover {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            gap: 10px;
        }
        
        .page-numbers {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .page-btn {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 1px solid var(--admin-gray);
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: var(--admin-transition);
        }
        
        .page-btn.active, .page-btn:hover {
            background-color: var(--admin-primary);
            color: white;
            border-color: var(--admin-primary);
        }
        
        .page-btn.prev, .page-btn.next {
            width: auto;
            padding: 0 12px;
            border-radius: 20px;
        }
        
        /* Products grid */
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .product-card {
            background-color: white;
            border-radius: var(--admin-card-radius);
            overflow: hidden;
            position: relative;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            transition: var(--admin-transition);
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        .product-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            z-index: 1;
        }
        
        .product-image {
            height: 150px;
            overflow: hidden;
        }
        
        .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--admin-transition);
        }
        
        .product-card:hover .product-image img {
            transform: scale(1.1);
        }
        
        .product-details {
            padding: 15px;
        }
        
        .product-details h3 {
            margin-bottom: 8px;
            font-size: 1.1rem;
        }
        
        .product-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .product-category {
            background-color: rgba(0, 55, 255, 0.1);
            color: var(--admin-primary);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.75rem;
        }
        
        .product-price {
            font-weight: 700;
        }
        
        .product-description {
            color: #6c757d;
            font-size: 0.85rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        /* Date filter */
        .date-filter {
            display: flex;
            gap: 5px;
        }
        
        .btn-date {
            padding: 5px 10px;
            border: 1px solid var(--admin-gray);
            background: white;
            border-radius: 5px;
            cursor: pointer;
            transition: var(--admin-transition);
        }
        
        .btn-date.active, .btn-date:hover {
            background-color: var(--admin-primary);
            color: white;
            border-color: var(--admin-primary);
        }
    `;
    document.head.appendChild(style);
}); 