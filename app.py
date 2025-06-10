# ==============================================================================
# FINAL PRODUCTION SCRIPT (All-in-One, Lightweight Version)
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

# --- SECTION 1: ALL CONSTANTS AND SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'

# --- SECTION 2: ALL HELPER FUNCTIONS ---

@st.cache_data
def load_inventory():
    """Loads inventory directly from the CSV file. This is fast and memory-efficient."""
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

@st.cache_data
def load_intents(file_path: str):
    """Loads the intents from the specified JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        st.error(f"Training file not found: {file_path}. Please make sure it's uploaded.")
        return None

def get_bot_response(user_input: str):
    """Generates an intelligent response by finding the best-matching intent."""
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Could not load chatbot training data."

    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    response_text = "I'm sorry, I am still under development and my apologies for not being able to understand your query. A human agent will review your question."
    if matches:
        tag = pattern_to_tag[matches[0]]
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses'])
                break
    return response_text

# --- SECTION 3: UI AND MAIN APPLICATION LOGIC ---

def display_car(car_data):
    """Displays the details of a single car."""
    st.subheader(f"{car_data.get('year')} {car_data.get('make')} {car_data.get('model')}")
    
    col1, col2 = st.columns([1, 2])
    with col1:
        st.image(car_data.get('image_url', ''), use_column_width=True)
    with col2:
        st.write(f"**Price:** ¥{car_data.get('price', 0):,}")
        st.write(f"**Mileage:** {car_data.get('mileage', 0):,} km")
        st.write(f"**Color:** {car_data.get('color', 'N/A')}")
        st.write(f"**Transmission:** {car_data.get('transmission', 'N/A')}")
        st.write(f"**Grade:** {car_data.get('grade', 'N/A')}")

def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

    # --- Initialize Session State ---
    if "offer_placed" not in st.session_state:
        st.session_state.offer_placed = False
    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = []
    if "car_in_chat" not in st.session_state:
        st.session_state.car_in_chat = {}

    st.title(f"{PAGE_ICON} Sparky - AI Sales Assistant")

    inventory = load_inventory()
    if inventory.empty:
        st.error("Could not load inventory. Please check that `inventory.csv` is uploaded and correct.")
        return

    # --- CHAT VIEW ---
    if st.session_state.offer_placed:
        car_details = st.session_state.car_in_chat
        display_car(car_details)
        st.markdown("---")
        st.subheader("💬 Chat with our Sales Team")

        for message in st.session_state.chat_messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])

        if prompt := st.chat_input("Ask a question..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.write(prompt)

            response = get_bot_response(prompt)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})
            with st.chat_message("assistant"):
                st.write(response)

    # --- BROWSER VIEW ---
    else:
        st.subheader("Our Current Inventory")
        st.dataframe(inventory)

        selected_indices = st.multiselect("Select a vehicle from the list to make an offer:", inventory.index)
        
        if selected_indices:
            selected_car_index = selected_indices[0]
            selected_car = inventory.iloc[selected_car_index].to_dict()
            
            st.markdown("---")
            display_car(selected_car)
            
            if st.button("❤️ Place Offer on This Vehicle"):
                st.session_state.offer_placed = True
                st.session_state.car_in_chat = selected_car
                st.session_state.chat_messages = [
                    {"role": "assistant", "content": f"Hello! I'm Sparky. I can help you finalize your offer on the {selected_car['year']} {selected_car['make']} {selected_car['model']}. What would you like to know?"}
                ]
                st.rerun()

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred.")
        st.code(traceback.format_exc())
