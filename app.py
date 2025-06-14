# app.py (File Lister Diagnostic)
import streamlit as st
import os
import traceback

st.set_page_config(layout="wide")
st.title("🕵️‍♂️ Ultimate File Diagnostic")

st.info(
    "This application's only purpose is to list all the files and folders "
    "it can see in its repository. This will help us solve the 'file not found' error."
)

st.header("Files Found in Repository:")

try:
    # Get the current working directory
    cwd = os.getcwd()
    st.write(f"**Current Directory:** `{cwd}`")

    # List all files and directories
    files_and_folders = os.listdir(cwd)

    if files_and_folders:
        st.write("Here is everything I found:")
        # Use st.code to preserve formatting and show exactly what Python sees
        st.code('\n'.join(sorted(files_and_folders)))
        
        # Add a specific check for the file in question
        if 'inventory.csv' in files_and_folders:
            st.success("The name 'inventory.csv' was found in the list.")
        else:
            st.error("The name 'inventory.csv' was NOT found in the list.")

    else:
        st.warning("The directory appears to be empty.")

except Exception as e:
    st.error("A critical error occurred while trying to list the files.")
    st.code(traceback.format_exc())
