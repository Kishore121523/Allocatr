// hooks/use-speech-recognition.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    webkitSpeechGrammarList: any;
  }
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const hasShownNetworkError = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    try {
      const recognition = new SpeechRecognition();
      
      // Test if the browser properly supports speech recognition
      if (!recognition) {
        console.warn("Speech recognition failed to initialize");
        return;
      }

    // Configure recognition
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    
    // Add additional compatibility settings for desktop browsers
    if ('webkitSpeechRecognition' in window) {
      recognition.grammars = recognition.grammars || window.webkitSpeechGrammarList?.();
    }

    recognition.onstart = () => {
      setIsListening(true);
      hasShownNetworkError.current = false;
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const combinedTranscript = finalTranscript || interimTranscript;
      if (combinedTranscript) {
        setTranscript(combinedTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);

      // Only log non-network errors to console
      if (event.error !== "network") {
        console.warn("Speech recognition error:", event.error);
      }

      switch (event.error) {
        case "network":
          // Network errors are common in development and some environments
          // Only show the error once per session
          if (!hasShownNetworkError.current) {
            hasShownNetworkError.current = true;
            setHasNetworkError(true);
            toast.error("Voice input unavailable", {
              description: "Speech recognition service is not accessible. Make sure you're on HTTPS and have a stable internet connection.",
              duration: 5000,
            });
          }
          break;

        case "not-allowed":
          toast.error("Microphone access denied", {
            description: "Please enable microphone access in your browser settings and refresh the page.",
          });
          break;

        case "no-speech":
          // This is not really an error, just timeout
          toast.info("No speech detected", {
            description: "Try speaking louder or closer to the microphone.",
          });
          break;

        case "audio-capture":
          toast.error("No microphone found", {
            description: "Please ensure a microphone is connected and accessible.",
          });
          break;

        case "aborted":
          // User or system aborted, no need to show error
          break;

        case "service-not-allowed":
          toast.error("Speech service blocked", {
            description: "Speech recognition is blocked by your browser or security settings.",
          });
          break;

        case "bad-grammar":
          // Just restart, this is usually temporary
          setTimeout(() => {
            if (!isListening) {
              try {
                recognition.start();
              } catch (e) {
                // Ignore
              }
            }
          }, 100);
          break;

        default:
          if (event.error) {
            toast.error("Voice input error", {
              description: "Something went wrong. Please try again.",
            });
          }
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // Test if speech recognition actually works
    // This will fail immediately if network is not available
    recognition.onaudiostart = () => {
      // If we get here, the service is working
      setHasNetworkError(false);
    };

      recognitionRef.current = recognition;
    } catch (error) {
      console.warn("Failed to initialize speech recognition:", error);
      setHasNetworkError(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Voice input not initialized", {
        description: "Please refresh the page and try again.",
      });
      return;
    }

    // Reset transcript
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch (error: any) {
      if (error.message && error.message.includes("already started")) {
        // Recognition is already running, stop and restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn("Could not restart recognition:", e);
            }
          }, 100);
        } catch (e) {
          console.warn("Could not stop recognition:", e);
        }
      } else {
        console.warn("Could not start voice input:", error);
        toast.error("Could not start voice input", {
          description: "Please try again or type your expense instead.",
        });
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.warn("Error stopping recognition:", error);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
  };
}