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
        /// Analyze data from certain types of common documents with prebuilt models, using an invoice as an example
        /// </summary>
        /// <returns></returns>
        public static async Task AnalyzeWithPrebuiltModel()
        {
            // Read the endpoint and apikey from app.config. For how to obtain the endpoint and apikey, please see Prerequisites in README.md .
            string endpoint = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"]!;
            string apiKey = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_KEY"]!;
            var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(apiKey));

#if (ANALYZE_LOCAL_FILE)
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

            Operation<AnalyzeResult> operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-invoice", content);
            AnalyzeResult result = operation.Value;

            // To see the list of all the supported fields returned by service and its corresponding types for the
            // prebuilt-invoice model, see:
            // https://aka.ms/azsdk/formrecognizer/invoicefieldschema

            // Extract DocumentField: 
            for (int i = 0; i < result.Documents.Count; i++)
            {
                Console.WriteLine($"Document {i}:");

                AnalyzedDocument document = result.Documents[i];

                foreach (var item in document.Fields)
                {
                    Utils.ExtractValueFromDocumentField(item.Key, item.Value);
                }
            }
        }
    }
}
