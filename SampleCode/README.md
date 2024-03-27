# Azure AI Document Intelligence Code Samples

> [!NOTE]
> Form Recognizer is now **Azure AI Document Intelligence**!

This repository contains example code snippets showing how Azure AI Document Intelligence can be used to get insights from documents.

# Samples for Python SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-python/tree/main/sdk/documentintelligence/azure-ai-documentintelligence/samples) for the samples using the [latest SDK version](https://learn.microsoft.com/python/api/overview/azure/ai-documentintelligence-readme?view=azure-python-preview&preserve-view=true).

# Samples for .NET SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-net/tree/main/sdk/documentintelligence/Azure.AI.DocumentIntelligence) for the samples using the [latest SDK version](https://learn.microsoft.com/en-us/dotnet/api/azure.ai.documentintelligence?view=azure-dotnet-preview).

# Samples for Java SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-java/tree/main/sdk/documentintelligence/azure-ai-documentintelligence) for the samples using the [latest SDK version](https://learn.microsoft.com/java/api/overview/azure/ai-documentintelligence-readme).

# Samples for JavaScript SDK
Refer to [this repo](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/documentintelligence/ai-document-intelligence-rest) for the samples using the [latest SDK version](https://learn.microsoft.com/javascript/api/overview/azure/ai-document-intelligence-rest-readme).

# Retrieval Augmented Generation (RAG) samples
The Layout model provides various building blocks like tables, paragraphs, section headings, etc. that can enable different semantic chunking strategies of the document. With semantic chunking in Retrieval Augmented Generation (RAG), it will be more efficient in storage and retrieval, together with the benefits of improved relevance and enhanced interpretability. The following samples show how to use the Layout model to do semantic chunking and use the chunks to do RAG.

| File Name | Description |
| --- | --- |
| [sample_rag_langchain.ipynb](Python/sample_rag_langchain.ipynb) | Sample RAG notebook using Azure AI Document Intelligence as document loader, MarkdownHeaderSplitter and Azure AI Search as retriever in Langchain |
| [sample_figure_understanding.ipynb](Python/sample_figure_understanding.ipynb) | Sample notebook showcasing how to crop the figures and send figure content (with its caption) to Azure Open AI GPT-4V model to understand the semantics. The figure description will be used to update the markdown output, which can be further used for [semantic chunking](https://aka.ms/doc-gen-ai). |


# Pre/post processing samples
There are usually some pre/post processing steps that are needed to get the best results from the Document Intelligence models. These steps are not part of the Document Intelligence service, but are common steps that are needed to get the best results. The following samples show how to do these steps.

| File Name | Description |
| --- | --- |
| [sample_disambiguate_similar_characters.ipynb](Python/sample_disambiguate_similar_characters.ipynb) and [sample_disambiguate_similar_characters.py](Python/sample_disambiguate_similar_characters.py) | Sample postprocessing script to disambiguate similar characters based on business rules. |
| [sample_identify_cross_page_tables.ipynb](Python/sample_identify_cross_page_tables.ipynb) and [sample_identify_cross_page_tables.py](Python/sample_identify_cross_page_tables.py) | Sample postprocessing script to identify cross-page tables based on business rules. |
| [sample_identify_and_merge_cross_page_tales.ipynb](Python/sample_identify_and_merge_cross_page_tales.ipynb) and [sample_identify_and_merge_cross_page_tales.py](Python/sample_identify_and_merge_cross_page_tales.py) | Sample postprocessing script to identify and merge cross-page tables based on business rules. |