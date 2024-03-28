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
        ///  Extract content from a given file with improved quality through the add-on high resolution capability
        /// </summary>
        /// <returns></returns>
        public static async Task AddOn_HighResolutionExtraction()
        {
            // Read the endpoint and apikey from app.config. For how to obtain the endpoint and apikey, please see Prerequisites in README.md .
            string endpoint = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT"]!;
            string apiKey = ConfigurationManager.AppSettings["AZURE_DOCUMENT_INTELLIGENCE_KEY"]!;
            var client = new DocumentIntelligenceClient(new Uri(endpoint), new AzureKeyCredential(apiKey));

#if (ANALYZE_LOCAL_FILE)
            #region Option 1: Analyze a document file from local file system.
            // Set the value of variable "docFilePath" to your actual file path.
            var docFilePath = $"{Environment.CurrentDirectory}\\Assets\\read-highres.png";
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
            Uri uriSource = new Uri("https://documentintelligence.ai.azure.com/documents/samples/read/read-highres.png");
            var content = new AnalyzeDocumentContent()
            {
                UrlSource = uriSource
            };
            #endregion
#endif

            //  Specify DocumentAnalysisFeature.OcrHighResolution as the analysis features
            List<DocumentAnalysisFeature> features = new List<DocumentAnalysisFeature> { DocumentAnalysisFeature.OcrHighResolution };

            var operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-read", content, features: features);
            AnalyzeResult result = operation.Value;

            // Extract page lines:
            foreach (DocumentPage page in result.Pages)
            {
                Console.WriteLine($"Document Page {page.PageNumber} has {page.Lines.Count} line(s), {page.Words.Count} word(s),");

                for (int i = 0; i < page.Lines.Count; i++)
                {
                    DocumentLine line = page.Lines[i];
                    Console.WriteLine($"  Line {i} has content: '{line.Content}'.");

                    Console.WriteLine($"    Its bounding box is:");
                    Console.WriteLine($"      Upper left => X: {line.Polygon[0]}, Y= {line.Polygon[1]}");
                    Console.WriteLine($"      Upper right => X: {line.Polygon[2]}, Y= {line.Polygon[3]}");
                    Console.WriteLine($"      Lower right => X: {line.Polygon[4]}, Y= {line.Polygon[5]}");
                    Console.WriteLine($"      Lower left => X: {line.Polygon[6]}, Y= {line.Polygon[7]}");
                }
            }

            // Detect handwritten:
            foreach (DocumentStyle style in result.Styles)
            {
                // Check the style and style confidence to see if text is handwritten.
                // Note that value '0.8' is used as an example.
                bool isHandwritten = style.IsHandwritten.HasValue && style.IsHandwritten == true;

                if (isHandwritten && style.Confidence > 0.8)
                {
                    Console.WriteLine($"Handwritten content found:");

                    foreach (DocumentSpan span in style.Spans)
                    {
                        Console.WriteLine($"  Content: {result.Content.Substring(span.Offset, span.Length)}");
                    }
                }
            }

            // Detect language:
            foreach (DocumentLanguage language in result.Languages)
            {
                Console.WriteLine($"  Found language '{language.Locale}' with confidence {language.Confidence}.");
            }
        }
    }
}
