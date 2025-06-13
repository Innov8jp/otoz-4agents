# ================================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (v7) - Sparky AI Sales Assistant
# ================================================================================

# --- SECTION 1: IMPORTS ---
import streamlit as st
import pandas as pd
import altair as alt
import json
import random
import traceback
import os
import re
from datetime import datetime
from pandas.tseries.offsets import DateOffset
from difflib import get_close_matches
import requests
from bs4 import BeautifulSoup

# --- SECTION 2: GLOBAL CONSTANTS & SETTINGS ---
PAGE_TITLE = "Sparky - Transaction Manager"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents_extended_50.json'

# Ports grouped by country for user selection
PORTS_BY_COUNTRY = {
    "Australia": ["Adelaide", "Brisbane", "Fremantle", "Melbourne", "Sydney"],
    "Canada": ["Halifax", "Vancouver"],
    "Chile": ["Iquique", "Valparaíso"],
    "Germany": ["Bremerhaven", "Hamburg"],
    "Ireland": ["Cork", "Dublin"],
    "Kenya": ["Mombasa"],
    "Malaysia": ["Port Klang"],
    "New Zealand": ["Auckland", "Lyttelton", "Napier", "Wellington"],
    "Pakistan": ["Karachi", "Port Qasim"],
    "Tanzania": ["Dar es Salaam"],
    "Thailand": ["Laem Chabang"],
    "United Arab Emirates": ["Jebel Ali (Dubai)"],
    "United Kingdom": ["Bristol", "Liverpool", "Southampton", "Tilbury"],
    "United States": ["Baltimore", "Jacksonville", "Long Beach", "Newark", "Tacoma"],
    "Zambia": ["Via Dar es Salaam, Tanzania"]
}

# Hard-coded car makers and models for quick filters
CAR_MAKERS_AND_MODELS = {
    "Toyota": ["Aqua", "Vitz", "Passo", "Corolla", "Prius", "Harrier", "RAV4", "Land Cruiser", "HiAce"],
    "Honda": ["Fit", "Vezel", "CR-V", "Civic", "Accord", "N-BOX", "Freed"],
    "Nissan": ["Note", "Serena", "X-Trail", "Leaf", "Skyline", "March", "Juke"]
}

PRICE_TERMS = ["FOB", "C&F", "CIF"]

# --- SECTION 3: DATA LOADING & CACHING ---
@st.cache_data
def load_inventory(path: str) -> pd.DataFrame:
    """Load inventory CSV into a DataFrame."""
    try:
        df = pd.read_csv(path)
    except Exception as e:
        st.error(f"Failed to load inventory: {e}")
        return pd.DataFrame()
    # Ensure required columns exist
    for col in ['id', 'make', 'model', 'year', 'price', 'mileage']:
        if col not in df.columns:
            df[col] = None
    # Normalize images field
    if 'image_urls' not in df.columns:
        df['image_urls'] = df.get('image_url', '').apply(lambda x: x.split('|') if pd.notna(x) else [])
    return df

@st.cache_data
def load_intents(path: str) -> dict:
    """Load JSON intents file."""
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        st.error(f"Failed to load intents: {e}")
        return {"intents": []}

# --- SECTION 4: INTENT MATCHING ---
def match_intent(message: str, intents: dict) -> str:
    """Simple pattern-based intent matcher with fallback."""
    msg = message.lower()
    for intent in intents.get('intents', []):
        for pat in intent.get('patterns', []):
            if re.search(rf"\b{re.escape(pat.lower())}\b", msg):
                return random.choice(intent.get('responses', []))
    # Fallback: try fuzzy by tag
    tags = [item['tag'] for item in intents.get('intents', [])]
    best = get_close_matches(msg, tags, n=1, cutoff=0.6)
    if best:
        responses = next(item['responses'] for item in intents['intents'] if item['tag']==best[0])
        return random.choice(responses)
    return "Sorry, I didn't understand that. Could you rephrase?"

# --- SECTION 5: MARKET PRICE SCRAPING ---
@st.cache_data
def fetch_market_prices(make: str, model: str) -> pd.Series:
    """Scrape or mock 6-month price series from beforward.jp"""
    try:
        url = f"https://www.beforward.jp/catalog/{make}/{model}/"
        html = requests.get(url, timeout=5).text
        # TODO: parse actual data from HTML
        dates = pd.date_range(end=pd.Timestamp.today(), periods=6, freq='M')
        prices = pd.Series([1000000 + i*50000 for i in range(6)], index=dates)
        return prices
    except Exception:
        return pd.Series()

# --- SECTION 6: PRICE BREAKDOWN ---
def calculate_breakdown(base: float, term: str) -> dict:
    """Compute fees and totals for FOB, C&F, CIF."""
    land = 30000
    freight = 300000
    breakdown = {"Base Price": base, "Land Transport": land}
    if term in ["C&F", "CIF"]:
        breakdown["Freight"] = freight
    if term == "CIF":
        breakdown["Insurance"] = base * 0.01
    breakdown["Grand Total"] = sum(breakdown.values())
    return breakdown

# --- SECTION 7: RENDERING UTILITIES ---
def show_price_trend(prices: pd.Series):
    df = prices.rename_axis('Date').reset_index(name='Price')
    chart = alt.Chart(df).mark_line(point=True).encode(x='Date:T', y='Price:Q').properties(title='6-Month Price Trend')
    st.altair_chart(chart, use_container_width=True)


def render_car_card(car: dict, term: str):
    """Display car info, images, price breakdown, and invoice download."""
    # Images
    imgs = car.get('image_urls', [])
    if imgs:
        cols = st.columns(min(len(imgs), 3))
        for col, url in zip(cols, imgs):
            col.image(url, use_column_width=True)
    else:
        st.image("https://placehold.co/600x400?text=No+Image", use_column_width=True)

    # Details
    st.subheader(f"{car['year']} {car['make']} {car['model']}")
    breakdown = calculate_breakdown(car['price'], term)
    for k, v in breakdown.items():
        st.markdown(f"**{k}:** ¥{int(v):,}")
    st.markdown(f"**Mileage:** {int(car['mileage']):,} km")

    # Market comparison
    with st.expander("Market Comparison"):
        series = fetch_market_prices(car['make'], car['model'])
        if not series.empty:
            show_price_trend(series)
        else:
            st.write("Market data unavailable.")

    # Negotiation
    offer = st.number_input("Your offer (JPY):", min_value=0, step=50000, key=f"offer_{car['id']}")
    if st.button("Make Offer", key=f"make_{car['id']}"):
        st.session_state.setdefault('offers', {})[car['id']] = offer
        st.success(f"Offer of ¥{offer:,} submitted.")

    # Invoice download
    if car['id'] in st.session_state.get('offers', {}):
        if st.button("Generate & Download Invoice", key=f"inv_{car['id']}"):
            inv_html = generate_invoice_html(car, st.session_state['offers'][car['id']], breakdown)
            st.download_button("Download Invoice", data=inv_html, file_name=f"invoice_{car['id']}.html", mime='text/html')


def generate_invoice_html(car: dict, agreed: float, breakdown: dict) -> str:
    """Return HTML invoice as text."""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    rows = ''.join(f"<tr><th>{k}</th><td>¥{int(v):,}</td></tr>" for k, v in breakdown.items())
    return f"""
<html><head><style>body{{font-family:Arial;}}table{{width:100%;border-collapse:collapse;}}th,td{{border:1px solid #ddd;padding:8px;}}th{{background:#f2f2f2;}}</style></head><body>
<h1>Invoice</h1><p>{now}</p><h2>Seller</h2><p>Otoz.ai, Tokyo</p><h2>Buyer</h2><p>{st.session_state.get('user_name','N/A')}</p><h2>Details</h2><table>{rows}</table></body></html>"""

# --- SECTION 8: MAIN APP ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout='wide')
    st.title(PAGE_TITLE)

    # Load data
    inventory = load_inventory(INVENTORY_FILE_PATH)
    intents = load_intents(INTENTS_FILE_PATH)

    # Sidebar: Chat & Filters
    with st.sidebar:
        st.header("Chat with Sparky")
        msg = st.text_input("You:")
        if st.button("Send") and msg:
            st.write(f"**Sparky:** {match_intent(msg, intents)}")
        st.markdown("---")
        st.header("Filter Inventory")
        st.text_input("Your Name", key='user_name')
        country = st.selectbox("Country of Port", options=list(PORTS_BY_COUNTRY.keys()), key='country')
        port = st.selectbox("Port", options=PORTS_BY_COUNTRY[country], key='port')
        term = st.radio("Price Term", PRICE_TERMS, key='term')
        maker = st.selectbox("Maker", options=["All"]+list(CAR_MAKERS_AND_MODELS.keys()), key='maker')
        model = st.selectbox("Model", options=["All"]+(CAR_MAKERS_AND_MODELS.get(st.session_state.maker, []) if st.session_state.maker!="All" else []), key='model')
        pr_min, pr_max = int(inventory['price'].min()), int(inventory['price'].max())
        st.slider("Price Range", pr_min, pr_max, (pr_min, pr_max), key='price_range')
        m_max = int(inventory['mileage'].max())
        st.slider("Max Mileage", 0, m_max, m_max, key='mileage')

    # Apply filters
    df = inventory.copy()
    if st.session_state.maker != "All": df = df[df['make']==st.session_state.maker]
    if st.session_state.model != "All": df = df[df['model']==st.session_state.model]
    low, high = st.session_state.price_range
    df = df[df['price'].between(low, high)]
    df = df[df['mileage']<=st.session_state.mileage]

    # Display cards
    for car in df.to_dict('records'):
        st.markdown('---')
        render_car_card(car, st.session_state.term)

if __name__ == '__main__':
    try:
        main()
    except Exception:
        st.error("An unexpected error occurred, see logs.")
        traceback.print_exc()

# End of script
