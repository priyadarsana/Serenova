from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

MODEL_NAME = "bhadresh-savani/distilbert-base-uncased-emotion"

# Lazy load model and tokenizer only when needed
_emotion_pipe = None

def get_emotion_pipe():
    global _emotion_pipe
    if _emotion_pipe is None:
        print("Loading emotion model...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        _emotion_pipe = pipeline(
            "text-classification",
            model=model,
            tokenizer=tokenizer,
            top_k=None
        )
    return _emotion_pipe

# For backwards compatibility
emotion_pipe = None  # Will be loaded on first use
