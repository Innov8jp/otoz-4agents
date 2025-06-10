# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT
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
import altair as alt
from pandas.tseries.offsets import DateOffset

# --- SECTION 1: ALL CONSTANTS AND SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents.json'
PORTS_BY_COUNTRY = {
    "Australia": ["Melbourne", "Sydney"], "Canada": ["Vancouver"], "Kenya": ["Mombasa"],
    "New Zealand": ["Auckland"], "Pakistan": ["Karachi"], "Tanzania": ["Dar es Salaam"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"], "United Kingdom": ["Southampton"],
}
DOMESTIC_TRANSPORT = 50_000
FREIGHT_COST = 150_000
INSURANCE_RATE = 0.025

# --- SECTION 2: CORE HELPER FUNCTIONS ---

@st.cache_data
def load_data(file_path):
    """A single, robust function to load either CSV or JSON data files."""
    if not os.path.exists(file_path):
        st.error(f"Required data file not found: `{file_path}`. Please ensure it is in your GitHub repository.")
        return None
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            # Add required columns if they don't exist in the CSV
            if 'image_url' not in df.columns:
                df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
            if 'id' not in df.columns:
                df.reset_index(inplace=True)
                df['id'] = [f"VID{i:04d}" for i in df['index']]
            return df
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading data from `{file_path}`: {e}")
        return None

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
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"
        response_text = response_text.format(
            total_price=f"¥{int(price_breakdown['total_price']):,}",
            offer_amount=f"¥{offer_amount}"
        )
    return response_text

@st.cache_data
def simulate_price_history(df: pd.DataFrame) -> pd.DataFrame:
    history = []
    today = pd.to_datetime(datetime.now())
    for _, car in df.iterrows():
        base_price = car['price']
        for m in range(1, 7):
            date = today - DateOffset(months=m)
            price = base_price * (0.995 ** m) * (1 + random.uniform(-0.05, 0.05))
            history.append({"make": car['make'], "model": car['model'], "date": date, "avg_price": max(100000, int(price))})
    return pd.DataFrame(history)

# --- SECTION 3: UI FUNCTIONS ---

def user_info_form():
    with st.sidebar:
        st.header("Your Information")
        with st.form("customer_info_form"):
            name = st.text_input("Full Name", st.session_state.customer_info.get("name", ""))
            email = st.text_input("Email", st.session_state.customer_info.get("email", ""))
            phone = st.text_input("Phone Number", st.session_state.customer_info.get("phone", ""))
            countries = sorted(list(PORTS_BY_COUNTRY.keys()))
            selected_country = st.selectbox("Country", countries, index=None, placeholder="Select your country...")
            available_ports = PORTS_BY_COUNTRY.get(selected_country, [])
            selected_port = st.selectbox("Port of Discharge", available_ports, index=None, placeholder="Select a port...", disabled=not selected_country)
            if st.form_submit_button("Save Details"):
                st.session_state.customer_info = {"name": name, "email": email, "phone": phone, "country": selected_country, "port_of_discharge": selected_port}
                st.success("Your details have been saved!")

def car_filters(inventory):
    with st.sidebar:
        st.header("Vehicle Filters")
        if inventory.empty: st.warning("No inventory data found."); return
        with st.form("car_filters_form"):
            make_list = ["All"] + sorted(inventory['make'].unique())
            selected_make = st.selectbox("Make", make_list)
            model_list = ["All"]
            if selected_make != "All": model_list += sorted(inventory[inventory['make'] == selected_make]['model'].unique())
            selected_model = st.selectbox("Model", model_list)
            year_min, year_max = int(inventory['year'].min()), int(inventory['year'].max())
            selected_years = st.slider("Year", year_min, year_max, (year_min, year_max))
            if st.form_submit_button("Show Results"):
                st.session_state.active_filters = {"make": selected_make, "model": selected_model, "year_min": selected_years[0], "year_max": selected_years[1]}
                st.session_state.current_car_index = 0; st.rerun()

def filter_inventory(inventory, filters):
    if not filters: return inventory
    filtered_df = inventory.copy()
    if filters['make'] != "All":
        filtered_df = filtered_df[filtered_df['make'] == filters['make']]
        if filters.get('model') and filters['model'] != "All":
            filtered_df = filtered_df[filtered_df['model'] == filters['model']]
    filtered_df = filtered_df[ (filtered_df['year'] >= filters['year_min']) & (filtered_df['year'] <= filters['year_max']) ]
    return filtered_df

def display_car_card(car, shipping_option):
    price_breakdown = calculate_total_price(car['price'], shipping_option)
    with st.container(border=True):
        col1, col2 = st.columns([1, 2])
        with col1: st.image(car['image_url'], use_column_width=True)
        with col2:
            st.subheader(f"{car.get('year')} {car.get('make')} {car.get('model')}")
            st.write(f"**ID:** {car.get('id')} | **Mileage:** {car.get('mileage', 0):,} km")
            st.write(f"**Color:** {car.get('color')} | **Transmission:** {car.get('transmission')}")
            st.write(f"**Base Price (Vehicle Only):** ¥{car.get('price', 0):,}")
            st.success(f"**Total Price ({shipping_option}): ¥{int(price_breakdown['total_price']):,}**")
            with st.expander("Click to see full price breakdown"):
                st.markdown(f"**Base Vehicle Price:** `¥{price_breakdown['base_price']:,}`")
                if price_breakdown['domestic_transport'] > 0: st.markdown(f"**Domestic Transport:** `¥{price_breakdown['domestic_transport']:,}`")
                if price_breakdown['freight_cost'] > 0: st.markdown(f"**Ocean Freight:** `¥{price_breakdown['freight_cost']:,}`")
                if price_breakdown['insurance'] > 0: st.markdown(f"**Marine Insurance:** `¥{price_breakdown['insurance']:,.0f}`")
                st.divider(); st.markdown(f"### **Total:** `¥{price_breakdown['total_price']:,.0f}`")

def display_market_data_chart(df, make, model):
    filtered_data = df.query("make == @make and model == @model")
    if filtered_data.empty: return
    chart = alt.Chart(filtered_data).mark_line(point=True).encode(
        x=alt.X('date:T', title='Date'), y=alt.Y('avg_price:Q', title='Average Price (JPY)'),
        tooltip=['date:T', 'avg_price:Q']).properties(title=f"6-Month Price Trend for {make} {model}")
    st.altair_chart(chart, use_container_width=True)

# --- SECTION 4: MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide", initial_sidebar_state="expanded")

    state_keys = {'current_car_index': 0, 'customer_info': {}, 'active_filters': {}, 'offer_placed': False, 'chat_messages': [], 'car_in_chat': {}, 'shipping_option': 'FOB'}
    for key, default_value in state_keys.items():
        if key not in st.session_state: st.session_state[key] = default_value

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    
    inventory = load_data(INVENTORY_FILE_PATH)
    if inventory is None or inventory.empty: st.stop()
    
    price_history = simulate_price_history(inventory)
    
    user_info_form()
    car_filters(inventory)
    
    if st.session_state.offer_placed:
        st.subheader(f"Continuing your offer for:")
        display_car_card(pd.Series(st.session_state.car_in_chat), st.session_state.shipping_option)
        for msg in st.session_state.chat_messages:
            with st.chat_message(msg["role"]): st.write(msg["content"])
        if prompt := st.chat_input("Ask a question..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            response = get_bot_response(prompt)
            st.session_state.chat_messages.append({"role": "assistant", "content": response})
            st.rerun()
    else:
        filtered_inventory = filter_inventory(inventory, st.session_state.active_filters)
        if filtered_inventory.empty:
            st.warning("No vehicles match your current filters."); st.stop()

        if st.session_state.current_car_index >= len(filtered_inventory): st.session_state.current_car_index = 0
