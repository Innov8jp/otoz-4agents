# ==============================================================================
# PRODUCTION SCRIPT (v6 - Sidebar and Filters Restored)
# ==============================================================================

import streamlit as st
import pandas as pd
import random
import os
import traceback
from datetime import datetime
from difflib import get_close_matches
import json
import re

# --- SECTION 1: CONSTANTS AND SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents.json' # Using the new, simpler intents file

# A subset of the PORTS_BY_COUNTRY for the restored sidebar
PORTS_BY_COUNTRY = {
    "Australia": ["Melbourne", "Sydney"], "Canada": ["Vancouver"], "Kenya": ["Mombasa"],
    "New Zealand": ["Auckland"], "Pakistan": ["Karachi"], "Tanzania": ["Dar es Salaam"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"], "United Kingdom": ["Southampton"],
}

# --- SECTION 2: CORE HELPER FUNCTIONS ---

@st.cache_data
def load_data(file_path):
    """A single function to load either CSV or JSON data files."""
    if not os.path.exists(file_path):
        st.error(f"Required data file not found: `{file_path}`")
        return None
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            if 'image_url' not in df.columns:
                df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
            if 'id' not in df.columns:
                df['id'] = [f"VID{i:04d}" for i, r in enumerate(df.itertuples())]
            return df
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading data from `{file_path}`: {e}")
        return None

def get_bot_response(user_input: str):
    """Generates an intelligent response by finding the best-matching intent."""
    # This function remains the same as our last working version
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data:
        return "Error: Could not load chatbot training data."
    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.5)
    response_text = "I'm sorry, I don't quite understand. A human agent will review your question."
    if matches:
        tag = pattern_to_tag[matches[0]]
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    if '{' in response_text:
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"
        response_text = response_text.format(
            total_price=f"¥{st.session_state.get('total_price', 0):,}",
            offer_amount=f"¥{offer_amount}"
        )
    return response_text

# --- SECTION 3: UI AND APPLICATION LOGIC ---

### FEATURE RESTORED: Sidebar functions ###
def user_info_form():
    with st.sidebar:
        st.header("Your Information")
        with st.form("customer_info_form"):
            name = st.text_input("Full Name", st.session_state.customer_info.get("name", ""))
            email = st.text_input("Email", st.session_state.customer_info.get("email", ""))
            phone = st.text_input("Phone Number", st.session_state.customer_info.get("phone", ""))
            countries = sorted(list(PORTS_BY_COUNTRY.keys()))
            selected_country = st.selectbox("Country", countries, index=
