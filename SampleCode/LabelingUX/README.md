# Form Recognizer Toolkit - Labeling UX

## Introduction

This open-source project aims to provide a sample template for data labeling. Users could implement other features based on this project, e.g., uploading data, or modifying the UI.

You are welcome to bring up any encountered issues. Microsoft Azure Form Recognizer team would update the source code periodically.

### Feature preview

Labeling UX is a user-friendly web application tool for you to label your document through creating label key and assigning the label value to each label key. There are several different types of label key, including "Field", "Selection mark", "Signature" and "Table". By using label key of type "Table", you can label a table with customized name of every column/row as well.


![Labeling UX_feature preview](https://user-images.githubusercontent.com/73906265/213135367-01cdfb79-f60a-45f2-86e3-cba2228452cf.gif)

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

Run the command below to switch back to root folder and start the application, which runs the server at port 4000 and the client application at port 3000.

```sh
cd ..
npm run dev
```

Now, you should see "Compiled successfully!" in your terminal, and the application should automatically open in your default browser with URL : <http://localhost:3000/label>

Now, since we have not set up input data, the Labeling UX application should look like this:

![Labeling UX_before set up labeling data](https://user-images.githubusercontent.com/73906265/213135625-ebf26724-f9aa-4f5b-a77d-826121f7fb15.png)

---

### Setting up input data

**All the labeling data will be read from and write into `Server/data`.**

In order to experience Labeling UX project, you will need to add the files mentioned below in `Server/data` folder:

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

![Labeling UX_switch between documents](https://user-images.githubusercontent.com/73906265/213135758-6fbdf121-36c0-4388-aad2-e99afca94d22.gif)

> **Note:**
>
> If you provide the correct corresponding `.ocr.json` files for your documents, your document rendered in the middle canvas pane should include:
>
> - Light-yellow background for all the text in your documents
> - Table icon on the top-left corner for each table in your documents
> - Pink border for all the selection marks in your documents

You should be able to toggle the layer filter to hide/show different layers as shown below.

![Labeling UX_toggle layer filter](https://user-images.githubusercontent.com/73906265/213135807-8224a530-d5dc-472d-b6b6-edda3cd3fc8a.gif)

> **Reminder:**
>
> If you have added `ocr.json` file for your document, yet you are not able to see the light-yellow background for all the text nor tables icon on each table of your documents. Please check the naming for your `ocr.json` file. It should be **`<document_name>.<document_extension>.ocr.json`**. For example:
> The name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**

If everything works as described above, you are ready to start labeling.

---

## Using Labeling UX

Before starting the detailed tutorial regarding how to label your document. Let's have a quick tour of the Labeling UX application. Labeling UX application basically consist of three pane:

- **Label Canvas** (Middle part of application)
  - This is where you perform specifying label value and inspect label value of your document.
  - On the top-left corner of label canvas, there is a "Region" button, which allow you to draw region for specifying label value of an area in the document.
  - On the top right corner, there is a layer filter icon, which allows you to toggle "Text", "Table" and "Selection mark" layer.
  - On the bottom-center, there is a page control tool, which allow you to switch to a different page of document.
  - On the bottom-right corner, there is a set of tool for you to zoom in/zoom-out/zoom to fit and rotate the document.
- **Document gallery** (left pane)
  - This is where all the thumbnails of your documents would be displayed. 
  - By clicking on thumbnail of document, you can switch the document rendered in the label canvas.
  - While hovering on the thumbnail of your document, a "Delete" icon would be displayed for you to delete a document. Notice that the deletion will not only delete the document file but also delete its corresponding `ocr.json` and `labels.json from `Server/data` folder.
- **Label Pane** (right pane)
  - This is where all label keys and label values are displayed.
  - You could create label key and assign label value to a label key in this pane.
  
![Sample Label UX_introduction of three pane](https://user-images.githubusercontent.com/73906265/213135865-791f1e8e-66c0-44ae-95f2-848cb104f52c.png)

To label a document is to assign key-value pairs for a document. For example, if there is text `Due date: 12/15/2021` in your document, you might want to create a label key `Due date` and assign label value `12/15/2021` to it. With that said, to label a document consists of three main actions:

- Creating a label key
- Specifying label value
- Assigning the specified label value to a label key

In this section, how each action could be performed using Labeling UX application will be elaborated.

Notice that table labeling is more complex and will be explained in a separate topic at the end of this section.

### Ways to specify label value

With `ocr.json` provided for the document you would like to label, Labeling UX application is able to get the bounding boxes and the content value for all the text, selection marks and tables. There are several approaches to specify label value in your document.

#### Specify label value through bounding boxes

##### Click on the text/selection marks

You could click on the bounding box of the text (which is of light-yellow background) or selection mark (which is of pink border). The text being clicked should change into green background while the selection mark being clicked should turn with pink background, which means it is selected.

You could continue clicking on another bounding box to specify multiple words/selection marks in your selection. Notice that for label key of selection mark type, only  single selection mark to be assigned to it.

To unselect, simply click on a selected bounding box again.

![Labeling UX_click to select and unselect label value](https://user-images.githubusercontent.com/73906265/213136018-835e3e81-a023-413f-90a4-e829fc536611.gif)

##### Perform multiple bounding box selection by mouse down and swiping through the text

Besides clicking on all bounding boxes one by one, we can also perform multiple selection by continuously mouse down and swipe through all the text you would like to select.

![Labeling UX_swipe to select label](https://user-images.githubusercontent.com/73906265/213136081-d6f0674e-7d51-4e2f-a189-f45254aed1ac.gif)

##### Press "Shift" and drag the cursor to perform group selection

To perform a group selection, press "Shift" key and drag the "+" cursor to specify the area in which all text you would like to selected.

You can also press "Shift" key and drag the cursor to the area of selected bounding box to perform unselecting.

![Labeling UX_shift and drag to select label](https://user-images.githubusercontent.com/73906265/213136144-b9f6bdfd-b72d-4447-abdc-7a6ff1ac96cb.gif)

#### Use "Region" tool to specify an area

Click on the "Region" button on the top-left corner of middle canvas pane to enter region-drawing mode. Drag the "+" cursor on the document to draw the region you would like to label.

To modify the area of a drawn region, hover on the corner of drawn region and drag the vertex.

To delete the region you drew, hover on the drawn region. There should be a "x" icon on the top-right corner of the region. Click on the "x" for region deletion.

To leave region-drawing mode, click on the "Region" button again.

Notice that only one region can be assigned to a label key or table cell.

![Labeling UX_draw region to specify label value](https://user-images.githubusercontent.com/73906265/213136199-773ecd3f-7880-4838-808f-31e6b6c06cba.gif)

### How to create a label key?

In order to label a document, you need to create label keys and assign the label value to a label key.
In Labeling UX application, there are four types of label key:

- **Field**: for labeling string, number, date, time and integer
- **Selection Mark**: for label value with a single selection mark (bounding box with pink border) or a "Region"
- **Signature**: for label value specified with single "Region"
- **Table**: perform table labeling 

There are two approaches to create a label key, as described below.

#### Create a new label key by clicking on "+" button

The below action applies for label key of type "Field", "Selection mark" and "Signature". Creation of label key of type "Table" will be explained in a separate sub-section later.

At the top label pane, there is a "+" button. Click on the button and choose which type of label key you would like to create. Then, type the name of the label key and hit "Enter". The label key should now be created and displayed on the label pane.

![Labeling UX_create label key by +](https://user-images.githubusercontent.com/73906265/213136253-88080464-690f-42b0-bd1c-659d736e8b5f.gif)

#### Create a new label key and assign label through pop-up after label being specified

Note: This approach is not applicable for table labeling.

After selecting bounding boxes or finishing drawing a region, a pop-up will be displayed next to the bounding boxes/region. Enter the name of the label key in the text field of the pop-up and click on the type of label key you would like to create.

This will not only create a new label key but also assign the label value you just selected to this newly created label key, as shown in the GIF below.

![Labeling UX_create and assign label with inlineLabelMenu](https://user-images.githubusercontent.com/73906265/213136299-af617afe-a3c6-4d14-ac91-052bcb4f7a4d.gif)

### Assign label value to a label key 

After you have the label key created and label value specified, you can now assign the label value to the corresponding label key.

The below is the applicable label value that can be assigned to each type of label key.

- **Field**:
  - Bounding boxes of text
  - Bounding boxes of selection mark
  - Single draw region
- **Selection Mark**:
  - Single bounding box of selection mark
  - Single draw region
- **Signature**:
  - Single draw region

#### Click on the label keys in pop-up to assign label (not applicable for table labeling)

After specifying label value through bounding boxes or region, a pop-up will be displayed next to the bounding boxes/region, which include a list of applicable label keys you have created. Click on the label key you would like to assign the label value to.

![Labeling UX_assign label with inlineLabelMenu](https://user-images.githubusercontent.com/73906265/213136462-bfb5ab67-e9ad-4368-9455-8ff46a97da22.gif)

Notice that the list of label key in the pop-up filter out all the inapplicable label keys. For example, the label key with type "table", "selection mark" and "signature" will not be displayed when you specify label value with text bounding boxes, since text is not allowed to assign to these three types of label key.

#### Click on the label key in the right label pane to assign label

After specifying label value, you can click on the label key you would like to assign the label value to in the label pane.

![Labeling UX_click on label pane to assign label value](https://user-images.githubusercontent.com/73906265/213136561-6851f57a-1016-462f-93bb-6302150b6f28.gif)

Notice that if the label key you click on is not applicable to the label value you specified. There will be a "Label assignment warning" message modal which provide simple instruction on what label value is applicable for this label key.

### Inspect and modify labels

After assigning label, you might want to inspect and possibly modify the labels you have assigned. How these could be performed is described as below.

#### Inspect label of type "field", "signature", and "selection mark"

To inspect a label of type "field", "signature", and "selection mark", simply hover on the label key in label pane. The corresponding label value will be highlighted with thicker border. You could also distinguish the label value of different label key by colors.

![Labeling UX_inspect label value](https://user-images.githubusercontent.com/73906265/213136626-aeb6ba8d-5695-43dd-b46e-31a951836176.gif)

#### Update label value to a label key

For "field" type label key, of which label value with bounding boxes is assigned, you are able to add more label value to a label key simply by selecting additional text with bounding boxes and assign to the label key through clicking the label key in pop-up or label pane. This action will not overwrite the label value you previously assigned but add the newly-selected value and merge with the original one.

If a label key is assigned with value specified by bounding boxes and you are now specifying a value with region drawn, the original value from bounding boxes will be overwritten.

If a label key is assigned with value specified by region and you are now specifying a value with either another drawn region or bounding boxes, the original drawn region value will be overwritten with the new value of the new value from bounding box.

![Labeling UX_update label value](https://user-images.githubusercontent.com/73906265/213136704-e70d6ef0-2c18-4fe0-be26-34465be0e6b7.gif)

#### Delete label value

If you would like re-select/re-draw a label value, you can delete the label value you originally assigned to a label key simply by clicking on the "x" icon on the right of label value.

![Labeling UX_delete label value](https://user-images.githubusercontent.com/73906265/213136768-689ed8c9-0b3c-492b-956b-104d3bccc441.gif)

#### Rename a label key

This action applies for all types of label key, which are "Field", "Selection mark", "Signature" and "Table".

To rename a label key. Click on the three-dot icon on the right of the label key. Click on the "Rename" option and entering new name for label key. (Hit "Esc" if you don't want to rename the label key) After entering the new name, hit "Enter", then a confirmation modal will be displayed.

![Labeling UX_rename label key](https://user-images.githubusercontent.com/73906265/213136854-04ea4551-6d83-4508-9de9-99bf024304e0.gif)

#### Delete label key

This action applies for all types of label key, which are "Field", "Selection mark", "Signature" and "Table".

To delete a label key. Click on the three-dot icon on the right of the label key. Click on "Delete" and a confirmation modal will be displayed.

> **Notice that deleting a label key will also delete all the label value assigned to this label key in all your documents.**

![Labeling UX_delete label key](https://user-images.githubusercontent.com/73906265/213136952-6b473afb-635b-483a-9ace-8bb903c1df62.gif)

#### Assign sub type of the label key

This action applies only to label key of type "Field". For label key with type "Selection mark", "Signature" and "Table", "Sub type" option will be disabled.

To assign sub type for a label key. Click on the three-dot icon on the right of label key. Hover on "Sub type" and a menu of all sub type options will be displayed. Click on the sub type that suit your label value.

![Labeling UX_assign sub type](https://user-images.githubusercontent.com/73906265/213137055-b845bf2c-2be4-4494-afc8-a32e4b68c7f9.gif)


### Table labeling

We have discussed how label of type "Field", "Selection mark" and "Signature" can be created and assigned. In this section, we will discuss a separate topic, which is table labeling.

You could create a table label key with customized rows and columns that suit the content of your document and assign label values to each table cell accordingly.

#### Type of table field

There are a few terms you need to know before start creating a label key of type "Table".

##### Fixed table v.s. Dynamic table

If the table you would like to label is with fixed numbers of row and column, it is suggested to use fixed table.

Otherwise, if the table you would like to label is with different row count from on document to another, for example, a list of purchase items, it is suggested to use dynamic table.

![Sample Label UX_fixed table v s  dynamic table](https://user-images.githubusercontent.com/73906265/213137130-0af91d93-4811-42ae-adf8-608f8d4fa4e7.png)

##### What does "header type" means?

As discussed above, you could specify the "Sub type" to a label key of type "Field". With the similar concept, you cound specify "Sub type" to a row/column of a table.

If you choose header type as column, you could specify sub type for every column of the table you created, but not allowed to specify sub type for any row, and vice versa.


#### Creating a "Table" label field

Click on the "+" button at the top of label pane and select table and select "Table". A "Create table field" modal will be displayed. Enter the name (label key) of this table, and select the table type, header type (if it is a fixed table). Then click "Create" button on the bottom-right corner of the modal.

![Labeling UX_create fixed and dynamic tables](https://user-images.githubusercontent.com/73906265/213137247-023ec3ca-fbb0-47f4-beb4-1f37664fc59d.gif)

#### Open and close table label pane

To open the table label pane for a created label key with type of "Table", click on the table label key in label pane.

To close the table label pane, click on the "x" icon on the top-right corner of table label pane.

![Labeling UX_open and close table view](https://user-images.githubusercontent.com/73906265/213137310-f958bc01-4047-4be9-afd2-fcf174a9403f.gif)

#### Modify the column/row of a table field

After you created a label key of type "Table", open the table label pane, the default content of the table label key should be displayed. Next we will introduce how you could modify the table into the one that suit your usage.

##### Rename column/row

Click on the name of column or row and and select "Rename" in the option menu. Type in the new name then hit "Enter". (Hit "Esc" if you do not want to rename the column/row) A confirmation modal should be displayed. After clicking on "Yes", the column/row should be renamed.

![Labeling UX_rename column and row](https://user-images.githubusercontent.com/73906265/213137370-e10a96ae-b9b6-4bca-8f3d-7437923a6e6e.gif)

##### Insert column/row and add row

For a fixed table, you can insert a column/row, whereas for a dynamic table, you can insert a column and add a row at the bottom of the table.

To insert a row/column, click on the name of column/row or and select "Insert" in menu options. Type in the name for the inserting column/row and hit "Enter". (Hit "Esc" if you do not want to insert a new column/row.)

![Labeling UX_insert column and row in fixed table](https://user-images.githubusercontent.com/73906265/213137477-514416b8-10ef-4318-9f53-c295b090f5f4.gif)

To add a new row in dynamic table, simply click on the "+" icon at the bottom-left corner of the table.

![Labeling UX_add row for dynamic table](https://user-images.githubusercontent.com/73906265/213137545-8b563fee-6bc1-4f35-95c4-3f760384e480.gif)

##### Delete column/row

For a fixed table, you can delete a column/row, whereas for a dynamic table, you can delete a column.

To delete a row/column, click on the name of column/row or and select "Delete" in menu options. A confirmation modal should be displayed. After clicking on "Yes", the column/row should be deleted.

![Labeling UX_delete column and row](https://user-images.githubusercontent.com/73906265/213137606-f0e56296-5671-4176-86f1-e10c479c0473.gif)

##### Assign sub type for column/row

For a fixed table with header type of column, you can assign sub type for each column, whereas for a fixed table with header type of row, you can assign sub type for each row. For a dynamic table, you can assign sub type for each column.

To assign sub type, click on the name of column/row and hover on "Sub type" in menu options. The sub type options should be displayed and you could select the sub type you would like to assign for this column/row.

![Labeling UX_assign label value to table cell](https://user-images.githubusercontent.com/73906265/213137929-46842436-793c-4bb5-aab0-073c2bff8bc2.gif)

#### Assign label value to a table cell

For any table cell, you could assign the label value of with bounding boxes or a single draw region.

With the table label pane opened, specify the label value as described earlier with bounding boxes or drawn region, then click on the table cell you would like to assign the label value to.

![Labeling UX_assign label value to table cell](https://user-images.githubusercontent.com/73906265/213138175-9c3c383b-b210-4873-a30c-7fb490bace0c.gif)

#### Inspect the label value of a table cell

To inspect a label value for a table cell, hover on the table cell you would like to inspect in table label pane. The corresponding label value will be highlighted with thicker border on your document.

![Labeling UX_inspect table cell label value](https://user-images.githubusercontent.com/73906265/213138298-1be58325-e666-4b98-8385-af923a58fb23.gif)

#### Modify label value of a table cell

After assigning label value to a table cell, similar to modifying label value of label key of type "Field", "Selection mark" and "Signature", you can modify the label value by either updating or deleting the label value.

##### Update label value to a table cell

If you have bounding boxes of value assigned to a table cell, you could select more bounding boxes and their value to this table cell.

If it is a table cell with value specified by bounding boxes and you are now specifying a value with region drawn, the original value from bounding boxes will be overwritten with the new drawing region.

If it is a table cell with value specified by region and you are now specifying a value with either bounding boxes or newly drawn region, the original drawn region will be overwritten with the new value of the new value from bounding box.

![Labeling UX_update table cell label value](https://user-images.githubusercontent.com/73906265/213138416-baa13a62-e5ea-4011-9f8a-fcdbdca642e4.gif)

##### Delete the label value for a table cell

If you would like to delete the label value for a table cell, hover on the table cell and there should be a "x" icon displayed on the top-right corner of the table cell. Click on the icon to delete the label value for this table cell.

![Labeling UX_delete table cell label value](https://user-images.githubusercontent.com/73906265/213138477-6f83ba1b-d04b-409f-90ba-ba44849989c5.gif)

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

1. Upload document to [Form Recognizer Studio Layout](https://formrecognizer.appliedai.azure.com/studio/layout) and analyze the document, download the JSON file by clicking on the download button in result tab of analyze result pane (the pane on the right).


2. Use [Form Recognizer SDKs](https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-v3-sdk-rest-api?pivots=programming-language-csharp) to analyze document with Layout API.

After getting `ocr.json` file for your document, **it is important to rename the file with the naming convention in order for Labeling UX to correctly connect your document with its corresponding `ocr.json` file**.

The naming convention for `ocr.json` file is **`<document name>.<document extension>.ocr.json`**. For example, the name of `ocr.json` file for document named **`invoiceA.pdf`** should be **`invoiceA.pdf.ocr.json`**
