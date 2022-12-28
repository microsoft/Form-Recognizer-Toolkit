# Form Recognizer Toolkit - Labeling UX

Help us improve Form Recognizer. [Take our survey!](https://microsoft.qualtrics.com/jfe/form/SV_40zWLBFYILTkRWl?Kind=FormRecognizer&From=Studio)

## Introduction

This open-source project aims to provide a sample template for data labeling.Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

### Feature preview

[the gif for overall labeling process]

## Getting Started

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

Now, Labeling UX application should look like this:
[The screenshot]

---

## Setting up input data

**All the labeling data will be read from and write into `Server/data`.**

In order to experience Labeling UX project, you will need to:

1. Create a folder named `data` under `Server` folder.
2. Inside `data` folder, add:
   - Documents you would like to label. (Supported types of document for labeling: PDF, JPG, JPEG, PNG, TIFF, TIF)
   - Corresponding `.ocr.json` files for these documents.
   - (Optional) If you already have the `.labels.json` files for corresponding documents or `fields.json` file for your labeled documents. You could add these files into `data` folder as well.

> ---
> **Note:**
>
> - **You will need to provide `.ocr.json` files for corresponding documents to start labeling.**
  If you don't have `.ocr.json` files for the documents, check out the instruction at the end of this README -- "How to create `.ocr.json` file for your documents?".
> - `.labels.json` files and `fields.json` file will be automatically generated when you start labeling your documents.
>
> ---

### Input data illustration

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

### What you should see after successfully setting up input data

After setting up input data, refresh the application webpage and you should see Sample Labeling UX application similar to the screenshot below, with thumbnails of your documents in the left pane and the first document in the canvas of middle pane.

[The git for switch between document]

> --
> **Note:**
>
> If you provide the correct corresponding `.ocr.json` files for your documents, your document rendered in the middle canvas pane should include:
>
> - Light-yellow background for all the text in your documents
> - Table icon on the top-left corner for each table in your documents
>
> ---

You should be able to toggle the layer filter to hide/show different layers as shown below.

[toggle filter gif]

>--
> **Reminder:**
>
> If you have added `ocr.json` file for your document, yet you are not able to see the light-yellow background for all the text nor tables icon on each table of your documents. Please check the naming for your `ocr.json` file. It should be **`<document_name>.<document_extension>.ocr.json`**. For example:
> The name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**
>
>---

If everything works as described above, you are ready to start labeling.

---

## Using Labeling UX

(brief intro, include create fields, label document, assign label to fields)

### Ways to label your documents

#### Click on text

#### Mouse down and swipe through the text

#### Press "Shift" and group select the text

#### Use "Region" tool

### How to create a field?

(Types of label fields)

#### Create new field through "+" icon

#### Directly create a field after labeling through pop-up (not applicable for table labeling)

### Introduction to table labeling

(intro of table labeling)

#### Fix table

#### Dynamic table

### Assign label to field

#### Directly click on the field in pop-up (not applicable for table labeling)

#### Click on the field in the right label pane

#### Assign label to table field

### Inspect and modify labels and fields

#### Inspect text, signature, selection mark fields

#### Inspect table fields

#### Delete labels

#### Rename/delete field

#### Modify the content of a table field

---

## What you will get after finish labeling in Labeling UX application

(explain what fields.json and labels json is)

```markdown
SampleLabelingUX
│   README.md
│
└───Server
│   │
│   └───data
│       │   example1.pdf
│       │   example1.pdf.ocr.json
│       │   example1.pdf.labels.json
│       │   example2.pdf
│       │   example2.pdf.ocr.json
│       │   example2.pdf.labels.json
│       │   ...
│       │   fields.json
│
└───Client
```

---

## How to create `.ocr.json` file for your documents?

You can get the `ocr.json` file for your document with two approaches:

1. Upload document to [Form Recognizer Studio Layout](https://formrecognizer.appliedai.azure.com/studio/layout) and analyze the document, download the JSON file by clicking on the download button in result pane.

    [the screenshot]

2. Use [Form Recognizer SDKs](https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-v3-sdk-rest-api?pivots=programming-language-csharp) to analyze document with Layout API.

After getting `ocr.json` file for your document, **it is important to rename the file with the naming convention in order for Labeling UX to correctly connect your document with its corresponding `ocr.json` file**.

The naming convention for `ocr.json` file is **`<document name>.<document extension>.ocr.json`**

The name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**
