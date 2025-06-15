import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

# -----------------------------
# Page Configuration
# -----------------------------
st.set_page_config(
    page_title="Otoz.ai Concierge",
    page_icon="🚗",
    layout="wide"
)

st.title("🚗 Otoz.ai – Cross-Border Car Concierge")

# -----------------------------
# Load Data
# -----------------------------
inventory = pd.read_csv("data/inventory.csv")
ports = pd.read_csv("data/ports.csv")
market_prices = pd.read_csv("data/market_prices.csv")

# -----------------------------
# Sidebar Filters
# -----------------------------
st.sidebar.header("🔍 Search Preferences")

make_options = inventory["make"].unique()
selected_make = st.sidebar.selectbox("Car Make", make_options)

model_options = inventory[inventory["make"] == selected_make]["model"].unique()
selected_model = st.sidebar.selectbox("Model", model_options)

year = st.sidebar.slider("Minimum Year", 2015, 2022, 2018)

countries = ports["country"].unique()
selected_country = st.sidebar.selectbox("Destination Country", countries)

available_ports = ports[ports["country"] == selected_country]["port"]
selected_port = st.sidebar.selectbox("Destination Port", available_ports)

st.sidebar.markdown("---")
st.sidebar.info("Selected car + port data will help finalize your quote.")

# -----------------------------
# Filtered Car Listings
# -----------------------------
filtered_cars = inventory[
    (inventory["make"] == selected_make) &
    (inventory["model"] == selected_model) &
    (inventory["year"] >= year)
]

st.subheader(f"🔎 Showing {len(filtered_cars)} Matching Cars")

# -----------------------------
# Price Calculator
# -----------------------------
def calculate_prices(base_price):
    fob = base_price + 150
    cf = fob + 2000
    cif = cf + (base_price * 0.02)
    return round(fob, 2), round(cf, 2), round(cif, 2)

# -----------------------------
# Show Cars
# -----------------------------
for i, row in filtered_cars.iterrows():
    with st.container():
        st.markdown("---")
        cols = st.columns([1, 2])
        with cols[0]:
            st.image(row["image_url"], width=250)
        with cols[1]:
            st.markdown(f"**{row['year']} {row['make']} {row['model']}**")
            st.write(f"📍 Location: {row['location']}")
            fob, cf, cif = calculate_prices(row["price"])
            st.write(f"💰 FOB: ${fob}")
            st.write(f"🚢 C&F: ${cf}")
            st.write(f"🛡️ CIF: ${cif}")
            with st.expander("📈 Market Price Trend"):
                trend = market_prices[
                    (market_prices["make"] == row["make"]) &
                    (market_prices["model"] == row["model"])
                ]
                fig, ax = plt.subplots()
                ax.plot(trend["month"], trend["price"], marker="o")
                ax.set_title(f"{row['make']} {row['model']} Price Trend")
                ax.set_xlabel("Month")
                ax.set_ylabel("Price (USD)")
                st.pyplot(fig)

        btn_cols = st.columns([1, 1])
        if btn_cols[0].button("❤️ Like", key=f"like_{i}"):
            st.success("Agent A will start negotiation soon...")
        if btn_cols[1].button("❌ Pass", key=f"pass_{i}"):
            st.info("Skipping this car.")

# -----------------------------
# Footer
# -----------------------------
st.markdown("---")
st.caption("Powered by Otoz.ai – Your Global Car Concierge")
