import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import io
import requests
from bs4 import BeautifulSoup

# --- CONFIGURATION & CONSTANTS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'
PORTS = ['Tokyo', 'Yokohama', 'Osaka', 'Kobe', 'Nagoya']
PRICE_TYPES = ['FOB', 'C&F', 'CIF']

# --- CACHE DATA LOADING ---
@st.cache_data
def load_inventory(path: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(path)
    except Exception as e:
        st.error(f"Error loading inventory: {e}")
        return pd.DataFrame()
    for col in ['id', 'make', 'model', 'year', 'price', 'mileage']:
        if col not in df.columns:
            df[col] = None
    if 'image_urls' not in df.columns:
        if 'image_url' in df.columns:
            df['image_urls'] = df['image_url'].fillna('').apply(lambda x: [x] if x else [])
        else:
            df['image_urls'] = [[] for _ in range(len(df))]
    return df

# --- MARKET DATA SCRAPING ---
@st.cache_data
def fetch_market_prices(make: str, model: str) -> pd.Series:
    """Scrape 6-month price data from beforward.jp"""
    try:
        # Placeholder URL, actual scraping logic may vary
        url = f"https://www.beforward.jp/catalog/{make}/{model}/"
        resp = requests.get(url)
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Parse dates and prices; dummy example below
        dates = pd.date_range(end=pd.Timestamp.today(), periods=6, freq='M')
        prices = pd.Series([1000000 + i*50000 for i in range(6)], index=dates)
        return prices
    except Exception:
        return pd.Series()

# --- PRICE BREAKDOWN CALCULATION ---
def calculate_breakdown(base: float, price_type: str, land: float, freight: float) -> dict:
    breakdown = {'Base Price': base, 'Land Transport': land}
    if price_type in ['C&F', 'CIF']:
        breakdown['Freight'] = freight
    if price_type == 'CIF':
        breakdown['Insurance'] = base * 0.01
    total = sum(breakdown.values())
    breakdown['Grand Total'] = total
    return breakdown

# --- RENDERING FUNCTIONS ---

def show_price_trend(prices: pd.Series):
    fig, ax = plt.subplots()
    prices.plot(ax=ax)
    ax.set_ylabel('Price')
    ax.set_xlabel('Date')
    ax.set_title('6-Month Market Price Trend')
    st.pyplot(fig)


def render_car_card(car: dict, selected_port: str, price_type: str):
    imgs = car.get('image_urls', [])
    if imgs:
        cols = st.columns(min(len(imgs), 3))
        for col, img in zip(cols, imgs):
            col.image(img, use_column_width=True)
    else:
        st.image("https://placehold.co/600x400?text=No+Image", use_column_width=True)

    st.markdown(f"### {car['year']} {car['make']} {car['model']}")
    base = car['price']
    # Example fixed fees; in reality these could be dynamic
    land_fee = 30000
    freight_fee = 300000
    breakdown = calculate_breakdown(base, price_type, land_fee, freight_fee)

    for k, v in breakdown.items():
        st.markdown(f"**{k}:** ¥{int(v):,}")

    st.markdown(f"**Mileage:** {car['mileage']:,} km")

    with st.expander("Market Comparison"):
        market_prices = fetch_market_prices(car['make'], car['model'])
        if not market_prices.empty:
            show_price_trend(market_prices)
        else:
            st.write("Market data not available.")

    offer = st.number_input("Your offer:", min_value=0, step=100000, key=f"offer_{car['id']}")
    if st.button("Make Offer", key=f"btn_{car['id']}"):
        st.session_state.setdefault('offers', {})
        st.session_state['offers'][car['id']] = offer
        st.success(f"Offer of ¥{offer:,} submitted for car {car['id']}")

    if car['id'] in st.session_state.get('offers', {}):
        agreed = st.session_state['offers'][car['id']]
        if st.button("Confirm Deal & Generate Invoice", key=f"confirm_{car['id']}"):
            invoice_html = generate_html_invoice(car, agreed, breakdown)
            st.download_button(
                label="Download Invoice (HTML)",
                data=invoice_html.encode('utf-8'),
                file_name=f"invoice_car_{car['id']}.html",
                mime='text/html'
            )

# --- INVOICE GENERATION ---
def generate_html_invoice(car: dict, price: float, breakdown: dict) -> str:
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    rows = "".join(f"<tr><th>{k}</th><td>¥{int(v):,}</td></tr>" for k, v in breakdown.items())
    return f"""
<html>
<head><style>body{{font-family:Arial;}}table{{width:100%;border-collapse:collapse;}}th,td{{border:1px solid #ddd;padding:8px;}}th{{background:#f2f2f2;}}</style></head>
<body>
<h1>Invoice</h1><p>{now}</p>
<h2>Seller</h2><p>Otoz.ai<br>Tokyo</p>
<h2>Buyer</h2><p>{st.session_state.get('user_name','Customer')}</p>
<h2>Car Details</h2><table>{rows}</table>
</body>
</html>
"""

# --- MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout='wide')
    st.title(PAGE_TITLE)

    with st.sidebar:
        st.header("User & Filters")
        st.session_state['user_name'] = st.text_input("Your Name", value=st.session_state.get('user_name',''))
        st.selectbox("Select Port", options=PORTS, key='port')
        st.radio("Price Type", options=PRICE_TYPES, key='price_type')
        df = load_inventory(INVENTORY_FILE_PATH)
        makes = sorted(df['make'].dropna().unique())
        st.selectbox("Make", ["All"]+makes, key='make')
        models = sorted(df['model'].dropna().unique())
        st.selectbox("Model", ["All"]+models, key='model')
        pr_min, pr_max = int(df['price'].min()), int(df['price'].max())
        st.slider("Price Range", pr_min, pr_max, (pr_min, pr_max), key='price_range')
        m_max = int(df['mileage'].max())
        st.slider("Max Mileage", 0, m_max, m_max, key='mileage')

    df = load_inventory(INVENTORY_FILE_PATH)
    filtered = df.copy()
    if st.session_state.make != "All": filtered = filtered[filtered['make']==st.session_state.make]
    if st.session_state.model != "All": filtered = filtered[filtered['model']==st.session_state.model]
    low, high = st.session_state.price_range
    filtered = filtered[(filtered['price']>=low)&(filtered['price']<=high)]
    filtered = filtered[filtered['mileage']<=st.session_state.mileage]

    for car in filtered.to_dict('records'):
        st.markdown("---")
        render_car_card(car, st.session_state.port, st.session_state.price_type)

if __name__ == '__main__':
    main()

# End of app.py script
