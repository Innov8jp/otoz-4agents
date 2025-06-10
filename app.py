import streamlit as st
import pandas as pd
import os
import traceback

# --- Constants (Simplified for this test) ---
PAGE_TITLE = "Otoz.ai - Final Diagnostic"
PAGE_ICON = "ախ"
INVENTORY_FILE_PATH = 'inventory.csv'

# --- Core Function (Caching is intentionally disabled) ---
def load_inventory():
    """Loads inventory directly from the CSV file. Caching is disabled."""
    try:
        st.write("Attempting to run `pd.read_csv('inventory.csv')` now...")
        df = pd.read_csv(INVENTORY_FILE_PATH)
        st.success("✅ `pd.read_csv` command executed successfully!")
        return df
    except FileNotFoundError:
        st.error(f"❌ `pd.read_csv` failed with FileNotFoundError.")
        return pd.DataFrame()
    except Exception as e:
        st.error(f"An error occurred inside `load_inventory`: {e}")
        st.code(traceback.format_exc())
        return pd.DataFrame()

# --- Main Application ---
def main():
    st.set_page_config(page_title=PAGE_TITLE, page_icon=PAGE_ICON, layout="wide")
    st.title(f"{PAGE_ICON} Final Diagnostic Test")

    # --- Deep File Inspection Block ---
    st.subheader("Deep File Inspection Results")
    try:
        cwd = os.getcwd()
        st.write(f"**Current Directory:** `{cwd}`")
        
        files_in_repository = os.listdir(cwd)
        st.write("**Files Found by `os.listdir()`:**")
        st.code('\n'.join(sorted(files_in_repository)))
        
        target_file = 'inventory.csv'
        if target_file in files_in_repository:
            st.success(f"✅ **Check 1:** The file `{target_file}` exists in the list.")
            
            file_path = os.path.join(cwd, target_file)
            st.write(f"**Full Path:** `{file_path}`")
            
            is_a_file = os.path.isfile(file_path)
            if is_a_file:
                st.success(f"✅ **Check 2:** `os.path.isfile()` confirms it is a file.")
                try:
                    with open(file_path, 'r') as f:
                        content_snippet = f.read(100)
                        st.write("**First 100 characters of file content:**")
                        st.code(content_snippet)
                    st.success("✅ **Check 3:** Successfully opened and read from the file.")
                except Exception as read_e:
                    st.error(f"❌ **Check 3 FAILED:** Could not open or read the file. Error: {read_e}")
            else:
                st.error(f"❌ **Check 2 FAILED:** `os.path.isfile()` reports this is NOT a file. It may be a folder or a broken link.")
        else:
            st.error(f"❌ **Check 1 FAILED:** The file `{target_file}` does not exist in the list.")
            st.info("Please ensure the file is named exactly `inventory.csv` (all lowercase) and is in the main directory of your GitHub repository.")

    except Exception as e:
        st.error(f"A critical error occurred during the file inspection: {e}")
    
    st.markdown("---")
    
    # --- Attempt to load data using the function ---
    inventory = load_inventory()
    
    if not inventory.empty:
        st.success("Application FINALLY loaded the inventory successfully!")
        st.dataframe(inventory.head())
    else:
        st.error("Application failed to load the inventory.")

# --- Script Entry Point ---
if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        st.error("A top-level critical error occurred.")
        st.code(traceback.format_exc())
