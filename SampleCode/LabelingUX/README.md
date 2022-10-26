# Introduction

This open-source project aims to provide a sample template for sample data labeling.
Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues.
Microsoft Azure Form Recognizer team would update the source code periodically.

# Get Started

## Install node packages

### Install server's node packages

Run the below command under root folder to install node packages for Server

```sh
npm i
```

### Install client's node packages

Run the command below to install node packages for Client

```sh
cd Client
npm i
```

## Start the application

Switch back to root folder and start the server at port 4000, the client application at port 3000

```sh
cd ..
npm run dev
```

You should see "Compiled successfully!" in your CLI, and the application should automatically open in your default browser with URL : http://localhost:3000/label

## Add labeling data

All the labeling data will be read from and write into `Server/data`.

```
SampleLabelingUX
│   README.md
│
└───Server
│   │
│   └───data
│       │   fields.json
│       │   example.pdf
│       │   example.ocr.json
│       │   example.labels.json
│       │   ...
│
└───Client
```

### Labeling data in `data` folder contains:

-   supported types of document file
-   \*.ocr.json
-   \*.labels.json
-   fields.json

Notice that **you would need to provide the documents and their corresponding .ocr.json files to start labeling** (If you don't have .ocr.json file for the document you would like to label, check out the instruction at the end of this README for how to generate the .ocr.json file for your document)

You could also provide document's .label.json file and overall fields,json file if you have ones.

After labeling your documents in this Sample Labeling tool, the labeling result, i.e. .labels.json files and fields.json will be stored in this folder as well.

### More details about the labeling data

-   Supported types of document for labeling:
    -   PDF
    -   JPG
    -   JPEG
    -   PNG
    -   TIFF
    -   TIF
-   `.ocr.json`: **MUST** be provided along with the document to start labeling.
-   `.labels.json`: will be auto-generated after labeling with a field assigned to it. If you have provided one, it will read and write into the one you provided.
-   `fields.json`: will be auto-generated after a new field is created. If you have provided one, it will read and write into the one you provided.

#### Note: How to create `.ocr.json` file for your documents

User can create the `ocr.json` file via

1. Upload document to [Form Recognizer Studio Layout](https://formrecognizer.appliedai.azure.com/studio/layout) to analyze the document, the `ocr.json` file will be created according to the filename respectively in user blob storage container.
2. Use [Form Recognizer SDKs](https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-v3-sdk-rest-api?pivots=programming-language-csharp) to analyze document with Layout API, save the result as JSON file with the naming convention <br>
   `<document name>.<document extension>.ocr.json` <br>
   For example, `test.pdf` document should have a corresponding `test.pdf.ocr.json` file for OCR results
