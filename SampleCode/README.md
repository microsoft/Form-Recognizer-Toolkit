# Azure AI Document Intelligence Code Samples

> [!NOTE]
> Form Recognizer is now **Azure AI Document Intelligence**!

This repository contains example code snippets showing how Azure AI Document Intelligence can be used to get insights from documents.

# Samples for Python SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/documentintelligence/azure-ai-documentintelligence/samples) for the samples using the latest SDK version.

# Samples for .NET SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-net/blob/Azure.AI.FormRecognizer_4.1.0-beta.1/sdk/formrecognizer/Azure.AI.FormRecognizer/samples/README.md#common-scenarios-samples-for-client-library-version-400) for the samples using the latest SDK version.

# Samples for Java SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-java/tree/azure-ai-formrecognizer_4.1.0-beta.1/sdk/formrecognizer/azure-ai-formrecognizer/src/samples#examples) for the samples using the latest SDK version.

# Samples for JavaScript SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-js/tree/%40azure/ai-form-recognizer_4.1.0-beta.1/sdk/formrecognizer/ai-form-recognizer/samples/v4-beta) for the samples using the latest SDK version.

# Retrieval Augmented Generation (RAG) samples
The Layout model provides various building blocks like tables, paragraphs, section headings, etc. that can enable different semantic chunking strategies of the document. With semantic chunking in Retrieval Augmented Generation (RAG), it will be more efficient in storage and retrieval, together with the benefits of improved relevance and enhanced interpretability. The following samples show how to use the Layout model to do semantic chunking and use the chunks to do RAG.

| File Name | Description |
| --- | --- |
| [sample_rag_langchain.ipynb](Python/sample_rag_langchain.ipynb) | Sample RAG notebook using Azure AI Document Intelligence as document loader, MarkdownHeaderSplitter and Azure AI Search as retriever in Langchain |


# Pre/post processing samples
There are usually some pre/post processing steps that are needed to get the best results from the Document Intelligence models. These steps are not part of the Document Intelligence service, but are common steps that are needed to get the best results. The following samples show how to do these steps.

| File Name | Description |
| --- | --- |
| [sample_disambiguate_similar_characters.ipynb](Python/sample_disambiguate_similar_characters.ipynb) and [sample_disambiguate_similar_characters.py](Python/sample_disambiguate_similar_characters.py) | Sample postprocessing script to disambiguate similar characters based on business rules. |