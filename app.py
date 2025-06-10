# ==============================================================================
# FINAL PRODUCTION SCRIPT (Single-File Version)
# ==============================================================================

# --- SECTION 1: IMPORTS ---
import streamlit as st
import traceback
import re
import random
import pandas as pd
from datetime import datetime
import os
import logging
from difflib import get_close_matches
import json

# --- SECTION 2: GLOBAL CONSTANTS & CONFIGURATION ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    from fpdf import FPDF
    ENABLE_PDF_INVOICING = True
except ImportError:
    ENABLE_PDF_INVOICING = False
    logging.warning("fpdf2 module not found. PDF invoicing will be disabled.")

BOT_NAME = "Sparky"
PAGE_TITLE = f"{BOT_NAME} - AI Sales Assistant"
PAGE_ICON = "🚗"
SELLER_INFO = {
    "name": "Otoz.ai", "address": "1-chōme-9-1 Akasaka, Minato City, Tōkyō-to 107-0052, Japan",
    "phone": "+81-3-1234-5678", "email": "sales@otoz.ai"
}
LOGO_PATH = "otoz_logo.png"
INVENTORY_FILE_PATH = 'Inventory Agasta.csv'
MILEAGE_RANGE = (5_000, 150_000)
DOMESTIC_TRANSPORT = 50_000
FREIGHT_COST = 150_000
INSURANCE_RATE = 0.025

CAR_MAKERS_AND_MODELS = {
    "Toyota": ["Aqua", "Vitz", "Passo", "Corolla", "Prius", "Harrier", "RAV4", "Land Cruiser", "HiAce"],
    "Honda": ["Fit", "Vezel", "CR-V", "Civic", "Accord", "N-BOX", "Freed"],
    "Nissan": ["Note", "Serena", "X-Trail", "Leaf", "Skyline", "March", "Juke"],
    "Mazda": ["Demio", "CX-5", "CX-8", "Mazda3", "Mazda6", "Roadster"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "A-Class"],
    "BMW": ["3 Series", "5 Series", "X1", "X3", "X5", "1 Series"]
}
CAR_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Beige', 'Brown', 'Green', 'Pearl White', 'Dark Blue', 'Maroon']

# --- SECTION 3: CORE FUNCTIONS (from utils.py) ---

@st.cache_data
def load_intents(file_path: str):
    """Loads the intents from the specified JSON file."""
    try:
        # NOTE: In Streamlit sharing, files are at the root, so direct access is fine.
        # If running locally in a different structure, you might need a full path.
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        st.error(f"Training file not found: {file_path}. Please make sure it's uploaded to your repository.")
        return None
    except json.JSONDecodeError:
        st.error(f"Error decoding the JSON from {file_path}. Please check for syntax errors.")
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
            except Exception as e:
                logging.error(f"Could not read CSV file: {e}")

        if df is None:
            car_data = []
            current_year = datetime.now().year
            for make, models in CAR_MAKERS_AND_MODELS.items():
                for model in models:
                    for _ in range(random.randint(2, 3)):
                        year = random.randint(current_year - 8, current_year - 1)
                        price = int(3_000_000 * (0.85 ** (current_year - year)) * random.uniform(0.9, 1.1))
                        car_data.append({'make': make, 'model': model, 'year': year, 'price': max(300_000, price)})
            df = pd.DataFrame(car_data)
        
        defaults = {
            'mileage': lambda: random.randint(*MILEAGE_RANGE),
            'color': lambda: random.choice(CAR_COLORS),
        }
        for col, func in defaults.items():
            if col not in df.columns:
                df[col] = [func() for _ in range(len(df))]
        
        df.reset_index(drop=True, inplace=True)
        df['id'] = [f"VID{i:04d}" for i in df.index]
        df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
        return df
    except Exception as e:
        st.error(f"A fatal error occurred while loading inventory: {e}")
        return pd.DataFrame()

def get_bot_response(user_input: str):
    """Generates an intelligent response by finding the best-matching intent."""
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Training data `intents_extended_50.json` not found or invalid."

    lowered_input = user_input.lower()
    
    # Create a mapping of all patterns to their intent tag
    pattern_to_tag = {pattern.lower(): intent['tag'] 
                      for intent in intents_data['intents'] 
                      for pattern in intent['patterns']}
    
    all_patterns = list(pattern_to_tag.keys())
    
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    response_text = "I'm sorry, I'm not sure how to answer that. A human sales agent will review your question."
    if matches:
        best_match = matches[0]
        tag = pattern_to_tag[best_match]
        
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses'])
                break

    # Placeholder replacement
    if '{' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        response_text = response_text.format(
            price=f"¥{int(car_details.get('price', 0)):,}",
            total_price=f"¥{int(price_breakdown['total_price']):,}"
        )

    return response_text

def calculate_total_price(base_price, option):
    # This function remains the same
    breakdown = {'base_price': base_price, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if option in ["FOB", "C&F", "CIF"]: breakdown['domestic_transport'] = DOMESTIC_TRANSPORT
    if option in ["C&F", "CIF"]: breakdown['freight_cost'] = FREIGHT_COST
    if option == "CIF":
        cost_and_freight = base_price + breakdown['freight_cost']
        breakdown['insurance'] = cost_and_freight * INSURANCE_RATE
    breakdown['total_price'] = sum(breakdown.values())
    return breakdown


# --- SECTION 4: UI FUNCTIONS ---
def display_car_card(car, shipping_option):
    # This function remains the same
    price_breakdown = calculate_total_price(car['price'], shipping_option)
    with st.container(border=True):
        col1, col2 = st.columns([1, 2])
        with col1: st.image(car['image_url'], use_column_width=True)
        with col2:
            st.subheader(f"{car.get('year')} {car.get('make')} {car.get('model')}")
            st.write(f"**ID:** {car.get('id')} | **Mileage:** {car.get('mileage', 0):,} km")
            st.write(f"**Color:** {car.get('color')}")
            st.write(f"**Base Price (Vehicle Only):** ¥{car.get('price', 0):,}")
            st.success(f"**Total Price ({shipping_option}): ¥{int(price_breakdown['total_price']):,}**")

# --- SECTION 5: MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

    # Initialize session state
    if 'current_car_index' not in st.session_state: st.session_state.current_car_index = 0
    if 'offer_placed' not in st.session_state: st.session_state.offer_placed = False
    if 'chat_messages' not in st.session_state: st.session_state.chat_messages = []
    if 'car_in_chat' not in st.session_state: st.session_state.car_in_chat = {}

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    
    inventory = load_inventory()
    if inventory.empty:
        st.error("Critical Error: Inventory could not be loaded."); return

    if st.session_state.offer_placed:
        st.markdown(f"### Continuing your offer for:")
        display_car_card(pd.Series(st.session_state.car_in_chat), st.session_state.get('shipping_option', 'FOB'))
        
        st.subheader("💬 Chat with our Sales Team")
        for msg in st.session_state.chat_messages:
            st.chat_message(msg["role"]).write(msg["content"])
        
        if prompt := st.chat_input("Ask a question..."):
            st.chat_message("user").write(prompt)
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            
            response = get_bot_response(prompt)
            st.chat_message("assistant").write(response)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})

    else:
        current_car = inventory.iloc[st.session_state.current_car_index]
        display_car_card(current_car, "FOB")
        
        if st.button("❤️ Place Offer", use_container_width=True):
            st.session_state.offer_placed = True
            st.session_state.car_in_chat = current_car.to_dict()
            st.session_state.chat_messages = [{"role": "assistant", "content": f"Hello! I'm Sparky. I can help you finalize your offer on the {current_car['year']} {current_car['make']} {current_car['model']}. What would you like to know?"}]
            st.rerun()
            
        if st.button("❌ Next Vehicle", use_container_width=True):
            st.session_state.current_car_index = (st.session_state.current_car_index + 1) % len(inventory)
            st.rerun()

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred.")
        st.code(traceback.format_exc())
