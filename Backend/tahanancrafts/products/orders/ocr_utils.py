import easyocr
import re

# Load OCR model
reader = easyocr.Reader(['en'], gpu=False)

def extract_text_from_image(image_path):
    """
    Extract text from image and return as clean string.
    """
    result = reader.readtext(image_path, detail=0)
    return " ".join(result)

def extract_reference_number(text: str):
    patterns = [
        r"(?:Ref(?:erence)?\.?\s?(?:No|Number)?\.?\s?:?\s?)([A-Za-z0-9]{6,20})",
        r"(?:Txn\s?ID|Transaction\s?ID)\s?:?\s?([A-Za-z0-9]{6,20})",
        r"(?:Trace\s?No\.?)\s?:?\s?([A-Za-z0-9]{6,20})",
        r"\b[A-Za-z0-9]{8,20}\b"  # last fallback
    ]

    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return match.group(1)

    return None

def extract_amount(text: str):
    patterns = [
        r"₱\s?([\d,]+\.\d{2})",
        r"PHP\s?([\d,]+\.\d{2})",
        r"Amount\s?:?\s?([\d,]+\.\d{2})",
        r"\b([\d,]+\.\d{2})\b"
    ]

    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", ""))
    return None

def extract_sender_account(text: str):
    patterns = [
        r"Acct(?:ount)?\s?(?:No|Number)?\.?:?\s?([0-9]{6,20})",
        r"Sender\s?:?\s?([A-Za-z ]+)\s?\(?\+?([0-9]{10,12})?\)?",
        r"\b09\d{9}\b",
        r"\+639\d{9}\b"
    ]

    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            # return entire matched useful number
            groups = [g for g in match.groups() if g]
            return groups[-1] if groups else None

    return None

def detect_payment_source(text: str):
    text = text.lower()

    if "gcash" in text:
        return "GCash"
    if "bpi" in text:
        return "BPI"
    if "bdo" in text:
        return "BDO"
    if "metrobank" in text:
        return "Metrobank"
    if "unionbank" in text:
        return "Unionbank"
    if "landbank" in text:
        return "Landbank"
    if "transfer" in text:
        return "Bank Transfer"

    return "Unknown"
