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
        /// Extract key-value pairs from a given file with the add-on keyValuePairs capability
        /// </summary>
        /// <returns></returns>
        public static async Task AddOn_KeyValuePairsExtraction()
        {
            // Read the endpoint and apikey from app.config. For how to obtain the endpoint and apikey, please see Prerequisites in README.md .
            string endpoint = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"]!;
            string apiKey = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_KEY"]!;
            var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(apiKey));

#if(ANALYZE_LOCAL_FILE)
            #region Option 1: Analyze a sample document file from local file system.
            // Set the value of variable "docFilePath" to your actual file path.
            var docFilePath = $"{Environment.CurrentDirectory}\\Assets\\invoice_sample.jpg";
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
            Uri uriSource = new Uri("https://raw.githubusercontent.com/Azure-Samples/cognitive-services-REST-api-samples/master/curl/form-recognizer/invoice_sample.jpg");
            var content = new AnalyzeDocumentContent()
            {
                UrlSource = uriSource
            };
            #endregion
#endif

            // Specify DocumentAnalysisFeature.KeyValuePairs as the analysis features
            List<DocumentAnalysisFeature> features = new List<DocumentAnalysisFeature> { DocumentAnalysisFeature.KeyValuePairs };

            var operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", content, features: features);
            AnalyzeResult result = operation.Value;

            // Extract key-value-pair:
            Console.WriteLine("----Key Value Pair Options detected in the document----");
            Console.WriteLine($"Detected {result.KeyValuePairs.Count} Key Value Pairs:");

            for (int i = 0; i < result.KeyValuePairs.Count; i++)
            {
                var kvp = result.KeyValuePairs[i];

                Console.WriteLine($"- Key Value Pair #{i}: Key '{kvp.Key.Content}'");
                Console.WriteLine($"  Value: {(kvp.Value != null ? kvp.Value.Content : kvp.Value)}");
                Console.WriteLine($"  Confidence: {kvp.Confidence}");
            }
        }
    }
}
