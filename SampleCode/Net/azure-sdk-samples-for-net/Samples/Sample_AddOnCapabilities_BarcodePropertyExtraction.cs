// coding: utf - 8
// --------------------------------------------------------------------------
// Copyright(c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for
// license information.
// --------------------------------------------------------------------------

// Symbol to instruct that the example analyzes local document file.
// If want to analyze the document file by url, just update below line to: #undef ANALYZE_LOCAL_FILE
#define ANALYZE_LOCAL_FILE
//#undef ANALYZE_LOCAL_FILE

using Azure;
using Azure.AI.DocumentIntelligence;
using System.Configuration;

namespace azure_sdk_samples_for_net
{
    internal partial class Samples
    {
        /// <summary>
        /// Extract barcodes from a given file with the add-on barcodes capability
        /// </summary>
        /// <returns></returns>
        public static async Task AddOn_BarcodePropertyExtraction()
        {
            // Read the endpoint and apikey from app.config. For how to obtain the endpoint and apikey, please see Prerequisites in README.md .
            string endpoint = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"]!;
            string apiKey = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_KEY"]!;
            var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(apiKey));

#if(ANALYZE_LOCAL_FILE)
            #region Option 1: Analyze a document file from local file system
            // Set the value of variable "docFilePath" to your actual file path.
            var docFilePath = $"{Environment.CurrentDirectory}\\Assets\\barcode.png";
            var docFileBytes = File.ReadAllBytes(docFilePath);
            var content = new AnalyzeDocumentContent()
            {
                Base64Source = BinaryData.FromBytes(docFileBytes)
            };
            #endregion
#else
            #region Option 2: Analyze a document file from url
            // Replace with your actual document url:
            // If you use the URL of a public website, to find more URLs, please visit: https://aka.ms/more-URLs 
            // If you analyze a document in Blob Storage, you need to generate Public SAS URL, please visit: https://aka.ms/create-sas-tokens
            Uri uriSource = new Uri("<uriSource>");
            var content = new AnalyzeDocumentContent()
            {
                UrlSource = uriSource
            };
            #endregion
#endif

            // Specify DocumentAnalysisFeature.Barcodes as the analysis features
            List<DocumentAnalysisFeature> features = new List<DocumentAnalysisFeature> { DocumentAnalysisFeature.Barcodes };

            var operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", content, features: features);
            AnalyzeResult result = operation.Value;

            foreach (DocumentPage page in result.Pages)
            {
                Console.WriteLine($"----Barcodes detected from page #{page.PageNumber}----");
                Console.WriteLine($"Detected {page.Barcodes.Count} barcodes:");

                // Extract the barcodes:
                for (int i = 0; i < page.Barcodes.Count; i++)
                {
                    DocumentBarcode barcode = page.Barcodes[i];

                    Console.WriteLine($"- Barcode #{i}: {barcode.Value}");
                    Console.WriteLine($"  Kind: {barcode.Kind}");
                    Console.WriteLine($"  Confidence: {barcode.Confidence}");
                    Console.WriteLine($"  bounding polygon (points ordered clockwise):");

                    for (int j = 0; j < barcode.Polygon.Count; j += 2)
                    {
                        Console.WriteLine($"      Point {j / 2} => X: {barcode.Polygon[j]}, Y: {barcode.Polygon[j + 1]}");
                    }
                }
            }
        }
    }
}
