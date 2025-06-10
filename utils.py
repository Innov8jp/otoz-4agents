# utils.py (Version with PDF generation temporarily removed)

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime
from config import * # Import all constants from our new config file

# --- NOTE: All PDF-related code has been removed from this file ---

# --- DATA LOADING ---
@st.cache_data
def load_inventory():
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

# --- HELPER FUNCTIONS ---
def calculate_total_price(base_price, option):
    breakdown = {'base_price': base_price, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if option in ["FOB", "C&F", "CIF"]: breakdown['domestic_transport'] = DOMESTIC_TRANSPORT
    if option in ["C&F", "CIF"]: breakdown['freight_cost'] = FREIGHT_COST
    if option == "CIF":
        cost_and_freight = base_price + breakdown['freight_cost']
        breakdown['insurance'] = cost_and_freight * INSURANCE_RATE
    breakdown['total_price'] = sum(breakdown.values())
    return breakdown

def get_bot_response(user_input: str):
    lowered_input = user_input.lower()
    # NOTE: "invoice" keyword logic is simplified as we cannot generate one right now.
    if any(keyword in lowered_input for keyword in ["another car", "start over", "change car", "go back"]):
        st.session_state.offer_placed = False
        st.session_state.chat_messages = []; st.session_state.car_in_chat = {}
        st.rerun()
    if "invoice" in lowered_input:
        return "Our sales team will prepare and email you the proforma invoice shortly. Can I help with anything else?"
    if any(keyword in lowered_input for keyword in ["payment", "pay", "bank"]):
        return "We accept wire transfers to our corporate bank account in Tokyo. The full details will be on the proforma invoice."
    if any(keyword in lowered_input for keyword in ["price", "discount", "negotiate", "offer"]):
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option'))
        total_price = f"{int(price_breakdown['total_price']):,}"
        return f"The current total price is ¥{total_price} {st.session_state.get('shipping_option')}. Our prices are competitive, but feel free to state your best offer for our sales team to review."
    return "That's a great question. I am forwarding it to a human sales representative who will get back to you shortly, either here in the chat or via email."
