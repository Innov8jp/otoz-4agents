# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (v8 - Full Features)
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

# --- SECTION 2: GLOBAL CONSTANTS & SETTINGS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents_200.json'  # Using your specified intents file

# --- App Data ---
PORTS_BY_COUNTRY = {
    "Australia": ["Adelaide", "Brisbane", "Fremantle", "Melbourne", "Sydney"], "Canada": ["Halifax", "Vancouver"],
    "Chile": ["Iquique", "Valparaíso"], "Germany": ["Bremerhaven", "Hamburg"], "Ireland": ["Cork", "Dublin"],
    "Kenya": ["Mombasa"], "Malaysia": ["Port Klang"], "New Zealand": ["Auckland", "Lyttelton", "Napier", "Wellington"],
    "Pakistan": ["Karachi", "Port Qasim"], "Tanzania": ["Dar es Salaam"], "Thailand": ["Laem Chabang"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"], "United Kingdom": ["Bristol", "Liverpool", "Southampton", "Tilbury"],
    "United States": ["Baltimore", "Jacksonville", "Long Beach", "Newark", "Tacoma"], "Zambia": ["(Via Dar es Salaam, Tanzania)"]
}
CAR_MAKERS_AND_MODELS = {
    "Toyota": ["Aqua", "Vitz", "Passo", "Corolla", "Prius", "Harrier", "RAV4", "Land Cruiser", "HiAce"],
    "Honda": ["Fit", "Vezel", "CR-V", "Civic", "Accord", "N-BOX", "Freed"],
    "Nissan": ["Note", "Serena", "X-Trail", "Leaf", "Skyline", "March", "Juke"],
    "Mazda": ["Demio", "CX-5", "CX-8", "Mazda3", "Mazda6", "Roadster"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "A-Class"],
    "BMW": ["3 Series", "5 Series", "X1", "X3", "X5", "1 Series"]
}
DOMESTIC_TRANSPORT = 50_000
FREIGHT_COST = 150_000
INSURANCE_RATE = 0.025

# --- SECTION 3: CORE HELPER FUNCTIONS ---

class default_map(dict):
    """Helper class to safely format strings with placeholders."""
    def __missing__(self, key):
        return f'{{{key}}}'

@st.cache_data
def load_data(file_path):
    """A single, robust function to load either CSV or JSON data files."""
    if not os.path.exists(file_path):
        st.error(f"Required data file not found: `{file_path}`. Please ensure it is in your GitHub repository.")
        return None
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
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

@st.cache_data
def simulate_price_history(df: pd.DataFrame) -> pd.DataFrame:
    """Generates a simulated 6-month price history for cars in the DataFrame."""
    history = []
    today = pd.to_datetime(datetime.now())
    sample_df = df.head(50) 
    for _, car in sample_df.iterrows():
        base_price = car['price']
        for m in range(1, 7):
            date = today - DateOffset(months=m)
            price = base_price * (0.995 ** m) * (1 + random.uniform(-0.05, 0.05))
            history.append({"make": car['make'], "model": car['model'], "date": date, "avg_price": max(100000, int(price))})
    return pd.DataFrame(history)

def calculate_total_price(base_price, option):
    """Calculates total price with a full breakdown of components."""
    breakdown = {'base_price': base_price, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if option in ["FOB", "C&F", "CIF"]: breakdown['domestic_transport'] = DOMESTIC_TRANSPORT
    if option in ["C&F", "CIF"]: breakdown['freight_cost'] = FREIGHT_COST
    if option == "CIF":
        cost_and_freight = base_price + breakdown['freight_cost']
        breakdown['insurance'] = cost_and_freight * INSURANCE_RATE
    breakdown['total_price'] = sum(breakdown.values())
    return breakdown

def get_bot_response(user_input: str):
    """The main chatbot brain, powered by the intents JSON file."""
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data: return "Error: Could not load chatbot training data."

    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    
    tag = pattern_to_tag[matches[0]] if matches else None

    # --- Action Engine ---
    if tag == 'update_filter':
        active_filters = st.session_state.active_filters.copy()
        updated = False
        for make in CAR_MAKERS_AND_MODELS.keys():
            if make.lower() in lowered_input:
                active_filters['make'] = make
                updated = True
        year_match = re.search(r'\b(20\d{2})\b', user_input)
        if year_match:
            year = int(year_match.group(1))
            active_filters['year_min'] = year
            active_filters['year_max'] = year
            updated = True
        if updated:
            st.session_state.active_filters = active_filters
            st.session_state.current_car_index = 0
            st.rerun()

    # --- Response Generation ---
    response_text = "I'm sorry, I don't quite understand. A human sales agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    
    if '{' in response_text:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"
        format_map = default_map({
            "price": f"¥{car_details.get('price', 0):,}",
            "total_price": f"¥{int(price_breakdown['total_price']):,}",
            "offer_amount": offer_amount,
        })
        response_text = response_text.format_map(format_map)
        
    return response_text

# --- SECTION 4: UI FUNCTIONS ---
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
    if filters.get('make') and filters['make'] != "All":
        filtered_df = filtered_df[filtered_df['make'] == filters['make']]
    if filters.get('model') and filters['model'] != "All":
        filtered_df = filtered_df[filtered_df['model'] == filters['model']]
    if filters.get('year_min'):
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
    if df.empty: return
    filtered_data = df.query("make == @make and model == @model")
    if filtered_data.empty: return
    chart = alt.Chart(filtered_data).mark_line(point=True).encode(
        x=alt.X('date:T', title='Date'), y=alt.Y('avg_price:Q', title='Average Price (JPY)'),
        tooltip=['date:T', 'avg_price:Q']).properties(title=f"6-Month Price Trend for {make} {model}")
    st.altair_chart(chart, use_container_width=True)

def display_chat_interface():
    st.subheader("💬 Chat with our Sales Team")
    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]): st.write(msg["content"])
    if prompt := st.chat_input("Ask a question..."):
        st.session_state.chat_messages.append({"role": "user", "content": prompt})
        response = get_bot_response(prompt)
        st.session_state.chat_messages.append({"role": "assistant", "content": response})
        st.rerun()

# --- SECTION 5: MAIN APPLICATION ---
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
    
    st.markdown("---")
    
    if st.session_state.active_filters:
        st.info(f"**Active Filters:** {st.session_state.active_filters}")

    filtered_inventory = filter_inventory(inventory, st.session_state.active_filters)
    if filtered_inventory.empty:
        st.warning("No vehicles match your current filters."); st.stop()

    if st.session_state.current_car_index >= len(filtered_inventory): st.session_state.current_car_index = 0
    current_car = filtered_inventory.iloc[st.session_state.current_car_index].to_dict()
    
    if st.session_state.offer_placed:
        st.subheader(f"Continuing your offer for:")
        display_car_card(current_car, st.session_state.shipping_option)
        display_chat_interface()
    else:
        st.markdown(f"#### Showing Vehicle {st.session_state.current_car_index + 1} of {len(filtered_inventory)}")
        st.session_state.shipping_option = st.radio("Shipping Option", ["FOB", "C&F", "CIF"], index=["FOB", "C&F", "CIF"].index(st.session_state.shipping_option), horizontal=True)
        display_car_card(current_car, st.session_state.shipping_option)
        st.markdown("---"); st.markdown("#### Market Insights")
        display_market_data_chart(price_history, current_car['make'], current_car['model'])
        
        col1, col2, _ = st.columns([1.5, 1.5, 4])
        with col1:
            if st.button("❤️ Place Offer", use_container_width=True):
                if not all(st.session_state.customer_info.get(key) for key in ["name", "email", "phone"]):
                    st.error("Please complete 'Your Information' in the sidebar and click 'Save Details' first.")
                else:
                    st.session_state.offer_placed = True
                    st.session_state.car_in_chat = current_car
                    if not st.session_state.chat_messages:
                        st.session_state.chat_messages = [{"role": "assistant", "content": f"Hello {st.session_state.customer_info['name']}! I can help finalize your offer on the {current_car['year']} {current_car['make']} {current_car['model']}. What would you like to know?"}]
                    st.rerun()
        with col2:
            if st.button("❌ Next Vehicle", use_container_width=True):
                st.session_state.current_car_index = (st.session_state.current_car_index + 1) % len(filtered_inventory)
                st.rerun()

    # Always show a chat input at the bottom for conversational filtering
    if not st.session_state.offer_placed:
        st.markdown("---")
        if prompt := st.chat_input("Ask Sparky to find a car for you... (e.g., 'show me a Toyota from 2020')"):
            response = get_bot_response(prompt) # This triggers the filter action

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical error occurred.")
        st.code(traceback.format_exc())

# ==============================================================================
# END OF SCRIPT
# ==============================================================================
