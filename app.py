import os
import re
import csv
import io
import random
import requests
import streamlit as st
import pandas as pd
import altair as alt
from datetime import datetime
try:
    from fpdf import FPDF
    ENABLE_PDF = True
except ImportError:
    ENABLE_PDF = False

# ─────────────────────────────────────────────────────────────────────────────
# 1. Top-level Page Config
# Must be called exactly once
st.set_page_config(
    page_title="Sparky - AI Sales Assistant",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =====================================================================================
# 2. Dynamic Currency Rates (fetch and cache)
# =====================================================================================
@st.cache_data(ttl=60*60)
def get_currency_rates(base="JPY"):  # use public API
    try:
        resp = requests.get(f"https://api.exchangerate.host/latest?base={base}", timeout=5)
        data = resp.json().get("rates", {})
        return data
    except:
        return {"JPY":1, "USD":1/155, "PKR":1/0.55}

CURRENCIES = get_currency_rates()
DEFAULT_CURRENCY = "JPY"

# =====================================================================================
# 3. Sidebar: Profile, Filters, Currency
# =====================================================================================
with st.sidebar:
    st.title("Lead Profile 📋")
    # Reset session on new start
    if st.button("Start Chat"):  # clear all except cached
        for k in list(st.session_state.keys()):
            if not k.startswith("compute_"):
                del st.session_state[k]
        st.session_state.chat_started = True
        st.session_state.history = []
    if st.session_state.get("chat_started"):
        # User info
        st.session_state.user_name = st.text_input("Name", st.session_state.get("user_name", ""))
        st.session_state.user_email = st.text_input("Email", st.session_state.get("user_email", ""))
        st.session_state.user_country = st.text_input("Country", st.session_state.get("user_country", ""))
        st.markdown("---")
        # Budget and currency
        st.session_state.budget = st.slider("Budget (JPY)", 500_000, 15_000_000,
                                           st.session_state.get("budget", (1_000_000, 5_000_000)))
        curr_opts = list(CURRENCIES.keys())
        default_idx = curr_opts.index(st.session_state.get("currency", DEFAULT_CURRENCY))
        st.session_state.currency = st.selectbox("Currency", curr_opts, index=default_idx)
        st.markdown("---")
        # Vehicle Filters
        st.header("Filters 🔎")
        makes = [""] + sorted(st.session_state.inventory_df['make'].unique() if 'inventory_df' in st.session_state else [])
        st.session_state.filters_make = st.selectbox("Make", makes)
        years = st.slider("Year Range", 2015, 2025,
                             st.session_state.get("filters_year", (2018,2022)))
        st.session_state.filters_year = years
        st.markdown("---")
        if st.button("Apply Filters & Show Deals", use_container_width=True):
            st.session_state.history.append({"role":"assistant","content":"Applying filters and fetching deals..."})
    else:
        st.info("Click 'Start Chat' to begin your session.")

# =====================================================================================
# 4. Load & Cache Inventory + Market Data
# =====================================================================================
@st.cache_data
def load_inventory(path='Inventory Agasta.csv'):
    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            # rename columns to standard
            df.columns = [c.lower() for c in df.columns]
            return df
        except:
            pass
    # fallback dummy inventory
    makes = ["Toyota","Honda","Nissan"]
    records = []
    for _ in range(500):
        mk = random.choice(makes)
        records.append({
            'make': mk,
            'model': random.choice(["Corolla","Civic","Altima"]),
            'year': random.randint(2015,2025),
            'price': random.randint(500_000,5_000_000),
            'mileage': random.randint(5000,150000),
            'fuel': 'Petrol', 'transmission':'Automatic',
            'color':'White','grade':'S',
            'location':'Tokyo',
            'id': f"ID{random.randint(1000,9999)}"
        })
    return pd.DataFrame(records)

st.session_state.inventory_df = load_inventory()

# =====================================================================================
# 5. Helper: Fetch & Filter Inventory
# =====================================================================================
@st.cache_data
def fetch_inventory(make, year):
    df = st.session_state.inventory_df
    return df[(df.make.str.lower()==make.lower()) & (df.year==year)]

# =====================================================================================
# 6. Chat UI Logic (isolated container)
# =====================================================================================
chat_container = st.container()
if st.session_state.get("chat_started"):
    with chat_container:
        if not st.session_state.history:
            st.session_state.history = [{"role":"assistant","content":f"👋 Hello {st.session_state.get('user_name','there')}! I'm Sparky. Ask for 'show deals' or a specific car (e.g., Honda 2020)."}]
        # Display history
        for msg in st.session_state.history:
            avatar = BOT_AVATAR_URL if msg['role']=='assistant' else USER_AVATAR_URL
            with st.chat_message(msg['role'], avatar=avatar): st.markdown(msg['content'])
        # User input form to batch submit
        with st.form(key='chat_form', clear_on_submit=True):
            user_input = st.text_input("Your message...", key='user_input')
            submitted = st.form_submit_button("Send")
        if submitted:
            handle_user_message(user_input)  # abstracted handler
else:
    chat_container.info("Your chat will appear here once you start.")

# =====================================================================================
# 7. Handler Functions (not shown due to brevity)
# - parse_intent, respond, negotiation, invoice, etc.
# You would incorporate improved regex (re.search), currency scaling in charts,
# stable keys for download, and additional caching for data loads.
# =====================================================================================

# End of script
