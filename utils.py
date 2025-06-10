### REPLACEMENT "BRAIN" FOR THE BOT (v2 - Improved Matching) ###

def get_bot_response(user_input: str):
    """
    Generates an intelligent response by finding the best-matching intent
    from the training data, ignoring case and handling variations.
    """
    intents_data = load_intents('intents_extended_50.json')
    if not intents_data:
        return "Error: Could not load training data. Please check the `intents_extended_50.json` file."

    lowered_input = user_input.lower()

    # --- Step 1: Create a mapping from lowercase patterns to their intent tag ---
    lowercased_pattern_map = {}
    for intent in intents_data['intents']:
        for pattern in intent['patterns']:
            # Map the lowercased pattern to its original tag
            lowercased_pattern_map[pattern.lower()] = intent['tag']

    all_lowercase_patterns = list(lowercased_pattern_map.keys())

    # --- Step 2: Find the best matching pattern using a more lenient cutoff ---
    # The cutoff value (0.0 to 1.0) determines how similar a phrase must be.
    # We lower it from 0.6 to 0.5 to make the matching more flexible.
    matches = get_close_matches(lowered_input, all_lowercase_patterns, n=1, cutoff=0.5)

    best_match_tag = None
    if matches:
        best_match_pattern = matches[0]
        best_match_tag = lowercased_pattern_map[best_match_pattern]
        
    # --- Step 3: Select a response based on the matched intent (tag) ---
    response = "I'm sorry, I'm not sure how to answer that. A human sales agent will review your question."
    if best_match_tag:
        for intent in intents_data['intents']:
            if intent['tag'] == best_match_tag:
                response = random.choice(intent['responses'])
                # Special handling for invoice generation state
                if best_match_tag == 'confirm_invoice':
                    st.session_state.generate_invoice_request = True
                break
    
    # --- Step 4: Fill in any placeholders in the response ---
    if '{' in response and '}' in response:
        car_details = st.session_state.get('car_in_chat', {})
        price_breakdown = calculate_total_price(car_details.get('price', 0), st.session_state.get('shipping_option'))
        
        offer_match = re.search(r'(\d[\d,.]*)', user_input)
        offer_amount = offer_match.group(1) if offer_match else "[your offer]"

        # Use .format_map() with a dictionary to safely fill placeholders
        response = response.format_map({
            "price": f"¥{int(car_details.get('price', 0)):,}",
            "total_price": f"¥{int(price_breakdown['total_price']):,}",
            "shipping_option": st.session_state.get('shipping_option', 'FOB'),
            "offer_amount": offer_amount,
            "port": st.session_state.get('customer_info', {}).get('port_of_discharge', 'your selected port'),
            "country": st.session_state.get('customer_info', {}).get('country', 'your country')
        })
        
    return response
