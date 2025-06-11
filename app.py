import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import io

# --- CONFIGURATION & CONSTANTS ---
PAGE_TITLE = "Sparky - AI Sales Assistant"
PAGE_ICON = "🚗"
INVENTORY_FILE_PATH = 'inventory.csv'

# --- CACHE DATA LOADING ---
@st.cache_data
def load_inventory(path: str) -> pd.DataFrame:
    """
    Load inventory data from CSV. Expects columns: id, make, model, year, price, mileage, image_url or image_urls
    """
    try:
        df = pd.read_csv(path)
    except Exception as e:
        st.error(f"Error loading inventory: {e}")
        return pd.DataFrame()
    # Ensure required columns
    for col in ['id', 'make', 'model', 'year', 'price', 'mileage']:
        if col not in df.columns:
            df[col] = None
    # Normalize image fields
    if 'image_urls' not in df.columns:
        # If single image_url exists, convert to list
        if 'image_url' in df.columns:
            df['image_urls'] = df['image_url'].fillna('').apply(lambda x: [x] if x else [])
        else:
            df['image_urls'] = [[] for _ in range(len(df))]
    return df

# --- RENDERING FUNCTIONS ---
def show_price_trend(prices: pd.Series):
    """Render a 6-month price trend chart."""
    fig, ax = plt.subplots()
    prices.plot(ax=ax)
    ax.set_ylabel('Price')
    ax.set_xlabel('Date')
    ax.set_title('6-Month Price Trend')
    st.pyplot(fig)


def render_car_card(car: dict):
    """Render a car card with multiple images, details, price trend toggle, and negotiation flow."""
    # Display multiple images if available
    imgs = car.get('image_urls', [])
    if imgs:
        cols = st.columns(len(imgs))
        for col, img_url in zip(cols, imgs):
            col.image(img_url, use_column_width=True)
    else:
        st.image("https://placehold.co/600x400?text=No+Image", use_column_width=True)

    st.markdown(f"### {car['year']} {car['make']} {car['model']}")
    st.markdown(f"**Price:** ¥{car['price']:,}")
    st.markdown(f"**Mileage:** {car['mileage']:,} km")

    with st.expander("Market Comparison"):
        st.write("Placeholder for market comparison details.")

    # Price trend toggle
    if st.checkbox("Show price trend", key=f"trend_{car['id']}"):
        dates = pd.date_range(end=pd.Timestamp.today(), periods=6, freq='M')
        dummy_prices = pd.Series([car['price'] * (1 + i * 0.01) for i in range(6)], index=dates)
        show_price_trend(dummy_prices)

    # Negotiation flow
    offer = st.number_input("Your offer:", min_value=0, step=100000, key=f"offer_{car['id']}")
    if st.button("Make Offer", key=f"btn_{car['id']}"):
        st.session_state.setdefault('offers', {})
        st.session_state['offers'][car['id']] = offer
        st.success(f"Offer of ¥{offer:,} submitted for car {car['id']}")

    # Invoice generation
    if car['id'] in st.session_state.get('offers', {}):
        agreed = st.session_state['offers'][car['id']]
        if st.button("Confirm Deal & Generate Invoice", key=f"confirm_{car['id']}"):
            invoice_html = generate_html_invoice(car, agreed)
            b = invoice_html.encode('utf-8')
            st.download_button(
                label="Download Invoice (HTML)",
                data=b,
                file_name=f"invoice_car_{car['id']}.html",
                mime='text/html'
            )

# --- INVOICE GENERATION ---
def generate_html_invoice(car: dict, price: float) -> str:
    """Generate styled HTML invoice for a confirmed deal."""
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    html = f"""
    <html>
    <head>
      <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; }}
        .header {{ text-align: center; margin-bottom: 40px; }}
        .section {{ margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; }}
        th {{ background-color: #f2f2f2; }}
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Invoice</h1>
        <p>{now}</p>
      </div>
      <div class="section">
        <h2>Seller Information</h2>
        <p>Otoz.ai<br>1-chōme-9-1 Akasaka, Minato City, Tokyo<br>sales@otoz.ai</p>
      </div>
      <div class="section">
        <h2>Buyer Information</h2>
        <p>{st.session_state.get('user_name', 'Valued Customer')}</p>
      </div>
      <div class="section">
        <h2>Car Details</h2>
        <table>
          <tr><th>Make</th><td>{car['make']}</td></tr>
          <tr><th>Model</th><td>{car['model']}</td></tr>
          <tr><th>Year</th><td>{car['year']}</td></tr>
          <tr><th>Mileage</th><td>{car['mileage']:,} km</td></tr>
        </table>
      </div>
      <div class="section">
        <h2>Agreed Price</h2>
        <p>¥{price:,}</p>
      </div>
    </body>
    </html>
    """
    return html

# --- MAIN APPLICATION ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout='wide')
    st.title(PAGE_TITLE)

    with st.sidebar:
        st.header("User Settings")
        st.session_state['user_name'] = st.text_input("Your Name", value=st.session_state.get('user_name', ''))
        st.header("Filters")
        df = load_inventory(INVENTORY_FILE_PATH)
        makes = sorted(df['make'].dropna().unique())
        selected_make = st.selectbox("Make", options=["All"]+makes)
        models = sorted(df['model'].dropna().unique())
        selected_model = st.selectbox("Model", options=["All"]+models)
        min_price, max_price = int(df['price'].min()), int(df['price'].max())
        price_range = st.slider("Price Range", min_price, max_price, (min_price, max_price))
        max_mileage = int(df['mileage'].max())
        mileage_limit = st.slider("Max Mileage", 0, max_mileage, max_mileage)

    filtered = df.copy()
    if selected_make != "All": filtered = filtered[filtered['make']==selected_make]
    if selected_model != "All": filtered = filtered[filtered['model']==selected_model]
    filtered = filtered[(filtered['price']>=price_range[0])&(filtered['price']<=price_range[1])]
    filtered = filtered[filtered['mileage']<=mileage_limit]

    for car in filtered.to_dict('records'):
        st.markdown("---")
        render_car_card(car)

if __name__ == '__main__':
    main()

# End of app.py script
