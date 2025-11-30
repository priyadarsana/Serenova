# Quick Start: Install Ollama for AI Chatbot

## What is Ollama?

Ollama lets you run powerful AI models (like ChatGPT) **locally on your computer** - completely free, private, and offline.

## Installation (Windows)

### Option 1: Download Installer
1. Go to https://ollama.ai/download
2. Download Windows installer
3. Run the installer
4. Ollama will start automatically in the background

### Option 2: Using Winget
```powershell
winget install Ollama.Ollama
```

## Download the AI Model

After installing Ollama, you need to download a model:

```powershell
# Recommended: Phi-3 Mini (2.3GB, great balance)
ollama pull phi3:mini

# Alternative: Gemma 2B (1.4GB, smaller and faster)
ollama pull gemma:2b

# Alternative: Llama 3.2 1B (1.3GB, smallest)
ollama pull llama3.2:1b
```

The first download takes 2-5 minutes depending on your internet speed.

## Start Ollama Server

Ollama usually starts automatically after installation. If not:

```powershell
ollama serve
```

You should see: `Ollama is running`

## Verify It's Working

```powershell
# Check if server is running
ollama list

# Test with a simple prompt
ollama run phi3:mini "Hello, how are you?"
```

## Using with Aurora Mind

Once Ollama is running:

1. Start Aurora Mind backend: `uvicorn app.main:app --reload --port 8000`
2. Start Aurora Mind frontend: `npm run dev`
3. Go to http://localhost:5173
4. Complete the intake chat
5. Click "Talk to AI support companion"
6. Chat away! 💬

## Troubleshooting

### "Ollama is not running"
- Windows: Check system tray for Ollama icon
- Or manually run: `ollama serve` in PowerShell

### "Model not found"
```powershell
ollama pull phi3:mini
```

### Port 11434 is in use
Ollama uses port 11434 by default. Make sure nothing else is using it.

### Slow responses
- First response is always slower (model loading)
- Subsequent responses are faster
- Try smaller model: `ollama pull gemma:2b`
- Phi-3 runs on CPU (no GPU needed)

## Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| phi3:mini | 2.3GB | Medium | High | **Recommended - Great balance** |
| gemma:2b | 1.4GB | Fast | Good | Lower-end hardware |
| llama3.2:1b | 1.3GB | Very Fast | Good | Very limited hardware |
| mistral:7b | 4.1GB | Slower | Excellent | Powerful hardware |

## Resources

- Official site: https://ollama.ai
- Model library: https://ollama.ai/library
- GitHub: https://github.com/ollama/ollama

## What Happens Behind the Scenes

1. You type a message in Aurora Mind
2. Frontend sends message to backend (`/api/support/chat`)
3. Backend adds safety system prompt + intake context
4. Backend sends to Ollama at `http://localhost:11434`
5. Ollama runs Phi-3 model on your CPU
6. Model generates empathetic response
7. Backend checks for crisis keywords
8. Response sent back to frontend
9. You see the AI's reply

**100% local. 100% private. 100% free.** 🔒
