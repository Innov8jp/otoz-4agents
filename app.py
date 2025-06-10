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
st.set_page_config(
    page_title="Sparky - AI Sales Assistant",
    page_icon="🚗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# =====================================================================================
# 2. Dynamic Currency Rates (fetch and cache)
@st.cache_data(ttl=3600)
def get_currency_rates(base="JPY"):
    try:
        resp = requests.get(f"https://api.exchangerate.host/latest?base={base}", timeout=5)
        return resp.json().get("rates", {"JPY":1})
    except:
        return {"JPY":1, "USD":1/155, "PKR":1/0.55}

CURRENCIES = get_currency_rates()
DEFAULT_CURRENCY = "JPY"

# =====================================================================================
# 3. Sidebar: Onboarding, Profile, Budget & Filters
with st.sidebar:
    st.title("Lead Profile 📋")
    if st.button("Start Chat", use_container_width=True):
        # Reset session state except cached data
        keys = list(st.session_state.keys())
        for k in keys:
            if k not in ("_mutations",):
                del st.session_state[k]
        st.session_state.chat_started = True
        st.session_state.history = []
    if st.session_state.get("chat_started"):
        st.subheader("Your Details")
        st.session_state.user_name = st.text_input("Name", st.session_state.get("user_name", ""))
        st.session_state.user_email = st.text_input("Email", st.session_state.get("user_email", ""))
        st.session_state.user_country = st.text_input("Country", st.session_state.get("user_country", ""))
        if st.button("Save Profile", use_container_width=True): st.success("Profile saved!")
        st.markdown("---")
        st.subheader("Budget & Currency")
        st.session_state.budget = st.slider(
            "Budget (JPY)", 500_000, 15_000_000,
            st.session_state.get("budget", (1_000_000,5_000_000)), step=100_000
        )
        curr_opts = list(CURRENCIES.keys())
        idx = curr_opts.index(st.session_state.get("currency", DEFAULT_CURRENCY))
        st.session_state.currency = st.selectbox(
            "Display Prices in", curr_opts, index=idx
        )
        st.markdown("---")
        st.subheader("Filters 🔎")
        makes = [""] + sorted(st.session_state.inventory_df['make'].unique())
        st.session_state.filters_make = st.selectbox("Make", makes)
        st.session_state.filters_year = st.slider(
            "Year Range", 2015, 2025,
            st.session_state.get("filters_year", (2018,2022))
        )
        if st.button("Apply Filters & Show Deals", use_container_width=True):
            handle_user_message("show deals")
            st.experimental_rerun()
    else:
        st.info("Click 'Start Chat' to begin your session.")

# =====================================================================================
# 4. Load & Cache Inventory + Market Data
@st.cache_data
def load_inventory(path='Inventory Agasta.csv'):
    if os.path.exists(path):
        try:
            df = pd.read_csv(path)
            df.columns = [c.lower() for c in df.columns]
            return df
        except:
            pass
    # fallback dummy inventory
    makes = ["Toyota","Honda","Nissan"]
    data = []
    for _ in range(500):
        mk = random.choice(makes)
        data.append({
            'make': mk,
            'model': random.choice(["Corolla","Civic","Altima"]),
            'year': random.randint(2015,2025),
            'price': random.randint(500_000,5_000_000),
            'mileage': random.randint(5_000,150_000),
            'fuel': 'Petrol', 'transmission': 'Automatic',
            'color': 'White', 'grade': 'S', 'location': 'Tokyo',
            'id': f"ID{random.randint(1000,9999)}"
        })
    return pd.DataFrame(data)

st.session_state.inventory_df = load_inventory()

# =====================================================================================
# 5. Helper: Fetch & Filter Inventory
@st.cache_data
def fetch_inventory(make, year):
    df = st.session_state.inventory_df
    return df[(df.make.str.lower()==make.lower()) & (df.year==year)]

# =====================================================================================
# 6. Chat UI Logic
if not st.session_state.get("history"): st.session_state.history = []
chat_container = st.container()
if st.session_state.get("chat_started"):
    with chat_container:
        # Display history
        for msg in st.session_state.history:
            avatar = BOT_AVATAR_URL if msg['role']=='assistant' else USER_AVATAR_URL
            with st.chat_message(msg['role'], avatar=avatar): st.markdown(msg['content'])
        # Input form
        with st.form(key='chat_form', clear_on_submit=True):
            user_input = st.text_input("Your message...", key='user_input')
            send = st.form_submit_button("Send")
        if send:
            handle_user_message(user_input)
else:
    chat_container.info("Your chat will appear here once you start.")

# =====================================================================================
# 7. Handler: parse intents and respond
def handle_user_message(text):
    text = text.strip(); lc = text.lower()
    st.session_state.history.append({"role":"user","content":text})
    # Show deals
    if lc == "show deals":
        df = st.session_state.inventory_df
        if st.session_state.filters_make:
            df = df[df.make==st.session_state.filters_make]
        y0,y1 = st.session_state.filters_year
        df = df[(df.year>=y0)&(df.year<=y1)]
        st.session_state.history.append({"role":"assistant","content":f"Found {len(df)} deals. First 3:"})
        for _,c in df.head(3).iterrows():
            price = int(c.price * CURRENCIES[st.session_state.currency])
            st.session_state.history.append({"role":"assistant","content":f"{c.make} {c.model} ({c.year}) - {st.session_state.currency} {price:,}"})
        return
    # Contact support
    if lc == "contact support":
        st.session_state.history.append({"role":"assistant","content":f"Contact: {st.session_state.user_email or 'sales@otoz.ai'}"})
        return
    # Inventory lookup
    m = re.match(r"(\w+)\s*(\d{4})", text)
    if m and m.group(1).capitalize() in st.session_state.inventory_df.make.unique():
        make = m.group(1).capitalize(); year = int(m.group(2))
        st.session_state.history.append({"role":"assistant","content":f"Looking up {make} {year}..."})
        cars = fetch_inventory(make,year)
        if not cars.empty:
            # Chart
            recs = st.session_state.inventory_df[st.session_state.inventory_df.make==make]
            chart_df = recs.groupby('year').price.mean().reset_index()
            chart_df['display'] = chart_df.price * CURRENCIES[st.session_state.currency]
            st.altair_chart(alt.Line(chart_df, x='year', y='display'), use_container_width=True)
            c = cars.iloc[0]
            st.image(f"https://dummyimage.com/200x100/000/fff&text={make}+{year}")
            st.write(f"**{year} {make} {c.model}**")
            st.write(f"Price: {st.session_state.currency} {int(c.price * CURRENCIES[st.session_state.currency]):,}")
        else:
            st.session_state.history.append({"role":"assistant","content":"No listings found."})
        return
    # Fallback
    st_session = st.session_state
    st_session.history.append({"role":"assistant","content":"Try 'show deals' or specify car make+year."})

# End of script
