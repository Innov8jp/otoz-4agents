# utils.py

### REPLACEMENT "BRAIN" FOR THE BOT (v5 - With Negotiation Logic) ###
def get_bot_response(user_input: str):
    """
    The chatbot brain. It can now handle conversational filtering AND
    basic price negotiation.
    """
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data:
        return "Error: Could not load chatbot training data."

    lowered_input = user_input.lower()
    
    # --- Intent Matching Logic ---
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.6)
    tag = pattern_to_tag[matches[0]] if matches else None

    car_details = st.session_state.get('car_in_chat', {})

    # --- Action Engine ---
    
    # Action 1: Conversational Filtering
    if tag == 'find_car':
        active_filters = st.session_state.active_filters.copy()
        updated = False
        for make in CAR_MAKERS_AND_MODELS.keys():
            if make.lower() in lowered_input:
                active_filters['make'] = make
                updated = True
        year_match = re.search(r'\b(20\d{2})\b', user_input)
        if year_match:
            year = int(year_match.group(1))
            active_filters['year_min'] = year
            active_filters['year_max'] = year
            active_filters['year_range'] = (year, year)
            updated = True
        if updated:
            st.session_state.active_filters = active_filters
            st.session_state.current_car_index = 0
            st.rerun()

    # Action 2: Price Negotiation
    if tag == 'make_offer':
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        if offer_match:
            offer_amount_str = offer_match.group(1).replace(",", "")
            offer_amount = int(float(offer_amount_str))
            asking_price = car_details.get('price', 0)

            if offer_amount >= asking_price * 0.95: # Offer is 95% or more of asking price
                st.session_state.offer_accepted = True
                return f"That's a great offer! We can accept ¥{offer_amount:,}. Shall we proceed to the invoice to finalize the deal?"
            elif offer_amount >= asking_price * 0.85: # Offer is between 85% and 95%
                counter_offer = int(asking_price * 0.96)
                return f"Thank you for the offer. That's a little lower than we'd like, but I can meet you at ¥{counter_offer:,}. What do you think?"
            else: # Offer is less than 85%
                return f"I appreciate the offer of ¥{offer_amount:,}, but that is too far below our asking price for this vehicle. Perhaps we can look at other cars in your budget?"
        else: # The user said "I want to make an offer" but didn't give a number
             return "I understand. What price would you like to offer for this vehicle?"

    # --- Standard Response Generation ---
    response_text = "I'm sorry, I don't quite understand. A human sales agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses'])
                break
    
    # --- Placeholder Replacement ---
    if '{' in response_text:
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option', 'FOB'))
        format_map = default_map({
            "total_price": f"¥{int(price_breakdown['total_price']):,}"
            # Add other placeholders as needed
        })
        response_text = response_text.format_map(format_map)
        
    return response_text
