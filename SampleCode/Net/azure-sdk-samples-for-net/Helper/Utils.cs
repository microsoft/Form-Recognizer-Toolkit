// coding: utf - 8
// --------------------------------------------------------------------------
// Copyright(c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for
// license information.
// --------------------------------------------------------------------------
using Azure.AI.DocumentIntelligence;

namespace azure_sdk_samples_for_net
{
    public class Utils
    {
        /// <summary>
        /// Extract value from AnalyzeResult.Document[n].Fields . This function could extract descendant child DocumentField by recursion. 
        /// </summary>
        /// <param name="key">The key to display</param>
        /// <param name="docField">The DocumentField value to extract</param>
        /// <param name="isSubItem">Indicates whether the current DocumentField is a descendant element</param>
        public static void ExtractValueFromDocumentField(string key, DocumentField docField, bool isSubItem = false)
        {
            var valueStr = "";

            if (docField.Type == DocumentFieldType.String)
            {
                valueStr = docField.ValueString;
            }
            else if (docField.Type == DocumentFieldType.Currency)
            {
                CurrencyValue currencyVal = docField.ValueCurrency;
                valueStr = $"{currencyVal.CurrencySymbol}{currencyVal.Amount}";
            }
            else if (docField.Type == DocumentFieldType.Address)
            {
                valueStr = $"{docField.ValueAddress.HouseNumber}, {docField.ValueAddress.Road}, {docField.ValueAddress.City}, " +
                           $"{docField.ValueAddress.State}, {docField.ValueAddress.PostalCode}";
            }
            else if (docField.Type == DocumentFieldType.Date)
            {
                valueStr = docField.ValueDate.ToString();
            }
            else if (docField.Type == DocumentFieldType.Dictionary)
            {
                // if current DocumentField type is an Object, extract each property in Object.
                IReadOnlyDictionary<string, DocumentField> itemFields = docField.ValueDictionary;
                foreach (var item in itemFields)
                {
                    ExtractValueFromDocumentField(item.Key, item.Value, isSubItem);
                }

                return;
            }
            else if (docField.Type == DocumentFieldType.List)
            {
                Console.WriteLine(key);
                if (docField.ValueList.Count > 0)
                {
                    // if current DocumentField type is an array, extract each member in array.
                    for (var i = 0; i < docField.ValueList.Count; i++)
                    {
                        Console.WriteLine($"    Index {i} :");
                        ExtractValueFromDocumentField(key, docField.ValueList[i], true);
                    }
                }

                return;
            }
            else
            {
                valueStr = docField.Content;
            }

            var keyStr = isSubItem ? $"        {key}" : key;
            Console.WriteLine($"{keyStr} : '{valueStr}', with confidence {docField.Confidence}");
        }
    }
}
