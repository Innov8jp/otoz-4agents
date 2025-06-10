# utils.py

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime
from config import *
import json
import re
from difflib import get_close_matches

# NOTE: PDF Generation is disabled.
ENABLE_PDF_INVOICING = False

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
        st.error(f"Error decoding the JSON from {file_path}. Please check its syntax.")
        return None

@st.cache_data
def load_inventory():
    """Loads inventory directly from the CSV file."""
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
    except Exception as e:
        st.error(f"A fatal error occurred while loading inventory: {e}")
        return pd.DataFrame()

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
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Could not load training data `intents_extended_50.json`."

    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    response_text = "I'm sorry, I'm not sure how to answer that. A human sales agent will review your question."
    if matches:
        tag = pattern_to_tag[matches[0]]
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    
    if '{' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        response_text = response_text.format(
            total_price=f"¥{int(price_breakdown['total_price']):,}",
        )
    return response_text
