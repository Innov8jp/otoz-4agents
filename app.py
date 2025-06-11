# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (All Features Restored + Invoice & UX Fixes)
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
INTENTS_FILE_PATH = 'intents.json'

PORTS_BY_COUNTRY = {
    "Australia": ["Melbourne", "Sydney"], "Canada": ["Vancouver"], "Kenya": ["Mombasa"],
    "New Zealand": ["Auckland"], "Pakistan": ["Karachi"], "Tanzania": ["Dar es Salaam"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"], "United Kingdom": ["Southampton"],
}
DOMESTIC_TRANSPORT = 50_000
FREIGHT_COST = 150_000
INSURANCE_RATE = 0.025

# --- SECTION 3: CORE HELPER FUNCTIONS ---
@st.cache_data
def load_data(file_path):
    """Load CSV or JSON data files."""
    if not os.path.exists(file_path):
        st.error(f"Data file not found: {file_path}")
        return None
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            if 'image_url' not in df:
                df['image_url'] = [f"https://placehold.co/600x400?text={r.make}+{r.model}" for r in df.itertuples()]
            if 'id' not in df:
                df.reset_index(inplace=True)
                df['id'] = [f"VID{i:04d}" for i in df['index']]
            return df
        if file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading {file_path}: {e}")
        return None

@st.cache_data
def simulate_price_history(df: pd.DataFrame) -> pd.DataFrame:
    """Simulate 6-month price history."""
    history = []
    today = pd.to_datetime(datetime.now())
    for _, car in df.head(50).iterrows():
        base = car['price']
        for m in range(1, 7):
            dt = today - DateOffset(months=m)
            price = base * (0.995**m) * (1 + random.uniform(-0.05, 0.05))
            history.append({'make': car['make'], 'model': car['model'], 'date': dt, 'avg_price': int(price)})
    return pd.DataFrame(history)


def calculate_total_price(base, option):
    """Calculate total price breakdown based on shipping option."""
    bd = {'base_price': base, 'domestic_transport':0, 'freight_cost':0, 'insurance':0}
    if option in ['FOB','C&F','CIF']: bd['domestic_transport']=DOMESTIC_TRANSPORT
    if option in ['C&F','CIF']: bd['freight_cost']=FREIGHT_COST
    if option=='CIF': bd['insurance']=(base+bd['freight_cost'])*INSURANCE_RATE
    bd['total_price']=sum(bd.values())
    return bd


def generate_invoice_html(customer, car, breakdown):
    """Generate a simple HTML invoice."""
    html = f"""
    <html><body>
      <h2>Invoice</h2>
      <p><strong>Date:</strong> {datetime.now().strftime('%Y-%m-%d')}</p>
      <p><strong>Customer:</strong> {customer['name']} ({customer['email']})</p>
      <table border='1' cellpadding='5'>
        <tr><th>Item</th><th>Amount (JPY)</th></tr>
        <tr><td>Vehicle {car['year']} {car['make']} {car['model']}</td><td>{breakdown['base_price']:,}</td></tr>
        {f"<tr><td>Domestic Transport</td><td>{breakdown['domestic_transport']:,}</td></tr>" if breakdown['domestic_transport'] else ''}
        {f"<tr><td>Freight Cost</td><td>{breakdown['freight_cost']:,}</td></tr>" if breakdown['freight_cost'] else ''}
        {f"<tr><td>Insurance</td><td>{int(breakdown['insurance']):,}</td></tr>" if breakdown['insurance'] else ''}
        <tr><td><strong>Total</strong></td><td><strong>{breakdown['total_price']:,}</strong></td></tr>
      </table>
    </body></html>
    """
    return html

# --- SECTION 4: CHATBOT & INVOICE LOGIC ---
def get_bot_response(user_input: str):
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data:
        return "Error: Could not load chatbot training data."
    lowered = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    matches = get_close_matches(lowered, list(pattern_to_tag), n=1, cutoff=0.5)
    response = "I'm sorry, I don't understand."
    if matches:
        tag = pattern_to_tag[matches[0]]
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response = random.choice(intent['responses'])
                break
    if '{' in response:
        car = st.session_state.get('car_in_chat', {})
        breakdown = calculate_total_price(car.get('price',0), st.session_state.get('shipping_option','FOB'))
        offer_match = re.search(r'(\d[\d,]*)', user_input)
        offer = offer_match.group(1) if offer_match else '[your offer]'
        response = response.format(total_price=f"¥{breakdown['total_price']:,}", offer_amount=f"¥{offer}")
    return response

# --- SECTION 5: UI COMPONENTS ---
def user_info_form():
    with st.sidebar:
        st.header("Your Information")
        # Always show country->port
        name = st.text_input("Full Name", st.session_state.customer_info.get("name",""))
        email = st.text_input("Email", st.session_state.customer_info.get("email",""))
        phone = st.text_input("Phone", st.session_state.customer_info.get("phone",""))
        country = st.selectbox("Country", [""]+sorted(PORTS_BY_COUNTRY), index=sorted(PORTS_BY_COUNTRY).index(st.session_state.customer_info.get("country","")))
        ports = PORTS_BY_COUNTRY.get(country, [])
        port = st.selectbox("Port of Discharge", [""]+ports, index=ports.index(st.session_state.customer_info.get("port_of_discharge",""))+1 if st.session_state.customer_info.get("port_of_discharge") in ports else 0)
        if st.button("Save Info", use_container_width=True):
            st.session_state.customer_info = {"name":name,"email":email,"phone":phone,"country":country,"port_of_discharge":port}
            st.success("Details saved")


def car_filters(inventory):
    with st.sidebar:
        st.header("Vehicle Filters")
        # existing filter form
        with st.form("car_filters_form"):
            makes = ["All"]+sorted(inventory['make'].unique())
            sel_make = st.selectbox("Make", makes, index=makes.index(st.session_state.active_filters.get('make','All')))
            models = ["All"] + (sorted(inventory[inventory['make']==sel_make]['model'].unique()) if sel_make!='All' else [])
            sel_model = st.selectbox("Model", models, index=models.index(st.session_state.active_filters.get('model','All')))
            year_min, year_max = int(inventory['year'].min()), int(inventory['year'].max())
            sel_years = st.slider("Year", year_min, year_max, st.session_state.active_filters.get('year_range',(year_min,year_max)))
            if st.form_submit_button("Show Results"):
                st.session_state.active_filters={'make':sel_make,'model':sel_model,'year_range':sel_years}
                st.session_state.current_car_index=0
                st.experimental_rerun()

# --- SECTION 6: MARKET CHART & DISPLAY ---
def display_market_data_chart(df, make, model):
    # Wrap chart in expander
    history = df[(df['make']==make)&(df['model']==model)]
    if history.empty: return
    with st.expander("6-Month Price Trend (click to expand)"):
        chart = alt.Chart(history).mark_line(point=True).encode(
            x='date:T', y='avg_price:Q', tooltip=['date:T','avg_price:Q']
        ).properties(title=f"6-Month Price Trend for {make} {model}")
        st.altair_chart(chart, use_container_width=True)

# --- SECTION 7: MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout='wide')
    # Initialize state
    defaults = {'current_car_index':0,'customer_info':{},'active_filters':{},'offer_placed':False,'chat_messages':[],'car_in_chat':{},'shipping_option':'FOB'}
    for k,v in defaults.items():
        if k not in st.session_state: st.session_state[k]=v

    inventory = load_data(INVENTORY_FILE_PATH)
    if inventory is None or inventory.empty: return
    history = simulate_price_history(inventory)

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    user_info_form()
    car_filters(inventory)

    filtered = inventory.copy()
    af = st.session_state.active_filters
    if af:
        if af['make']!='All': filtered=filtered[filtered['make']==af['make']]
        if af['model']!='All': filtered=filtered[filtered['model']==af['model']]
        yr=af['year_range']; filtered=filtered[filtered['year'].between(yr[0],yr[1])]
    if filtered.empty:
        st.warning("No vehicles match your filters."); return

    idx=st.session_state.current_car_index % len(filtered)
    car = filtered.iloc[idx].to_dict()
    st.session_state.shipping_option = st.radio("Shipping Option",['FOB','C&F','CIF'],index=['FOB','C&F','CIF'].index(st.session_state.shipping_option),horizontal=True)
    display_car_card(car, st.session_state.shipping_option)
    display_market_data_chart(history, car['make'], car['model'])

    col1,col2 = st.columns(2)
    with col1:
        if st.button("❤️ Place Offer",use_container_width=True):
            if not all(st.session_state.customer_info.get(x) for x in ["name","email","phone","country","port_of_discharge"]):
                st.error("Complete your info first.")
            else:
                st.session_state.offer_placed=True
                st.session_state.car_in_chat=car
                inv = generate_invoice_html(st.session_state.customer_info,car,calculate_total_price(car['price'],st.session_state.shipping_option))
                st.markdown(inv,unsafe_allow_html=True)
                st.download_button("Download Invoice",inv,file_name="invoice.html",mime="text/html")
    with col2:
        if st.button("❌ Next Vehicle",use_container_width=True):
            st.session_state.current_car_index+=1
            st.experimental_rerun()

    if st.session_state.offer_placed:
        display_chat_interface()

# --- SECTION 8: CHAT INTERFACE ---
def display_chat_interface():
    st.subheader("💬 Chat with our Sales Team")
    for m in st.session_state.chat_messages:
        with st.chat_message(m['role']): st.write(m['content'])
    if prompt := st.chat_input("Ask a question..."):
        st.session_state.chat_messages.append({"role":"user","content":prompt})
        resp = get_bot_response(prompt)
        st.session_state.chat_messages.append({"role":"assistant","content":resp})
        st.experimental_rerun()

# --- SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception:
        st.error("A critical error occurred.")
        st.code(traceback.format_exc())

# --- END OF SCRIPT ---
