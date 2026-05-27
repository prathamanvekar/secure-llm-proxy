# AEGIS 🛡️

**Guardian for your LLMs** — A secure, production-ready LLM proxy with built-in security layers.

AEGIS protects your AI interactions by sanitizing sensitive data, detecting prompt injections, and filtering malicious content before it reaches the model.

## ✨ Features

- **🔒 Multi-Layer Security**
  - PII sanitization (emails, phones, credit cards, API keys)
  - Prompt injection detection
  - Malware pattern filtering
  - Real-time threat assessment

- **🌐 Web Search Integration**
  - Safe, sanitized web context retrieval
  - Security-filtered search results

- **📁 Multi-Format Support**
  - File uploads (PDF, DOCX, TXT)
  - Image processing with OCR
  - Drag-and-drop interface

- **🎨 Modern UI**
  - Glassmorphism design
  - Smooth animations
  - Security breach news cards
  - Real-time chat interface

## 🚀 Tech Stack

**Frontend:**

- React + Vite
- Tailwind CSS v4
- Modern ES6+

**Backend:**

- FastAPI
- Gemma 3 (LLM)
- Presidio (PII detection)
- EasyOCR
- SerpAPI (web search)

## 📦 Setup

### Frontend

```bash
npm install
npm run dev
```

### Backend

Run the Jupyter notebook in `backend notebook/` to start the secure LLM server with ngrok tunneling.

Update `src/api.js` with your ngrok URL:

```javascript
const API_BASE = "https://your-ngrok-url.ngrok-free.app";
```

## 🎯 Usage

1. Start the backend server (notebook)
2. Launch the frontend (`npm run dev`)
3. Try example prompts or upload files
4. Watch AEGIS sanitize and secure your requests in real-time

## 🔐 Security Layers

1. **Input Sanitization** — Removes PII before processing
2. **Threat Detection** — Identifies injection attempts and malicious patterns
3. **Safe Response** — Blocks unsafe requests, allows safe ones
4. **Transparency** — Shows what was filtered and why

## 💡 Example Prompts

Try these to see AEGIS in action:

- "Summarize the latest AI security news"
- "Explain what prompt injection means"
- "Rewrite this text: Contact me at john@example.com"

## 📝 License

MIT

---

**Note:** This is a hackathon project. Fund our API keys so we can build the next t3.chat! 🚀
