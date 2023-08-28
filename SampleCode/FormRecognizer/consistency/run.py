import argparse
import json
import os
import time
from collections import defaultdict
from hashlib import sha256
from pathlib import Path

from form_recognizer import AzureFormRecognizer

from dotenv import load_dotenv

load_dotenv()


FORM_RECOGNIZER = AzureFormRecognizer(
    os.environ["AZURE_ENDPOINT"], os.environ["AZURE_CREDENTIAL"], os.environ["API_VERSION"])


def analyze_document(recognizer, document, out_dir: Path, idx):
    with open(document, "rb") as fd:
        document_bytes = fd.read()

    result = recognizer.analyze_document(document_bytes, model_id=os.environ["MODEL_ID"])
    digest = sha256(json.dumps(result, sort_keys=True).encode('utf8')).hexdigest()
    print(f"{document.name}: Response digest {digest}")

    if not out_dir.exists():
        out_dir.mkdir(parents=True)

    out_file = out_dir / f"{document.name}_{digest[0:8]}_{idx}.json"
    out_file.write_text(json.dumps(result, indent=4))

    return digest


def check_consistency(files, out_dir, repeat, sleep):
    expected_digests = defaultdict(lambda: None)
    for i in range(repeat):
        print()
        print("Running round {}".format(i))

        for f in files:
            digest = analyze_document(FORM_RECOGNIZER, f, out_dir, i)

            assert expected_digests[f] is None or expected_digests[f] == digest, "Response changed!"

            expected_digests[f] = digest

        time.sleep(sleep)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--files", nargs="+", type=Path, required=True, help="Files to analyze")
    parser.add_argument("--out-dir", type=Path, default=Path("logs"), help="OCR result output directory")
    parser.add_argument("--repeat", type=int, default=100, help="Number of times to repeat the analysis")
    parser.add_argument("--sleep", type=int, default=60, help="Seconds to sleep between each round")
    return parser.parse_args()


if __name__ == "__main__":
    check_consistency(**vars(parse_args()))
