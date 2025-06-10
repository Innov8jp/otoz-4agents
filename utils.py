# utils.py

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime, timedelta
from config import *
import json
import re
from difflib import get_close_matches

ENABLE_PDF_INVOICING = False

# This helper class remains the same.
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
        st.error(f"Training file not found: {file_path}. Please make sure it's uploaded.")
        return None
    except json.JSONDecodeError:
        st.error(f"Error decoding JSON from {file_path}. Please check syntax.")
        return None

@st.cache_data
def load_inventory():
    """Loads inventory from the CSV file."""
    try:
        df = pd.read_csv(INVENTORY_FILE_PATH)
        df.reset_index(drop=True, inplace=True)
        if 'image_url' not in df.columns:
            df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
        if 'id' not in df.columns:
            df['id'] = [f"VID{i:04d}" for i in df.index]
        return df
    except FileNotFoundError:
        st.error(f"FATAL: `inventory.csv` not found. Please upload it to your repository.")
        return pd.DataFrame()

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

### UPGRADED: The new chatbot brain, now an "Action Engine" ###
def get_bot_response(user_input: str):
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Could not load training data."

    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.5)
    
    tag = pattern_to_tag[matches[0]] if matches else None

    # --- ACTION ENGINE: Perform actions based on intent tag ---
    if tag == "reservation":
        st.session_state.reservation_time = datetime.now() + timedelta(hours=24)
    elif tag == "chat_with_agent":
        st.session_state.human_requested = True
    elif tag == "make_offer":
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        if offer_match:
            offer_amount_str = offer_match.group(1).replace(",", "")
            st.session_state.last_offer = int(float(offer_amount_str))
    elif tag == "confirm_invoice":
        st.session_state.generate_invoice_request = True
    
    # --- RESPONSE GENERATION ---
    response_text = "I'm sorry, I'm not sure how to answer that. A human sales agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses'])
                break
    
    # --- DYNAMIC PLACEHOLDER REPLACEMENT ---
    if '{' in response_text and '}' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        
        format_map = {
            "price": f"¥{int(car_details.get('price', 0)):,}",
            "total_price": f"¥{int(price_breakdown['total_price']):,}",
            "shipping_option": st.session_state.get('shipping_option', 'FOB'),
            "offer_amount": f"¥{st.session_state.get('last_offer', 0):,}",
        }
        response_text = response_text.format_map(default_map(format_map))
        
    return response_text

class default_map(dict):
    def __missing__(self, key):
        return f'{{{key}}}'
