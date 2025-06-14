# utils.py

@st.cache_data
def load_inventory():
    """
    Loads inventory from a list of specified CSV files and combines them
    into a single master DataFrame.
    """
    # Define the list of inventory files to load.
    # These names come directly from your request.
    inventory_files = [
        'inventory_agasta.csv',
        'inventory_carbybuy.csv'
    ]
    
    all_dataframes = []
    
    # Loop through the list and load each file that exists
    for file_path in inventory_files:
        if os.path.exists(file_path):
            try:
                df = pd.read_csv(file_path)
                # Important: Add a 'source' column to know where the car came from
                df['source'] = os.path.basename(file_path) 
                all_dataframes.append(df)
                logging.info(f"Successfully loaded {file_path} with {len(df)} records.")
            except Exception as e:
                st.warning(f"Could not read or process {file_path}. It might be empty or corrupted. Error: {e}")
        else:
            st.warning(f"Inventory file not found: {file_path}. This file will be skipped.")
    
    # Check if any data was loaded at all
    if not all_dataframes:
        st.error("No valid inventory data could be loaded. Please check that your CSV files are uploaded.")
        return pd.DataFrame()
    
    # Combine all individual dataframes into one master list
    master_df = pd.concat(all_dataframes, ignore_index=True)
    
    # --- The rest of the function remains the same ---
    # It adds the
