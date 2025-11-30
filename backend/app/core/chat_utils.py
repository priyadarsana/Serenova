def combine_user_text(turns: list[dict]) -> str:
    """Extract and combine all user messages from chat conversation"""
    user_parts = [t["text"] for t in turns if t.get("role") == "user"]
    return " ".join(user_parts)
