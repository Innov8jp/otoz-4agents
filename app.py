# app.py

def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide", initial_sidebar_state="expanded")

    # Initialize all session state keys
    state_keys = {
        'current_car_index': 0, 'customer_info': {}, 'active_filters': {},
        'offer_placed': False, 'chat_messages': [], 'car_in_chat': {},
        'shipping_option': 'FOB'
    }
    for key, default_value in state_keys.items():
        if key not in st.session_state:
            st.session_state[key] = default_value

    st.title(f"{PAGE_ICON} {PAGE_TITLE}")
    
    inventory = load_data(INVENTORY_FILE_PATH)
    if inventory is None or inventory.empty: st.stop()
    
    price_history = simulate_price_history(inventory)
    
    # --- Sidebar ---
    user_info_form()
    car_filters(inventory)
    
    # --- Main Page ---
    st.markdown("---")
    if st.session_state.active_filters:
        active_filter_str = " | ".join([f"{k.replace('_',' ').title()}: {v}" for k,v in st.session_state.active_filters.items() if v != 'All' and not isinstance(v, int)])
        st.info(f"**Active Filters:** {active_filter_str if active_filter_str else 'Showing all vehicles.'}")

    filtered_inventory = filter_inventory(inventory, st.session_state.active_filters)
    if filtered_inventory.empty:
        st.warning("No vehicles match your current filters."); st.stop()

    if st.session_state.current_car_index >= len(filtered_inventory): st.session_state.current_car_index = 0
    current_car = filtered_inventory.iloc[st.session_state.current_car_index].to_dict()
    
    # --- Main Display Logic ---
    if st.session_state.offer_placed:
        st.subheader(f"Continuing your offer for:")
        display_car_card(current_car, st.session_state.shipping_option)
        display_chat_interface()
    else:
        st.markdown(f"#### Showing Vehicle {st.session_state.current_car_index + 1} of {len(filtered_inventory)}")
        st.session_state.shipping_option = st.radio("Shipping Option", ["FOB", "C&F", "CIF"], index=["FOB", "C&F", "CIF"].index(st.session_state.shipping_option), horizontal=True)
        display_car_card(current_car, st.session_state.shipping_option)
        
        st.markdown("---"); st.markdown("#### Market Insights")
        display_market_data_chart(price_history, current_car['make'], current_car['model'])
        
        col1, col2, _ = st.columns([1.5, 1.5, 4])
        with col1:
            if st.button("❤️ Place Offer", use_container_width=True):
                if not all(st.session_state.customer_info.get(key) for key in ["name", "email", "phone"]):
                    st.error("Please complete 'Your Information' in the sidebar and click 'Save Details' first.")
                else:
                    st.session_state.offer_placed = True
                    st.session_state.car_in_chat = current_car
                    if not st.session_state.chat_messages:
                        st.session_state.chat_messages = [{"role": "assistant", "content": f"Hello {st.session_state.customer_info['name']}! I can help finalize your offer on the {current_car['year']} {current_car['make']} {current_car['model']}. What would you like to know?"}]
                    st.rerun()
        with col2:
            if st.button("❌ Next Vehicle", use_container_width=True):
                st.session_state.current_car_index = (st.session_state.current_car_index + 1) % len(filtered_inventory)
                st.rerun()

    # --- Chat Input available on all pages for conversational filtering ---
    st.markdown("---")
    if prompt := st.chat_input("Ask Sparky to find a car for you... (e.g., 'show me a Toyota from 2020')"):
        # This command is processed by the "Action Engine" in get_bot_response
        response = get_bot_response(prompt)
        # For non-action intents, show a temporary message
        st.toast(response)
