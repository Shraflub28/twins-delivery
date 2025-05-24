#!/usr/bin/env python3
import os
import json
import csv
import re
import uuid
from datetime import datetime

"""
JSON to CSV Converter for Twins Delivery

This script converts the restaurant and menu JSON files into CSV format
for direct upload to Supabase. Each restaurant will have its own CSV file
containing both the restaurant information and its menu items.

Usage: python json_to_csv_converter.py
"""

class RestaurantCsvConverter:
    def __init__(self, restaurants_dir="restaurants", menu_dir="menu", output_dir="csv_exports"):
        self.restaurants_dir = restaurants_dir
        self.menu_dir = menu_dir
        self.output_dir = output_dir
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Ensure output directory exists
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # Create directory for individual restaurant CSVs
        self.restaurant_csv_dir = os.path.join(output_dir, "restaurants")
        if not os.path.exists(self.restaurant_csv_dir):
            os.makedirs(self.restaurant_csv_dir)
            
        # Create combined directory
        self.combined_csv_dir = os.path.join(output_dir, "combined")
        if not os.path.exists(self.combined_csv_dir):
            os.makedirs(self.combined_csv_dir)

    def get_restaurant_files(self):
        """Get a list of all restaurant JSON files"""
        restaurant_files = []
        for file in os.listdir(self.restaurants_dir):
            if file.endswith('.json'):
                restaurant_files.append(os.path.join(self.restaurants_dir, file))
        return restaurant_files

    def clean_filename(self, filename):
        """Clean a filename to be used as a restaurant ID"""
        # Remove file extension
        base_name = os.path.basename(filename)
        name_without_ext = os.path.splitext(base_name)[0]
        
        # Replace spaces and special chars with hyphens
        return re.sub(r'[^a-zA-Z0-9]', '-', name_without_ext).lower()

    def convert_restaurant_to_csv(self, restaurant_file):
        """Convert a restaurant JSON file to CSV format"""
        try:
            # Load restaurant data
            with open(restaurant_file, 'r', encoding='utf-8') as file:
                restaurant_data = json.load(file)
                
            restaurant_id = str(uuid.uuid4())
            restaurant_slug = restaurant_data.get('id') or self.clean_filename(restaurant_file)
            
            # Load menu data
            menu_file = restaurant_data.get('menu_file')
            menu_path = os.path.join(self.menu_dir, menu_file)
            
            menu_data = None
            if os.path.exists(menu_path):
                with open(menu_path, 'r', encoding='utf-8') as menu_file:
                    menu_data = json.load(menu_file)
            else:
                print(f"Warning: Menu file {menu_path} not found for {restaurant_data.get('name')}")
                
            # Create CSV file for this restaurant
            restaurant_name = restaurant_data.get('name')
            csv_filename = f"{self.clean_filename(restaurant_file)}.csv"
            csv_path = os.path.join(self.restaurant_csv_dir, csv_filename)
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                
                # Write header row with combined schema
                writer.writerow([
                    "record_type", "id", "slug", "name", "image_url", "cuisine", 
                    "rating", "reviews", "delivery_time", "price", "badge", "dietary", 
                    "description", "category_id", "category_name", "item_name", 
                    "item_description", "item_price", "item_currency", "item_image_url"
                ])
                
                # Write restaurant row
                badge_json = json.dumps(restaurant_data.get('badge', {}))
                dietary_json = json.dumps(restaurant_data.get('dietary', []))
                
                restaurant_row = [
                    "restaurant", restaurant_id, restaurant_slug, 
                    restaurant_data.get('name', ''), 
                    restaurant_data.get('image', ''),
                    restaurant_data.get('cuisine', ''), 
                    restaurant_data.get('rating', 0),
                    restaurant_data.get('reviews', 0), 
                    restaurant_data.get('deliveryTime', ''),
                    restaurant_data.get('price', ''), 
                    badge_json, dietary_json,
                    restaurant_data.get('description', ''),
                    "", "", "", "", "", "", ""  # Empty menu item fields
                ]
                writer.writerow(restaurant_row)
                
                # Write menu items if available
                if menu_data and 'categories' in menu_data:
                    for category in menu_data['categories']:
                        category_id = str(uuid.uuid4())
                        category_name = category.get('name', '')
                        
                        # Write category row (with empty restaurant fields)
                        category_row = [
                            "category", restaurant_id, "", "", "", "", "", "", "", "", "", "", "",
                            category_id, category_name,
                            "", "", "", "", ""  # Empty menu item fields
                        ]
                        writer.writerow(category_row)
                        
                        # Write items for this category
                        for item in category.get('items', []):
                            item_row = [
                                "item", "", "", "", "", "", "", "", "", "", "", "", "",
                                category_id, category_name,
                                item.get('name', ''), 
                                item.get('description', ''),
                                item.get('price', 0), 
                                item.get('currency', 'Dh'),
                                item.get('image_url', '')
                            ]
                            writer.writerow(item_row)
            
            print(f"Created CSV for {restaurant_name}: {csv_path}")
            return csv_path, restaurant_id, restaurant_data.get('name')
            
        except Exception as e:
            print(f"Error processing {restaurant_file}: {str(e)}")
            return None, None, None

    def create_combined_csv_files(self):
        """Create separate CSV files for Supabase tables"""
        restaurants_csv = os.path.join(self.combined_csv_dir, "restaurants.csv")
        categories_csv = os.path.join(self.combined_csv_dir, "menu_categories.csv")
        items_csv = os.path.join(self.combined_csv_dir, "menu_items.csv")
        
        restaurant_records = []
        category_records = []
        item_records = []
        
        # Read individual CSVs and sort records
        for csv_file in os.listdir(self.restaurant_csv_dir):
            csv_path = os.path.join(self.restaurant_csv_dir, csv_file)
            
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.reader(file)
                headers = next(reader)  # Skip header row
                
                # Keep track of the restaurant_id for this file
                current_restaurant_id = None
                
                for row in reader:
                    record_type = row[0]
                    
                    if record_type == "restaurant":
                        restaurant_records.append(row[1:13])  # Get restaurant fields
                        current_restaurant_id = row[1]  # Store restaurant ID
                    elif record_type == "category":
                        # Use the current restaurant ID instead of row[1] which was wrong
                        category_records.append([row[13], row[14], current_restaurant_id])  # category_id, name, restaurant_id
                    elif record_type == "item":
                        # Extract item fields but skip category_name (was at index 14)
                        item_record = [
                            str(uuid.uuid4()),  # Generate id for the item
                            row[13],            # category_id
                            row[15],            # name
                            row[16],            # description
                            row[17],            # price
                            row[18],            # currency
                            row[19]             # image_url
                        ]
                        item_records.append(item_record)
        
        # Write restaurants.csv
        with open(restaurants_csv, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([
                "id", "slug", "name", "image_url", "cuisine", "rating", "reviews",
                "delivery_time", "price", "badge", "dietary", "description"
            ])
            writer.writerows(restaurant_records)
        
        # Write categories.csv
        with open(categories_csv, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(["id", "name", "restaurant_id"])
            writer.writerows(category_records)
        
        # Write items.csv - updated to match Supabase schema exactly
        with open(items_csv, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([
                "id", "category_id", "name", "description",
                "price", "currency", "image_url"
            ])
            writer.writerows(item_records)
        
        print(f"Created combined CSV files in {self.combined_csv_dir}")

    def process_all_restaurants(self):
        """Process all restaurant files and create CSVs"""
        restaurant_files = self.get_restaurant_files()
        
        if not restaurant_files:
            print(f"No restaurant files found in {self.restaurants_dir}")
            return
        
        print(f"Found {len(restaurant_files)} restaurant files")
        
        for restaurant_file in restaurant_files:
            self.convert_restaurant_to_csv(restaurant_file)
        
        # Create combined CSVs for direct Supabase import
        self.create_combined_csv_files()
        
        print(f"\nCSV conversion completed. Files saved to {self.output_dir}")
        print(f"Individual restaurant CSVs: {self.restaurant_csv_dir}")
        print(f"Combined CSVs for Supabase: {self.combined_csv_dir}")


def main():
    # Get directories from command line arguments or use defaults
    import sys
    
    restaurants_dir = "restaurants"
    menu_dir = "menu"
    output_dir = "csv_exports"
    
    if len(sys.argv) > 1:
        restaurants_dir = sys.argv[1]
    if len(sys.argv) > 2:
        menu_dir = sys.argv[2]
    if len(sys.argv) > 3:
        output_dir = sys.argv[3]
    
    print("Twins Delivery - JSON to CSV Converter")
    print(f"Restaurants directory: {restaurants_dir}")
    print(f"Menu directory: {menu_dir}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    converter = RestaurantCsvConverter(
        restaurants_dir=restaurants_dir,
        menu_dir=menu_dir,
        output_dir=output_dir
    )
    
    converter.process_all_restaurants()


if __name__ == "__main__":
    main() 