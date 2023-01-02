# Form Recognizer Toolkit - Labeling UX

## Introduction

This open-source project aims to provide a sample template for data labeling.Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

### Feature preview

[the gif for overall labeling process]

## Getting Started

### Prerequisites

(node version, typeScript version, VS code extension(can ref onBoarding guide and FOTT))

### (Clone the repository and switch to Sample Label UX)

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
(canvas for rendering...)
(label pane for rendering all fields and the label value...)
[the screenshot of three pane]

(key value pair relationship for field and label explain)

To label a document consists of three main actions:

- Creating label key
- Specify the label value with bounding boxes or region
- Assigning the specified label value to a label key

In the this section, how each action could be performed with one or several approaches using Labeling UX application will be elaborated.

Notice that table labeling is more complex and will be explained in a separate topic at the end of this section.

### Ways to specify label value

With `ocr.json` provided for the document you would like to label, Labeling UX application is able to get the bounding boxes and the content value for all the text, selection marks and tables. There are several approaches to specify label value in your document.

#### Specify label value through bounding boxes

##### Click on the text/selection marks

You could click on the bounding box of the text (which should be with light-yellow background) or selection mark (which should be with pink border). The text being clicked should change into green background while the selection mark being clicked should turn with pink background, which means it is selected.

You could continue clicking on another bounding box to specify multiple words/selection marks in your selection. Notice that for selection marks, each selection marks field only allows single selection mark to be assigned.

To unselect, simply click on a selected bounding box (with background in green or pink) again.

[the gif]

##### Perform multiple bounding box selection by mouse down and swiping through the text

While selecting multiple bounding boxes for text, besides clicking on all bounding boxes one by one, we can also perform multiple selection by continuous mouse down and swipe through all the text you want to select.

[the gif]

##### Press "Shift" and drag the cursor to perform group selection

To perform a group selection, press "Shift" key and drag the "+" cursor to specify the area in which all text you would like to selected.

You can also press "Shift" key and drag the cursor to the area of selected bounding box to perform unselecting.

[the gif]

#### Use "Region" tool to specify an area

Click on the "Region" button on the top-left corner of middle canvas pane to enter region-drawing mode. Drag the "+" cursor on the document to draw the region you would like to label.

To modify the area of a drawn region, hover on the corner of drawn region and drag the vertex.

To delete the region you drew, hover on the drawn region and there should be a "x" icon on the top-right corner of the region. Click on the "x" for region deletion.

To leave region-drawing mode, click on the "Region" button again.

Notice that only one region can be assigned to a field or table cell.

[the gif]

### How to create a label key?

In order to label a document, you need to create label keys and assign the label value to a label key.
In Labeling UX application, there are four types of label key:

- **Field**: for string, number, date, time and integer (all text with light-yellow background)
- **Selection Mark**: allow assigned with a single selection mark (bounding box with pink border) or a region
- **Signature**: allow assigned with "Region"
- **Table**: perform table labeling (table labeling will be explained in the next sub-section)

There are two approaches to create a field, as described below.

Notice that as mentioned earlier, since table field creation and table labeling is more complex and different from other labeling of other field type, it will be explained separately in its own sub-section.

#### Create a new field by clicking on "+" button

At the top label pane, which is the right pane of the application, there is a "+" button. Click on the button and choose which type of label key you would like to create. Then, type the name of the label key and hit "Enter". The label key should now be created and displayed on the label pane.

[the gif]

#### Create a field and assign label through pop-up after label selection

Note: This approach is not applicable for table labeling.

After selecting bounding boxes or finishing drawing a region, a pop-up will be displayed next to the bounding boxes/region. Enter the name of the label key in the text field of the pop-up and click on the type of label key you would like to create.

This will not only create a new label key but also assign the label value you just selected to this newly created label key, as shown in the GIF below.

[the gif]

### Assign label to field

After you have the label key created and label value specified, you can now assign the label value to the corresponding label key.

#### Directly click on the field in pop-up (not applicable for table labeling)

After specifying label value through bounding boxes or region, a pop-up will be displayed next to the bounding boxes/region. Below the text field, a list of label keys should be displayed. Directly click on the label key you would like to assign the label value you just selected/drew to. After clicking on a label key, you should see the label value rendered in label pane.

[the gif for assigning label value to a label key using pop-up]

Notice that the list will filter out all the non-applicable label key. For example, the label key with type "table", "selection mark" and "signature" will not be displayed when you specify label value with bounding box of text, since these three types of label key can not be assigned with text.

#### Click on the field in the right label pane

After specifying label value, you can click on the label key you would like to assign the label value to in the label pane. After clicking on a label key, you should see the label value rendered in label pane.

[the gif for assigning label value by click on label key in label pane]

Notice that if the label key you click on is not applicable to the label value you specified. There will be a "Label assignment warning" message modal which provide simple instruction on what label value is applicable for this label key.

### Inspect and modify labels and fields

#### Inspect text, signature, selection mark fields

#### Update a label

#### Delete label

#### Rename/delete field

#### Specify sub type of the field

### Table field creation and table labeling

Besides assigning value directly to a field as the value of the field. You can create a table field with the numbers of row and column that fit the content of your document and assign value to the table cell accordingly. There are two kinds of table: Fixed table and dynamic table, which suit for different scenarios.

#### Create a fixed table

If the table you would like to label is with fixed numbers of row and column, it is suitable to use fixed table.

#### Create a dynamic table

#### Modify the content of a table field

##### Insert and delete column/row

##### Rename column/row

#### Assign label value to a table cell

#### Inspect table fields

##### Delete label value for table cell

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
