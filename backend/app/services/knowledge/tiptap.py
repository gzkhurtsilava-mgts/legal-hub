def extract_text(node: dict) -> str:
    """Recursively extract plain text from a TipTap JSON document."""
    if not node or not isinstance(node, dict):
        return ""
    parts: list[str] = []
    if node.get("type") == "text":
        parts.append(node.get("text", ""))
    for child in node.get("content", []):
        parts.append(extract_text(child))
    return " ".join(p for p in parts if p)
