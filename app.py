# app.py
# This is your main application file. It builds the UI and calls functions from utils.py

import streamlit as st
import traceback
import pandas as pd
from config import *
from utils import *

# --- UI FUNCTIONS ---
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
            make_index = make_list.index(st.session_state.active_filters.get("make", "All"))
            selected_make = st.selectbox("Make", make_list, index=make_index)
            model_list = ["All"]
            if selected_make != "All": model_list += sorted(inventory[inventory['make'] == selected_make]['model'].unique())
            model_index = model_list.index(st.session_state.active_filters.get("model", "All")) if st.session_state.active_filters.get("model", "All") in model_list else 0
            selected_model = st.selectbox("Model", model_list, index=model_index)
            year_min_val, year_max_val = int(inventory['year'].min()), int(inventory['year'].max())
            year_range = st.session_state.active_filters.get("year_range", (year_min_val, year_max_val))
            selected_years = st.slider("Year", year_min_val, year_max_val, value=year_range)
            if st.form_submit_button("Show Results"):
                st.session_state.active_filters = {"make": selected_make, "model": selected_model, "year_range": selected_years, "year_min": selected_years[0], "year_max": selected_years[1]}
                st.session_state.current_car_index = 0; st.rerun()

def filter_inventory(inventory, filters):
    if not filters: return inventory
    filtered_df = inventory.copy()
    if filters.get('make') and filters['make'] != "All":
        filtered_df = filtered_df[filtered_df['make'] == filters['make']]
        if filters.get('model') and filters['model'] != "All":
            filtered_df = filtered_df[filtered_df['model'] == filters['model']]
    if filters.get('year_min'):
        filtered_df = filtered_df[ (filtered_df['year'] >= filters['year_min']) & (filtered_df['year'] <= filters['year_max']) ]
    return filtered_df

def display_car_card(car):
    st.subheader(f"{car.get('year')} {car.get('make')} {car.get('model')}")
    st.image(car['image_url'], use_column_width=True)
    st.write(f"**Price:** ¥{car.get('price', 0):,}")
    st.write(f"**Mileage:** {car.get('mileage', 0):,} km")

# --- MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide", initial_sidebar_state="expanded")
    state_keys = {'current_car_index': 0, 'customer_info': {}, 'active_filters': {}}
    for key, default_value in state_keys.items():
        if key not in st.session_state: st.session_state[key] = default_value

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    
    inventory = load_data(INVENTORY_FILE_PATH)
    if inventory is None or inventory.empty: st.stop()
    
    user_info_form()
    car_filters(inventory)
    
    st.markdown("---")
    if st.session_state.active_filters:
        st.info(f"**Active Filters:** {st.session_state.active_filters}")

    filtered_inventory = filter_inventory(inventory, st.session_state.active_filters)
    if filtered_inventory.empty:
        st.warning("No vehicles match your current filters."); st.stop()

    if st.session_state.current_car_index >= len(filtered_inventory): st.session_state.current_car_index = 0
    current_car = filtered_inventory.iloc[st.session_state.current_car_index].to_dict()
    
    st.markdown(f"#### Showing Vehicle {st.session_state.current_car_index + 1} of {len(filtered_inventory)}")
    display_car_card(current_car)

    # --- ACTION BUTTONS & CHAT ---
    col1, col2 = st.columns(2)
    with col1:
        if st.button("❌ Next Vehicle", use_container_width=True):
            st.session_state.current_car_index = (st.session_state.current_car_index + 1) % len(filtered_inventory)
            st.rerun()
    
    st.markdown("---")
    st.subheader("💬 Chat with Sparky")
    if prompt := st.chat_input("Ask me to find a car... (e.g., 'show me a Toyota from 2020')"):
        response = get_bot_response(prompt)
        st.toast(response, icon="🤖")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred."); st.code(traceback.format_exc())
