## Getting started

This example guides you on how to perform consistency test against Azure Form Recognizer API.

### 1. Create dotenv file
   Copy `.env.sample` to `.env`.

### 2. Fill the credentials
   Follow this <a href='https://learn.microsoft.com/azure/applied-ai-services/form-recognizer/create-a-form-recognizer-resource?view=form-recog-3.0.0#get-endpoint-url-and-keys' target='_blank'>guide</a> to get your key and endpoint. Then update the .env file:
   ```
    "AZURE_CREDENTIAL": "insert your endpint key here"
    "AZURE_ENDPOINT": "insert your endpoint here"
    "API_VERSION": "insert your API version here" #e.g. "2022-08-31", "2023-02-28-preview"
    "MODEL_ID": "insert your model id" #e.g., prebuilt-layout
   ```

### 3. Run the script
   Install Python requirements.
   ```
   pip install -r requrements.txt
   ```

   Run consistency test with the specified documents.
   ```
   python run.py --files a.pdf b.pdf
   ```
