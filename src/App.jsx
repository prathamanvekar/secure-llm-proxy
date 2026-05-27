import { useState, useRef } from "react";

import "./App.css";

import { sendChat, uploadFile, uploadImage } from "./api";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [fileUploadEnabled, setFileUploadEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const fileInputRef = useRef(null);

  const examplePrompts = [
    "Summarize the latest AI security news",
    "Draft a professional email update",
    "Explain what prompt injection means",
    "Find recent data breach examples",
    "Rewrite this text more formally for john@pork.com",
    "Analyze this input for safety risks",
  ];

  const securityArticles = [
    {
      id: 1,
      title: "OmniGPT Data Breach",
      year: "2025",
      description: "Massive breach data allegedly for sale on dark web",
      url: "https://www.csoonline.com/article/3822911/hacker-allegedly-puts-massive-omnigpt-breach-data-for-sale-on-the-dark-web.html",
      position: "left-top",
    },
    {
      id: 2,
      title: "ChatGPT Corporate Bans",
      year: "2023",
      description: "Samsung blocks chatbots after code leak incident",
      url: "https://www.forbes.com/sites/siladityaray/2023/05/02/samsung-bans-chatgpt-and-other-chatbots-for-employees-after-sensitive-code-leak/",
      position: "left-bottom",
    },
    {
      id: 3,
      title: "API Keys Exposure",
      year: "2024",
      description: "GitHub awash with leaked AI credentials and tokens",
      url: "https://www.itpro.com/security/github-is-awash-with-leaked-ai-company-secrets-api-keys-tokens-and-credentials-were-all-found-out-in-the-open",
      position: "right-top",
    },
    {
      id: 4,
      title: "OpenAI Data Breach",
      year: "2023",
      description: "Major breach exposing user data and conversations",
      url: "https://www.windowscentral.com/artificial-intelligence/openai-chatgpt/openai-confirms-major-data-breach-exposing-users-names-email-addresses-and-more-transparency-is-important-to-us",
      position: "right-bottom",
    },
  ];

  const handlePromptClick = (prompt) => {
    setInputValue(prompt);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    const userMessage = {
      type: "user",
      content: inputValue,
      files: [...attachedFiles],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAttachedFiles([]);
    setFileUploadEnabled(false);
    setIsThinking(true);

    const policy = {
      enable_web_search: webSearchEnabled,
      sanitize_user_input: true,
      detect_prompt_injection: true,
      debug: true,
    };

    try {
      let response;

      // CASE 1: File upload
      if (attachedFiles.length > 0) {
        const file = attachedFiles[0];
        if (file.type.startsWith("image/")) {
          response = await uploadImage(file, policy);
        } else {
          response = await uploadFile(file, policy);
        }
      }
      // CASE 2: Text only
      else {
        response = await sendChat(inputValue, policy);
      }

      const securityData = {
        sanitizedPrompt: response.visualization.sanitized_prompt,
        securityVerdict: {
          status: response.status === "ALLOWED" ? "SAFE" : "BLOCKED",
          reason:
            response.status === "ALLOWED"
              ? "All security checks passed (PII, prompt injection, sanitization)"
              : response.reason,
        },
        webContext: response.visualization.sanitized_web_context
          ? response.visualization.sanitized_web_context
              .split("\n")
              .filter(Boolean)
              .map((line) => ({
                source: "Web",
                snippet: line,
              }))
          : null,
        finalResponse: response.visualization.llm_response,
      };

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          securityData,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          securityData: {
            sanitizedPrompt: "",
            securityVerdict: {
              status: "ERROR",
              reason: err.message,
            },

            webContext: null,
            finalResponse: "An error occurred while processing your request.",
          },
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
    setFileUploadEnabled(true);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    if (attachedFiles.length === 1) {
      setFileUploadEnabled(false);
    }
  };

  const hasMessages = messages.length > 0;

  const handleNewChat = () => {
    setMessages([]);
    setInputValue("");
    setAttachedFiles([]);
    setIsThinking(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1b2a] relative">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#415a77] rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#778da9] rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Floating Security Article Cards - Only on landing page */}
      {!hasMessages && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {securityArticles.map((article, idx) => {
            const positions = {
              "left-top": "left-20 top-[28%]",
              "left-bottom": "left-24 top-[58%]",
              "right-top": "right-24 top-[32%]",
              "right-bottom": "right-20 top-[62%]",
            };

            return (
              <div
                key={article.id}
                className={`absolute ${positions[article.position]} pointer-events-auto`}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div
                    className="w-72"
                    style={{
                      animation: `fadeIn 0.8s ease-out forwards, softFloat ${7.5 + idx * 0.5}s ease-in-out infinite`,
                      animationDelay: `${0.8 + idx * 0.15}s`,
                      opacity: 0,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div
                      className="glass-effect px-4 py-3 rounded-xl border border-[#778da9]/20
                                  shadow-xl backdrop-blur-xl hover:border-[#778da9]/60
                                  transition-all duration-300 hover:shadow-[0_0_24px_rgba(119,141,169,0.45)]
                                  hover:scale-[1.015] opacity-75 hover:opacity-95"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wide">
                          Security Breach
                        </span>
                        <span className="text-xs text-[#e0e1dd]/50 font-medium">
                          {article.year}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#e0e1dd] mb-1 leading-tight">
                        {article.title}
                      </h4>
                      <p className="text-xs text-[#e0e1dd]/70 leading-relaxed mb-3 line-clamp-1">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 text-[#778da9] text-sm font-medium
                                        group-hover:text-[#8b9eb3] transition-colors"
                        >
                          <span>Read more</span>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </div>
                        {/* icon removed */}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Header with navigation - show only when chat is active */}
      {hasMessages && (
        <header className="sticky top-0 z-50 px-6 py-4 border-b border-[#415a77]/30 animate-fade-in backdrop-blur-lg bg-[#0d1b2a]/80">
          <div className="w-full flex items-center justify-between">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         text-[#e0e1dd]/80 hover:text-[#e0e1dd]
                         hover:bg-[#415a77]/30 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>

            <h2
              className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold gradient-text"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AEGIS
            </h2>

            <button
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                         text-[#e0e1dd]/80 hover:text-[#e0e1dd]
                         hover:bg-[#415a77]/30 transition-all duration-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm font-medium">New Chat</span>
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main
        className={`flex-1 flex flex-col px-4 relative z-10 transition-all duration-700 ${hasMessages ? "justify-start pt-8" : "items-center justify-center"}`}
      >
        {/* Title - hide when chat starts */}
        <div
          className={`transition-all duration-700 ${hasMessages ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
        >
          <h1
            className="text-8xl md:text-6xl font-bold tracking-[0.3em] mb-6 gradient-text animate-fade-in-up text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            A E G I S
          </h1>

          <h3
            className="text-xl md:text-lg text-[#778da9] font-light tracking-wide mb-16 animate-fade-in text-center"
            style={{
              animationDelay: "0.2s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            Guardian for your LLMs
          </h3>
        </div>

        {/* Chat Messages Area */}
        {hasMessages && (
          <div className="w-full max-w-4xl mx-auto flex-1 overflow-y-auto mb-6 space-y-6 animate-fade-in">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{
                  animationDelay: `${idx * 0.1}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                }}
              >
                {message.type === "user" ? (
                  <div className="max-w-[75%] px-6 py-4 rounded-2xl bg-[#778da9]/30 text-[#e0e1dd] ml-auto">
                    {/* Display attached files */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {message.files.map((file, fileIdx) => (
                          <div
                            key={fileIdx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#415a77]/40
                                       text-[#e0e1dd] text-xs border border-[#415a77]/60"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="max-w-37.5 truncate">
                              {file.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.content && (
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="max-w-[85%] space-y-3">
                    {/* Sanitized Prompt (only show for SAFE) */}
                    {message.securityData.securityVerdict.status === "SAFE" && (
                      <div
                        className="glass-effect px-5 py-3 rounded-xl border-l-4 border-[#778da9]/50 animate-fade-in-up"
                        style={{
                          animationDelay: "0.1s",
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-[#778da9]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wide">
                            Sanitized Input
                          </span>
                        </div>
                        <p className="text-sm text-[#e0e1dd]/80 leading-relaxed">
                          {message.securityData.sanitizedPrompt}
                        </p>
                      </div>
                    )}

                    {/* Security Verdict */}
                    <div
                      className={`glass-effect px-5 py-3 rounded-xl border-l-4 animate-fade-in-up ${
                        message.securityData.securityVerdict.status === "SAFE"
                          ? "border-green-500/50"
                          : "border-red-500/50"
                      }`}
                      style={{
                        animationDelay: "0.2s",
                        opacity: 0,
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.securityData.securityVerdict.status ===
                        "SAFE" ? (
                          <svg
                            className="w-4 h-4 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        )}

                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            message.securityData.securityVerdict.status ===
                            "SAFE"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          Security Verdict:{" "}
                          {message.securityData.securityVerdict.status}
                        </span>
                      </div>

                      <p className="text-sm text-[#e0e1dd]/80">
                        {message.securityData.securityVerdict.reason}
                      </p>
                    </div>

                    {/* Security Block Panel (only when BLOCKED) */}
                    {message.securityData.securityVerdict.status ===
                      "BLOCKED" && (
                      <div
                        className={`glass-effect px-5 py-4 rounded-xl border-l-4 animate-fade-in-up ${
                          message.securityData.securityVerdict.reason ===
                          "MALWARE"
                            ? "border-amber-500/50"
                            : "border-red-500/50"
                        }`}
                        style={{
                          animationDelay: "0.3s",
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <svg
                            className={`w-5 h-5 ${
                              message.securityData.securityVerdict.reason ===
                              "MALWARE"
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span
                            className={`text-sm font-semibold uppercase tracking-wide ${
                              message.securityData.securityVerdict.reason ===
                              "MALWARE"
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            Request Blocked
                          </span>
                        </div>
                        <div className="space-y-3 text-sm text-[#e0e1dd]/85">
                          <p className="leading-relaxed">
                            {message.securityData.securityVerdict.reason ===
                            "PROMPT_INJECTION"
                              ? "This request appears to contain instructions that could manipulate the model's behavior or bypass its intended function."
                              : message.securityData.securityVerdict.reason ===
                                  "UNSAFE_REQUEST"
                                ? "This request includes content that doesn't align with safe usage guidelines and couldn't be processed."
                                : message.securityData.securityVerdict
                                      .reason === "MALWARE"
                                  ? "This request contains patterns associated with potentially harmful content and was filtered for your protection."
                                  : "This request couldn't be processed due to content policy restrictions."}
                          </p>
                          <p className="text-[#e0e1dd]/70">
                            Your request was filtered before being sent to the
                            model. This is a protective measure, not an error.
                          </p>
                          <div className="mt-3 pt-3 border-t border-[#415a77]/30">
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-4 h-4 text-[#778da9]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wide">
                                Sanitized Input
                              </span>
                            </div>
                            <p className="text-sm text-[#e0e1dd]/80 leading-relaxed">
                              {message.securityData.sanitizedPrompt}
                            </p>
                          </div>
                          <p className="text-xs text-[#e0e1dd]/60 italic">
                            💡 Try rephrasing your question in a straightforward
                            way, focusing on what information you need rather
                            than how to obtain it.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Web Context (if enabled) */}
                    {message.securityData.webContext && (
                      <div
                        className="glass-effect px-5 py-3 rounded-xl border-l-4 border-[#415a77]/50 animate-fade-in-up"
                        style={{
                          animationDelay: "0.35s",
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg
                            className="w-4 h-4 text-[#778da9]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          </svg>
                          <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wide">
                            Web Context
                          </span>
                        </div>
                        <div className="space-y-2">
                          {message.securityData.webContext.map(
                            (ctx, ctxIdx) => (
                              <div
                                key={ctxIdx}
                                className="bg-[#415a77]/20 px-3 py-2 rounded-lg"
                              >
                                <p className="text-xs font-medium text-[#778da9] mb-1">
                                  {ctx.source}
                                </p>
                                <p className="text-xs text-[#e0e1dd]/70">
                                  {ctx.snippet}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Final LLM Response (only when SAFE) */}
                    {message.securityData.securityVerdict.status === "SAFE" && (
                      <div
                        className="glass-effect px-6 py-4 rounded-2xl animate-fade-in-up"
                        style={{
                          animationDelay: "0.4s",
                          opacity: 0,
                          animationFillMode: "forwards",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#415a77]/30">
                          <div className="w-2 h-2 rounded-full bg-[#778da9] animate-pulse"></div>
                          <span className="text-xs font-semibold text-[#778da9] uppercase tracking-wide">
                            Response
                          </span>
                        </div>
                        <p className="text-base leading-relaxed text-[#e0e1dd]">
                          {message.securityData.finalResponse}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="glass-effect px-6 py-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full bg-[#778da9] animate-pulse"
                        style={{ animationDelay: "0s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-[#778da9] animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-[#778da9] animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-[#778da9]">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input bar - centered initially, moves to bottom when chat starts */}
        <div
          className={`w-full transition-all duration-700 ${hasMessages ? "max-w-4xl mx-auto mb-16 " : "max-w-3xl"}`}
        >
          {!hasMessages && <div className="mb-16"></div>}

          <div className="glass-effect rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(119,141,169,0.2)] transition-shadow duration-300">
            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <div className="px-6 pt-3 pb-2 border-b border-[#415a77]/30">
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#415a77]/30
                                 text-[#e0e1dd] text-xs border border-[#415a77]/40"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="max-w-37.5 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(idx)}
                        className="ml-1 hover:text-[#778da9] transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main input area */}
            <div className="px-6 py-4 flex items-center gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent outline-none placeholder:text-[#e0e1dd]/40
                           text-[#e0e1dd] font-light text-base"
              />
              <button
                onClick={handleSubmit}
                className="bg-linear-to-r from-[#778da9] to-[#415a77]
                           hover:from-[#8b9eb3] hover:to-[#4d6a8a]
                           transition-all duration-300 ease-out
                           rounded-xl px-5 py-2.5 text-base font-medium
                           hover:scale-105 active:scale-95
                           shadow-lg hover:shadow-xl
                           flex items-center justify-center min-w-11"
              >
                <span className="text-xl">↑</span>
              </button>
            </div>

            {/* Bottom controls bar */}
            <div className="px-6 py-3 border-t border-[#415a77]/30 flex items-center justify-between gap-4 flex-wrap">
              {/* Model Display */}
              <button
                onClick={() =>
                  alert("Fund our API keys so we can build the next t3.chat 🚀")
                }
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#415a77]/30 transition-all duration-300 cursor-pointer"
                title="Support us!"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#778da9] animate-pulse"></div>
                <span className="text-sm font-medium text-[#e0e1dd]/90">
                  Gemma 3
                </span>
              </button>

              {/* Toggles */}
              <div className="flex items-center gap-4">
                {/* Web Search Toggle */}
                <button
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300
                             ${webSearchEnabled ? "bg-[#778da9]/50 text-[#e0e1dd] shadow-lg" : "bg-transparent text-[#e0e1dd]/40"}
                             hover:bg-[#415a77]/30`}
                  title="Toggle Web Search"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium">Search</span>
                </button>

                {/* File Upload Button */}
                <button
                  onClick={handleAttachClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300
                             ${fileUploadEnabled ? "bg-[#778da9]/30 text-[#e0e1dd]" : "text-[#e0e1dd]/60"}
                             hover:bg-[#415a77]/30`}
                  title="Attach Files"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  <span className="text-xs font-medium">Attach</span>
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Example prompts - hide when chat starts */}
        {!hasMessages && (
          <div
            className="w-full max-w-3xl animate-fade-in"
            style={{
              animationDelay: "0.5s",
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <p className="text-sm text-[#778da9]/60 pt-8 mb-4 text-center font-medium">
              Try asking about:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examplePrompts.map((prompt, idx) => (
                <div
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="group relative px-5 py-3.5 rounded-xl cursor-pointer
                           transition-all duration-300 ease-out
                           hover:bg-[#415a77]/20 hover:scale-[1.02]
                           border border-[#415a77]/30 hover:border-[#415a77]/60
                           animate-fade-in-up"
                  style={{
                    animationDelay: `${0.6 + idx * 0.05}s`,
                    opacity: 0,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-[#778da9] opacity-60
                                  group-hover:opacity-100 group-hover:scale-150 transition-all"
                    ></div>
                    <span
                      className="text-sm text-[#e0e1dd]/70 group-hover:text-[#e0e1dd]
                                   font-normal transition-colors"
                    >
                      {prompt}
                    </span>
                  </div>
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                                transition-opacity pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(119, 141, 169, 0.05), transparent)",
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
