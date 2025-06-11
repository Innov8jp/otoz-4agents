# ==============================================================================
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Fixed Expander, Dynamic Ports, Invoice Trigger)
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
PAGE_TITLE = "Sparky - AI Sales Assistant"
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

# --- SECTION 3: CORE HELPER FUNCTIONS ---
@st.cache_data
def load_data(file_path):
    if not os.path.exists(file_path):
        st.error(f"File not found: {file_path}")
        return None
    if file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
        if 'image_url' not in df:
            df['image_url'] = [f"https://placehold.co/600x400?text={r.make}+{r.model}" for r in df.itertuples()]
        if 'id' not in df.columns:
            df.reset_index(inplace=True)
            df['id'] = [f"VID{i:04d}" for i in df['index']]
        return df
    if file_path.endswith('.json'):
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

@st.cache_data
def simulate_price_history(df):
    hist = []
    today = pd.to_datetime(datetime.now())
    sample = df.head(50)
    for _, row in sample.iterrows():
        base = row['price']
        for m in range(1,7):
            date = today - DateOffset(months=m)
            price = int(base*(0.995**m)*(1+random.uniform(-0.05,0.05)))
            hist.append({'make': row['make'],'model':row['model'],'date':date,'avg_price':price})
    return pd.DataFrame(hist)


def calculate_total_price(base, opt):
    bd = {'base_price':base,'domestic_transport':0,'freight_cost':0,'insurance':0}
    if opt in ['FOB','C&F','CIF']: bd['domestic_transport']=DOMESTIC_TRANSPORT
    if opt in ['C&F','CIF']: bd['freight_cost']=FREIGHT_COST
    if opt=='CIF': bd['insurance']=(base+bd['freight_cost'])*INSURANCE_RATE
    bd['total_price'] = sum(bd.values())
    return bd


def generate_invoice_html(cust, car, bd):
    rows = f"""
      <tr><td>Vehicle {car['year']} {car['make']} {car['model']}</td><td>{bd['base_price']:,}</td></tr>
    """
    if bd['domestic_transport']:
        rows += f"<tr><td>Domestic Transport</td><td>{bd['domestic_transport']:,}</td></tr>"
    if bd['freight_cost']:
        rows += f"<tr><td>Freight</td><td>{bd['freight_cost']:,}</td></tr>"
    if bd['insurance']:
        rows += f"<tr><td>Insurance</td><td>{int(bd['insurance']):,}</td></tr>"
    rows += f"<tr><td><strong>Total</strong></td><td><strong>{bd['total_price']:,}</strong></td></tr>"
    return f"""
<html><body>
<h2>Invoice</h2>
<p>Date: {datetime.now().date()}</p>
<p>Customer: {cust['name']} &lt;{cust['email']}&gt;</p>
<table border='1' cellpadding='5'>
<tr><th>Item</th><th>Amount (JPY)</th></tr>
{rows}
</table>
</body></html>
"""


def get_bot_response(inp):
    # Generate invoice directly on agreement
    if "i agree" in inp.lower():
        car = st.session_state['car_in_chat']
        bd = calculate_total_price(car['price'], st.session_state['shipping_option'])
        cust = st.session_state['customer_info']
        html = generate_invoice_html(cust, car, bd)
        return html  # frontend will detect invoice HTML and render

    data = load_data(INTENTS_FILE_PATH)
    if not data:
        return "[Chatbot data unavailable]"
    patterns = {p.lower():i['tag'] for i in data['intents'] for p in i['patterns']}
    match = get_close_matches(inp.lower(), list(patterns),n=1,cutoff=0.5)
    resp = "Sorry, I didn't get that."
    if match:
        tag = patterns[match[0]]
        for intent in data['intents']:
            if intent['tag']==tag:
                resp = random.choice(intent['responses']); break
    return resp

# --- SECTION 4: UI COMPONENTS ---
def user_info_form():
    with st.sidebar:
        st.header("Your Information")
        ci = st.session_state['customer_info']
        name = st.text_input("Name", ci.get('name',''))
        email= st.text_input("Email", ci.get('email',''))
        phone= st.text_input("Phone",ci.get('phone',''))
        country= st.selectbox("Country", [None]+sorted(PORTS_BY_COUNTRY), index=([None]+sorted(PORTS_BY_COUNTRY)).index(ci.get('country',None)))
        ports=PORTS_BY_COUNTRY.get(country,[])
        port=st.selectbox("Port of Discharge",[None]+ports, index=([None]+ports).index(ci.get('port_of_discharge',None)))
        if st.button("Save Info",use_container_width=True):
            st.session_state['customer_info']={'name':name,'email':email,'phone':phone,'country':country,'port_of_discharge':port}
            st.success("Info saved")


def car_filters(inv):
    with st.sidebar:
        st.header("Filters")
        af=st.session_state['active_filters']
        with st.form("filt"):            
            makes=["All"]+sorted(inv['make'].unique())
            sm=st.selectbox("Make",makes,index=makes.index(af.get('make','All')))
            models=["All"]+(sorted(inv[inv['make']==sm]['model'].unique()) if sm!='All' else [])
            md=st.selectbox("Model",models,index=models.index(af.get('model','All')))
            yrs=(int(inv['year'].min()),int(inv['year'].max()))
            yr=st.slider("Year",yrs[0],yrs[1],af.get('year_range',yrs))
            if st.form_submit_button("Apply"):
                st.session_state['active_filters']={'make':sm,'model':md,'year_range':yr}
                st.session_state['current_car_index']=0
                st.experimental_rerun()

# --- SECTION 5: DISPLAY FUNCTIONS ---
def display_car_card(car,opt):
    bd=calculate_total_price(car['price'],opt)
    c1,c2=st.columns([1,2])
    with c1: st.image(car['image_url'],use_column_width=True)
    with c2:
        st.subheader(f"{car['year']} {car['make']} {car['model']}")
        st.write(f"**Price:** ¥{car['price']:,}")
        st.success(f"Total ({opt}): ¥{bd['total_price']:,}")


def display_market_data_chart(hist,make,model):
    df=hist[(hist['make']==make)&(hist['model']==model)]
    if df.empty: return
    with st.expander("6-Month Price Trend"):        
        ch=alt.Chart(df).mark_line(point=True).encode(x='date:T',y='avg_price:Q')
        st.altair_chart(ch,use_container_width=True)

# --- SECTION 6: MAIN ---
def main():
    st.set_page_config(page_title=PAGE_TITLE,page_icon=PAGE_ICON,layout='wide')
    # state init
    for k,v in {'current_car_index':0,'customer_info':{},'active_filters':{},'offer_placed':False,'chat_messages':[],'car_in_chat':{},'shipping_option':'FOB'}.items():
        st.session_state.setdefault(k,v)

    inv=load_data(INVENTORY_FILE_PATH)
    if inv is None or inv.empty: return
    hist=simulate_price_history(inv)

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    user_info_form()
    car_filters(inv)

    # apply filters
    df=inv.copy(); af=st.session_state['active_filters']
    if af:
        if af['make']!='All': df=df[df['make']==af['make']]
        if af['model']!='All': df=df[df['model']==af['model']]
        yr=af['year_range']; df=df[df['year'].between(yr[0],yr[1])]
    if df.empty: st.warning("No matching cars"); return

    idx=st.session_state['current_car_index']%len(df)
    car=df.iloc[idx].to_dict()
    st.session_state['shipping_option']=st.radio("Shipping Option",['FOB','C&F','CIF'],index=['FOB','C&F','CIF'].index(st.session_state['shipping_option']),horizontal=True)

    display_car_card(car,st.session_state['shipping_option'])
    display_market_data_chart(hist,car['make'],car['model'])

    c1,c2=st.columns(2)
    with c1:
        if st.button("❤️ Place Offer",use_container_width=True):
            if not all(st.session_state['customer_info'].values()): st.error("Complete info first")
            else:
                st.session_state['offer_placed']=True
                st.session_state['car_in_chat']=car
                html=generate_invoice_html(st.session_state['customer_info'],car,calculate_total_price(car['price'],st.session_state['shipping_option']))
                st.markdown(html,unsafe_allow_html=True)
                st.download_button("Download Invoice",html,file_name="invoice.html",mime="text/html")
    with c2:
        if st.button("❌ Next Vehicle",use_container_width=True):
            st.session_state['current_car_index']+=1; st.experimental_rerun()

    if st.session_state['offer_placed']:
        st.subheader("💬 Chat")
        for m in st.session_state['chat_messages']:
            with st.chat_message(m['role']): st.write(m['content'])
        if prompt:=st.chat_input("Ask..."):
            st.session_state['chat_messages'].append({'role':'user','content':prompt})
            resp=get_bot_response(prompt)
            # render invoice HTML if agreement
            if resp.strip().startswith('<html>'):
                st.markdown(resp,unsafe_allow_html=True)
            else:
                st.write(resp)
            st.session_state['chat_messages'].append({'role':'assistant','content':resp})
            st.experimental_rerun()

# --- SCRIPT ENTRY POINT ---
if __name__=="__main__":
    try: main()
    except Exception as e:
        st.error("Critical error")
        st.code(traceback.format_exc())

# --- END OF SCRIPT ---
