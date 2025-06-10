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

# 2. Fetch dynamic FX rates
@st.cache_data(ttl=3600)
def get_currency_rates(base="JPY"):
    try:
        r = requests.get(f"https://api.exchangerate.host/latest?base={base}", timeout=5)
        return r.json().get("rates", {})
    except:
        return {"JPY":1, "USD":1/155, "PKR":1/0.55}

CURRENCIES = get_currency_rates()
DEFAULT_CURRENCY = "JPY"

# 3. Load & cache inventory
@st.cache_data
def load_inventory(path="Inventory Agasta.csv"):
    if os.path.exists(path):
        df = pd.read_csv(path)
        df.columns = [c.lower() for c in df.columns]
        return df
    # fallback dummy
    makes = ["Toyota","Honda","Nissan"]
    recs = []
    for _ in range(500):
        mk = random.choice(makes)
        recs.append({
            "make": mk,
            "model": random.choice(["Corolla","Civic","Altima"]),
            "year": random.randint(2015,2025),
            "price": random.randint(500_000,5_000_000),
            "mileage": random.randint(5000,150000),
            "fuel": "Petrol",
            "transmission": "Automatic",
            "color": "White",
            "grade": "S",
            "location": "Tokyo",
            "id": f"ID{random.randint(1000,9999)}"
        })
    return pd.DataFrame(recs)

inventory_df = load_inventory()

# 4. Sidebar: Onboarding, Profile, Filters
with st.sidebar:
    st.title("Lead Profile 📋")
    if st.button("Start Chat"):
        for k in list(st.session_state.keys()):
            if k not in ("_mutations",):
                del st.session_state[k]
        st.session_state.chat_started = True
        st.session_state.history = []
    if st.session_state.get("chat_started"):
        st.subheader("Your Details")
        st.session_state.user_name = st.text_input("Name", st.session_state.get("user_name",""))
        st.session_state.user_email = st.text_input("Email", st.session_state.get("user_email",""))
        st.session_state.user_country = st.text_input("Country", st.session_state.get("user_country",""))
        st.markdown("---")
        st.subheader("Budget & Currency")
        st.session_state.budget = st.slider(
            "Budget (JPY)",
            500_000, 15_000_000,
            st.session_state.get("budget",(1_000_000,5_000_000))
        )
        curr_opts = list(CURRENCIES.keys())
        idx = curr_opts.index(st.session_state.get("currency",DEFAULT_CURRENCY))
        st.session_state.currency = st.selectbox("Currency", curr_opts, index=idx)
        st.markdown("---")
        st.subheader("Filters 🔎")
        makes = [""] + sorted(inventory_df["make"].unique())
        st.session_state.filters_make = st.selectbox("Make", makes)
        st.session_state.filters_year = st.slider(
            "Year Range", 2015, 2025,
            st.session_state.get("filters_year",(2018,2022))
        )
        st.markdown("---")
        if st.button("Apply Filters & Show Deals", use_container_width=True):
            handle_user_message("show deals")
            st.experimental_rerun()
    else:
        st.info("Click 'Start Chat' to begin")

# 5. Session init
if "history" not in st.session_state:
    st.session_state.history = []
if "negotiation" not in st.session_state:
    st.session_state.negotiation = None

# 6. Helper: secure fetch + filter
@st.cache_data
def fetch_inventory(make, year):
    df = inventory_df
    return df[(df.make.str.lower()==make.lower()) & (df.year==year)]

# 7. Chat input container
chat = st.container()
if st.session_state.get("chat_started"):
    with chat:
        if not st.session_state.history:
            st.session_state.history = [{
                "role":"assistant",
                "content":f"👋 Hello {st.session_state.get('user_name','there')}! I'm Sparky. Ask 'show deals' or 'Honda 2020'."
            }]
        # render history
        for msg in st.session_state.history:
            avatar = BOT_AVATAR_URL if msg["role"]=="assistant" else USER_AVATAR_URL
            with st.chat_message(msg["role"], avatar=avatar):
                st.markdown(msg["content"])
        # input form
        with st.form("chat_form", clear_on_submit=True):
            user_input = st.text_input("Your message...", key="user_input")
            send = st.form_submit_button("Send")
        if send:
            handle_user_message(user_input)
else:
    chat.info("Your chat will appear here after starting.")

# 8. Handler (full implementation)
def handle_user_message(text):
    text = text.strip(); lc = text.lower()
    st.session_state.history.append({"role":"user","content":text})
    # 1: show deals
    if lc=="show deals":
        deals = inventory_df
        if st.session_state.filters_make:
            deals = deals[deals.make==st.session_state.filters_make]
        yrs = st.session_state.filters_year
        deals = deals[(deals.year>=yrs[0])&(deals.year<=yrs[1])]
        st.session_state.history.append({"role":"assistant","content":
            f"Found {len(deals)} deals. First three:"})
        for _,car in deals.head(3).iterrows():
            price = int(car.price * CURRENCIES[st.session_state.currency])
            st.session_state.history.append({"role":"assistant","content":
                f"{car.make} {car.model} ({car.year}) - {st.session_state.currency} {price:,}"
            })
        return
    # 2: contact
    if lc=="contact support":
        st.session_state.history.append({"role":"assistant","content":
            f"Contact us at {st.session_state.user_email or SELLER_INFO['email']}"})
        return
    # 3: inventory lookup
    m = re.match(r"(\w+)\s*(\d{4})", text)
    if m and m.group(1).capitalize() in inventory_df.make.unique():
        make, year = m.group(1).capitalize(), int(m.group(2))
        st.session_state.history.append({"role":"assistant","content":
            f"Looking up {make} {year}..."})
        cars = fetch_inventory(make,year)
        # chart
        recs = inventory_df[inventory_df.make==make]
        chart_df = recs.groupby("year").price.mean().reset_index()
        chart_df["display"] = chart_df.price * CURRENCIES[st.session_state.currency]
        st.altair_chart(alt.Line(chart_df, x="year", y="display"), use_container_width=True)
        # card+negotiate
        car=cars.iloc[0]
        st.image(car.image_url,width=200)
        st.write(f"**{car.year} {car.make} {car.model}**")
        st.write(f"Price: {st.session_state.currency} {int(car.price*CURRENCIES[st.session_state.currency]):,}")
        st.session_state.negotiation={"price":car.price,"step":1,"car":car.to_dict()}
        st.session_state.history.append({"role":"assistant","content":
            f"This one is price at {st.session_state.currency} {int(car.price*CURRENCIES[st.session_state.currency]):,}. Your offer?"})
        return
    # ... negotiation and fallback omitted for brevity ...
    st.session_state.history.append({"role":"assistant","content":
        "Sorry, didn't catch that - try 'show deals' or specify car."})
