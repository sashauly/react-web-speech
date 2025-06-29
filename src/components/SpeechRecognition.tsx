import { useEffect, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import useSpeechToText from "@/hooks/useSpeechToText";
import { Settings2, ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import SpeechRecognitionOptionsPanel from "./speech/SpeechRecognitionOptionsPanel";
import SpeechRecognitionHistory from "./speech/SpeechRecognitionHistory";
import SpeechRecognitionControls from "./speech/SpeechRecognitionControls";
import SpeechRecognitionTranscript from "./speech/SpeechRecognitionTranscript";
import DICTIONARY from "../lib/dictionary";
import { SUPPORTED_LANGUAGES, getUniqueLanguages } from "../lib/languages";
import { useSpeechRecognitionState } from "../hooks/useSpeechRecognitionState";

// List of all supported languages for Web Speech API (as of 2024):
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang

export default function SpeechRecognition() {
  const [state, dispatch] = useSpeechRecognitionState();
  const {
    selectedLanguage,
    selectedRegion,
    copyStatus,
    shouldRestart,
    continuous,
    interimResults,
    maxAlternatives,
    customGrammar,
    autoStart,
    autoStop,
    history,
    micPermission,
    lastConfidence,
  } = state;

  const lang = `${selectedLanguage}-${selectedRegion}`;

  const uniqueLanguages = useMemo(() => getUniqueLanguages(), []);
  const regionOptions = useMemo(
    () => SUPPORTED_LANGUAGES.filter((l) => l.lang === selectedLanguage),
    [selectedLanguage]
  );

  const {
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
    abortListening,
    processedFinalTranscript,
    processedInterimTranscript,
  } = useSpeechToText(
    {
      lang: lang,
      continuous,
      interimResults,
      maxAlternatives,
      grammars: undefined, // TODO: parse customGrammar if provided
    },
    {
      onfinal: (finalText, conf) => {
        dispatch({ type: "SET_LAST_CONFIDENCE", payload: conf ?? null });
        dispatch({ type: "ADD_HISTORY", payload: finalText });
      },
    },
    DICTIONARY
  );

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          dispatch({ type: "SET_MIC_PERMISSION", payload: status.state });
        })
        .catch(() =>
          dispatch({ type: "SET_MIC_PERMISSION", payload: "unsupported" })
        );
    } else {
      dispatch({ type: "SET_MIC_PERMISSION", payload: "unsupported" });
    }
  }, []);

  useEffect(() => {
    if (autoStart && !isListening) {
      handleStart();
    } else if (autoStop && isListening) {
      handleStop();
    }
  }, [autoStart, autoStop, isListening]);

  const handleStart = useCallback(() => {
    resetTranscript();
    startListening();
  }, [resetTranscript, startListening]);

  const handleStop = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const handleAbort = () => {
    if (abortListening) abortListening();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(processedFinalTranscript);
    dispatch({ type: "SET_COPY_STATUS", payload: "copied" });
    setTimeout(
      () => dispatch({ type: "SET_COPY_STATUS", payload: "idle" }),
      2000
    );
  };

  const handleClear = () => {
    resetTranscript();
    dispatch({ type: "CLEAR_HISTORY" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isListening) {
        handleStart();
        e.preventDefault();
      }
      if (e.code === "Escape" && isListening) {
        handleStop();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening, handleStart, handleStop]);

  useEffect(() => {
    if (isListening) {
      stopListening();
      dispatch({ type: "SET_SHOULD_RESTART", payload: true });
    }
    // eslint-disable-next-line
  }, [lang, continuous, interimResults, maxAlternatives, customGrammar]);

  useEffect(() => {
    if (shouldRestart && !isListening) {
      startListening();
      dispatch({ type: "SET_SHOULD_RESTART", payload: false });
    }
  }, [shouldRestart, isListening, startListening]);

  return (
    <div className="w-full max-w-3xl mx-auto px-2 md:px-6 py-4 md:py-8 space-y-6">
      <Collapsible defaultOpen className="p-4 border rounded-lg bg-card">
        {/* Collapsible Trigger */}
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            <h4 className="text-sm font-semibold">Options</h4>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <ChevronsUpDown className="w-5 h-5" />
              <span className="sr-only">Options</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-4 p-4">
          <SpeechRecognitionOptionsPanel
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={(val) => {
              dispatch({ type: "SET_LANGUAGE", payload: val });
              const firstRegion =
                SUPPORTED_LANGUAGES.find((l) => l.lang === val)?.region || "US";
              dispatch({ type: "SET_REGION", payload: firstRegion });
            }}
            selectedRegion={selectedRegion}
            setSelectedRegion={(val) =>
              dispatch({ type: "SET_REGION", payload: val })
            }
            uniqueLanguages={uniqueLanguages}
            regionOptions={regionOptions}
            continuous={continuous}
            setContinuous={(val) =>
              dispatch({ type: "SET_CONTINUOUS", payload: val })
            }
            interimResults={interimResults}
            setInterimResults={(val) =>
              dispatch({ type: "SET_INTERIM_RESULTS", payload: val })
            }
            maxAlternatives={maxAlternatives}
            setMaxAlternatives={(val) =>
              dispatch({ type: "SET_MAX_ALTERNATIVES", payload: val })
            }
            customGrammar={customGrammar}
            setCustomGrammar={(val) =>
              dispatch({ type: "SET_CUSTOM_GRAMMAR", payload: val })
            }
            autoStart={autoStart}
            setAutoStart={(val) =>
              dispatch({ type: "SET_AUTO_START", payload: val })
            }
            autoStop={autoStop}
            setAutoStop={(val) =>
              dispatch({ type: "SET_AUTO_STOP", payload: val })
            }
            micPermission={micPermission}
            lastConfidence={lastConfidence}
          />
          <SpeechRecognitionHistory history={history} />
        </CollapsibleContent>
      </Collapsible>
      {/* Main Recognition UI */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex-1 min-w-0" />
        <SpeechRecognitionControls
          isListening={isListening}
          copyStatus={copyStatus}
          onStart={handleStart}
          onStop={handleStop}
          onAbort={handleAbort}
          onCopy={handleCopy}
          onClear={handleClear}
        />
      </div>
      <SpeechRecognitionTranscript
        processedFinalTranscript={processedFinalTranscript}
        processedInterimTranscript={processedInterimTranscript}
        error={error}
      />
    </div>
  );
}
