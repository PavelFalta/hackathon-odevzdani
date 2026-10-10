import re
import unicodedata


def column_key(header: str) -> str:
    text = unicodedata.normalize("NFC", header.strip()).lower()
    text = text.replace(" ", "_")
    text = re.sub(r"_+", "_", text)
    return text


def slugify(text: str) -> str:
    folded = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", folded).strip("-").lower()
    return slug[:96] if slug else "dataset"
