// coding: utf - 8
// --------------------------------------------------------------------------
// Copyright(c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for
// license information.
// --------------------------------------------------------------------------

namespace azure_sdk_samples_for_net
{
    internal class Program
    {
        /// <summary>
        /// Here is the entrance for the Azure Document Intelligence client SDK Samples.
        /// </summary>
        /// <returns></returns>
        static async Task Main()
        {
            Console.WriteLine("Hello, welcome to the Azure Document Intelligence client SDK Sample Codes for .Net!");
            PrintHelpInfo();

            bool running = true;
            while (running)
            {
                Console.WriteLine("Please input the command alias which you want to execute:");
                string? commandStr = Console.ReadLine();

                if (!string.IsNullOrWhiteSpace(commandStr))
                {
                    switch (commandStr.ToLower())
                    {
                        case "help":
                            PrintHelpInfo();
                            break;
                        case "quit":
                        case "exit":
                            running = false;
                            break;
                        default:
                            (SampleFuncDelegate, string) funcTurple;
                            if (sampleDict.TryGetValue(commandStr, out funcTurple))
                            {
                                Console.Write($"\r\n Executing {funcTurple.Item2} \r\n\r\n");
                                await funcTurple.Item1();
                                Console.Write("\r\n\r\n");
                            }
                            else
                            {
                                Console.WriteLine("No such sample");
                                PrintHelpInfo();
                            }

                            break;
                    }
                }
            }

            Console.WriteLine("Program Exited.");
        }

        delegate Task SampleFuncDelegate();
        /// <summary>
        /// Sample command dictionary, it's used to display the help command-list and map the input command to executing example.
        /// </summary>
        static Dictionary<string, (SampleFuncDelegate, string)> sampleDict = new() {
            {"s01", (Samples.ExtractLayoutAsync, "Sample - Extract the layout of a document") },
            {"s02", (Samples.AnalyzeWithPrebuiltModel, "Sample - Analyze a document with a prebuilt model") },
            {"s03", (Samples.AddOn_HighResolutionExtraction, "Sample - Add-on : High resolution extraction")},
            {"s04", (Samples.AddOn_FormulaExtraction, "Sample - Add-on : Formula extraction")},
            {"s05", (Samples.AddOn_FontPropertyExtraction, "Sample - Add-on : Font property extraction")},
            {"s06", (Samples.AddOn_BarcodePropertyExtraction, "Sample - Add-on : Barcode property extraction")},
            {"s07", (Samples.AddOn_LanguageDetection, "Sample - Add-on : Language detection")},
            {"s08", (Samples.AddOn_KeyValuePairsExtraction, "Sample - Add-on : Key-value pairs extraction")},
        };

        /// <summary>
        /// Print the sample command list and help information.
        /// </summary>
        static void PrintHelpInfo()
        {
            Console.WriteLine("Here is the command list for samples:");
            Console.WriteLine("Command Alias ------------ Description");
            Console.WriteLine("============================================================");
            foreach (var item in sampleDict)
            {
                Console.WriteLine($"{item.Key}           ------------ {item.Value.Item2}");
            }
            Console.WriteLine("------------------------------------------------------------");
            Console.WriteLine("help          ------------ Print the command list");
            Console.WriteLine("exit | quit   ------------ Exit program");
            Console.WriteLine("============================================================");
        }
    }
}
