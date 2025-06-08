// Supabase configuration
const SUPABASE_CONFIG = {
    url: 'https://tqghrundisdrrokciulb.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZ2hydW5kaXNkcnJva2NpdWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDk2OTMsImV4cCI6MjA2MzQ4NTY5M30.FrqgrPdko7ks37Q6fv0JBARitiOtKqxYc80pkiKz90g'
};

// Initialize Supabase client
window.initSupabase = (function() {
    // Create a wrapper around all Supabase operations
    window.SupabaseWrapper = {
        client: null,
        initialized: false,
        
        // Initialize the client
        init: function() {
            if (this.initialized) return Promise.resolve();
            
            return new Promise((resolve, reject) => {
                const checkForSupabase = () => {
                    // Look for Supabase client from the CDN
                    if (window.supabase) {
                        try {
                            this.client = window.supabase.createClient(
                                SUPABASE_CONFIG.url, 
                                SUPABASE_CONFIG.key
                            );
                            this.initialized = true;
                            console.log('✅ Supabase initialized successfully');
                            resolve();
                        } catch (err) {
                            console.error('❌ Failed to initialize Supabase:', err);
                            reject(err);
                        }
                    } else {
                        console.warn('⏳ Waiting for Supabase to load...');
                        setTimeout(checkForSupabase, 500);
                    }
                };
                
                checkForSupabase();
            });
        },
        
        // Test the connection
        testConnection: async function() {
            await this.init();
            try {
                const { data, error } = await this.client
                    .from('orders')
                    .select('count');
                    
                if (error) throw error;
                return { success: true, data };
            } catch (err) {
                console.error('❌ Connection test failed:', err);
                return { success: false, error: err };
            }
        },
        
        // Orders API
        orders: {
            // Create a new order
            create: async function(orderData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('orders')
                        .insert([orderData])
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error('❌ Failed to create order:', err);
                    return { success: false, error: err };
                }
            },
            
            // Get an order by ID
            getById: async function(orderId) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('orders')
                        .select('*')
                        .eq('orderId', orderId)
                        .single();
                        
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get order ${orderId}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Get all orders
            getAll: async function() {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('orders')
                        .select('*')
                        .order('created_at', { ascending: false });
                        
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error('❌ Failed to get orders:', err);
                    return { success: false, error: err };
                }
            },
            
            // Update order status
            updateStatus: async function(orderId, status) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('orders')
                        .update({ status })
                        .eq('orderId', orderId)
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error(`❌ Failed to update order ${orderId}:`, err);
                    return { success: false, error: err };
                }
            }
        },
        
        // Grocery Orders API
        groceryOrders: {
            // Create a new grocery order
            create: async function(orderData) {
                await SupabaseWrapper.init();
                // Map grocery-specific fields to the grocery_orders table structure
                const groceryOrderPayload = {
                    order_id: orderData.orderId,
                    customer_details: JSON.parse(orderData.customer), // Assuming customer is a JSON string
                    grocery_list: orderData.notes, // groceries.html stores the list in 'notes'
                    order_date: orderData.orderDate,
                    status: orderData.status
                };
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('grocery_orders')
                        .insert([groceryOrderPayload])
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error('❌ Failed to create grocery order:', err);
                    return { success: false, error: err };
                }
            },
            
            // Get a grocery order by ID
            getById: async function(orderId) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('grocery_orders')
                        .select('*')
                        .eq('order_id', orderId) // Query by the custom order_id field
                        .single();
                        
                    if (error) throw error;
                    // Adapt the fetched data to the structure confirmation.html expects if needed
                    // For now, returning the raw data.
                    // Consider mapping customer_details back to a string if confirmation.html expects that.
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get grocery order ${orderId}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Get all grocery orders
            getAll: async function() {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('grocery_orders')
                        .select('*');
                        
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error('❌ Failed to get grocery orders:', err);
                    return { success: false, error: err };
                }
            },

            // Update grocery order status
            updateStatus: async function(orderId, status) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('grocery_orders')
                        .update({ status })
                        .eq('order_id', orderId)
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error(`❌ Failed to update grocery order ${orderId}:`, err);
                    return { success: false, error: err };
                }
            }
        },
        
        // Restaurants API
        restaurants: {
            // Get all restaurants
            getAll: async function() {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .select('*')
                        .order('display_order', { ascending: true })
                        .order('name', { ascending: true });
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error('❌ Failed to get restaurants:', err);
                    return { success: false, error: err };
                }
            },
            
            // Get restaurant by name
            getByName: async function(name) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .select('*')
                        .eq('name', name)
                        .single();
                    
                    if (error) {
                        // If not found, try fallback to JSON
                        console.warn(`⚠️ Restaurant ${name} not found in database, trying fallback`);
                        return await restaurantService.getRestaurantByNameFallback(name);
                    }
                    
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get restaurant ${name}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Get restaurant by slug
            getBySlug: async function(slug) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .select('*')
                        .eq('slug', slug)
                        .single();
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get restaurant by slug ${slug}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Get restaurant by ID (New Function)
            getById: async function(id) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .select('*')
                        .eq('id', id)
                        .single();
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get restaurant by ID ${id}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Search restaurants
            search: async function(query) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .select('*')
                        .or(`name.ilike.%${query}%,cuisine.ilike.%${query}%,description.ilike.%${query}%`)
                        .order('rating', { ascending: false });
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to search restaurants for ${query}:`, err);
                    return { success: false, error: err };
                }
            },

            // Create a new restaurant
            create: async function(restaurantData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .insert([restaurantData])
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error('❌ Failed to create restaurant:', err);
                    return { success: false, error: err };
                }
            },

            // Update an existing restaurant
            update: async function(id, restaurantData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .update(restaurantData)
                        .eq('id', id)
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error(`❌ Failed to update restaurant ${id}:`, err);
                    return { success: false, error: err };
                }
            },

            // Delete a restaurant
            delete: async function(id) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('restaurants')
                        .delete()
                        .eq('id', id);
                        
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to delete restaurant ${id}:`, err);
                    return { success: false, error: err };
                }
            }
        },
        
        // Menu API
        menu: {
            // Get menu categories for a restaurant
            getCategories: async function(restaurantId) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_categories')
                        .select('*')
                        .eq('restaurant_id', restaurantId)
                        .order('name');
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get menu categories for restaurant ${restaurantId}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Create a new menu category
            createCategory: async function(categoryData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_categories')
                        .insert([categoryData])
                        .select();
                    
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error('❌ Failed to create menu category:', err);
                    return { success: false, error: err };
                }
            },

            // Update an existing menu category
            updateCategory: async function(categoryId, categoryData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_categories')
                        .update(categoryData)
                        .eq('id', categoryId)
                        .select();
                    
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error(`❌ Failed to update menu category ${categoryId}:`, err);
                    return { success: false, error: err };
                }
            },

            // Delete a menu category
            deleteCategory: async function(categoryId) {
                await SupabaseWrapper.init();
                try {
                    // Note: You might want to handle related menu items (delete or disassociate)
                    const { error } = await SupabaseWrapper.client
                        .from('menu_categories')
                        .delete()
                        .eq('id', categoryId);
                        
                    if (error) throw error;
                    return { success: true };
                } catch (err) {
                    console.error(`❌ Failed to delete menu category ${categoryId}:`, err);
                    return { success: false, error: err };
                }
            },

            // Get menu items for a category
            getItemsByCategory: async function(categoryId) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_items')
                        .select('*')
                        .eq('category_id', categoryId);
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get menu items for category ${categoryId}:`, err);
                    return { success: false, error: err };
                }
            },
            
            // Get a single menu item by its ID (New Function)
            getItemById: async function(itemId) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_items')
                        .select('*')
                        .eq('id', itemId)
                        .single(); // Use single() if ID is unique and you expect one record
                    
                    if (error) throw error;
                    return { success: true, data };
                } catch (err) {
                    console.error(`❌ Failed to get menu item by ID ${itemId}:`, err);
                    return { success: false, error: err };
                }
            },

            // Create a new menu item
            createMenuItem: async function(itemData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_items')
                        .insert([itemData])
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error('❌ Failed to create menu item:', err);
                    return { success: false, error: err };
                }
            },

            // Update an existing menu item
            updateMenuItem: async function(itemId, itemData) {
                await SupabaseWrapper.init();
                try {
                    const { data, error } = await SupabaseWrapper.client
                        .from('menu_items')
                        .update(itemData)
                        .eq('id', itemId)
                        .select();
                        
                    if (error) throw error;
                    return { success: true, data: data[0] };
                } catch (err) {
                    console.error(`❌ Failed to update menu item ${itemId}:`, err);
                    return { success: false, error: err };
                }
            },

            // Delete a menu item
            deleteMenuItem: async function(itemId) {
                await SupabaseWrapper.init();
                try {
                    const { error } = await SupabaseWrapper.client
                        .from('menu_items')
                        .delete()
                        .eq('id', itemId);
                        
                    if (error) throw error;
                    return { success: true };
                } catch (err) {
                    console.error(`❌ Failed to delete menu item ${itemId}:`, err);
                    return { success: false, error: err };
                }
            },

            // Get entire menu structure for a restaurant
            getFullMenu: async function(restaurantId) {
                await SupabaseWrapper.init();
                try {
                    // First get all categories
                    const { data: categories, error: categoriesError } = await SupabaseWrapper.client
                        .from('menu_categories')
                        .select('*')
                        .eq('restaurant_id', restaurantId)
                        .order('name');
                    
                    if (categoriesError) throw categoriesError;
                    
                    // If no categories, try to get data from JSON fallback
                    if (categories.length === 0) {
                        console.warn(`⚠️ No menu categories found for restaurant ${restaurantId} in database, trying fallback`);
                        return await restaurantService.getMenuFallback(restaurantId);
                    }
                    
                    // Then get all items for this restaurant's categories
                    const menuData = { restaurant_id: restaurantId, categories: [] };
                    
                    for (const category of categories) {
                        const { data: items, error: itemsError } = await SupabaseWrapper.client
                            .from('menu_items')
                            .select('*')
                            .eq('category_id', category.id);
                        
                        if (itemsError) throw itemsError;
                        
                        menuData.categories.push({
                            id: category.id,
                            name: category.name,
                            items: items
                        });
                    }
                    
                    return { success: true, data: menuData };
                } catch (err) {
                    console.error(`❌ Failed to get full menu for restaurant ${restaurantId}:`, err);
                    return { success: false, error: err };
                }
            }
        }
    };
    
    // Initialize Supabase when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        SupabaseWrapper.init().catch(err => {
            console.error('Initial Supabase initialization failed:', err);
        });
    });
    
    return SupabaseWrapper.init;
})();

// Backward compatibility for existing code
window.supabaseDB = {
    from: function(table) {
        if (!SupabaseWrapper.initialized) {
            console.warn('⚠️ Supabase not initialized yet. Operation might fail.');
            // Try to initialize
            SupabaseWrapper.init();
        }
        if (!SupabaseWrapper.client) return { 
            select: () => ({ error: 'Client not initialized' }) 
        };
        
        return SupabaseWrapper.client.from(table);
    }
};

// Restaurant functions - modified to use the new API but with fallbacks for compatibility
const restaurantService = {
    // Get all restaurants
    async getAllRestaurants() {
        try {
            // Try to get from Supabase first
            const { success, data } = await SupabaseWrapper.restaurants.getAll();
                
            if (success && data && data.length > 0) {
            return data;
            }
            
            return await this.getAllRestaurantsFallback();
        } catch (error) {
            console.error('Error getting restaurants:', error);
            return await this.getAllRestaurantsFallback();
        }
    },
    
    // Fallback to get restaurants from JSON files
    async getAllRestaurantsFallback() {
        try {
            // This would normally scan the restaurants directory
            // For now we'll return a simple array
            return fallbackToLocalStorage('all_restaurants', [
                { name: 'Pizza Hut', id: 'pizza-hut' },
                { name: 'KFC', id: 'kfc' }
            ]);
        } catch (error) {
            console.error('Error in restaurant fallback:', error);
            return [];
        }
    },
    
    // Get restaurant by name
    async getRestaurantByName(name) {
        try {
            // Try to get from Supabase first
            const { success, data } = await SupabaseWrapper.restaurants.getByName(name);
                
            if (success && data) {
            return data;
            }
            
            return await this.getRestaurantByNameFallback(name);
        } catch (error) {
            console.error('Error getting restaurant:', error);
            return await this.getRestaurantByNameFallback(name);
        }
    },
    
    // Fallback to get restaurant from JSON file
    async getRestaurantByNameFallback(name) {
        try {
            // Try to load from local JSON file
            const response = await fetch(`/restaurants/${name}.json`);
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            }
            return { success: false, error: 'Restaurant not found' };
        } catch (error) {
            console.error(`Error in restaurant fallback for ${name}:`, error);
            return { success: false, error };
        }
    },
    
    // Get menu for a restaurant
    async getMenu(restaurantId, restaurantName) {
        try {
            // Try to get from Supabase first
            const { success, data } = await SupabaseWrapper.menu.getFullMenu(restaurantId);
            
            if (success && data && data.categories && data.categories.length > 0) {
                return data;
            }
            
            return await this.getMenuFallback(restaurantId, restaurantName);
        } catch (error) {
            console.error(`Error getting menu for ${restaurantName}:`, error);
            return await this.getMenuFallback(restaurantId, restaurantName);
        }
    },
    
    // Fallback to get menu from JSON file
    async getMenuFallback(restaurantId, restaurantName) {
        try {
            // First get the restaurant to find the menu file
            let menuFile;
            
            if (restaurantName) {
                try {
                    const response = await fetch(`/restaurants/${restaurantName}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        menuFile = data.menu_file;
                    }
                } catch (e) {
                    console.warn(`Could not load restaurant data for ${restaurantName}`);
                }
            }
            
            // If we couldn't get the menu file name, try a default pattern
            if (!menuFile) {
                menuFile = `${restaurantName}_menu.json`;
            }
            
            // Try to load menu from local JSON file
            const response = await fetch(`/menu/${menuFile}`);
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            }
            return { success: false, error: 'Menu not found' };
        } catch (error) {
            console.error(`Error in menu fallback for ${restaurantName}:`, error);
            return { success: false, error };
        }
    }
};

// Fallback to localStorage if Supabase fails
function fallbackToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    return data;
}

function getFromLocalStorageFallback(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
} 