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
        /// Extract page lines, paragraphs, styles, table structures from a given document
        /// </summary>
        /// <returns></returns>
        public static async Task ExtractLayoutAsync()
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

            Operation<AnalyzeResult> operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", content);
            AnalyzeResult result = operation.Value;

            // Extract page lines:
            foreach (DocumentPage page in result.Pages)
            {
                Console.WriteLine($"Document Page {page.PageNumber} has {page.Lines.Count} line(s), {page.Words.Count} word(s)," +
                    $" and {page.SelectionMarks.Count} selection mark(s).");

                for (int i = 0; i < page.Lines.Count; i++)
                {
                    DocumentLine line = page.Lines[i];

                    Console.WriteLine($"  Line {i}:");
                    Console.WriteLine($"    Content: '{line.Content}'");

                    Console.Write("    Bounding polygon, with points ordered clockwise:");
                    for (int j = 0; j < line.Polygon.Count; j += 2)
                    {
                        Console.Write($" ({line.Polygon[j]}, {line.Polygon[j + 1]})");
                    }

                    Console.WriteLine();
                }

                for (int i = 0; i < page.SelectionMarks.Count; i++)
                {
                    DocumentSelectionMark selectionMark = page.SelectionMarks[i];

                    Console.WriteLine($"  Selection Mark {i} is {selectionMark.State}.");
                    Console.WriteLine($"    State: {selectionMark.State}");

                    Console.Write("    Bounding polygon, with points ordered clockwise:");
                    for (int j = 0; j < selectionMark.Polygon.Count; j++)
                    {
                        Console.Write($" ({selectionMark.Polygon[j]}, {selectionMark.Polygon[j + 1]})");
                    }

                    Console.WriteLine();
                }
            }

            // Extract paragraph:
            for (int i = 0; i < result.Paragraphs.Count; i++)
            {
                DocumentParagraph paragraph = result.Paragraphs[i];

                Console.WriteLine($"Paragraph {i}:");
                Console.WriteLine($"  Content: {paragraph.Content}");

                if (paragraph.Role != null)
                {
                    Console.WriteLine($"  Role: {paragraph.Role}");
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
                        var handwrittenContent = result.Content.Substring(span.Offset, span.Length);
                        Console.WriteLine($"  {handwrittenContent}");
                    }
                }
            }

            // Extract table cells:
            for (int i = 0; i < result.Tables.Count; i++)
            {
                DocumentTable table = result.Tables[i];

                Console.WriteLine($"Table {i} has {table.RowCount} rows and {table.ColumnCount} columns.");

                foreach (DocumentTableCell cell in table.Cells)
                {
                    Console.WriteLine($"  Cell ({cell.RowIndex}, {cell.ColumnIndex}) is a '{cell.Kind}' with content: {cell.Content}");
                }
            }

            // Next steps:
            // Learn more about Layout model: https://aka.ms/di-layout
            // Find more sample code: https://aka.ms/doc-intelligence-samples
        }
    }
}
