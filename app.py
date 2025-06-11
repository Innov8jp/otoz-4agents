# ==============================================================================  
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Chat + Offer Per Car + QA + Admin UI)
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
from difflib import get_close_matches  
import json  
import re  
import altair as alt

# Patch for rerun compatibility
if not hasattr(st, "rerun") and hasattr(st, "experimental_rerun"):
    st.rerun = st.experimental_rerun

# --- SECTION 2: GLOBAL SETTINGS ---  
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
        with open(path,'r',encoding='utf-8') as f:  
            return json.load(f)  
    return None  

@st.cache_data  
def simulate_price_history(df):  
    hist=[]  
    today = pd.to_datetime(datetime.now())  
    for _,r in df.head(50).iterrows():  
        base = r['price']  
        for m in range(1,7):  
            dt = today - DateOffset(months=m)  
            price = int(base * (0.995**m) * (1 + random.uniform(-0.05,0.05)))  
            hist.append({'make':r['make'],'model':r['model'],'date':dt,'avg_price':price})  
    return pd.DataFrame(hist)  

# --- SECTION 4: INTENTS LOADING ---  
@st.cache_data  
def load_intents(path):  
    try:  
        with open(path,'r',encoding='utf-8') as f:  
            return json.load(f).get('intents',[])  
    except Exception:  
        return []  

# --- SECTION 5: PRICE BREAKDOWN & INVOICE ---  
def calculate_total_price(base,opt):  
    if not isinstance(base, (int, float)):
        st.error("Invalid price data. Please check the selected vehicle.")
        return None
    bd = {'base_price':base,'domestic_transport':0,'freight_cost':0,'insurance':0}  
    if opt in ['FOB','C&F','CIF']: bd['domestic_transport'] = DOMESTIC_TRANSPORT  
    if opt in ['C&F','CIF']: bd['freight_cost'] = FREIGHT_COST  
    if opt == 'CIF': bd['insurance'] = (base + bd['freight_cost']) * INSURANCE_RATE  
    bd['total_price'] = sum(bd.values())  
    return bd  

def generate_invoice_html(cust,car,bd):  
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

# --- SECTION 6: VEHICLE LISTING & CHAT ---
df = load_data(INVENTORY_FILE_PATH)
if df is not None:
    st.title("🚗 Vehicle Listings")
    for _, car in df.iterrows():
        with st.container(border=True):
            st.image(car['image_url'], width=300)
            st.subheader(f"{car['year']} {car['make']} {car['model']}")
            st.write(f"Mileage: {car['mileage']} km")
            st.write(f"Price: ¥{car['price']:,}")
            if st.button(f"💬 Place Offer / Ask About This Car", key=f"btn_{car['id']}"):
                st.session_state['selected_car'] = car.to_dict()
                st.rerun()

# --- SECTION 7: LAUNCH CHAT IF CAR SELECTED ---
if "selected_car" in st.session_state:
    selected = st.session_state['selected_car']
    customer = st.session_state.get("customer_info", {})

    st.title(f"Chat for {selected['year']} {selected['make']} {selected['model']}")
    st.image(selected['image_url'], width=300)
    if not customer.get("name") or not customer.get("email"):
        st.warning("⚠️ Please complete your information to begin chat.")
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
