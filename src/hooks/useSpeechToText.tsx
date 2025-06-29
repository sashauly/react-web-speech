import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export interface SpeechToTextOptions {
  lang?: SpeechRecognition["lang"];
  continuous?: SpeechRecognition["continuous"];
  interimResults?: SpeechRecognition["interimResults"];
  maxAlternatives?: SpeechRecognition["maxAlternatives"];
  grammars?: SpeechGrammarList;
}

export interface SpeechToTextEvents {
  onaudiostart?: (event: Event) => void;
  onaudioend?: (event: Event) => void;
  onend?: (event: Event) => void;
  onerror?: (event: SpeechRecognitionErrorEvent) => void;
  onnomatch?: (event: SpeechRecognitionEvent) => void;
  onresult?: (event: SpeechRecognitionEvent) => void;
  onsoundstart?: (event: Event) => void;
  onsoundend?: (event: Event) => void;
  onspeechstart?: (event: Event) => void;
  onspeechend?: (event: Event) => void;
  onstart?: (event: Event) => void;
  oninterim?: (interim: string) => void;
  onfinal?: (finalText: string, confidence: number | null) => void;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  confidence: number | null;
  results: SpeechRecognitionResultList | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setOptions: (opts: Partial<SpeechToTextOptions>) => void;
  abortListening: () => void;
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  interimTranscript: string;
  finalTranscript: string;
  resultsHistory: string[];
  processedInterimTranscript: string;
  processedFinalTranscript: string;
}

function editInterim(s: string, dictionary?: Record<string, string>) {
  if (!dictionary) return s;
  const result = s
    .split(" ")
    .map((word) => {
      word = word.trim();
      return dictionary[word.toLowerCase()]
        ? dictionary[word.toLowerCase()]
        : word;
    })
    .join(" ");
  console.log("[useSpeechToText] editInterim:", s, "=>", result);
  return result;
}

function editFinal(s: string, dictionary?: Record<string, string>) {
  if (!dictionary) return s;
  const result = s.replace(/\s{1,}([.,?!:-])/g, "$1");
  console.log("[useSpeechToText] editFinal:", s, "=>", result);
  return result;
}

const defaultOptions: SpeechToTextOptions = {
  lang: "en-US",
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
};

const useSpeechToText = (
  initialOptions: Partial<SpeechToTextOptions> = {},
  eventHandlers: Partial<SpeechToTextEvents> = {},
  dictionary?: Record<string, string>,
  actions?: Record<string, () => void>
): UseSpeechToTextReturn => {
  console.log("[useSpeechToText] Hook initialized");
  const [transcriptState, setTranscriptState] = useState({
    transcript: "",
    interimTranscript: "",
    finalTranscript: "",
    resultsHistory: [] as string[],
  });
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [results, setResults] = useState<SpeechRecognitionResultList | null>(
    null
  );
  const [options, setOptionsState] = useState<SpeechToTextOptions>({
    ...defaultOptions,
    ...initialOptions,
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "prompt" | "unsupported"
  >("prompt");

  const processedInterimTranscript = useMemo(
    () => editInterim(transcriptState.interimTranscript, dictionary),
    [transcriptState.interimTranscript, dictionary]
  );
  const processedFinalTranscript = useMemo(
    () => editFinal(transcriptState.finalTranscript, dictionary),
    [transcriptState.finalTranscript, dictionary]
  );

  useEffect(() => {
    let isMounted = true;
    console.log("[useSpeechToText] Checking microphone permission...");
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          if (!isMounted) return;
          setMicPermission(status.state as typeof micPermission);
          console.log(
            `[useSpeechToText] Microphone permission: ${status.state}`
          );
          if (status.state === "denied") {
            setError(
              "Microphone access is denied. Please allow microphone access in your browser settings."
            );
            console.error("[useSpeechToText] Microphone access denied.");
          }
          status.onchange = () => {
            if (!isMounted) return;
            setMicPermission(status.state as typeof micPermission);
            console.log(
              `[useSpeechToText] Microphone permission changed: ${status.state}`
            );
            if (status.state === "denied") {
              setError(
                "Microphone access is denied. Please allow microphone access in your browser settings."
              );
              console.error(
                "[useSpeechToText] Microphone access denied (onchange)."
              );
            } else {
              setError(null);
            }
          };
        })
        .catch((err) => {
          if (!isMounted) return;
          setMicPermission("unsupported");
          console.warn(
            "[useSpeechToText] Permissions API unsupported or error:",
            err
          );
        });
    } else {
      setMicPermission("unsupported");
      console.warn("[useSpeechToText] Permissions API not supported.");
    }
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      setError("This browser does not support SpeechRecognition");
      console.error(
        "[useSpeechToText] SpeechRecognition not supported in this browser."
      );
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    console.log(
      "[useSpeechToText] SpeechRecognition instance created (or recreated due to options change)",
      options
    );

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      let bestConfidence: number | null = null;
      const newFinals: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          const processed = editInterim(transcriptPart, dictionary);
          final += processed;
          bestConfidence = event.results[i][0].confidence;
          newFinals.push(processed);
        } else {
          interim += editInterim(transcriptPart, dictionary);
        }
      }
      setTranscriptState((prev) => ({
        transcript:
          (final ? prev.finalTranscript + final : prev.finalTranscript) +
          interim,
        interimTranscript: interim,
        finalTranscript: final
          ? prev.finalTranscript + final
          : prev.finalTranscript,
        resultsHistory:
          newFinals.length > 0
            ? [...prev.resultsHistory, ...newFinals]
            : prev.resultsHistory,
      }));
      setConfidence(bestConfidence);
      setResults(event.results);
      if (newFinals.length > 0) {
        if (actions) {
          newFinals.forEach((result) => {
            result.split(" ").forEach((word) => {
              const cmd = word.trim().toLowerCase();
              if (actions[cmd]) {
                console.log("[useSpeechToText] Action triggered:", cmd);
                actions[cmd]();
              }
            });
          });
        }
        eventHandlers.onfinal?.(newFinals.join(" "), bestConfidence);
      }
      if (interim) {
        eventHandlers.oninterim?.(interim);
      }
      eventHandlers.onresult?.(event);
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
      console.error("[useSpeechToText] onerror:", event.error, event);
      eventHandlers.onerror?.(event);
    };
    recognition.onend = (event: Event) => {
      setIsListening(false);
      console.log("[useSpeechToText] onend", event);
      eventHandlers.onend?.(event);
    };
    recognition.onaudiostart = (event: Event) => {
      console.log("[useSpeechToText] onaudiostart", event);
      eventHandlers.onaudiostart?.(event);
    };
    recognition.onaudioend = (event: Event) => {
      console.log("[useSpeechToText] onaudioend", event);
      eventHandlers.onaudioend?.(event);
    };
    recognition.onnomatch = (event: SpeechRecognitionEvent) => {
      console.warn("[useSpeechToText] onnomatch", event);
      eventHandlers.onnomatch?.(event);
    };
    recognition.onsoundstart = (event: Event) => {
      console.log("[useSpeechToText] onsoundstart", event);
      eventHandlers.onsoundstart?.(event);
    };
    recognition.onsoundend = (event: Event) => {
      console.log("[useSpeechToText] onsoundend", event);
      eventHandlers.onsoundend?.(event);
    };
    recognition.onspeechstart = (event: Event) => {
      console.log("[useSpeechToText] onspeechstart", event);
      eventHandlers.onspeechstart?.(event);
    };
    recognition.onspeechend = (event: Event) => {
      console.log("[useSpeechToText] onspeechend", event);
      eventHandlers.onspeechend?.(event);
    };
    recognition.onstart = (event: Event) => {
      setIsListening(true);
      console.log("[useSpeechToText] onstart", event);
      eventHandlers.onstart?.(event);
    };

    return () => {
      recognition.stop();
      recognitionRef.current = null;
      console.log("[useSpeechToText] SpeechRecognition instance cleaned up.");
    };
  }, [options, dictionary, actions]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.lang = options.lang || defaultOptions.lang!;
      recognition.continuous = options.continuous ?? defaultOptions.continuous!;
      recognition.interimResults =
        options.interimResults ?? defaultOptions.interimResults!;
      recognition.maxAlternatives =
        options.maxAlternatives ?? defaultOptions.maxAlternatives!;
      if (options.grammars) {
        recognition.grammars = options.grammars;
        console.log("[useSpeechToText] Grammars set.");
      }
      console.log("[useSpeechToText] Recognition options updated", options);
    }
  }, [options]);

  const setOptions = useCallback((opts: Partial<SpeechToTextOptions>) => {
    setOptionsState((prev) => ({ ...prev, ...opts }));
    console.log("[useSpeechToText] Options updated:", opts);
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscriptState({
      transcript: "",
      interimTranscript: "",
      finalTranscript: "",
      resultsHistory: [],
    });
    setConfidence(null);
    setResults(null);
    console.log(
      "[useSpeechToText] Attempting to start listening. Mic permission:",
      micPermission
    );
    if (micPermission === "denied") {
      setError(
        "Microphone access is denied. Please allow microphone access in your browser settings."
      );
      console.error(
        "[useSpeechToText] Cannot start: microphone access denied."
      );
      return;
    }
    if (micPermission === "prompt") {
      setError("Please allow microphone access to use speech recognition.");
      console.warn(
        "[useSpeechToText] Microphone permission is prompt. User must allow access."
      );
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("[useSpeechToText] Recognition started.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error(
            "[useSpeechToText] Failed to start recognition:",
            err.message
          );
        } else {
          setError("Failed to start recognition");
          console.error(
            "[useSpeechToText] Failed to start recognition: unknown error"
          );
        }
      }
    } else {
      console.error("[useSpeechToText] Recognition instance is not available.");
    }
  }, [micPermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log("[useSpeechToText] Recognition stopped.");
    }
  }, []);

  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      console.log("[useSpeechToText] Recognition aborted.");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscriptState({
      transcript: "",
      interimTranscript: "",
      finalTranscript: "",
      resultsHistory: [],
    });
    setConfidence(null);
    setResults(null);
    setError(null);
    console.log("[useSpeechToText] Transcript reset.");
  }, []);

  useEffect(() => {
    setOptionsState((prev) => {
      const changed = Object.keys(initialOptions).some(
        (key) =>
          prev[key as keyof SpeechToTextOptions] !==
          initialOptions[key as keyof SpeechToTextOptions]
      );
      if (changed) {
        console.log(
          "[useSpeechToText] initialOptions changed:",
          initialOptions
        );
        return { ...prev, ...initialOptions };
      }
      return prev;
    });
  }, [initialOptions]);

  return {
    isListening,
    transcript: transcriptState.transcript,
    error,
    confidence,
    results,
    startListening,
    stopListening,
    resetTranscript,
    setOptions,
    abortListening,
    recognitionRef,
    interimTranscript: transcriptState.interimTranscript,
    finalTranscript: transcriptState.finalTranscript,
    resultsHistory: transcriptState.resultsHistory,
    processedInterimTranscript,
    processedFinalTranscript,
  };
};

export default useSpeechToText;
