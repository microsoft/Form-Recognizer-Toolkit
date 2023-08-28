import requests
import time
import uuid

debug = False


class AzureFormRecognizer():
    """
    Doc reference :
    https://learn.microsoft.com/en-us/azure/applied-ai-services/form-recognizer/quickstarts/get-started-sdks-rest-api?view=form-recog-3.0.0&preserve-view=true&pivots=programming-language-rest-api
    """

    def __init__(self, api_endpoint, api_key, api_version="2022-08-31", api_cert=None):
        self.api_endpoint = api_endpoint
        self.api_key = api_key
        self.api_version = api_version
        self.api_cert = api_cert

    def pool_result(self, operation_url, headers, max_retry=100):
        traceId = headers["X-ClientTraceId"]
        for _ in range(max_retry):
            request = requests.get(operation_url, headers=headers, cert=self.api_cert)
            if request.status_code != 200:
                raise ValueError(f"Invalid response status {request.status_code} for {operation_url}")

            result = request.json()
            status = result["status"]
            if status == "succeeded":
                return result["analyzeResult"]
            elif status in ["running", "notStarted"]:
                if debug:
                    print(f"{traceId} Waiting...")
                time.sleep(1)
            else:
                raise ValueError(f"Invalid operation status {status} for {operation_url}")

        raise RuntimeError("Max retry reached")

    def analyze_document(self, document_bytes: str, model_id="prebuilt-layout"):
        traceId = str(uuid.uuid4())

        print(f"{traceId}: Analyze document")
        path = f"/formrecognizer/documentModels/{model_id}:analyze?api-version={self.api_version}"
        constructed_url = self.api_endpoint + path
        if debug:
            print(f"{traceId} {constructed_url}")

        headers = {
            "Ocp-Apim-Subscription-Key": self.api_key,
            "Content-type": "application/octet-stream",
            "X-ClientTraceId": traceId,
        }

        request = requests.post(
            constructed_url, headers=headers, data=document_bytes, cert=self.api_cert)
        if request.status_code != 202:
            raise ValueError(f"Error {request.status_code}")

        if debug:
            print(f"{traceId} {request.headers}")

        operation_url = request.headers["Operation-Location"]
        result = self.pool_result(operation_url, headers)
        return result
