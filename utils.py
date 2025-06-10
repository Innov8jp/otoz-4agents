# utils.py

import streamlit as st
import pandas as pd
import random
import os
import logging
from datetime import datetime
from config import * # Import all constants from our new config file

# NOTE: fpdf library is no longer needed

# --- DATA LOADING ---
@st.cache_data
def load_inventory():
    try:
        df = None
        if os.path.exists(INVENTORY_FILE_PATH):
            try:
                df_from_file = pd.read_csv(INVENTORY_FILE_PATH)
                if not df_from_file.empty:
                    required_columns = ['make', 'model', 'year', 'price']
                    if all(col in df_from_file.columns for col in required_columns):
                        df = df_from_file
                    else: logging.warning("CSV is missing required columns. Generating sample data.")
                else: logging.warning("Inventory CSV file is empty. Generating sample data.")
            except Exception as read_error:
                logging.error(f"Could not read CSV file: {read_error}. Generating sample data.")
        if df is None:
            car_data = []
            current_year = datetime.now().year
            for make, models in CAR_MAKERS_AND_MODELS.items():
                for model in models:
                    for _ in range(random.randint(2, 3)):
                        year = random.randint(current_year - 8, current_year - 1)
                        base_price_factor = 3_000_000 if make in ["Mercedes-Benz", "BMW"] else 1_500_000
                        price = int(base_price_factor * (0.85 ** (current_year - year)) * random.uniform(0.9, 1.1))
                        car_data.append({'make': make, 'model': model, 'year': year, 'price': max(300_000, price)})
            df = pd.DataFrame(car_data)
        defaults = {
            'mileage': lambda: random.randint(*MILEAGE_RANGE), 'location': lambda: random.choice(list(PORTS_BY_COUNTRY.keys())),
            'fuel': 'Gasoline', 'transmission': lambda: random.choice(["Automatic", "Manual"]),
            'color': lambda: random.choice(CAR_COLORS), 'grade': lambda: random.choice(["4.5", "4.0", "3.5", "R"])
        }
        for col, default in defaults.items():
            if col not in df.columns:
                df[col] = [default() if callable(default) else default for _ in range(len(df))]
        df.reset_index(drop=True, inplace=True)
        df['image_url'] = [f"https://placehold.co/600x400/grey/white?text={r.make}+{r.model}" for r in df.itertuples()]
        df['id'] = [f"VID{i:04d}" for i in df.index]
        return df
    except Exception as e:
        logging.error(f"FATAL: Error during inventory loading: {e}"); st.error(f"A fatal error occurred while preparing inventory data: {e}"); return pd.DataFrame()

# --- HELPER FUNCTIONS ---
def calculate_total_price(base_price, option):
    breakdown = {'base_price': base_price, 'domestic_transport': 0, 'freight_cost': 0, 'insurance': 0}
    if option in ["FOB", "C&F", "CIF"]: breakdown['domestic_transport'] = DOMESTIC_TRANSPORT
    if option in ["C&F", "CIF"]: breakdown['freight_cost'] = FREIGHT_COST
    if option == "CIF":
        cost_and_freight = base_price + breakdown['freight_cost']
        breakdown['insurance'] = cost_and_freight * INSURANCE_RATE
    breakdown['total_price'] = sum(breakdown.values())
    return breakdown

### NEW: HTML Invoice Generator ###
def generate_html_invoice(car, customer_info, shipping_option):
    """Generates a professional-looking HTML string for the invoice."""
    price_breakdown = calculate_total_price(car['price'], shipping_option)
    
    # Using f-string with triple quotes to build the HTML document
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        .invoice-box {{ max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }}
        .header {{ text-align: center; margin-bottom: 40px; }}
        .header h1 {{ margin: 0; }}
        .details-table {{ width: 100%; line-height: inherit; text-align: left; }}
        .details-table td {{ padding: 5px; vertical-align: top; }}
        .details-table .right {{ text-align: right; }}
        .section-header {{ background-color: #f2f2f2; padding: 10px; font-weight: bold; margin-top: 20px; }}
        .pricing-table {{ width: 100%; line-height: inherit; text-align: left; margin-top: 20px;}}
        .pricing-table td {{ padding: 5px; vertical-align: top; border-bottom: 1px solid #eee;}}
        .pricing-table .total td {{ border-bottom: none; font-weight: bold; font-size: 1.2em; }}
    </style>
    </head>
    <body>
    <div class="invoice-box">
        <div class="header">
            <h1>Proforma Invoice</h1>
            <p>Date: {datetime.now().strftime('%B %d, %Y')}</p>
        </div>

        <table class="details-table">
            <tr>
                <td>
                    <strong>Seller Information:</strong><br>
                    {SELLER_INFO['name']}<br>
                    {SELLER_INFO['address']}<br>
                    {SELLER_INFO['email']}
                </td>
                <td class="right">
                    <strong>Customer Information:</strong><br>
                    {customer_info.get('name', 'N/A')}<br>
                    {customer_info.get('email', 'N/A')}<br>
                    Destination: {customer_info.get('port_of_discharge', 'N/A')}, {customer_info.get('country', 'N/A')}
                </td>
            </tr>
        </table>

        <div class="section-header">Vehicle Details</div>
        <table class="details-table">
            <tr><td><strong>Vehicle:</strong></td><td>{car['year']} {car['make']} {car['model']}</td></tr>
            <tr><td><strong>Stock ID:</strong></td><td>{car.get('id', 'N/A')}</td></tr>
            <tr><td><strong>Color:</strong></td><td>{car.get('color', 'N/A')}</td></tr>
            <tr><td><strong>Mileage:</strong></td><td>{car.get('mileage', 0):,} km</td></tr>
        </table>
        
        <div class="section-header">Price Breakdown ({shipping_option})</div>
        <table class="pricing-table">
            {''.join([f"<tr><td>{key.replace('_', ' ').capitalize()}</td><td class='right'>¥{int(value):,}</td></tr>" for key, value in price_breakdown.items() if value > 0 and key != 'total_price'])}
            <tr class="total">
                <td>Total Price</td>
                <td class="right">¥{int(price_breakdown['total_price']):,}</td>
            </tr>
        </table>
    </div>
    </body>
    </html>
    """
    return html

### UPDATED: Chatbot brain now handles HTML invoice generation ###
def get_bot_response(user_input: str):
    lowered_input = user_input.lower()
    customer_info = st.session_state.get('customer_info', {})
    car_details = st.session_state.get('car_in_chat', {})
    car_name = f"{car_details.get('year', '')} {car_details.get('make', '')} {car_details.get('model', '')}"

    if any(keyword in lowered_input for keyword in ["another car", "start over", "change car", "go back"]):
        st.session_state.offer_placed = False
        st.session_state.chat_messages = []; st.session_state.car_in_chat = {}
        st.rerun()
    if not customer_info.get("country"):
        return "I see we haven't confirmed your destination. To which country will you be shipping the vehicle?"
    if not customer_info.get("port_of_discharge"):
        return f"Thanks! And which port in {customer_info.get('country')} will be the port of discharge?"
    
    # --- New Invoice Logic ---
    if "invoice" in lowered_input:
        st.session_state.invoice_request_pending = True
        return "Absolutely. I can prepare the proforma invoice. To confirm, are you ready to proceed with the purchase at the displayed price?"
    if any(keyword in lowered_input for keyword in ["yes", "proceed", "confirm", "i agree"]) and st.session_state.get('invoice_request_pending'):
        st.session_state.generate_invoice_request = True
        st.session_state.invoice_request_pending = False # Reset the flag
        return "Excellent! I am preparing your invoice below. You can print the page or save it as a PDF using your browser's print function (Ctrl+P or Cmd+P)."
    
    # Reset pending flag if user asks something else
    st.session_state.invoice_request_pending = False
    
    if any(keyword in lowered_input for keyword in ["payment", "pay", "bank"]):
        return "We accept wire transfers to our corporate bank account in Tokyo. The full details will be on the proforma invoice."
    if any(keyword in lowered_input for keyword in ["price", "discount", "negotiate", "offer"]):
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option'))
        total_price = f"{int(price_breakdown['total_price']):,}"
        return f"The current total price is ¥{total_price} {st.session_state.get('shipping_option')}. Our prices are competitive, but feel free to state your best offer for our sales team to review."
    return "That's a great question. I am forwarding it to a human sales representative who will get back to you shortly."
