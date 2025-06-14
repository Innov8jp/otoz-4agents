# utils.py
# This is your "toolbox" with all the helper functions and logic.

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime
from config import *
import json
import re
from difflib import get_close_matches

@st.cache_data
def load_data(file_path):
    if not os.path.exists(file_path):
        st.error(f"Required data file not found: `{file_path}`.")
        return None
    try:
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            if 'image_url' not in df.columns:
                df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
            if 'id' not in df.columns:
                df.reset_index(inplace=True)
                df['id'] = [f"VID{i:04d}" for i in df['index']]
            return df
        elif file_path.endswith('.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        st.error(f"Error loading data from `{file_path}`: {e}")
        return None

class default_map(dict):
    def __missing__(self, key):
        return f'{{{key}}}'

def get_bot_response(user_input: str):
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data: return "Error: Could not load chatbot training data."
    
    lowered_input = user_input.lower()
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    tag = pattern_to_tag[matches[0]] if matches else None

    # --- Action Engine ---
    if tag == 'find_car':
        active_filters = st.session_state.active_filters.copy()
        updated = False
        for make in CAR_MAKERS_AND_MODELS.keys():
            if make.lower() in lowered_input:
                active_filters['make'] = make; updated = True
        year_match = re.search(r'\b(20\d{2})\b', user_input)
        if year_match:
            year = int(year_match.group(1))
            active_filters['year_min'] = year; active_filters['year_max'] = year; active_filters['year_range'] = (year, year); updated = True
        if updated:
            st.session_state.active_filters = active_filters
            st.session_state.current_car_index = 0; st.rerun()

    # --- Response Generation ---
    response_text = "I'm sorry, I don't quite understand. A human sales agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    
    # --- Placeholder Replacement ---
    if '{' in response_text:
        format_map = default_map({})
        response_text = response_text.format_map(format_map)
        
    return response_text
