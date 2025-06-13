# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (v7 - All Features Included)
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
PAGE_TITLE = "Meet Sparky - Our Ai Transcation Manager"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
INTENTS_FILE_PATH = 'intents_extended_50.json'
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
    "Nissan": ["Note", "Serena", "X-Trail", "Leaf", "Skyline", "March", "J
