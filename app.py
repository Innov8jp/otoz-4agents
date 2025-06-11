# ==============================================================================  
# FINAL, ALL-IN-ONE PRODUCTION SCRIPT (Fixed Expander & Immediate Ports)  
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
def load_data(path):  
    if not os.path.exists(path):  
        st.error(f"File not found: {path}")  
        return None  
    if path.endswith('.csv'):  
        df = pd.read_csv(path)  
        df['image_url'] = df.apply(lambda r: r.get('image_url') or f"https://placehold.co/600x400?text={r.make}+{r.model}", axis=1)  
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
        base=r['price']  
        for m in range(1,7):  
            dt = today - DateOffset(months=m)  
            hist.append({  
                'make':r['make'],'model':r['model'],'date':dt,  
                'avg_price':int(base*(0.995**m)*(1+random.uniform(-0.05,0.05)))  
            })  
    return pd.DataFrame(hist)  

# --- SECTION 4: LOAD INTENTS ONCE ---  
@st.cache_data  
def load_intents(path):  
    try:  
        with open(path,'r',encoding='utf-8') as f:  
            data=json.load(f)  
            return data.get('intents',[])  
    except Exception:  
        return []  

# --- SECTION 5: CHATBOT & INVOICE LOGIC ---  
def get_bot_response(inp):  
    # Invoice trigger on agreement  
    if 'i agree' in inp.lower():  
        car=st.session_state['car_in_chat']  
        bd=calculate_total_price(car['price'],st.session_state['shipping_option'])  
        return generate_invoice_html(st.session_state['customer_info'],car,bd)  

    intents=st.session_state.get('intents_data',[])  
    if not intents:  
        return "I'm sorry, the chat service is unavailable right now."  
    patt={p.lower():it['tag'] for it in intents for p in it.get('patterns',[])}  
    m=get_close_matches(inp.lower(),list(patt),n=1,cutoff=0.5)  
    resp="Sorry, I didn't get that."  
    if m:  
        tag=patt[m[0]]  
        for it in intents:  
            if it.get('tag')==tag:  
                resp=random.choice(it.get('responses',[]))  
                break  
    return resp  

# --- SECTION 6: UI COMPONENTS ---  
def get_bot_response(inp):  
    # invoice on agreement  
    if 'i agree' in inp.lower():  
        car=st.session_state['car_in_chat']  
        bd=calculate_total_price(car['price'],st.session_state['shipping_option'])  
        return generate_invoice_html(st.session_state['customer_info'],car,bd)  

    data = load_data(INTENTS_FILE_PATH)  
    if not data: return "[Chatbot data unavailable]"  
    patt={p.lower():i['tag'] for i in data['intents'] for p in i['patterns']}  
    m=get_close_matches(inp.lower(),list(patt),n=1,cutoff=0.5)  
    resp="Sorry, didn't get that."  
    if m:  
        tag=patt[m[0]]  
        for it in data['intents']:  
            if it['tag']==tag:  
                resp=random.choice(it['responses'])  
                break  
    return resp  

# --- SECTION 5: UI COMPONENTS ---  
def user_info_form():  
    with st.sidebar:  
        st.header("Your Information")  
        ci=st.session_state['customer_info']  
        name=st.text_input("Name",ci.get('name',''),key='ui_name')  
        email=st.text_input("Email",ci.get('email',''),key='ui_email')  
        phone=st.text_input("Phone",ci.get('phone',''),key='ui_phone')  
        country=st.selectbox("Country",[""]+sorted(PORTS_BY_COUNTRY),index=0,key='ui_country')  
        port=st.selectbox("Port of Discharge",[""]+PORTS_BY_COUNTRY.get(country,[]),index=0,key='ui_port')  
        if st.button("Save Info",use_container_width=True):  
            st.session_state['customer_info']={'name':name,'email':email,'phone':phone,'country':country,'port_of_discharge':port}  
            st.success("Details saved")  

# --- SECTION 6: DISPLAY FUNCTIONS ---  
def display_car_card(car,opt):  
    bd=calculate_total_price(car['price'],opt)  
    c1,c2=st.columns([1,2])  
    with c1:  
        st.image(car['image_url'],use_column_width=True)  
    with c2:  
        st.subheader(f"{car['year']} {car['make']} {car['model']}")  
        st.write(f"**Price:** ¥{car['price']:,}")  
        st.success(f"Total ({opt}): ¥{bd['total_price']:,}")  

def display_market_data_chart(hist,make,model):  
    df=hist[(hist['make']==make)&(hist['model']==model)]  
    if df.empty: return  
    # explicit expander label encourages toggle  
    with st.expander("6-Month Price Trend (Click to Expand/Collapse)"):  
        chart=alt.Chart(df).mark_line(point=True).encode(
            x='date:T',y='avg_price:Q',tooltip=['date:T','avg_price:Q']
        ).properties(title=f"6-Month Trend for {make} {model}")
        st.altair_chart(chart,use_container_width=True)  

# --- SECTION 7: MAIN APPLICATION ---  
def main():  
    st.set_page_config(page_title=PAGE_TITLE,page_icon=PAGE_ICON,layout='wide')  
    # init session_state defaults  
    defaults={'current_car_index':0,'customer_info':{},'active_filters':{},'offer_placed':False,'chat_messages':[],'car_in_chat':{},'shipping_option':'FOB'}  
    for k,v in defaults.items(): st.session_state.setdefault(k,v)  
    # load intents once  
    st.session_state['intents_data']=load_intents(INTENTS_FILE_PATH)  

    inv=load_data(INVENTORY_FILE_PATH)  
    if inv is None or inv.empty:  
        st.error("No inventory loaded."); return  
    hist=simulate_price_history(inv)

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")  
    user_info_form()  
    st.set_page_config(page_title=PAGE_TITLE,page_icon=PAGE_ICON,layout='wide')  
    # init session_state defaults  
    defaults={'current_car_index':0,'customer_info':{},'active_filters':{},'offer_placed':False,'chat_messages':[],'car_in_chat':{},'shipping_option':'FOB'}  
    for k,v in defaults.items(): st.session_state.setdefault(k,v)  

    inv=load_data(INVENTORY_FILE_PATH)  
    if inv is None or inv.empty:  
        st.error("No inventory loaded."); return  
    hist=simulate_price_history(inv)  

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")  
    user_info_form()  

    # filters sidebar  
    af=st.session_state['active_filters']  
    with st.sidebar.form("filters"):  
        st.header("Filters")  
        makes=["All"]+sorted(inv['make'].unique())  
        sel_make=st.selectbox("Make",makes,index=makes.index(af.get('make','All')))  
        models=["All"]+(sorted(inv[inv['make']==sel_make]['model'].unique()) if sel_make!='All' else [])  
        sel_model=st.selectbox("Model",models,index=models.index(af.get('model','All')))  
        yr_min,yr_max=int(inv['year'].min()),int(inv['year'].max())  
        sel_years=st.slider("Year",yr_min,yr_max,af.get('year_range',(yr_min,yr_max)))  
        if st.form_submit_button("Apply Filters"):  
            st.session_state['active_filters']={'make':sel_make,'model':sel_model,'year_range':sel_years}  
            st.session_state['current_car_index']=0  
            st.experimental_rerun()  

    # apply filters  
    df=inv.copy()  
    af=st.session_state['active_filters']  
    if af:  
        if af['make']!='All': df=df[df['make']==af['make']]  
        if af['model']!='All': df=df[df['model']==af['model']]  
        yr=af['year_range']; df=df[df['year'].between(yr[0],yr[1])]  
    if df.empty:  
        st.warning("No vehicles match filters"); return  

    idx=st.session_state['current_car_index']%len(df)  
    car=df.iloc[idx].to_dict()  
    st.session_state['shipping_option']=st.radio("Shipping Option",['FOB','C&F','CIF'],index=['FOB','C&F','CIF'].index(st.session_state['shipping_option']),horizontal=True)  

    display_car_card(car,st.session_state['shipping_option'])  
    display_market_data_chart(hist,car['make'],car['model'])  

    col1,col2=st.columns(2)  
    with col1:  
        if st.button("❤️ Place Offer",use_container_width=True):  
            if not all(st.session_state['customer_info'].values()):  
                st.error("Please complete your information first.")  
            else:  
                st.session_state['offer_placed']=True  
                st.session_state['car_in_chat']=car  
                html=generate_invoice_html(st.session_state['customer_info'],car,calculate_total_price(car['price'],st.session_state['shipping_option']))  
                st.markdown(html,unsafe_allow_html=True)  
                st.download_button("Download Invoice",html,file_name="invoice.html",mime="text/html")  
    with col2:  
        if st.button("❌ Next Vehicle",use_container_width=True):  
            st.session_state['current_car_index']+=1  
            st.experimental_rerun()  

    if st.session_state['offer_placed']:  
        st.subheader("💬 Chat with our Sales Team")  
        for m in st.session_state['chat_messages']:  
            with st.chat_message(m['role']): st.write(m['content'])  
        if prompt:=st.chat_input("Ask a question..."):  
            st.session_state['chat_messages'].append({'role':'user','content':prompt})  
            resp=get_bot_response(prompt)  
            if resp.strip().startswith('<html>'):  
                st.markdown(resp,unsafe_allow_html=True)  
            else:  
                st.write(resp)  
            st.session_state['chat_messages'].append({'role':'assistant','content':resp})  
            st.experimental_rerun()  

# --- SCRIPT ENTRY POINT ---  
if __name__=="__main__":  
    try:  
        main()  
    except Exception as e:  
        st.error("Critical error occurred")  
        st.code(traceback.format_exc())  

# --- END OF SCRIPT ---
