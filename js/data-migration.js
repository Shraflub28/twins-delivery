/**
 * Restaurant and Menu Data Migration Script
 * 
 * This script reads restaurant data from local JSON files and uploads it to Supabase.
 * It creates restaurant entries, menu categories, and menu items based on the JSON data.
 */

// Import Supabase client
// Including the function at the top of the file for standalone execution
async function loadSupabase() {
    // Check if Supabase is already loaded
    if (window.SupabaseWrapper && window.SupabaseWrapper.initialized) {
        return window.SupabaseWrapper.client;
    }
    
    // Wait for Supabase initialization if it's in progress
    if (window.initSupabase) {
        await window.initSupabase();
        return window.SupabaseWrapper.client;
    }
    
    // Fallback: Manual init if the wrapper isn't available
    if (window.supabase) {
        const SUPABASE_CONFIG = {
            url: 'https://tqghrundisdrrokciulb.supabase.co',
            key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZ2hydW5kaXNkcnJva2NpdWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDk2OTMsImV4cCI6MjA2MzQ4NTY5M30.FrqgrPdko7ks37Q6fv0JBARitiOtKqxYc80pkiKz90g'
        };
        
        return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    }
    
    throw new Error('Supabase client not available');
}

/**
 * Main migration class for restaurant data
 */
class RestaurantMigration {
    constructor() {
        this.supabase = null;
        this.restaurants = [];
        this.menuItems = [];
        this.totalRestaurants = 0;
        this.processedRestaurants = 0;
    }
    
    /**
     * Initialize the migration process
     */
    async init() {
        try {
            this.supabase = await loadSupabase();
            console.log('✅ Supabase initialized for migration');
            
            await this.loadRestaurantsList();
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize migration:', error);
            return false;
        }
    }
    
    /**
     * Load the list of restaurant JSON files
     */
    async loadRestaurantsList() {
        try {
            const response = await fetch('/restaurants/');
            if (!response.ok) throw new Error('Failed to load restaurants directory');
            
            // This is a simplified approach. In a real-world scenario,
            // you'd need server-side code or a different approach to list files
            // We're assuming you have a list of restaurant files available
            
            // For demonstration, we'll manually fetch some known restaurant files
            const knownRestaurants = [
                'Pizza Hut.json',
                'KFC.json',
                'Yoka Sushi.json',
                'Shawarma Al Agha.json',
                'SaladBox.json',
                'Patron de la Mer.json',
                'L\'adresse.json',
                'Katsura.json',
                'Dar Chhiwate.json',
                'D-Delice Thai.json',
                'Café Lobo.json',
                'Brunch Terrasses.json',
                'Babakich.json',
                'oumnia sushi.json',
                'Oliveri.json',
                'Kech Burger.json',
                'Donuts Factory.json'
            ];
            
            this.restaurants = knownRestaurants;
            this.totalRestaurants = knownRestaurants.length;
            console.log(`📋 Found ${this.totalRestaurants} restaurants to migrate`);
            
            return this.restaurants;
        } catch (error) {
            console.error('❌ Failed to load restaurants list:', error);
            return [];
        }
    }
    
    /**
     * Process restaurant data migration
     */
    async migrateRestaurants() {
        const results = {
            success: 0,
            failed: 0,
            restaurants: []
        };
        
        for (const restaurantFile of this.restaurants) {
            try {
                console.log(`🔄 Processing ${restaurantFile}...`);
                
                // Load restaurant data
                const restaurantData = await this.loadRestaurantData(restaurantFile);
                if (!restaurantData) {
                    results.failed++;
                    continue;
                }
                
                // Insert restaurant into Supabase
                const restaurant = await this.insertRestaurant(restaurantData);
                if (!restaurant) {
                    results.failed++;
                    continue;
                }
                
                // Load and insert menu data
                const menuSuccess = await this.migrateRestaurantMenu(restaurant.id, restaurantData.menu_file);
                
                results.restaurants.push({
                    name: restaurantData.name,
                    id: restaurant.id,
                    menuSuccess
                });
                
                results.success++;
                this.processedRestaurants++;
                console.log(`✅ Migrated ${restaurantData.name} (${this.processedRestaurants}/${this.totalRestaurants})`);
            } catch (error) {
                console.error(`❌ Failed to migrate ${restaurantFile}:`, error);
                results.failed++;
                this.processedRestaurants++;
            }
        }
        
        console.log(`🏁 Migration complete: ${results.success} successful, ${results.failed} failed`);
        return results;
    }
    
    /**
     * Load restaurant JSON data
     */
    async loadRestaurantData(filename) {
        try {
            const response = await fetch(`/restaurants/${filename}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`❌ Failed to load restaurant data for ${filename}:`, error);
            return null;
        }
    }
    
    /**
     * Insert restaurant data into Supabase
     */
    async insertRestaurant(restaurantData) {
        try {
            // Check if restaurant already exists
            const { data: existingRestaurant } = await this.supabase
                .from('restaurants')
                .select('id, name')
                .eq('name', restaurantData.name)
                .maybeSingle();
            
            if (existingRestaurant) {
                console.log(`ℹ️ Restaurant ${restaurantData.name} already exists, skipping insert`);
                return existingRestaurant;
            }
            
            // Prepare restaurant data for insert
            const restaurant = {
                slug: restaurantData.id,
                name: restaurantData.name,
                image_url: restaurantData.image,
                cuisine: restaurantData.cuisine,
                rating: restaurantData.rating,
                reviews: restaurantData.reviews,
                delivery_time: restaurantData.deliveryTime,
                price: restaurantData.price,
                badge: restaurantData.badge,
                dietary: restaurantData.dietary || [],
                description: restaurantData.description
            };
            
            // Insert restaurant
            const { data, error } = await this.supabase
                .from('restaurants')
                .insert([restaurant])
                .select();
            
            if (error) throw error;
            
            console.log(`✅ Inserted restaurant: ${restaurantData.name}`);
            return data[0];
        } catch (error) {
            console.error(`❌ Failed to insert restaurant ${restaurantData.name}:`, error);
            return null;
        }
    }
    
    /**
     * Migrate menu data for a restaurant
     */
    async migrateRestaurantMenu(restaurantId, menuFile) {
        try {
            // Load menu data
            const menuData = await this.loadMenuData(menuFile);
            if (!menuData) return false;
            
            // Process each menu category
            for (const category of menuData.categories) {
                // Insert category
                const { data: categoryData, error: categoryError } = await this.supabase
                    .from('menu_categories')
                    .insert([{
                        restaurant_id: restaurantId,
                        name: category.name
                    }])
                    .select();
                
                if (categoryError) {
                    console.error(`❌ Failed to insert category ${category.name}:`, categoryError);
                    continue;
                }
                
                const categoryId = categoryData[0].id;
                
                // Insert menu items
                for (const item of category.items) {
                    const { error: itemError } = await this.supabase
                        .from('menu_items')
                        .insert([{
                            category_id: categoryId,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            currency: item.currency,
                            image_url: item.image_url
                        }]);
                    
                    if (itemError) {
                        console.error(`❌ Failed to insert menu item ${item.name}:`, itemError);
                    }
                }
                
                console.log(`✅ Inserted ${category.items.length} menu items for ${category.name}`);
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to migrate menu for restaurant ${restaurantId}:`, error);
            return false;
        }
    }
    
    /**
     * Load menu JSON data
     */
    async loadMenuData(filename) {
        try {
            const response = await fetch(`/menu/${filename}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`❌ Failed to load menu data for ${filename}:`, error);
            return null;
        }
    }
}

/**
 * Execute migration
 */
async function runMigration() {
    const migration = new RestaurantMigration();
    const initialized = await migration.init();
    
    if (initialized) {
        const results = await migration.migrateRestaurants();
        
        if (results.success > 0) {
            // Success notification
            const notification = document.createElement('div');
            notification.className = 'migration-notification success';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Successfully migrated ${results.success} restaurants to Supabase</span>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 10 seconds
            setTimeout(() => {
                notification.remove();
            }, 10000);
            
            // Close button
            notification.querySelector('.close-btn').addEventListener('click', () => {
                notification.remove();
            });
        }
        
        return results;
    }
    
    return { success: 0, failed: 0, message: 'Migration initialization failed' };
}

// Start migration when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add migration button to UI
    const addMigrationButton = () => {
        const button = document.createElement('button');
        button.className = 'migration-button';
        button.innerHTML = '<i class="fas fa-database"></i> Migrate Restaurant Data to Supabase';
        button.addEventListener('click', async () => {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Migration in progress...';
            
            try {
                await runMigration();
            } catch (error) {
                console.error('Migration failed:', error);
            } finally {
                button.innerHTML = '<i class="fas fa-check-circle"></i> Migration completed';
                setTimeout(() => {
                    button.remove();
                }, 5000);
            }
        });
        
        // Add button to page
        document.body.appendChild(button);
        
        // Add styles for the button
        const style = document.createElement('style');
        style.textContent = `
            .migration-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 20px;
                font-weight: 600;
                cursor: pointer;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }
            
            .migration-button:hover {
                background: var(--primary-dark);
                transform: translateY(-3px);
            }
            
            .migration-button:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .migration-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid #4CAF50;
                border-radius: 4px;
                padding: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
            }
            
            .migration-notification i {
                font-size: 20px;
                color: #4CAF50;
            }
            
            .migration-notification .close-btn {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: 10px;
                color: #999;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    };
    
    // Only show migration button on admin pages or in development environment
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isAdminPage = window.location.pathname.includes('admin') || window.location.search.includes('admin=true');
    
    if (isDevelopment || isAdminPage) {
        addMigrationButton();
    }
});

// Export for use in other scripts
window.RestaurantMigration = RestaurantMigration;
window.runMigration = runMigration; 