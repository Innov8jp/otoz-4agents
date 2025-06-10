# ==============================================================================
# FINAL PRODUCTION SCRIPT (All-in-One Version)
# ==============================================================================

# --- SECTION 1: IMPORTS ---
import streamlit as st
import pandas as pd
import random
import os
import traceback
from datetime import datetime
from difflib import get_close_matches
import json
import re

# --- SECTION 2: GLOBAL CONSTANTS & SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents_extended_50.json'


# --- SECTION 3: CORE HELPER FUNCTIONS ---

@st.cache_data
def load_data(file_path):
    """A single, robust function to load either CSV or JSON data files."""
    if not os.path.exists(file_path):
        st.error(f"Required data file not found: `{file_path}`. Please upload it to your GitHub repository.")
        return None
    
    try:
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading data from `{file_path}`: {e}")
        return None

def get_bot_response(user_input: str):
    """Generates an intelligent response by finding the best-matching intent from the JSON data."""
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data:
        return "Error: Could not load chatbot training data. Please check the intents file."

    lowered_input = user_input.lower()
    
    # Create a mapping of all patterns to their intent tag for efficient lookup
    pattern_to_tag = {pattern.lower(): intent['tag'] 
                      for intent in intents_data['intents'] 
                      for pattern in intent['patterns']}
    
    all_patterns = list(pattern_to_tag.keys())
    
    # Find the best matching pattern from the user's input
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    response_text = "I'm sorry, I don't quite understand. A human sales agent will review your question."
    if matches:
        best_match_pattern = matches[0]
        tag = pattern_to_tag[best_match_pattern]
        
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses'])
                break

    # Fill in any dynamic placeholders like {price} in the response
    if '{' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        
        # Use a default dictionary to avoid errors if a key is missing
        format_map = {
            "price": f"¥{car_details.get('price', 0):,}",
            "total_price": f"¥{st.session_state.get('total_price', 0):,}",
            "year": car_details.get('year', ''),
            "make": car_details.get('make', ''),
            "model": car_details.get('model', ''),
        }
        response_text = response_text.format(**format_map)
        
    return response_text

# --- SECTION 4: UI AND MAIN APPLICATION LOGIC ---

def display_car_details(car_data):
    """A simple function to display the key details of a selected car."""
    st.subheader(f"{car_data.get('year')} {car_data.get('make')} {car_data.get('model')}")
    
    col1, col2 = st.columns([1, 2])
    with col1:
        # Use a placeholder if image_url is missing
        image_url = car_data.get('image_url', f"https://placehold.co/600x400/grey/white?text=No+Image")
        st.image(image_url, use_column_width=True)
    with col2:
        st.write(f"**Price:** ¥{car_data.get('price', 0):,}")
        st.write(f"**Mileage:** {car_data.get('mileage', 0):,} km")
        st.write(f"**Color:** {car_data.get('color', 'N/A')}")
        st.write(f"**Transmission:** {car_data.get('transmission', 'N/A')}")
        st.write(f"**Grade:** {car_data.get('grade', 'N/A')}")

def main():
    """Main function to run the Streamlit application."""
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")

    # --- Initialize Session State ---
    if "offer_placed" not in st.session_state:
        st.session_state.offer_placed = False
    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = []
    if "car_in_chat" not in st.session_state:
        st.session_state.car_in_chat = {}
    if "total_price" not in st.session_state:
        st.session_state.total_price = 0

    st.title(f"{PAGE_ICON} Sparky - AI Sales Assistant")

    inventory = load_data(INVENTORY_FILE_PATH)
    if inventory is None or inventory.empty:
        st.error("Could not load inventory. Please ensure `inventory.csv` is uploaded and correct.")
        return

    # --- CHAT VIEW ---
    if st.session_state.offer_placed:
        car_details = st.session_state.car_in_chat
        display_car_details(car_details)
        st.markdown("---")
        st.subheader("💬 Chat with our Sales Team")

        # Display chat history
        for message in st.session_state.chat_messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])

        # Handle new user input
        if prompt := st.chat_input("Ask your question or make an offer..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.write(prompt)
            
            # Get bot response and display it
            response = get_bot_response(prompt)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})
            with st.chat_message("assistant"):
                st.write(response)

    # --- BROWSER VIEW ---
    else:
        st.subheader("Our Current Inventory")
        # Use st.data_editor for a spreadsheet-like view
        st.data_editor(inventory, use_container_width=True, hide_index=True)
        
        # Create a user-friendly list for the selectbox
        car_list = [f"{idx}: {row['year']} {row['make']} {row['model']} (¥{row['price']:,})" for idx, row in inventory.iterrows()]
        selected_car_str = st.selectbox("Select a vehicle from the list above to make an offer:", car_list, index=None, placeholder="Choose a car...")

        if selected_car_str:
            # Extract the index from the selected string
            selected_idx = int(selected_car_str.split(':')[0])
            selected_car = inventory.iloc[selected_idx].to_dict()
            
            st.markdown("---")
            display_car_details(selected_car)
            
            if st.button(f"❤️ Place Offer on This Vehicle"):
                st.session_state.offer_placed = True
                st.session_state.car_in_chat = selected_car
                # Initialize total price for placeholder use in chat
                st.session_state.total_price = selected_car.get('price', 0)
                st.session_state.chat_messages = [
                    {"role": "assistant", "content": f"Hello! I'm Sparky. I can help you finalize your offer on the {selected_car['year']} {selected_car['make']} {selected_car['model']}. What would you like to know?"}
                ]
                st.rerun()

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred. The application has to stop.")
        st.code(traceback.format_exc())
