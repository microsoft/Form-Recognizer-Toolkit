# Form Recognizer Toolkit - Labeling UX

## Introduction

This open-source project aims to provide a sample template for data labeling.Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

### Feature preview

[the gif for overall labeling process]

## Getting Started

### Prerequisites

(node version, typeScript version, VS code extension(can ref onBoarding guide and FOTT))

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
> - Pink border for all the selection marks in your documents
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

(left pane, middle pane, right pane) introduction

To label a document consists of three main actions:

- Creating fields
- Specify the content with bounding boxes or region for a field
- Assigning the specified bounding boxes or region to a field

In the this section, how each action could be performed with one or several approaches using Labeling UX application will be elaborated.

Also, besides simple field labeling (i.e. field, selection mark and signature), what table labeling is and how table labeling can be performed is explained in this section as well.

### Ways to specify bounding boxes or a region to a field or table cell

With `ocr.json` provided for the document you would like to label, Labeling UX application is able to get the bounding box and the content value for all the text, selection marks and tables. There are several approaches to specify which bounding boxes or region in the document you would like to label.

#### Specify bounding boxes

##### Click on the text/selection marks

You could click on the bounding box of the text (which should be with light-yellow background) or selection mark (which should be with pink border). The text being clicked should change into green background and the selection mark being clicked should be with pink background, which means it is selected.

You could continue clicking on another bounding box to specify multiple words/selection marks in your selection. Notice that for selection marks, each selection marks field only allows single selection mark to be assigned.

To unselect, simply click on a selected bounding box (with background in green or pink) again.

[the gif]

##### Perform multiple bounding box selection by mouse down and swiping through the text

While selecting multiple bounding boxes for text, besides clicking on all bounding boxes one by one, we can also perform multiple selection by continuous mouse down and swipe through all the text you want to select.

[the gif]

##### Press "Shift" and drag the cursor to perform group selection

To perform a group selection, press "Shift" key and drag the cursor to specify the area in which all text you would like to selected.

You can also press "Shift" key and drag the cursor to the area of selected bounding box to perform unselecting.

[the gif]

#### Use "Region" tool to specify an area

Click on the "Region" button on the top-left corner of middle canvas pane to enter region-drawing mode. Drag the cursor on the document to draw the region you would like to label.

To modify the area of a drawn region, hover on the corner of drawn region and drag the vertex.

To delete the region you drew, hover on the drawn region and there should be a "x" icon on the top-right corner of the region. Click on the "x" for region deletion.

To leave region-drawing mode, click on the "Region" button again.

Notice that only one region can be assigned to a field or table cell.

[the gif]

### How to create a field?

In order to label a document, we need to create fields and assign the content value as well as the bounding box/region to it.
In Labeling UX application, there are four types of field:

- **Field**: for string, number, date, time and integer (all text with light-yellow background)
- **Selection Mark**: allow assigned with a single selection mark (bounding box with pink border) or a region
- **Signature**: allow assigned with "Region"
- **Table**: perform table labeling (table labeling will be explained in the next sub-section)

There are two approaches to assign a field, as described below.

#### Create a new field by clicking on "+" button

At the top label pane, which is the right pane of the application, there is a "+" button. Click on the button and choose which type of field you would like to create. Then, type the name of the field and hit "Enter". The field should now be created and displayed on the label pane.

[the gif]

#### Create a field and assign label through pop-up after label selection

Note: This approach is not applicable for table labeling.

After selecting bounding boxes or finishing drawing a region, a pop-up will be displayed next to the bounding boxes/region. Enter the name of the field in the text input area of the pop-up and click on the type of field you would like to create.

This will not only create a new field but also assign the label you just select to this newly created field, as shown in the GIF below.

[the gif]

### Introduction of table field and how to create one

Besides assigning value directly to a field as the value of the field. You can create a table field with the numbers of row and column that fit the content of your document and assign value to the table cell accordingly. There are two kinds of table: Fixed table and dynamic table, which suit for different scenarios.

#### Fix table

#### Dynamic table

### Assign label to field

#### Directly click on the field in pop-up (not applicable for table labeling)

#### Click on the field in the right label pane

#### Assign label to a table cell

### Inspect and modify labels and fields

#### Inspect text, signature, selection mark fields

#### Inspect table fields

#### Delete labels

#### Rename/delete field

#### Specify sub type of the field

#### Modify the content of a table field

##### Insert and delete column/row

##### Rename column/row

##### Delete label for table cell

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
