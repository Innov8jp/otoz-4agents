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
from difflib import get_close_matches  
import json  
import re  
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
            hist.append({'id': r['id'], 'make':r['make'],'model':r['model'],'date':dt,'avg_price':price})  
    return pd.DataFrame(hist)  

# --- SECTION
