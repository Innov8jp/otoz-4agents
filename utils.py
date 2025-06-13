# utils.py

def get_bot_response(user_input: str):
    """
    The chatbot brain. It identifies user intent and can now trigger
    actions like updating the vehicle filters.
    """
    intents_data = load_data(INTENTS_FILE_PATH)
    if not intents_data:
        return "Error: Could not load chatbot training data."

    lowered_input = user_input.lower()
    
    # --- Intent Matching Logic ---
    pattern_to_tag = {p.lower(): i['tag'] for i in intents_data['intents'] for p in i['patterns']}
    all_patterns = list(pattern_to_tag.keys())
    matches = get_close_matches(lowered_input, all_patterns, n=1, cutoff=0.7) # Higher cutoff for more specific matches
    
    tag = pattern_to_tag[matches[0]] if matches else None

    # --- Action Engine ---
    # NEW: Logic for the find_car intent
    if tag == 'find_car':
        active_filters = st.session_state.active_filters.copy()
        updated = False
        
        # Look for car makes mentioned in the input
        for make in CAR_MAKERS_AND_MODELS.keys():
            if make.lower() in lowered_input:
                active_filters['make'] = make
                updated = True
        
        # Look for a 4-digit year mentioned in the input
        year_match = re.search(r'\b(20\d{2})\b', user_input)
        if year_match:
            year = int(year_match.group(1))
            active_filters['year_min'] = year
            active_filters['year_max'] = year
            updated = True
        
        if updated:
            st.session_state.active_filters = active_filters
            st.session_state.current_car_index = 0
            st.rerun()
        else: # If they say "find me a car" but give no details
            return "Of course! What make, model, or year are you interested in?"

    # --- Response Generation (for all other intents) ---
    response_text = "I'm sorry, I don't quite understand. A human sales agent will review your question."
    if tag:
        for intent in intents_data['intents']:
            if intent['tag'] == tag:
                response_text = random.choice(intent['responses']); break
    
    # --- Placeholder Replacement ---
    if '{' in response_text:
        # This logic can be expanded to fill placeholders
        pass
        
    return response_text
