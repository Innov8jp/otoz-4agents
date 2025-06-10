# utils.py (Corrected and Complete Version)

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime
from config import * # Import all constants from our new config file
import json # For reading the intents file
import re # For finding numbers in user input
from difflib import get_close_matches # For intelligent pattern matching

# NOTE: PDF Generation is disabled.
ENABLE_PDF_INVOICING = False

### NEW HELPER CLASS ###
# This small class is crucial for safely formatting the bot's responses.
# If a placeholder like {price} exists but we don't have a value for it,
# this prevents the app from crashing.
class default_map(dict):
    def __missing__(self, key):
        return f'{{{key}}}'

@st.cache_data
def load_intents(file_path: str):
    """Loads the intents from the specified JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        st.error(f"Training file not found: {file_path}. Please make sure it's uploaded to your repository.")
        return None
    except json.JSONDecodeError:
        st.error(f"Error decoding the JSON from {file_path}. Please check for syntax errors in the file.")
        return None

@st.cache_data
def load_inventory():
    """Loads inventory from CSV, or generates a sample DataFrame."""
    try:
        df = None
        if os.path.exists(INVENTORY_FILE_PATH):
            try:
                df_from_file = pd.read_csv(INVENTORY_FILE_PATH)
                if not df_from_file.empty:
                    required_columns = ['make', 'model', 'year', 'price']
                    if all(col in df_from_file.columns for col in required_columns):
                        df = df_from_file
                    else: logging.warning("CSV is missing required columns. Generating sample data.")
                else: logging.warning("Inventory CSV file is empty. Generating sample data.")
            except Exception as read_error:
                logging.error(f"Could not read CSV file: {read_error}. Generating sample data.")
        if df is None:
            car_data = []
            current_year = datetime.now().year
            for make, models in CAR_MAKERS_AND_MODELS.items():
                for model in models:
                    for _ in range(random.randint(2, 3)):
                        year = random.randint(current_year - 8, current_year - 1)
                        base_price_factor = 3_000_000 if make in ["Mercedes-Benz", "BMW"] else 1_500_000
                        price = int(base_price_factor * (0.85 ** (current_year - year)) * random.uniform(0.9, 1.1))
                        car_data.append({'make': make, 'model': model, 'year': year, 'price': max(300_000, price)})
            df = pd.DataFrame(car_data)
        defaults = {
            'mileage': lambda: random.randint(*MILEAGE_RANGE), 'location': lambda: random.choice(list(PORTS_BY_COUNTRY.keys())),
            'fuel': 'Gasoline', 'transmission': lambda: random.choice(["Automatic", "Manual"]),
            'color': lambda: random.choice(CAR_COLORS), 'grade': lambda: random.choice(["4.5", "4.0", "3.5", "R"])
        }
        for col, default in defaults.items():
            if col not in df.columns:
                df[col] = [default() if callable(default) else default for _ in range(len(df))]
        df.reset_index(drop=True, inplace=True)
        df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
        df['id'] = [f"VID{i:04d}" for i in df.index]
        return df
    except Exception as e:
        logging.error(f"FATAL: Error during inventory loading: {e}"); st.error(f"A fatal error occurred while preparing inventory data: {e}"); return pd.DataFrame()

def calculate_total_price(base_price, option):
    breakdown = {'base_price': base_price, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if option in ["FOB", "C&F", "CIF"]: breakdown['domestic_transport'] = DOMESTIC_TRANSPORT
    if option in ["C&F", "CIF"]: breakdown['freight_cost'] = FREIGHT_COST
    if option == "CIF":
        cost_and_freight = base_price + breakdown['freight_cost']
        breakdown['insurance'] = cost_and_freight * INSURANCE_RATE
    breakdown['total_price'] = sum(breakdown.values())
    return breakdown

### UPGRADED: The new chatbot brain, powered by your JSON file ###
def get_bot_response(user_input: str):
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Could not load training data. Please check the `intents_extended_50.json` file."

    # --- Step 1: Create a mapping of all patterns to their intent tag ---
    pattern_to_tag = {pattern.lower(): intent['tag'] 
                      for intent in intents_data['intents'] 
                      for pattern in intent['patterns']}
    
    all_patterns = list(pattern_to_tag.keys())
    
    # --- Step 2: Find the best matching pattern for the user's input ---
    matches = get_close_matches(user_input.lower(), all_patterns, n=1, cutoff=0.6)
    
    best_match_tag = None
    if matches:
        best_match_pattern = matches[0]
        best_match_tag = pattern_to_tag[best_match_pattern]
        
    # --- Step 3: Select a response based on the matched intent (tag) ---
    response_text = "I'm sorry, I'm not sure how to answer that. A human sales agent will review your question."
    if best_match_tag:
        for intent in intents_data['intents']:
            if intent['tag'] == best_match_tag:
                response_text = random.choice(intent['responses'])
                break
    
    # --- Step 4: Fill in any placeholders in the response ---
    if '{' in response_text and '}' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"

        format_map = {
            "price": f"¥{int(car_details.get('price', 0)):,}",
            "total_price": f"¥{int(price_breakdown['total_price']):,}",
            "shipping_option": st.session_state.get('shipping_option', 'FOB'),
            "offer_amount": offer_amount,
            "port": st.session_state.get('customer_info', {}).get('port_of_discharge', 'your selected port'),
            "country": st.session_state.get('customer_info', {}).get('country', 'your country')
        }
        response_text = response_text.format_map(default_map(format_map))
        
    return response_text
