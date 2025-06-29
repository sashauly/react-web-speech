import { useEffect, useReducer, useCallback, useMemo } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import useSpeechToText from "@/hooks/useSpeechToText";
import {
  CirclePlay,
  CircleStop,
  RefreshCcw,
  Copy,
  Trash2,
  Info,
  Settings2,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";

const DICTIONARY: Record<string, string> = {
  точка: ".",
  запятая: ",",
  вопрос: "?",
  восклицание: "!",
  двоеточие: ":",
  тире: "-",
  абзац: "\n",
  отступ: "\t",
};

// List of all supported languages for Web Speech API (as of 2024):
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang

const SUPPORTED_LANGUAGES = [
  // Language, Region, Label
  { lang: "af", region: "ZA", label: "Afrikaans (South Africa)" },
  { lang: "ar", region: "SA", label: "Arabic (Saudi Arabia)" },
  { lang: "ar", region: "EG", label: "Arabic (Egypt)" },
  { lang: "ar", region: "JO", label: "Arabic (Jordan)" },
  { lang: "ar", region: "KW", label: "Arabic (Kuwait)" },
  { lang: "ar", region: "LB", label: "Arabic (Lebanon)" },
  { lang: "ar", region: "MA", label: "Arabic (Morocco)" },
  { lang: "ar", region: "QA", label: "Arabic (Qatar)" },
  { lang: "ar", region: "AE", label: "Arabic (UAE)" },
  { lang: "ar", region: "TN", label: "Arabic (Tunisia)" },
  { lang: "ar", region: "OM", label: "Arabic (Oman)" },
  { lang: "bg", region: "BG", label: "Bulgarian (Bulgaria)" },
  { lang: "ca", region: "ES", label: "Catalan (Spain)" },
  { lang: "zh", region: "CN", label: "Chinese, Mandarin (Simplified, China)" },
  {
    lang: "zh",
    region: "TW",
    label: "Chinese, Mandarin (Traditional, Taiwan)",
  },
  {
    lang: "zh",
    region: "HK",
    label: "Chinese, Cantonese (Traditional, Hong Kong)",
  },
  { lang: "hr", region: "HR", label: "Croatian (Croatia)" },
  { lang: "cs", region: "CZ", label: "Czech (Czech Republic)" },
  { lang: "da", region: "DK", label: "Danish (Denmark)" },
  { lang: "nl", region: "NL", label: "Dutch (Netherlands)" },
  { lang: "en", region: "AU", label: "English (Australia)" },
  { lang: "en", region: "CA", label: "English (Canada)" },
  { lang: "en", region: "IN", label: "English (India)" },
  { lang: "en", region: "IE", label: "English (Ireland)" },
  { lang: "en", region: "NZ", label: "English (New Zealand)" },
  { lang: "en", region: "ZA", label: "English (South Africa)" },
  { lang: "en", region: "GB", label: "English (United Kingdom)" },
  { lang: "en", region: "US", label: "English (United States)" },
  { lang: "fi", region: "FI", label: "Finnish (Finland)" },
  { lang: "fr", region: "CA", label: "French (Canada)" },
  { lang: "fr", region: "FR", label: "French (France)" },
  { lang: "de", region: "DE", label: "German (Germany)" },
  { lang: "el", region: "GR", label: "Greek (Greece)" },
  { lang: "he", region: "IL", label: "Hebrew (Israel)" },
  { lang: "hi", region: "IN", label: "Hindi (India)" },
  { lang: "hu", region: "HU", label: "Hungarian (Hungary)" },
  { lang: "id", region: "ID", label: "Indonesian (Indonesia)" },
  { lang: "it", region: "IT", label: "Italian (Italy)" },
  { lang: "ja", region: "JP", label: "Japanese (Japan)" },
  { lang: "ko", region: "KR", label: "Korean (Korea)" },
  { lang: "ms", region: "MY", label: "Malay (Malaysia)" },
  { lang: "no", region: "NO", label: "Norwegian (Norway)" },
  { lang: "pl", region: "PL", label: "Polish (Poland)" },
  { lang: "pt", region: "BR", label: "Portuguese (Brazil)" },
  { lang: "pt", region: "PT", label: "Portuguese (Portugal)" },
  { lang: "ro", region: "RO", label: "Romanian (Romania)" },
  { lang: "ru", region: "RU", label: "Russian (Russia)" },
  { lang: "sr", region: "RS", label: "Serbian (Serbia)" },
  { lang: "sk", region: "SK", label: "Slovak (Slovakia)" },
  { lang: "es", region: "AR", label: "Spanish (Argentina)" },
  { lang: "es", region: "BO", label: "Spanish (Bolivia)" },
  { lang: "es", region: "CL", label: "Spanish (Chile)" },
  { lang: "es", region: "CO", label: "Spanish (Colombia)" },
  { lang: "es", region: "CR", label: "Spanish (Costa Rica)" },
  { lang: "es", region: "EC", label: "Spanish (Ecuador)" },
  { lang: "es", region: "SV", label: "Spanish (El Salvador)" },
  { lang: "es", region: "ES", label: "Spanish (Spain)" },
  { lang: "es", region: "US", label: "Spanish (United States)" },
  { lang: "es", region: "MX", label: "Spanish (Mexico)" },
  { lang: "es", region: "GT", label: "Spanish (Guatemala)" },
  { lang: "es", region: "HN", label: "Spanish (Honduras)" },
  { lang: "es", region: "NI", label: "Spanish (Nicaragua)" },
  { lang: "es", region: "PA", label: "Spanish (Panama)" },
  { lang: "es", region: "PY", label: "Spanish (Paraguay)" },
  { lang: "es", region: "PE", label: "Spanish (Peru)" },
  { lang: "es", region: "PR", label: "Spanish (Puerto Rico)" },
  { lang: "es", region: "DO", label: "Spanish (Dominican Republic)" },
  { lang: "es", region: "UY", label: "Spanish (Uruguay)" },
  { lang: "es", region: "VE", label: "Spanish (Venezuela)" },
  { lang: "sv", region: "SE", label: "Swedish (Sweden)" },
  { lang: "th", region: "TH", label: "Thai (Thailand)" },
  { lang: "tr", region: "TR", label: "Turkish (Turkey)" },
  { lang: "uk", region: "UA", label: "Ukrainian (Ukraine)" },
  { lang: "vi", region: "VN", label: "Vietnamese (Vietnam)" },
];

// --- State Management ---
const initialState = {
  selectedLanguage: "en",
  selectedRegion: "US",
  copyStatus: "idle" as "idle" | "copied",
  shouldRestart: false,
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  customGrammar: "",
  autoStart: false,
  autoStop: false,
  history: [] as string[],
  micPermission: null as string | null,
  lastConfidence: null as number | null,
};

type Action =
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "SET_REGION"; payload: string }
  | { type: "SET_COPY_STATUS"; payload: "idle" | "copied" }
  | { type: "SET_SHOULD_RESTART"; payload: boolean }
  | { type: "SET_CONTINUOUS"; payload: boolean }
  | { type: "SET_INTERIM_RESULTS"; payload: boolean }
  | { type: "SET_MAX_ALTERNATIVES"; payload: number }
  | { type: "SET_CUSTOM_GRAMMAR"; payload: string }
  | { type: "SET_AUTO_START"; payload: boolean }
  | { type: "SET_AUTO_STOP"; payload: boolean }
  | { type: "ADD_HISTORY"; payload: string }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_MIC_PERMISSION"; payload: string | null }
  | { type: "SET_LAST_CONFIDENCE"; payload: number | null };

function reducer(
  state: typeof initialState,
  action: Action
): typeof initialState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, selectedLanguage: action.payload };
    case "SET_REGION":
      return { ...state, selectedRegion: action.payload };
    case "SET_COPY_STATUS":
      return { ...state, copyStatus: action.payload };
    case "SET_SHOULD_RESTART":
      return { ...state, shouldRestart: action.payload };
    case "SET_CONTINUOUS":
      return { ...state, continuous: action.payload };
    case "SET_INTERIM_RESULTS":
      return { ...state, interimResults: action.payload };
    case "SET_MAX_ALTERNATIVES":
      return { ...state, maxAlternatives: action.payload };
    case "SET_CUSTOM_GRAMMAR":
      return { ...state, customGrammar: action.payload };
    case "SET_AUTO_START":
      return { ...state, autoStart: action.payload };
    case "SET_AUTO_STOP":
      return { ...state, autoStop: action.payload };
    case "ADD_HISTORY":
      return {
        ...state,
        history: [...state.history.slice(-9), action.payload],
      };
    case "CLEAR_HISTORY":
      return { ...state, history: [] };
    case "SET_MIC_PERMISSION":
      return { ...state, micPermission: action.payload };
    case "SET_LAST_CONFIDENCE":
      return { ...state, lastConfidence: action.payload };
    default:
      return state;
  }
}

export default function SpeechRecognition() {
  const [state, dispatch] = useReducer(reducer, initialState);
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

  const uniqueLanguages = useMemo(
    () =>
      Array.from(
        SUPPORTED_LANGUAGES.reduce(
          (acc, cur) => acc.add(cur.lang),
          new Set<string>()
        )
      ),
    []
  );
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
        <TooltipProvider>
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
            {/* Language Select */}
            <div className="w-full flex gap-2">
              <div className="w-full flex flex-col mb-2">
                <Label htmlFor="language-select">
                  Language
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Language select info"
                        className="align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Select the language for speech recognition.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(val) => {
                    dispatch({ type: "SET_LANGUAGE", payload: val });
                    // Reset region to first available for this language
                    const firstRegion =
                      SUPPORTED_LANGUAGES.find((l) => l.lang === val)?.region ||
                      "US";
                    dispatch({ type: "SET_REGION", payload: firstRegion });
                  }}
                >
                  <SelectTrigger className="w-full mt-1" aria-label="Language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueLanguages.map((langCode) => {
                      // Find a label for this language (first occurrence)
                      const label =
                        SUPPORTED_LANGUAGES.find(
                          (l) => l.lang === langCode
                        )?.label.split(" (")[0] || langCode;
                      return (
                        <SelectItem key={langCode} value={langCode}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full flex flex-col mb-2">
                <Label htmlFor="region-select">
                  Region
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Region select info"
                        className="align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Select the region for the chosen language.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={selectedRegion}
                  onValueChange={(val) =>
                    dispatch({ type: "SET_REGION", payload: val })
                  }
                >
                  <SelectTrigger className="w-full mt-1" aria-label="Region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((l) => (
                      <SelectItem key={l.region} value={l.region}>
                        {l.label.includes("(")
                          ? l.label.split(" (")[1].replace(")", "")
                          : l.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Options */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Mic Permission */}
              <div>
                <Label htmlFor="mic-perm">
                  Mic Permission
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Mic permission info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Shows the current microphone permission status in your
                      browser.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Badge
                  variant={
                    micPermission === "granted"
                      ? "default"
                      : micPermission === "denied"
                      ? "destructive"
                      : "secondary"
                  }
                  className="ml-2"
                >
                  {micPermission || "unknown"}
                </Badge>
              </div>
              {/* Continuous */}
              <div>
                <Label htmlFor="continuous">
                  Continuous
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Continuous mode info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      When enabled, recognition will keep listening after each
                      result. If off, it stops after the first phrase.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  id="continuous"
                  checked={continuous}
                  onCheckedChange={(val) =>
                    dispatch({ type: "SET_CONTINUOUS", payload: val })
                  }
                />
              </div>
              {/* Interim Results */}
              <div>
                <Label htmlFor="interim">
                  Interim Results
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Interim results info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Show partial (interim) results as you speak, before the
                      final result is ready.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  id="interim"
                  checked={interimResults}
                  onCheckedChange={(val) =>
                    dispatch({ type: "SET_INTERIM_RESULTS", payload: val })
                  }
                />
              </div>
              {/* Max Alternatives */}
              <div>
                <Label htmlFor="maxAlt">
                  Max Alternatives
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Max alternatives info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      How many alternative transcriptions to request from the
                      recognition engine.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="maxAlt"
                  type="number"
                  min={1}
                  max={10}
                  value={maxAlternatives}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_MAX_ALTERNATIVES",
                      payload: Number(e.target.value),
                    })
                  }
                  className="w-20"
                />
              </div>
              {/* Auto Start */}
              <div>
                <Label htmlFor="autoStart">
                  Auto Start
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Auto start info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Automatically start recognition when the page loads or
                      when toggled on.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  id="autoStart"
                  checked={autoStart}
                  onCheckedChange={(val) =>
                    dispatch({ type: "SET_AUTO_START", payload: val })
                  }
                />
              </div>
              {/* Auto Stop */}
              <div>
                <Label htmlFor="autoStop">
                  Auto Stop
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Auto stop info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Automatically stop recognition after a phrase or when
                      toggled on.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Switch
                  id="autoStop"
                  checked={autoStop}
                  onCheckedChange={(val) =>
                    dispatch({ type: "SET_AUTO_STOP", payload: val })
                  }
                />
              </div>
            </div>
            {/* Manual Language & Custom Grammar */}
            <div className="flex flex-wrap gap-4 items-center mt-2">
              <div className="flex flex-col">
                <Label htmlFor="confidence">
                  Last Confidence
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Confidence info"
                        className=" align-middle"
                      >
                        <Info className="inline size-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Confidence score (0-1) of the last recognized phrase.
                      Higher is more certain.
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Badge variant="secondary" className="ml-2">
                  {lastConfidence !== null ? lastConfidence.toFixed(2) : "-"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col flex-1 min-w-[200px]">
              <Label htmlFor="customGrammar">
                Custom Grammar (SRGS)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label="Custom grammar info"
                      className=" align-middle"
                    >
                      <Info className="inline size-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Paste a custom SRGS XML or JavaScript grammar to influence
                    recognition (advanced).
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Textarea
                id="customGrammar"
                placeholder="Paste SRGS XML or JS grammar"
                value={customGrammar}
                onChange={(e) =>
                  dispatch({
                    type: "SET_CUSTOM_GRAMMAR",
                    payload: e.target.value,
                  })
                }
                className="w-full min-h-20"
              />
            </div>

            {/* Recognition History as Collapsible */}
            <Collapsible className="mt-2">
              <CollapsibleTrigger className="flex items-center gap-2 text-base font-semibold">
                <ChevronDown className="w-4 h-4" />
                <span>Recognition History</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      tabIndex={0}
                      aria-label="Recognition history info"
                      className=" align-middle"
                    >
                      <Info className="inline size-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Shows the last 10 recognized phrases for reference.
                  </TooltipContent>
                </Tooltip>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-2 mt-2">
                  {history.length === 0 ? (
                    <span className="text-muted-foreground text-xs">
                      No history yet.
                    </span>
                  ) : (
                    history.slice(-10).map((h, i) => (
                      <Badge key={i} variant="outline">
                        {h}
                      </Badge>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </TooltipProvider>
      </Collapsible>
      {/* Main Recognition UI */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          {/* Language select removed from here, now in options */}
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          <Button
            className="start"
            onClick={handleStart}
            disabled={isListening}
            title="Start speech recognition"
          >
            <CirclePlay className="inline align-middle mr-2" />
            <span>Start</span>
          </Button>
          <Button
            className="stop"
            onClick={handleStop}
            disabled={!isListening}
            variant="destructive"
            title="Stop speech recognition"
          >
            <CircleStop className="inline align-middle mr-2" />
            <span>Stop</span>
          </Button>
          <Button
            className="abort"
            onClick={handleAbort}
            variant="secondary"
            title="Reset recognition session"
          >
            <RefreshCcw className="inline align-middle mr-2" />
            <span>Reset</span>
          </Button>
          <Button
            className="copy"
            onClick={handleCopy}
            variant="secondary"
            title="Copy recognized text to clipboard"
          >
            <Copy className="inline align-middle mr-2" />
            <span>{copyStatus === "copied" ? "Done" : "Copy"}</span>
          </Button>
          <Button
            className="clear"
            onClick={handleClear}
            variant="secondary"
            title="Clear recognized text"
          >
            <Trash2 className="inline align-middle mr-2" />
            <span>Clear</span>
          </Button>
        </div>
      </div>
      <div>
        <label htmlFor="final_text" className="font-semibold">
          Final text
        </label>
        <Textarea
          id="final_text"
          value={processedFinalTranscript}
          readOnly
          className="w-full min-h-24 md:min-h-32 resize-y mt-2 text-base"
          aria-label="Final recognized text"
        />
      </div>
      <div>
        <label htmlFor="interim_text" className="font-semibold">
          Interim text
        </label>
        <Input
          id="interim_text"
          value={processedInterimTranscript}
          readOnly
          className="w-full mt-2 text-base text-muted-foreground"
          aria-label="Interim recognized text"
        />
      </div>
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="text-xs text-muted-foreground mt-2">
        <span>
          Tip: Press <kbd>Space</kbd> to start, <kbd>Escape</kbd> to stop
          recognition.
        </span>
      </div>
    </div>
  );
}
