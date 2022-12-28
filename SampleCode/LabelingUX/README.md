# Form Recognizer Toolkit - Labeling UX

Help us improve Form Recognizer. [Take our survey!](https://microsoft.qualtrics.com/jfe/form/SV_40zWLBFYILTkRWl?Kind=FormRecognizer&From=Studio)

## Introduction

This open-source project aims to provide a sample template for data labeling.Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

## Get Started

### Install node packages

#### Install server's node packages

Run the below command under root folder to install node packages for Server

```sh
npm i
```

#### Install client's node packages

Run the command below to install node packages for Client

```sh
cd Client
npm i
```

### Start the application

Switch back to root folder and start the server at port 4000, the client application at port 3000

```sh
cd ..
npm run dev
```

You should see "Compiled successfully!" in your CLI, and the application should automatically open in your default browser with URL : <http://localhost:3000/label>

Labeling UX application should look like this:
[The screenshot]

## Use Form Recognizer Toolkit - Labeling UX

### Set up input data

**All the labeling data will be read from and write into `Server/data`.**

In order to experience Labeling UX project, you will need to:

1. Create a folder named `data` under `Server` folder.
2. Inside `data` folder, add:
   - Documents you would like to label. (Supported types of document for labeling: PDF, JPG, JPEG, PNG, TIFF, TIF)
   - Corresponding `.ocr.json` files for these documents.
   - (Optional) If you already have the `.labels.json` files for corresponding documents or `fields.json` file for your labeled documents. You could add these files into `data` folder as well.

**Note:**

- **You will need to provide `.ocr.json` files for corresponding documents to start labeling.**
  If you don't have `.ocr.json` files for the documents, check out the instruction at the end of this README -- "How to create `.ocr.json` file for your documents?".
- `.labels.json` files and `fields.json` file will be automatically generated when you start labeling your documents.

The input data should be similar as below:

```markdown
SampleLabelingUX
│   README.md
│
└───Server
│   │
│   └───data
│       │   example1.pdf
│       │   example1.pdf.ocr.json
│       │   example1.pdf.labels.json (optional)
│       │   example2.pdf
│       │   example2.pdf.ocr.json
│       │   example2.pdf.labels.json (optional)
│       │   fields.json (optional)
│       │   ...
│
└───Client
```

After setting up input data, refresh the application webpage and you should see Sample Labeling UX application similar to the screenshot below, with thumbnails of your documents in the left pane and the first document in the canvas of middle pane.

[The screenshot]

### Label your documents

<hr>

### How to create `.ocr.json` file for your documents?

User can create the `ocr.json` file via

1. Upload document to [Form Recognizer Studio Layout](https://formrecognizer.appliedai.azure.com/studio/layout) and analyze the document, the `ocr.json` file will be created according to the filename respectively in user blob storage container.
2. Use [Form Recognizer SDKs](https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-v3-sdk-rest-api?pivots=programming-language-csharp) to analyze document with Layout API, save the result as JSON file with the naming convention <br>
   `<document name>.<document extension>.ocr.json` <br>
   For example, `test.pdf` document should have a corresponding `test.pdf.ocr.json` file for OCR results

```markdown
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
