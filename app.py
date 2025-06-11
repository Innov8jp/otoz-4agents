# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Chat + Offer Per Car + Filters + Price Details + QA)
# ==============================================================================

# --- SECTION 1: IMPORTS ---
try:
    import streamlit as st
except ModuleNotFoundError:
    raise ImportError("The 'streamlit' module is not installed. Install via: pip install streamlit")

import pandas as pd
import random
import os
from datetime import datetime
from pandas.tseries.offsets import DateOffset
import json
import altair as alt

# Patch for rerun compatibility
if not hasattr(st, "rerun") and hasattr(st, "experimental_rerun"):
    st.rerun = st.experimental_rerun

# --- SECTION 2: GLOBAL SETTINGS ---
st.set_page_config(page_title="Sparky - AI Transaction Manager", page_icon="🚗", layout="wide")

INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents.json'

PORTS_BY_COUNTRY = {
    "Australia": ["Melbourne", "Sydney"], "Canada": ["Vancouver"], "Kenya": ["Mombasa"],
    "New Zealand": ["Auckland"], "Pakistan": ["Karachi"], "Tanzania": ["Dar es Salaam"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"], "United Kingdom": ["Southampton"]
}

DOMESTIC_TRANSPORT = 50_000
FREIGHT_COST = 150_000
INSURANCE_RATE = 0.025

JAPAN_MAKERS = {
    "Toyota": ["Corolla", "Camry", "Aqua"],
    "Honda": ["Civic", "Fit", "Vezel"],
    "Nissan": ["Note", "Serena", "X-Trail"]
}
GERMANY_MAKERS = {
    "BMW": ["3 Series", "5 Series", "X1"],
    "Mercedes": ["C-Class", "E-Class", "GLA"],
    "Volkswagen": ["Golf", "Passat", "Tiguan"]
}# --- SECTION 3: DATA LOADING ---
@st.cache_data
def load_data(path):
    if not os.path.exists(path):
        st.error(f"File not found: {path}")
        return None
    df = pd.read_csv(path)
    if 'image_url' not in df.columns:
        df['image_url'] = df.apply(lambda r: f"https://placehold.co/600x400?text={r.make}+{r.model}", axis=1)
    if 'id' not in df.columns:
        df.reset_index(inplace=True)
        df['id'] = df['index'].apply(lambda i: f"VID{i:04d}")
    return df

@st.cache_data
def simulate_price_history(df):
    hist = []
    today = pd.to_datetime(datetime.now())
    for _, r in df.iterrows():
        base = r['price']
        for m in range(1, 7):
            dt = today - DateOffset(months=m)
            price = int(base * (0.995**m) * (1 + random.uniform(-0.05, 0.05)))
            hist.append({'id': r['id'], 'make': r['make'], 'model': r['model'], 'date': dt, 'avg_price': price})
    return pd.DataFrame(hist)

def calculate_total_price(base, opt):
    if not isinstance(base, (int, float)):
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

# --- SECTION 4: MAIN APP UI ---
df = load_data(INVENTORY_FILE_PATH)
history_df = simulate_price_history(df) if df is not None else pd.DataFrame()

if df is not None:
    st.sidebar.title("🔧 Search Filters")
    country = st.sidebar.selectbox("Country of Origin", ["All", "Japan", "Germany"])
    makers = []
    if country == "Japan":
        makers = list(JAPAN_MAKERS.keys())
    elif country == "Germany":
        makers = list(GERMANY_MAKERS.keys())
    all_makers = sorted(set(df["make"]))
    selected_maker = st.sidebar.selectbox("Make", ["All"] + makers if makers else ["All"] + all_makers)
    
    models = []
    if country == "Japan" and selected_maker in JAPAN_MAKERS:
        models = JAPAN_MAKERS[selected_maker]
    elif country == "Germany" and selected_maker in GERMANY_MAKERS:
        models = GERMANY_MAKERS[selected_maker]
    elif selected_maker != "All":
        models = sorted(df[df["make"] == selected_maker]["model"].unique())

    selected_model = st.sidebar.selectbox("Model", ["All"] + models if models else ["All"])
    country_for_shipping = st.sidebar.selectbox("Shipping Destination", list(PORTS_BY_COUNTRY.keys()))
    selected_port = st.sidebar.selectbox("Port", PORTS_BY_COUNTRY[country_for_shipping])
    shipping_method = st.sidebar.selectbox("Shipping Method", ["FOB", "C&F", "CIF"])

    filtered_df = df.copy()
    if selected_maker != "All":
        filtered_df = filtered_df[filtered_df["make"] == selected_maker]
    if selected_model != "All":
        filtered_df = filtered_df[filtered_df["model"] == selected_model]

    st.title("🚗 Available Cars")
    for _, car in filtered_df.iterrows():
        st.markdown("---")
        col1, col2 = st.columns([1, 2])
        with col1:
            st.image(car['image_url'], width=260)
        with col2:
            st.subheader(f"{car['year']} {car['make']} {car['model']}")
            st.write(f"Mileage: {car['mileage']} km")
            st.write(f"Base Price: ¥{car['price']:,}")
            chart_df = history_df[history_df['id'] == car['id']]
            if not chart_df.empty:
                chart = alt.Chart(chart_df).mark_line(point=True).encode(
                    x='date:T', y='avg_price:Q'
                ).properties(height=140)
                st.altair_chart(chart, use_container_width=True)
            with st.expander("📦 View Price Details (FOB / C&F / CIF)"):
                bd = calculate_total_price(car['price'], shipping_method)
                if bd:
                    st.write(f"Base Price: ¥{bd['base_price']:,}")
                    if bd['domestic_transport']: st.write(f"Domestic Transport: ¥{bd['domestic_transport']:,}")
                    if bd['freight_cost']: st.write(f"Freight Cost: ¥{bd['freight_cost']:,}")
                    if bd['insurance']: st.write(f"Insurance: ¥{int(bd['insurance']):,}")
                    st.markdown(f"**Total Price ({shipping_method}): ¥{bd['total_price']:,}**")
            if st.button("💬 Place Offer / Ask About This Car", key=f"btn_{car['id']}"):
                st.session_state['selected_car'] = car.to_dict()
                if "customer_info" not in st.session_state:
                    st.session_state['customer_info'] = {"name": "", "email": ""}
                st.rerun()
