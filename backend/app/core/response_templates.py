import random

TEMPLATES = {
    "sadness": {
        "low": [
            "It sounds like you're feeling a little low today, and that's completely okay. "
            "Maybe take a small break and do one gentle thing just for yourself.",
            "I notice a touch of sadness in your words. Remember, it's natural to have ups and downs. "
            "Be kind to yourself today."
        ],
        "medium": [
            "You seem really weighed down right now. Your feelings are valid, and you don't have to pretend you're okay. "
            "Try talking to someone you trust or writing down what's hurting you.",
            "It sounds like you're carrying something heavy today. You deserve support and care. "
            "Consider reaching out to someone close or doing something small that brings you comfort."
        ],
        "high": [
            "It sounds like you're going through something very heavy. You don't deserve to carry this alone. "
            "If you can, reach out to a close friend, family member, or a professional for support.",
            "What you're feeling right now sounds overwhelming, and I'm really sorry you're experiencing this. "
            "Please know you deserve help. Consider talking to someone you trust or a mental health professional."
        ],
    },
    "joy": {
        "low": [
            "There's a hint of lightness in what you shared. "
            "Notice the small good moments today and let yourself enjoy them.",
            "I can sense a bit of positivity in your words. "
            "Take a moment to appreciate what's bringing you even a little happiness."
        ],
        "medium": [
            "You sound genuinely positive, and that's beautiful to see. "
            "Take a moment to celebrate what's going well for you.",
            "There's real joy coming through in what you shared! "
            "Soak in these good feelings and remember this moment."
        ],
        "high": [
            "You sound really joyful right now! "
            "Hold onto this feeling and maybe share it with someone you care about.",
            "What wonderful energy! It's clear something is bringing you real happiness. "
            "Enjoy this moment fully—you've earned it."
        ],
    },
    "anger": {
        "low": [
            "I sense a bit of frustration in your words. That's completely understandable. "
            "Sometimes naming what bothers us can help release some of that tension.",
            "You seem a little irritated, and that's okay. "
            "Give yourself permission to feel it, then take a breath and see what you need."
        ],
        "medium": [
            "It sounds like something has really upset you, and your anger is valid. "
            "Try taking a few deep breaths or stepping away from the situation for a moment.",
            "You're clearly dealing with real frustration right now. "
            "It's okay to feel angry—just remember to take care of yourself while you process this."
        ],
        "high": [
            "You sound very angry, and that's a powerful feeling. "
            "Before you act, try to pause and breathe. Consider talking to someone or channeling this energy into something physical like a walk.",
            "What you're feeling sounds intense and overwhelming. Your anger is valid. "
            "Please take a moment to ground yourself before making any big decisions. Reach out if you need support."
        ],
    },
    "fear": {
        "low": [
            "I notice a bit of worry or nervousness in your words. That's normal. "
            "Try grounding yourself—name five things you can see right now.",
            "You seem a little uneasy, and that's okay. "
            "Sometimes just acknowledging fear can make it feel more manageable."
        ],
        "medium": [
            "It sounds like anxiety or fear is weighing on you. You're not alone in feeling this way. "
            "Try a grounding exercise, take slow breaths, or talk to someone you trust.",
            "You're clearly feeling anxious, and that's really hard. "
            "Remember to breathe slowly and remind yourself that this feeling will pass."
        ],
        "high": [
            "You sound very scared or anxious right now, and I'm really sorry you're experiencing this. "
            "Please reach out to someone you trust or call a helpline if you feel unsafe. You don't have to face this alone.",
            "What you're feeling sounds overwhelming. Fear this intense is hard to carry. "
            "Please talk to someone—a friend, family member, or professional. You deserve support right now."
        ],
    },
    "neutral": {
        "low": [
            "You seem calm and reflective right now. "
            "Keep checking in with yourself and notice what you need.",
            "Your words feel balanced and steady. "
            "It's great that you're taking time to reflect."
        ],
        "medium": [
            "You sound thoughtful and centered. "
            "This is a good place to be—keep listening to yourself.",
            "There's a nice evenness to what you've shared. "
            "Stay present with yourself."
        ],
        "high": [
            "You sound very grounded and at peace. "
            "This clarity is valuable—hold onto it.",
            "What a calm and centered space you're in. "
            "Enjoy this equilibrium."
        ],
    },
    "surprise": {
        "low": [
            "Something seems to have caught you off guard. "
            "Take a moment to process what happened.",
            "You sound a bit surprised. "
            "Give yourself space to absorb this unexpected moment."
        ],
        "medium": [
            "It sounds like something unexpected just happened. "
            "Let yourself feel the surprise and then decide how you want to respond.",
            "You're clearly processing something surprising. "
            "Take your time—unexpected things can be disorienting."
        ],
        "high": [
            "Wow, something really caught you by surprise! "
            "Give yourself a moment to catch your breath and process what just happened.",
            "You sound genuinely shocked. "
            "That's a big reaction—take time to understand what you're feeling."
        ],
    },
    "love": {
        "low": [
            "There's warmth and care in your words. "
            "It's lovely to feel connection.",
            "I sense affection in what you've shared. "
            "Cherish these feelings of care."
        ],
        "medium": [
            "You sound genuinely caring and connected. "
            "Love in any form is beautiful—let yourself feel it.",
            "There's real warmth coming through. "
            "These feelings of love and connection are precious."
        ],
        "high": [
            "You sound full of love and connection! "
            "What a wonderful feeling. Let yourself be present in it.",
            "The depth of care you're feeling is beautiful. "
            "Hold onto this—it's something special."
        ],
    },
}

SUGGESTIONS = {
    ("sadness", "high"): [
        "Reach out to someone you trust and tell them how you feel",
        "Write down what's hurting you and what you wish could change",
        "View support resources and helplines"
    ],
    ("sadness", "medium"): [
        "Try a 3-minute breathing exercise",
        "Do one small comforting thing (music, warm drink, short walk)",
        "Write down three things that went okay today"
    ],
    ("sadness", "low"): [
        "Take a gentle 5-minute break",
        "Listen to calming music or sounds"
    ],
    ("joy", "high"): [
        "Write down what made you happy so you can remember it later",
        "Share your joy with someone you care about"
    ],
    ("joy", "medium"): [
        "Take a moment to celebrate what's going well",
        "Do something creative to express this positive energy"
    ],
    ("joy", "low"): [
        "Note one small thing that went okay today",
        "Keep noticing the little positives"
    ],
    ("anger", "high"): [
        "Take a 5-minute walk to cool down",
        "Write down what's making you angry without filtering",
        "Do something physical like stretching or exercise"
    ],
    ("anger", "medium"): [
        "Practice box breathing (4 counts in, hold, out, hold)",
        "Step away from the situation for a few minutes"
    ],
    ("anger", "low"): [
        "Name what's bothering you out loud",
        "Take three deep breaths"
    ],
    ("fear", "high"): [
        "Use the 5-4-3-2-1 grounding technique",
        "Call or text someone you trust",
        "View support resources and helplines"
    ],
    ("fear", "medium"): [
        "Try a grounding exercise",
        "Take slow, deep breaths for 2 minutes",
        "Write down what you're worried about"
    ],
    ("fear", "low"): [
        "Name five things you can see right now",
        "Take a few slow, calming breaths"
    ],
    ("neutral", "low"): [
        "Continue checking in with yourself",
        "Try a mindfulness exercise"
    ],
    ("neutral", "medium"): [
        "Journal about what's on your mind",
        "Take a reflective walk"
    ],
    ("neutral", "high"): [
        "Enjoy this calm moment",
        "Practice gratitude reflection"
    ],
    ("surprise", "low"): [
        "Take a moment to process what happened",
        "Write down your initial reaction"
    ],
    ("surprise", "medium"): [
        "Give yourself time to absorb this",
        "Talk to someone about what surprised you"
    ],
    ("surprise", "high"): [
        "Take a few deep breaths",
        "Write down everything you're feeling right now"
    ],
    ("love", "low"): [
        "Notice what brings you this warmth",
        "Express appreciation to someone"
    ],
    ("love", "medium"): [
        "Share your feelings with the person you care about",
        "Do something kind for yourself or someone else"
    ],
    ("love", "high"): [
        "Express your feelings to those you love",
        "Write about what makes this connection special"
    ],
}

def get_risk_level(label: str, score: float) -> str:
    """Determine risk level based on emotion and confidence score"""
    if label in ["sadness", "fear"] and score >= 0.75:
        return "high"
    if label in ["sadness", "fear", "anger"] and score >= 0.5:
        return "medium"
    return "low"

def build_response(label: str, score: float):
    """Generate empathetic message and suggestions based on emotion"""
    risk = get_risk_level(label, score)
    
    # Get templates for this emotion, fallback to neutral
    templates = TEMPLATES.get(label, TEMPLATES["neutral"])
    
    # Get message for this risk level, fallback to low
    messages = templates.get(risk, templates.get("low", ["Take care of yourself."]))
    message = random.choice(messages)
    
    # Get suggestions for this emotion + risk combo
    suggestions = SUGGESTIONS.get((label, risk), ["Take a short pause and breathe slowly for a moment."])
    
    return risk, message, suggestions
