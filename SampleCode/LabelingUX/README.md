# Form Recognizer Toolkit - Labeling UX

## Introduction

This open-source project aims to provide a sample template for data labeling. Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

### Feature preview

Labeling UX provide a user-friendly web application tool for you to label your document through creating label key and assigning the label value to each label key. There are several different types of label key, including "Field", "Selection mark", "Signature" and "Table". By using label key of type "Table", you can label a table with customized name of every column/row as well.

[the gif for overall labeling process, including creating label key, assign label to different type of label key, label value with region, table labeling]

## Getting Started

To get started, you would need to clone the repo and run the application on your local machine. Also, you would need to set up input data before you could start labeling.

### Run Labeling UX application

#### Prerequisites

Running Labeling UX application requires [NodeJS and NPM](https://github.com/nodejs/Release).

Required version of NodeJS : ^12.22.0 || ^14.17.0 || ^16.10.0 || >=17.0.0

For development, it is suggested to use TypeScript 4.7.4.

#### Clone the repository to your local machine

```sh
git clone https://github.com/microsoft/Form-Recognizer-Toolkit.git
```

#### Install node packages

##### Install server's node packages

Run the below command under root folder to install node packages for Server

```sh
cd Form-Recognizer-Toolkit/SampleCode/LabelingUX
npm i
```

##### Install client's node packages

Run the command below to install node packages for Client

```sh
cd Client
npm i
```

#### Start the application

Switch back to root folder and start the server at port 4000, the client application at port 3000

```sh
cd ..
npm run dev
```

You should see Compiled successfully!" in your CLI, and the application should automatically open in your default browser with URL : <http://localhost:3000/label>

Now, since we have not set up input data, the Labeling UX application should look like this:

[The screenshot of empty labeling UX application with no document reminder modal]

---

### Setting up input data

**All the labeling data will be read from and write into `Server/data`.**

In order to experience Labeling UX project, you will need to:

1. Create a folder named `data` under `Server` folder.
2. Inside `data` folder, add:
   - Documents you would like to label. (Supported types of document for labeling: PDF, JPG, JPEG, PNG, TIFF, TIF)
   - Corresponding `.ocr.json` files for these documents.
   - (Optional) If you already have the `.labels.json` files for corresponding documents or `fields.json` file for your labeled documents. You could add these files into `data` folder as well.

> **Note:**
>
> - **You will need to provide `.ocr.json` files for corresponding documents to start labeling.**
  If you don't have `.ocr.json` files for the documents, check out the instruction at the end of this README -- "How to create `.ocr.json` file for your documents?".
> - `.labels.json` files and `fields.json` file will be automatically generated when you start labeling your documents.

#### Input data illustration

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

#### What you should see after successfully setting up input data

After setting up input data, refresh the application webpage and you should see Labeling UX application similar to the screenshot below, with thumbnails of your documents in the left pane and the first document in the canvas of middle pane.

[The git for switch between document]

> **Note:**
>
> If you provide the correct corresponding `.ocr.json` files for your documents, your document rendered in the middle canvas pane should include:
>
> - Light-yellow background for all the text in your documents
> - Table icon on the top-left corner for each table in your documents
> - Pink border for all the selection marks in your documents

You should be able to toggle the layer filter to hide/show different layers as shown below.

[toggle filter gif]


> **Reminder:**
>
> If you have added `ocr.json` file for your document, yet you are not able to see the light-yellow background for all the text nor tables icon on each table of your documents. Please check the naming for your `ocr.json` file. It should be **`<document_name>.<document_extension>.ocr.json`**. For example:
> The name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**

If everything works as described above, you are ready to start labeling.

---

## Using Labeling UX

Before starting the detailed tutorial regarding how to label your document. Let's have a quick tour of the Labeling UX application. Labeling UX application basically consist of three pane:

- **Label Canvas** (Middle part of application)
  This is where you perform specifying label value and inspect label value of your document.
  On the top-left corner of label canvas, there is a "Region" button, which provide you to draw region for specifying label value of an area in the document.
  On the top right corner, there is a layer filter icon which allows you to toggle "Text", "Table" and "Selection mark" layer.
  On the bottom-center, there is a page control tool which allow you to switch to a different page of document.
  On the bottom-right corner, there is a set of tool for you to zoom in/zoom-out/zoom to fit and rotate the document.
- **Document gallery** (left pane)
  This is where all the thumbnails of your documents would be displayed. By clicking on thumbnail of document, you can switch the document rendered in the label canvas.
  While hovering on the thumbnail of your document, a "Delete" icon would be displayed. If you would like to delete the document, you could click on the icon. Notice that the document and its corresponding `ocr.json` and `labels.json` will be deleted as well.
- **Label Pane** (right pane)
  This is where you can create label key and view all the label key you have created as well as assigning label value to a label key or inspect the label value of a label key.

[the screenshot of three pane and framed there location]

To label a document is to assign key-value pairs for a document. For example, if there is text `Due date: 12/15/2021` in your document, you might want to create a label key `Due date` and assign label value `12/15/2021` to it. With that said, to label a document consists of three main actions:

- Creating label key
- Specify the label value
- Assigning the specified label value to a label key

In this section, how each action could be performed with one or several approaches using Labeling UX application will be elaborated.

Notice that table labeling is more complex and will be explained in a separate topic at the end of this section.

### Ways to specify label value

With `ocr.json` provided for the document you would like to label, Labeling UX application is able to get the bounding boxes and the content value for all the text, selection marks and tables. There are several approaches to specify label value in your document.

#### Specify label value through bounding boxes

##### Click on the text/selection marks

You could click on the bounding box of the text (which should be with light-yellow background) or selection mark (which should be with pink border). The text being clicked should change into green background while the selection mark being clicked should turn with pink background, which means it is selected.

You could continue clicking on another bounding box to specify multiple words/selection marks in your selection. Notice that for selection marks, each selection marks field only allows single selection mark to be assigned.

To unselect, simply click on a selected bounding box (with background in green or pink) again.

[the gif for selecting bounding boxes and unselect via clicking bounding box, for both text and selection marks]

##### Perform multiple bounding box selection by mouse down and swiping through the text

While selecting multiple bounding boxes for text, besides clicking on all bounding boxes one by one, we can also perform multiple selection by continuous mouse down and swipe through all the text you want to select.

[the gif of swiping to specify label value]

##### Press "Shift" and drag the cursor to perform group selection

To perform a group selection, press "Shift" key and drag the "+" cursor to specify the area in which all text you would like to selected.

You can also press "Shift" key and drag the cursor to the area of selected bounding box to perform unselecting.

[the gif of using shift key for group selection]

#### Use "Region" tool to specify an area

Click on the "Region" button on the top-left corner of middle canvas pane to enter region-drawing mode. Drag the "+" cursor on the document to draw the region you would like to label.

To modify the area of a drawn region, hover on the corner of drawn region and drag the vertex.

To delete the region you drew, hover on the drawn region and there should be a "x" icon on the top-right corner of the region. Click on the "x" for region deletion.

To leave region-drawing mode, click on the "Region" button again.

Notice that only one region can be assigned to a field or table cell.

[the gif for using drawing region to specify a label value]

### How to create a label key?

In order to label a document, you need to create label keys and assign the label value to a label key.
In Labeling UX application, there are four types of label key:

- **Field**: for string, number, date, time and integer
- **Selection Mark**: allow assigned with a single selection mark (bounding box with pink border) or a region
- **Signature**: allow assigned with "Region"
- **Table**: perform table labeling (table labeling will be explained in the next sub-section)

There are two approaches to create a field, as described below.

Notice that as mentioned earlier, since table field creation and table labeling is more complex and different from other labeling of other field type, it will be explained separately in its own sub-section.

#### Create a new label key by clicking on "+" button

The below action applies for label key of type "Field", "Selection mark" and "Signature", creation of label key of type "Table" will be explained in a separate sub-section below.

At the top label pane, which is the right pane of the application, there is a "+" button. Click on the button and choose which type of label key you would like to create. Then, type the name of the label key and hit "Enter". The label key should now be created and displayed on the label pane.

[the gif for creating new label key with "+" icon]

#### Create a field and assign label through pop-up after label selection

Note: This approach is not applicable for table labeling.

After selecting bounding boxes or finishing drawing a region, a pop-up will be displayed next to the bounding boxes/region. Enter the name of the label key in the text field of the pop-up and click on the type of label key you would like to create.

This will not only create a new label key but also assign the label value you just selected to this newly created label key, as shown in the GIF below.

[the gif for creating label key in the pop up]

### Assign label to field

After you have the label key created and label value specified, you can now assign the label value to the corresponding label key.

The below is the applicable type of label value that can be assigned to each type of label key.

- **Field**:
  - Bounding boxes of text (with light-yellow background)
  - Bounding boxes of selection mark (with pink border)
  - Single draw region
- **Selection Mark**:
  - Single bounding box of selection mark (with pink border)
  - Single draw region
- **Signature**:
  - Single draw region

#### Directly click on the field in pop-up (not applicable for table labeling)

After specifying label value through bounding boxes or region, a pop-up will be displayed next to the bounding boxes/region. Below the text field, a list of label keys should be displayed. Directly click on the label key you would like to assign the label value you just selected/drew to. After clicking on a label key, you should see the label value rendered in label pane.

[the gif for assigning label value to a label key using pop-up]

Notice that the list of label key in pop-up would filter out all the non-applicable label keys. For example, the label key with type "table", "selection mark" and "signature" will not be displayed when you specify label value with bounding box of text, since these three types of label key can not be assigned with text.

#### Click on the field in the right label pane

After specifying label value, you can click on the label key you would like to assign the label value to in the label pane. After clicking on a label key, you should see the label value rendered in label pane.

[the gif for assigning label value by click on label key in label pane]

Notice that if the label key you click on is not applicable to the label value you specified. There will be a "Label assignment warning" message modal which provide simple instruction on what label value is applicable for this label key.

### Inspect and modify labels

After assigning label, there will be times when you want to inspect labels and possibly modify the labels you assigned. In this section, how labels can be inspected and modified is being described.

#### Inspect label of type "field", "signature", and "selection mark"

To inspect a label of type "field", "signature", and "selection mark", simply hover on the label key in label pane. The corresponding label value will be highlighted with thicker border. You can also tell the value by the different color for each label key.

[the gif for hovering on label key]

#### Update label value to a label key

For "field" type label key which is using bounding boxes to specify label value, you are able to add more label value to a label key simply by selecting additional text with bounding boxes and assign to the label key through clicking the label key in pop-up or label pane. This action will not overwrite the label value you previously assigned but add the newly-selected value and merge with the original one.

If a label key is assigned with value specified by bounding boxes and you are now specifying a value with region drawn, the original value from bounding boxes will be overwritten with the new drawing region.

If a label key is assigned with value specified by region and you are now specifying a value with either another drawn region or bounding boxes, the original drawn region value will be overwritten with the new value of the new value from bounding box.

[the gif for add more label value to a label key]

#### Delete label value

If you would like re-select/re-draw a label value, you can delete the label value you originally assigned to a label key simply by clicking on the "x" icon on the right of label value.

[the gif for label value deletion]

#### Rename a label key

This action applies for all types of label key, which are "Field", "Selection mark", "Signature" and "Table".

To rename a label key. Click on the three-dot icon on the right of label key and a menu will show with the "Rename" option. Click on the "Rename" option and entering new name for label key. (Hit "Esc" if you don't want to rename the label key) After entering the new name, hit "Enter", then a confirmation modal will be displayed. After clicking "Yes" button in the modal, and the label key should be display with the new name.

[the gif for renaming a label key]

#### Delete label key

This action applies for all types of label key, which are "Field", "Selection mark", "Signature" and "Table".

To delete a label key. Click on the three-dot icon on the right of label key and a menu will show with the "Delete" option. Click on "Delete" and a confirmation modal will be displayed.

> **Notice that deleting a label key will also delete all the label value assigned to this label key in all your documents.**

[the gif for deleting a label key]

#### Assign sub type of the label key

This action applies for only label key of type "Field". For label key with type "Selection mark", "Signature" and "Table". "Sub type" option will be disabled.

To assign sub type for a label key. Click on the three-dot icon on the right of label key and a menu will show with "Sub type" option. Hover on "Sub type" and a menu of all sub type option will be displayed. Click on the sub type that suit your label value.

[the gif for assigning sub type for a label key]

### Table labeling

With the content above, we have discussed how label of type "Field", "Selection mark" and "Signature" has being covered. In this section, we will discuss a separate topic we have mentioned several times earlier, which is table labeling.

Besides assigning label value directly to a label key. You can create a table label key with rows and columns that fit the content of your document and assign label values to each table cell accordingly.

#### Type of table field

There are a few terms you need to know before start creating a label key of type "Table", which will be elaborated below.

##### Fixed table v.s. Dynamic table

If the table you would like to label is with fixed numbers of row and column with their name of each column and row being specified, it is suitable to use fixed table.

[the screen shot for a fixed table example]

Otherwise, if the table you would like to label is dynamic rows, for example, a list of purchase item with their own product name, quantity and total price, it is suitable to use fixed table.

[the screen shot for a dynamic table example]

##### What does "header type" means?

(question: difference between fixed row and fixed column)

#### Creating a "Table" label field

Click on the "+" button at the top of label pane and select table and select "Table". A "Create table field" modal will be display. Enter the name of this label field (label key), which will be the name of this table. and select the table type, header type(if it is a fixed table). Then click "Create" button on the bottom-right corner of the modal. The label pane should now display the newly created table label key.

[the gif for creating a table label field]

#### Open and close table label pane

To open the table label pane for a created label key with type of "Table", click on the table label key in label pane.

To close the table label pane, click on the "x" icon on the top-right corner of table label pane.

[the gif of opening and close table label pane]

#### Modify the column/row of a table field

After you created a label key of type "Table", open the table label pane, the default content of the table field should be displayed. Next we will introduce how you could modify the table into the one that suit your usage.

##### Rename column/row

Click on the name of column or row and a option menu should be displayed. Select "Rename" and type in the new name then hit "Enter". (Hit "Esc" if you do not want to rename the column/row) A confirmation modal should be displayed. After clicking on "Yes", the column/row should be renamed.

[the gif for renaming column and row in a default fixed table]

##### Insert column/row and add row

For a fixed table, you can insert a column/row, whereas for a dynamic table, you can insert a column and add a rows at the bottom of the table.

The newly inserted column/row will be located on the right/directly below the column/row you clicked on, while the newly added row will be appended at the bottom of the table.

To insert a row/column, click on the name of column/row or and select "Insert" in menu options. Type in the name for the inserting column/row and hit "Enter". (Hit "Esc" if you do not want to insert a new column/row.) The new column should be created with the name you assigned.

[the gif for inserting row and column in a fixed table]

To add a new row in dynamic table, simply click on the "+" icon at the bottom-left corner of the table.

[the gif for adding a row in dynamic table]

##### Delete column/row

For a fixed table, you can delete a column/row, whereas for a dynamic table, you can delete a row.

To delete a row/column, click on the name of column/row or and select "Delete" in menu options. A confirmation modal should be displayed. After clicking on "Yes", the column/row should be deleted.

[the gif for deleting a column/row in a fixed table]

##### Assign sub type for column/row

For a fixed table with header type of column, you can assign sub type for each column, whereas for a fixed table with header type of row, you can assign sub type for each row. For a dynamic table, you can assign sub type for each column.

To delete a row/column, click on the name of column/row or and hover on "Sub type" in menu options. The sub type options will be displayed, and you could select the sub type you would like to assign for this column/row.

#### Assign label value to a table cell

For any table cell, we can assign the value of text with bounding boxes, selection marks with bounding boxes, or draw region.

With the table field content opened, specify the label value as described earlier with bounding boxes or drawn region on your document, then click on the table cell of which the column and the row you would like to assign the label value to.

[the gif of assign label value to a label cell]

#### Inspect the label value of a table cell

To inspect a label value for a table cell, hover on the table cell you would like to inspect in table label pane. The corresponding label value will be highlighted with thicker border on your document.

[the gif for hovering on table cell to inspect table label value]

#### Modify label value of a table cell

After assigning label value to a table cell, similar to modifying label value of label key of type "Field", "Selection mark" and "Signature", you can modify the label value by either updating or deleting the label value.

##### Update label value to a table cell

If you have bounding boxes of value assigned to a table cell, you could select more bounding boxes and their value to this table cell.

If it is a table cell with value specified by bounding boxes and you are now specifying a value with region drawn, the original value from bounding boxes will be overwritten with the new drawing region.

If it is a table cell with value specified by region and you are now specifying a value with either bounding boxes or newly drawn region, the original drawn region will be overwritten with the new value of the new value from bounding box.

[the git for update label value to a table cell]

##### Delete the label value for a table cell

If you would like to delete the label value for a table cell, hover on the table cell and there should be a "x" icon displayed on the top-right corner of the table cell. Click on the icon to delete the label value for this table cell.

[the gif for delete label value for a table cell]

### Continue labeling another document

After finishing labeling for one document, you could now switch to another document and label the new document assigning label value to all the label keys you have created when labeling first document.

---

## What you will get after finish labeling in Labeling UX application

After finishing labeling all your documents. There should be `labels.json` for each document you have labeled. `labels.json` stores the coordinates of and the text value of each label as well as the corresponding label key for each label value.
Also, there should be a `fields.json` file. Which store the definition of all the label keys you created for labeling.

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

With all `labels.json` files and a `fields.json` file, your label result will be stored completely. You can use these files to further train a model or start labeling with a different set of documents and visit this set of label result later again.

---

## How to create `.ocr.json` file for your documents?

You can get the `ocr.json` file for your document with two approaches:

1. Upload document to [Form Recognizer Studio Layout](https://formrecognizer.appliedai.azure.com/studio/layout) and analyze the document, download the JSON file by clicking on the download button in result pane.

    [the screenshot]

2. Use [Form Recognizer SDKs](https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-v3-sdk-rest-api?pivots=programming-language-csharp) to analyze document with Layout API.

After getting `ocr.json` file for your document, **it is important to rename the file with the naming convention in order for Labeling UX to correctly connect your document with its corresponding `ocr.json` file**.

The naming convention for `ocr.json` file is **`<document name>.<document extension>.ocr.json`**

The name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**
