# ==============================================================================
# FINAL, SELF-CONTAINED PRODUCTION SCRIPT
# All data is included internally to guarantee reliability.
# ==============================================================================

# --- SECTION 1: IMPORTS ---
import streamlit as st
import pandas as pd
import random
import os
import traceback
from datetime import datetime
from pandas.tseries.offsets import DateOffset
from difflib import get_close_matches
import json
import re
import altair as alt

# --- SECTION 2: INTERNAL DATABASE AND SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"

# --- Internal Inventory Data ---
# All vehicle data is now stored directly in the code.
INTERNAL_INVENTORY_DATA = [
    {'make': 'Toyota', 'model': 'Aqua', 'year': 2019, 'price': 950000, 'mileage': 55000, 'color': 'Pearl White', 'fuel': 'Hybrid', 'transmission': 'Automatic', 'grade': 4.5},
    {'make': 'Toyota', 'model': 'Vitz', 'year': 2018, 'price': 820000, 'mileage': 62000, 'color': 'Silver', 'fuel': 'Gasoline', 'transmission': 'Automatic', 'grade': 4.0},
    {'make': 'Toyota', 'model': 'Corolla', 'year': 2020, 'price': 1500000, 'mileage': 35000, 'color': 'Black', 'fuel': 'Hybrid', 'transmission': 'Automatic', 'grade': 5.0},
    {'make': 'Honda', 'model': 'Fit', 'year': 2019, 'price': 890000, 'mileage': 58000, 'color': 'Red', 'fuel': 'Hybrid', 'transmission': 'Automatic', 'grade': 4.0},
    {'make': 'Honda', 'model': 'Vezel', 'year': 2020, 'price': 1800000, 'mileage': 40000, 'color': 'Gray', 'fuel': 'Hybrid', 'transmission': 'Automatic', 'grade': 4.5},
    {'make': 'Nissan', 'model': 'Note', 'year': 2019, 'price': 780000, 'mileage': 65000, 'color': 'Silver', 'fuel': 'Hybrid', 'transmission': 'Automatic', 'grade': 4.0},
    {'make': 'Mazda', 'model': 'CX-5', 'year': 2020, 'price': 2300000, 'mileage': 38000, 'color': 'Maroon', 'fuel': 'Diesel', 'transmission': 'Automatic', 'grade': 4.5},
    {'make': 'BMW', 'model': '3 Series', 'year': 2019, 'price': 3500000, 'mileage': 40000, 'color': 'Blue', 'fuel': 'Gasoline', 'transmission': 'Automatic', 'grade': 4.5}
]

# --- Internal Chatbot Brain ---
# All intents are now stored directly in the code.
INTERNAL_INTENTS_DATA = {
    "intents": [
      { "tag": "greeting", "patterns": ["Hi", "Hello", "Hey"], "responses": ["Hello there! How can I help you today?", "Hi! What can I do for you?"]},
      { "tag": "goodbye", "patterns": ["Bye", "Goodbye", "See you"], "responses": ["Thanks for stopping by!", "See you soon!"]},
      { "tag": "get_price", "patterns": ["How much is it?", "What's the price?", "Tell me the cost"], "responses": ["The current price is {price}. Feel free to make an offer!"]},
      { "tag": "make_offer", "patterns": ["My offer is", "How about", "I can do"], "responses": ["Thank you for your offer of {offer_amount}. I am forwarding this to our sales team for review."]},
      { "tag": "ask_shipping", "patterns": ["Tell me about shipping", "How does delivery work?"], "responses": ["We handle all export procedures from Japan."]}
    ]
}

# --- SECTION 3: CORE HELPER FUNCTIONS ---

@st.cache_data
def load_inventory():
    """Loads inventory from the internal hardcoded list."""
    try:
        df = pd.DataFrame(INTERNAL_INVENTORY_DATA)
        df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
        df['id'] = [f"VID{i:04d}" for i, r in enumerate(df.itertuples())]
        return df
    except Exception as e:
        st.error(f"A fatal error occurred while preparing internal inventory data: {e}")
        return pd.DataFrame()

@st.cache_data
def load_intents():
    """Loads intents from the internal hardcoded dictionary."""
    return INTERNAL_INTENTS_DATA

def get_bot_response(user_input: str):
    """Generates an intelligent response from the internal intents data."""
    intents_data = load_intents()
    if not intents_data: return "Error: Could not load internal training data."

    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    tag = pattern_to_tag[matches[0]] if matches else None
    
    response_text = "I'm sorry, I don't quite understand. A human agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    
    if '{' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"
        response_text = response_text.format(
            price=f"¥{car_details.get('price', 0):,}",
            offer_amount=f"¥{offer_amount}"
        )
    return response_text

# --- SECTION 4: MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

    if "offer_placed" not in st.session_state: st.session_state.offer_placed = False
    if "chat_messages" not in st.session_state: st.session_state.chat_messages = []
    if "car_in_chat" not in st.session_state: st.session_state.car_in_chat = {}

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    
    inventory = load_inventory()
    if inventory.empty:
        st.error("Critical Error: Internal inventory data could not be loaded."); return

    # --- CHAT VIEW ---
    if st.session_state.offer_placed:
        car = st.session_state.car_in_chat
        st.subheader(f"Continuing your offer for: {car.get('year')} {car.get('make')} {car.get('model')}")
        st.image(car.get('image_url', ''), use_column_width=True)
        st.write(f"**Price:** ¥{car.get('price', 0):,}")
        st.markdown("---")
        
        for message in st.session_state.chat_messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])

        if prompt := st.chat_input("Ask your question..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"): st.write(prompt)
            
            response = get_bot_response(prompt)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})
            with st.chat_message("assistant"): st.write(response)
    
    # --- BROWSER VIEW ---
    else:
        st.subheader("Our Current Inventory")
        st.dataframe(inventory, use_container_width=True, hide_index=True)
        
        car_list = [f"{idx}: {row['year']} {row['make']} {row['model']} (¥{row['price']:,})" for idx, row in inventory.iterrows()]
        selected_car_str = st.selectbox("Select a vehicle from the list above to make an offer:", car_list, index=None, placeholder="Choose a car...")

        if selected_car_str:
            selected_idx = int(selected_car_str.split(':')[0])
            selected_car = inventory.iloc[selected_idx].to_dict()
            
            if st.button(f"❤️ Place Offer on {selected_car['make']} {selected_car['model']}"):
                st.session_state.offer_placed = True
                st.session_state.car_in_chat = selected_car
                st.session_state.chat_messages = [
                    {"role": "assistant", "content": f"Hello! I can help you finalize your offer on the {selected_car['year']} {selected_car['make']} {selected_car['model']}. What would you like to know?"}
                ]
                st.rerun()

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred.")
        st.code(traceback.format_exc())
