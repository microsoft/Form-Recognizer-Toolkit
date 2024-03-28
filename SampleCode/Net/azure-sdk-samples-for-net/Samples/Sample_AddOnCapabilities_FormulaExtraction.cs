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
        /// Extract formulas from a given file with the add-on formulas capability
        /// </summary>
        /// <returns></returns>
        public static async Task AddOn_FormulaExtraction()
        {
            // Read the endpoint and apikey from app.config. For how to obtain the endpoint and apikey, please see Prerequisites in README.md .
            string endpoint = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"]!;
            string apiKey = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_KEY"]!;
            var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(apiKey));

#if (ANALYZE_LOCAL_FILE)
            #region Option 1: Analyze a sample document file from local file system.
            // Set the value of variable "docFilePath" to your actual file path.
            var docFilePath = $"{Environment.CurrentDirectory}\\Assets\\layout-formulas.png";
            var docFileBytes = File.ReadAllBytes(docFilePath);
            var content = new AnalyzeDocumentContent()
            {
                Base64Source = BinaryData.FromBytes(docFileBytes)
            };
            #endregion
#else
            #region Option 2: Analyze a sample document file from url.
            // Replace with your actual document url:
            // If you use the URL of a public website, to find more URLs, please visit: https://aka.ms/more-URLs 
            // If you analyze a document in Blob Storage, you need to generate Public SAS URL, please visit: https://aka.ms/create-sas-tokens
            Uri uriSource = new Uri("https://documentintelligence.ai.azure.com/documents/samples/layout/layout-formulas.png");
            var content = new AnalyzeDocumentContent()
            {
                UrlSource = uriSource
            };
            #endregion
#endif

            // Specify DocumentAnalysisFeature.Formulas as the analysis features
            List<DocumentAnalysisFeature> features = new List<DocumentAnalysisFeature> { DocumentAnalysisFeature.Formulas };

            var operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", content, features: features);
            AnalyzeResult result = operation.Value;

            // Extract Formulas:
            foreach (DocumentPage page in result.Pages)
            {
                Console.WriteLine($"----Formulas detected from page #{page.PageNumber}----");

                Console.WriteLine($"Detected {page.Formulas.Count} formulas.");
                for (int i = 0; i < page.Formulas.Count; i++)
                {
                    DocumentFormula formula = page.Formulas[i];
                    Console.WriteLine($"- Formula #{i}: {formula.Value}");
                    Console.WriteLine($"  Kind: {formula.Kind}");
                    Console.WriteLine($"  Confidence: {formula.Confidence}");
                    Console.WriteLine($"  bounding polygon (points ordered clockwise):");
                    for (int j = 0; j < formula.Polygon.Count; j += 2)
                    {
                        Console.WriteLine($"      Point {j / 2} => X: {formula.Polygon[j]}, Y: {formula.Polygon[j + 1]}");
                    }
                }
            }
        }
    }
}
