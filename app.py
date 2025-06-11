# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Chat + Offer Per Car + QA + Admin UI + Cards + Graph)
# ==============================================================================

# --- SECTION 1: IMPORTS ---
try:
    import streamlit as st
except ModuleNotFoundError:
    raise ImportError("The 'streamlit' module is not installed in this environment. Please install it via 'pip install streamlit' and run this script in a compatible environment.")

import pandas as pd
import random
import os
import traceback
from datetime import datetime
from pandas.tseries.offsets import DateOffset
import json
import altair as alt

# Patch for rerun compatibility
if not hasattr(st, "rerun") and hasattr(st, "experimental_rerun"):
    st.rerun = st.experimental_rerun

# --- SECTION 2: GLOBAL SETTINGS ---
st.set_page_config(page_title="Sparky - AI Transaction Manager", page_icon="🚗", layout="wide")

PAGE_TITLE = "Sparky - AI Transaction Manager"
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

# --- SECTION 3: DATA LOADING & SIMULATION ---
@st.cache_data
def load_data(path):
    if not os.path.exists(path):
        st.error(f"File not found: {path}")
        return None
    if path.endswith('.csv'):
        df = pd.read_csv(path)
        if 'image_url' not in df.columns:
            df['image_url'] = df.apply(lambda r: f"https://placehold.co/600x400?text={r.make}+{r.model}", axis=1)
        if 'id' not in df.columns:
            df.reset_index(inplace=True)
            df['id'] = df['index'].apply(lambda i: f"VID{i:04d}")
        return df
    if path.endswith('.json'):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data
def simulate_price_history(df):
    hist = []
    today = pd.to_datetime(datetime.now())
    for _, r in df.head(50).iterrows():
        base = r['price']
        for m in range(1, 7):
            dt = today - DateOffset(months=m)
            price = int(base * (0.995**m) * (1 + random.uniform(-0.05, 0.05)))
            hist.append({'id': r['id'], 'make': r['make'], 'model': r['model'], 'date': dt, 'avg_price': price})
    return pd.DataFrame(hist)

# --- SECTION 4: INTENTS LOADING ---
@st.cache_data
def load_intents(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f).get('intents', [])
    except Exception:
        return []

# --- SECTION 5: PRICE BREAKDOWN & INVOICE ---
def calculate_total_price(base, opt):
    if not isinstance(base, (int, float)):
        st.error("Invalid price data. Please check the selected vehicle.")
        return None
    bd = {'base_price': base, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if opt in ['FOB', 'C&F', 'CIF']: bd['domestic_transport'] = DOMESTIC_TRANSPORT
    if opt in ['C&F', 'CIF']: bd['freight_cost'] = FREIGHT_COST
    if opt == 'CIF': bd['insurance'] = (base + bd['freight_cost']) * INSURANCE_RATE
    bd['total_price'] = sum(bd.values())
    return bd

def generate_invoice_html(cust, car, bd):
    name = cust.get('name', 'Unknown')
    email = cust.get('email', 'unknown@example.com')
    rows = f"<tr><td>{car['year']} {car['make']} {car['model']}</td><td>{bd['base_price']:,}</td></tr>"
    if bd['domestic_transport']: rows += f"<tr><td>Domestic Transport</td><td>{bd['domestic_transport']:,}</td></tr>"
    if bd['freight_cost']: rows += f"<tr><td>Freight Cost</td><td>{bd['freight_cost']:,}</td></tr>"
    if bd['insurance']: rows += f"<tr><td>Insurance</td><td>{int(bd['insurance']):,}</td></tr>"
    rows += f"<tr><td><strong>Total</strong></td><td><strong>{bd['total_price']:,}</strong></td></tr>"
    return ("<html><body>"
            f"<h2>Invoice</h2><p>Date: {datetime.now().date()}</p>"
            f"<p>Customer: {name} &lt;{email}&gt;</p>"
            f"<table border='1'><tr><th>Item</th><th>Amount (JPY)</th></tr>{rows}</table>"
            "</body></html>")

# --- SECTION 6: VEHICLE LISTING & CHART ---
df = load_data(INVENTORY_FILE_PATH)
history_df = simulate_price_history(df) if df is not None else pd.DataFrame()

if df is not None:
    st.sidebar.title("🔍 Filters")
    makes = ["All"] + sorted(df["make"].unique())
    selected_make = st.sidebar.selectbox("Select Make", makes)

    filtered_df = df.copy()
    if selected_make != "All":
        filtered_df = df[df["make"] == selected_make]

    st.title("🚗 Vehicle Listings")
    for _, car in filtered_df.iterrows():
        col1, col2 = st.columns([1, 2])
        with col1:
            st.image(car['image_url'], width=240)
        with col2:
            st.subheader(f"{car['year']} {car['make']} {car['model']}")
            st.write(f"Mileage: {car['mileage']} km")
            st.write(f"Price: ¥{car['price']:,}")
            chart_df = history_df[history_df['id'] == car['id']]
            if not chart_df.empty:
                chart = alt.Chart(chart_df).mark_line(point=True).encode(
                    x='date:T', y='avg_price:Q'
                ).properties(height=150)
                st.altair_chart(chart, use_container_width=True)
            if st.button("💬 Place Offer / Ask About This Car", key=f"btn_{car['id']}"):
                st.session_state['selected_car'] = car.to_dict()
                if "customer_info" not in st.session_state:
                    st.session_state['customer_info'] = {"name": "", "email": ""}
                st.rerun()

# --- SECTION 7: CHAT ---
if "selected_car" in st.session_state:
    selected = st.session_state['selected_car']
    customer = st.session_state.get("customer_info", {"name": "", "email": ""})

    st.title(f"Chat for {selected['year']} {selected['make']} {selected['model']}")
    st.image(selected['image_url'], width=300)

    if not customer.get("name") or not customer.get("email"):
        st.info("✍️ Please enter your info to proceed with chat:")
        with st.form("customer_info_form"):
            name = st.text_input("Your Name", value=customer.get("name", ""))
            email = st.text_input("Email", value=customer.get("email", ""))
            submitted = st.form_submit_button("Continue")
            if submitted:
                st.session_state.customer_info = {"name": name, "email": email}
                st.rerun()
    else:
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []

        user_input = st.chat_input("Ask Sparky...")
        if user_input:
            st.session_state.chat_history.append(("user", user_input))
            st.session_state.chat_history.append(("sparky", f"You asked about the {selected['year']} {selected['make']} {selected['model']}. We'll get back with details soon!"))

        for speaker, msg in st.session_state.chat_history:
            if speaker == "user":
                st.chat_message("user").write(msg)
            else:
                st.chat_message("assistant").write(msg)

# --- END OF SCRIPT ---
