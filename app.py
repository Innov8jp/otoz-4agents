# ==============================================================================  
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Fixed Expander & Dynamic Ports)  
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

# --- SECTION 2: GLOBAL SETTINGS ---  
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
            hist.append({'make':r['make'],'model':r['model'],'date':dt,'avg_price':price})  
    return pd.DataFrame(hist)  

# --- SECTION 4: INTENTS LOADING ---  
@st.cache_data  
def load_intents(path):  
    try:  
        with open(path,'r',encoding='utf-8') as f:  
            return json.load(f).get('intents',[])  
    except Exception:  
        return []  

# --- SECTION 5: PRICE BREAKDOWN & INVOICE ---  
def calculate_total_price(base,opt):  
    bd = {'base_price':base,'domestic_transport':0,'freight_cost':0,'insurance':0}  
    if opt in ['FOB','C&F','CIF']: bd['domestic_transport'] = DOMESTIC_TRANSPORT  
    if opt in ['C&F','CIF']: bd['freight_cost'] = FREIGHT_COST  
    if opt == 'CIF': bd['insurance'] = (base + bd['freight_cost']) * INSURANCE_RATE  
    bd['total_price'] = sum(bd.values())  
    return bd  

def generate_invoice_html(cust,car,bd):  
    rows = f"<tr><td>{car['year']} {car['make']} {car['model']}</td><td>{bd['base_price']:,}</td></tr>"  
    if bd['domestic_transport']: rows += f"<tr><td>Domestic Transport</td><td>{bd['domestic_transport']:,}</td></tr>"  
    if bd['freight_cost']: rows += f"<tr><td>Freight Cost</td><td>{bd['freight_cost']:,}</td></tr>"  
    if bd['insurance']: rows += f"<tr><td>Insurance</td><td>{int(bd['insurance']):,}</td></tr>"  
    rows += f"<tr><td><strong>Total</strong></td><td><strong>{bd['total_price']:,}</strong></td></tr>"  
    return ("<html><body>"
            f"<h2>Invoice</h2><p>Date: {datetime.now().date()}</p>"
            f"<p>Customer: {cust['name']} &lt;{cust['email']}&gt;</p>"
            f"<table border='1'><tr><th>Item</th><th>Amount (JPY)</th></tr>{rows}</table>"
            "</body></html>")  

# --- SECTION 6: CHATBOT LOGIC ---  
def get_bot_response(inp):  
    # Invoice trigger  
    if 'i agree' in inp.lower():  
        car = st.session_state['car_in_chat']  
        bd = calculate_total_price(car['price'], st.session_state['shipping_option'])  
        return generate_invoice_html(st.session_state['customer_info'],car,bd)  
    intents = st.session_state.get('intents_data',[])  
    if not intents:  
        return "I'm sorry, chat data unavailable."  
    mapping = {p.lower():it['tag'] for it in intents for p in it.get('patterns',[])}  
    match = get_close_matches(inp.lower(), list(mapping), n=1, cutoff=0.5)  
    resp = "Sorry, didn't understand."  
    if match:  
        tag = mapping[match[0]]  
        for it in intents:  
            if it['tag'] == tag: resp = random.choice(it['responses']); break  
    return resp  

# --- SECTION 7: UI FUNCTIONS ---  
def user_info_form():  
    with st.sidebar:  
        st.header("Your Information")  
        ci = st.session_state['customer_info']  
        name = st.text_input("Name", ci.get('name',''))  
        email = st.text_input("Email", ci.get('email',''))  
        phone = st.text_input("Phone", ci.get('phone',''))  
        country = st.selectbox("Country", [""]+sorted(PORTS_BY_COUNTRY), index=0)  
        ports = PORTS_BY_COUNTRY.get(country,[])  
        port = st.selectbox("Port of Discharge", [""]+ports, index=0)  
        if st.button("Save Info", use_container_width=True):  
            st.session_state['customer_info'] = {'name':name,'email':email,'phone':phone,'country':country,'port_of_discharge':port}  
            st.success("Details saved.")  

def car_filters_form(inv):  
    with st.sidebar:  
        st.header("Filters")  
        with st.form("filters"):  
            makes = ["All"] + sorted(inv['make'].unique())  
            sel_make = st.selectbox("Make", makes)  
            models = ["All"] + (sorted(inv[inv['make']==sel_make]['model'].unique()) if sel_make!='All' else [])  
            sel_model = st.selectbox("Model", models)  
            min_y, max_y = int(inv['year'].min()), int(inv['year'].max())  
            sel_year_range = st.slider("Year", min_y, max_y, (min_y, max_y))  
            if st.form_submit_button("Apply Filters"):  
                st.session_state['active_filters'] = {'make':sel_make,'model':sel_model,'year_range':sel_year_range}  
                st.session_state['current_car_index'] = 0  
                st.experimental_rerun()  

# --- SECTION 8: DISPLAY FUNCTIONS ---  
def display_car_card(car,opt):  
    bd = calculate_total_price(car['price'],opt)  
    c1,c2 = st.columns([1,2])  
    with c1: st.image(car['image_url'], use_column_width=True)  
    with c2:  
        st.subheader(f"{car['year']} {car['make']} {car['model']}")  
        st.write(f"**Price:** ¥{car['price']:,}")  
        st.success(f"Total ({opt}): ¥{bd['total_price']:,}")  

def display_market_data_chart(hist,make,model):  
    df = hist[(hist['make']==make)&(hist['model']==model)]  
    if df.empty: return  
    # checkbox to toggle chart visibility  
    if st.checkbox("Show 6-Month Price Trend", key=f"chart_toggle_{make}_{model}"):  
        chart = alt.Chart(df).mark_line(point=True).encode(  
            x='date:T', y='avg_price:Q', tooltip=['date','avg_price']  
        ).properties(title=f"6-Month Trend for {make} {model}")  
        st.altair_chart(chart, use_container_width=True)  

# --- SECTION 9: MAIN --- ---  
def main():  
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout='wide')  
    # init state  
    defaults = {'current_car_index':0,'customer_info':{},'active_filters':{},'offer_placed':False,'chat_messages':[],'car_in_chat':{},'shipping_option':'FOB'}  
    for k,v in defaults.items(): st.session_state.setdefault(k,v)  
    # load intents  
    st.session_state['intents_data'] = load_intents(INTENTS_FILE_PATH)  

    inv = load_data(INVENTORY_FILE_PATH)  
    if inv is None or inv.empty:  
        st.error("No inventory."); return  
    hist = simulate_price_history(inv)  

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")  
    user_info_form()  
    car_filters_form(inv)  

    # apply filters  
    df = inv.copy()  
    af = st.session_state['active_filters']  
    if af and af.get('make')!='All': df = df[df['make']==af['make']]  
    if af and af.get('model')!='All': df = df[df['model']==af['model']]  
    if af and 'year_range' in af:  
        y0,y1 = af['year_range']; df = df[df['year'].between(y0,y1)]  
    if df.empty:  
        st.warning("No match."); return  

    idx = st.session_state['current_car_index'] % len(df)  
    car = df.iloc[idx].to_dict()  
    st.session_state['shipping_option'] = st.radio("Shipping Option", ['FOB','C&F','CIF'], index=['FOB','C&F','CIF'].index(st.session_state['shipping_option']), horizontal=True)  

    display_car_card(car, st.session_state['shipping_option'])  
    display_market_data_chart(hist, car['make'], car['model'])  

    c1, c2 = st.columns(2)  
    with c1:  
        if st.button("❤️ Place Offer", use_container_width=True):  
            if not all(st.session_state['customer_info'].values()):  
                st.error("Complete your info")  
            else:  
                st.session_state['offer_placed'] = True  
                st.session_state['car_in_chat'] = car  
                inv_html = generate_invoice_html(st.session_state['customer_info'], car, calculate_total_price(car['price'], st.session_state['shipping_option']))  
                st.markdown(inv_html, unsafe_allow_html=True)  
                st.download_button("Download Invoice", inv_html, file_name="invoice.html", mime="text/html")  
    with c2:  
        if st.button("❌ Next Vehicle", use_container_width=True):  
            st.session_state['current_car_index'] += 1  
            st.experimental_rerun()  

    if st.session_state['offer_placed']:  
        st.subheader("💬 Chat with our Sales Team")  
        for m in st.session_state['chat_messages']:  
            with st.chat_message(m['role']): st.write(m['content'])  
        if prompt := st.chat_input("Ask a question...!"):  
            st.session_state['chat_messages'].append({'role':'user','content':prompt})  
            resp = get_bot_response(prompt)  
            if resp.startswith('<html>'):  
                st.markdown(resp, unsafe_allow_html=True)  
            else:  
                st.write(resp)  
            st.session_state['chat_messages'].append({'role':'assistant','content':resp})  
            st.experimental_rerun()  

# --- SCRIPT ENTRY POINT ---  
if __name__ == "__main__":  
    try:  
        main()  
    except Exception as e:  
        st.error("Critical error")  
        st.code(traceback.format_exc())  

# --- END OF SCRIPT ---
