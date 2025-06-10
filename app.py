# app.py (Final Test Version)

import streamlit as st
import pandas as pd
import random
from datetime import datetime
import os
import traceback

# --- SECTION 1: CONSTANTS (Simplified for testing) ---
PAGE_TITLE = "Otoz.ai - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'Inventory Agasta.csv' # Will be ignored as we generate data
MILEAGE_RANGE = (5_000, 150_000)
CAR_MAKERS_AND_MODELS = {
    "Toyota": ["Aqua", "Vitz", "Corolla", "Prius"],
    "Honda": ["Fit", "Vezel", "CR-V"],
    "BMW": ["X1", "X3"]
}
CAR_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red']

# --- SECTION 2: CORE FUNCTIONS ---

# NOTE: @st.cache_data is intentionally removed for this test to prevent caching issues.
def load_inventory():
    """Generates a SMALL, lightweight sample DataFrame to guarantee a fast start."""
    try:
        car_data = []
        current_year = datetime.now().year
        for make, models in CAR_MAKERS_AND_MODELS.items():
            for model in models:
                for _ in range(random.randint(2, 3)):
                    year = random.randint(current_year - 8, current_year - 1)
                    price = int(2_000_000 * (0.85 ** (current_year - year)) * random.uniform(0.9, 1.1))
                    car_data.append({'make': make, 'model': model, 'year': year, 'price': max(300_000, price)})
        df = pd.DataFrame(car_data)
        
        # Add basic default columns
        df['mileage'] = [random.randint(*MILEAGE_RANGE) for _ in range(len(df))]
        df['color'] = [random.choice(CAR_COLORS) for _ in range(len(df))]
        df.reset_index(drop=True, inplace=True)
        df['id'] = [f"VID{i:04d}" for i in df.index]
        return df
    except Exception as e:
        st.error(f"A fatal error occurred in `load_inventory`: {e}")
        st.code(traceback.format_exc())
        return pd.DataFrame()

# --- SECTION 3: MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")
    
    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    st.success("Welcome! This is the minimal test version of the application.")

    # Initialize session state
    if 'current_car_index' not in st.session_state:
        st.session_state.current_car_index = 0

    inventory = load_inventory()

    if inventory.empty:
        st.error("Critical Error: Inventory data could not be loaded.")
        return

    st.info(f"Successfully loaded a sample inventory of {len(inventory)} vehicles.")

    # Display the first car
    current_car = inventory.iloc[st.session_state.current_car_index]
    
    st.markdown("---")
    st.header(f"{current_car['year']} {current_car['make']} {current_car['model']}")
    st.write(f"Price: ¥{current_car['price']:,}")
    st.write(f"Color: {current_car['color']}")
    
    if st.button("Click here to test interactivity"):
        st.balloons()
        st.write("Interactivity test passed!")

# --- SECTION 4: SCRIPT ENTRY POINT ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A critical top-level error occurred.")
        st.error(f"Error Type: {type(e).__name__}")
        st.error(f"Error Details: {e}")
        st.code(traceback.format_exc())
