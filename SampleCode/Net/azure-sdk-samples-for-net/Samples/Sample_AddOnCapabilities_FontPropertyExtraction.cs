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
        /// Extract font information from a given file with the add-on font styling capability
        /// </summary>
        /// <returns></returns>
        public static async Task AddOn_FontPropertyExtraction()
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

            // Specify DocumentAnalysisFeature.FontStyling as the analysis features.
            List<DocumentAnalysisFeature> features = new List<DocumentAnalysisFeature> { DocumentAnalysisFeature.StyleFont };

            var operation = await client.AnalyzeDocumentAsync(WaitUntil.Completed, "prebuilt-layout", content, features: features);
            AnalyzeResult result = operation.Value;

            // Handwritten styles
            var handwrittenSpans = result.Styles
                .Where(s => s.IsHandwritten != null && s.IsHandwritten.Value)
                .SelectMany(s => s.Spans).OrderBy(s => s.Offset);
            if (handwrittenSpans.Any())
            {
                Console.WriteLine("----Handwritten content----");
                var handwrittenContents = handwrittenSpans.Select(s => result.Content.Substring(s.Offset, s.Length));
                Console.WriteLine(string.Join(",", handwrittenContents));
            }
            else
            {
                Console.WriteLine("No handwritten content was detected.");
            }

            // DocumentStyle has the following font related attributes:
            var similarFontFamilies = new Dictionary<string, List<DocumentStyle>>(); // e.g., 'Arial, sans-serif
            var fontStyles = new Dictionary<DocumentFontStyle, List<DocumentStyle>>(); // e.g, 'italic'
            var fontWeights = new Dictionary<DocumentFontWeight, List<DocumentStyle>>(); // e.g., 'bold'
            var fontColors = new Dictionary<string, List<DocumentStyle>>(); // in '#rrggbb' hexadecimal format
            var fontBackgroundColors = new Dictionary<string, List<DocumentStyle>>(); // in '#rrggbb' hexadecimal format

            Console.WriteLine("\n----Fonts styles detected in the document----");

            // Iterate over the styles and group them by their font attributes.
            foreach (var style in result.Styles)
            {
                if (!string.IsNullOrEmpty(style.SimilarFontFamily))
                {
                    if (similarFontFamilies.ContainsKey(style.SimilarFontFamily))
                    {
                        similarFontFamilies[style.SimilarFontFamily].Add(style);
                    }
                    else
                    {
                        similarFontFamilies.Add(style.SimilarFontFamily, new List<DocumentStyle>() { style });
                    }
                }
                if (style.FontStyle != null)
                {
                    if (fontStyles.ContainsKey(style.FontStyle.Value))
                    {
                        fontStyles[style.FontStyle.Value].Add(style);
                    }
                    else
                    {
                        fontStyles.Add(style.FontStyle.Value, new List<DocumentStyle>() { style });
                    }
                }
                if (style.FontWeight != null)
                {
                    if (fontWeights.ContainsKey(style.FontWeight.Value))
                    {
                        fontWeights[style.FontWeight.Value].Add(style);
                    }
                    else
                    {
                        fontWeights.Add(style.FontWeight.Value, new List<DocumentStyle>() { style });
                    }
                }
                if (!string.IsNullOrEmpty(style.Color))
                {
                    if (fontColors.ContainsKey(style.Color))
                    {
                        fontColors[style.Color].Add(style);
                    }
                    else
                    {
                        fontColors.Add(style.Color, new List<DocumentStyle>() { style });
                    }
                }
                if (!string.IsNullOrEmpty(style.BackgroundColor))
                {
                    if (fontBackgroundColors.ContainsKey(style.BackgroundColor))
                    {
                        fontBackgroundColors[style.BackgroundColor].Add(style);
                    }
                    else
                    {
                        fontBackgroundColors.Add(style.BackgroundColor, new List<DocumentStyle>() { style });
                    }
                }
            }

            Console.WriteLine($"Detected {similarFontFamilies.Count()} font families:");
            foreach (var family in similarFontFamilies)
            {
                var spans = family.Value.SelectMany(s => s.Spans).OrderBy(s => s.Offset);
                var styleContents = spans.Select(s => result.Content.Substring(s.Offset, s.Length));

                Console.WriteLine($"- Font family: '{family.Key}'");
                Console.WriteLine($"  Text: '{string.Join(",", styleContents)}'");
            }

            Console.WriteLine($"\nDetected {fontStyles.Count()} font styles:");
            foreach (var style in fontStyles)
            {
                var spans = style.Value.SelectMany(s => s.Spans).OrderBy(s => s.Offset);
                var styleContents = spans.Select(s => result.Content.Substring(s.Offset, s.Length));

                Console.WriteLine($"- Font style: '{style.Key}'");
                Console.WriteLine($"  Text: '{string.Join(",", styleContents)}'");
            }

            Console.WriteLine($"\nDetected {fontWeights.Count()} font weights:");
            foreach (var weight in fontWeights)
            {
                var spans = weight.Value.SelectMany(s => s.Spans).OrderBy(s => s.Offset);
                var styleContents = spans.Select(s => result.Content.Substring(s.Offset, s.Length));

                Console.WriteLine($"- Font weight: '{weight.Key}'");
                Console.WriteLine($"  Text: '{string.Join(",", styleContents)}'");
            }

            Console.WriteLine($"\nDetected {fontColors.Count()} font colors:");
            foreach (var color in fontColors)
            {
                var spans = color.Value.SelectMany(s => s.Spans).OrderBy(s => s.Offset);
                var styleContents = spans.Select(s => result.Content.Substring(s.Offset, s.Length));

                Console.WriteLine($"- Font color: '{color.Key}'");
                Console.WriteLine($"  Text: '{string.Join(",", styleContents)}'");
            }

            Console.WriteLine($"\nDetected {fontBackgroundColors.Count()} font background colors:");
            foreach (var backGroundColor in fontBackgroundColors)
            {
                var spans = backGroundColor.Value.SelectMany(s => s.Spans).OrderBy(s => s.Offset);
                var styleContents = spans.Select(s => result.Content.Substring(s.Offset, s.Length));

                Console.WriteLine($"- Font background color: '{backGroundColor.Key}'");
                Console.WriteLine($"  Text: '{string.Join(",", styleContents)}'");
            }
        }
    }
}
