import { useEffect, useState, useCallback, useMemo } from "react";
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
import { getUniqueLanguages, SUPPORTED_LANGUAGES } from "@/lib/languages";
import DICTIONARY from "@/lib/dictionary";

export default function SpeechRecognition() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [shouldRestart, setShouldRestart] = useState(false);

  const [continuous, setContinuous] = useState(true);
  const [interimResults, setInterimResults] = useState(true);
  const [maxAlternatives, setMaxAlternatives] = useState(3);
  const [customGrammar, setCustomGrammar] = useState("");
  const [autoStart, setAutoStart] = useState(false);
  const [autoStop, setAutoStop] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [micPermission, setMicPermission] = useState<string | null>(null);
  const [lastConfidence, setLastConfidence] = useState<number | null>(null);

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
      grammars: undefined,
    },
    {
      onfinal: (finalText, conf) => {
        setLastConfidence(conf ?? null);
        setHistory((prev) => [...prev, finalText]);
      },
    },
    DICTIONARY
  );

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setMicPermission(status.state);
        })
        .catch(() => setMicPermission("unsupported"));
    } else {
      setMicPermission("unsupported");
    }
  }, []);

  useEffect(() => {
    if (autoStart && !isListening) {
      handleStart();
    }
  }, [autoStart]);
  useEffect(() => {
    if (autoStop && isListening) {
      handleStop();
    }
  }, [autoStop]);

  useEffect(() => {
    console.log("[SpeechRecognition] Mounted");
    return () => {
      console.log("[SpeechRecognition] Unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("[SpeechRecognition] Language changed:", lang);
  }, [lang]);

  useEffect(() => {
    console.log("[SpeechRecognition] isListening:", isListening);
  }, [isListening]);

  useEffect(() => {
    console.log(
      "[SpeechRecognition] processedFinalTranscript:",
      processedFinalTranscript
    );
  }, [processedFinalTranscript]);

  useEffect(() => {
    console.log(
      "[SpeechRecognition] processedInterimTranscript:",
      processedInterimTranscript
    );
  }, [processedInterimTranscript]);

  useEffect(() => {
    if (error) console.error("[SpeechRecognition] Error:", error);
  }, [error]);

  const handleStart = useCallback(() => {
    console.log("[SpeechRecognition] handleStart called");
    resetTranscript();
    startListening();
  }, [resetTranscript, startListening]);

  const handleStop = useCallback(() => {
    console.log("[SpeechRecognition] handleStop called");
    stopListening();
  }, [stopListening]);

  const handleAbort = () => {
    console.log("[SpeechRecognition] handleAbort called");
    if (abortListening) abortListening();
  };

  const handleCopy = async () => {
    console.log("[SpeechRecognition] handleCopy called");
    await navigator.clipboard.writeText(processedFinalTranscript);
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const handleClear = () => {
    console.log("[SpeechRecognition] handleClear called");
    resetTranscript();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isListening) {
        console.log("[SpeechRecognition] Space pressed");
        handleStart();
        e.preventDefault();
      }
      if (e.code === "Escape" && isListening) {
        console.log("[SpeechRecognition] Escape pressed");
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
      setShouldRestart(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, continuous, interimResults, maxAlternatives, customGrammar]);

  useEffect(() => {
    if (shouldRestart && !isListening) {
      startListening();
      setShouldRestart(false);
    }
  }, [shouldRestart, isListening, startListening]);

  return (
    <div className="w-full mx-auto px-1 md:px-3 py-2 md:py-4">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Sidebar: Options Panel */}
        <aside className="w-full max-w-full md:max-w-xs md:border bg-card rounded-lg p-2 md:p-4 mb-4 md:mb-0">
          <Collapsible defaultOpen>
            <TooltipProvider>
              {/* Collapsible Trigger */}
              <div className="flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-1">
                  <Settings2 className="w-4 h-4" />
                  <h4 className="text-xs md:text-sm font-semibold">Options</h4>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <ChevronsUpDown className="w-4 h-4" />
                    <span className="sr-only">Options</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-2 p-2 md:p-3">
                {/* Language Select */}
                <div className="w-full flex gap-1 md:gap-2">
                  <div className="w-full flex flex-col mb-1">
                    <Label
                      htmlFor="language-select"
                      className="text-xs md:text-sm"
                    >
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
                        setSelectedLanguage(val);
                        // Reset region to first available for this language
                        const firstRegion =
                          SUPPORTED_LANGUAGES.find((l) => l.lang === val)
                            ?.region || "US";
                        setSelectedRegion(firstRegion);
                      }}
                    >
                      <SelectTrigger
                        className="w-full mt-1 min-h-8 text-xs md:text-sm"
                        aria-label="Language"
                      >
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
                  <div className="w-full flex flex-col mb-1">
                    <Label
                      htmlFor="region-select"
                      className="text-xs md:text-sm"
                    >
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
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger
                        className="w-full mt-1 min-h-8 text-xs md:text-sm"
                        aria-label="Region"
                      >
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
                <div className="flex flex-wrap gap-2 md:gap-3 items-center">
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
                          When enabled, recognition will keep listening after
                          each result. If off, it stops after the first phrase.
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Switch
                      id="continuous"
                      checked={continuous}
                      onCheckedChange={setContinuous}
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
                          Show partial (interim) results as you speak, before
                          the final result is ready.
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Switch
                      id="interim"
                      checked={interimResults}
                      onCheckedChange={setInterimResults}
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
                          How many alternative transcriptions to request from
                          the recognition engine.
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
                        setMaxAlternatives(Number(e.target.value))
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
                      onCheckedChange={setAutoStart}
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
                      onCheckedChange={setAutoStop}
                    />
                  </div>
                </div>
                {/* Manual Language & Custom Grammar */}
                <div className="flex flex-wrap gap-2 md:gap-3 items-center mt-1">
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
                      {lastConfidence !== null
                        ? lastConfidence.toFixed(2)
                        : "-"}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-[160px]">
                  <Label htmlFor="customGrammar" className="text-xs md:text-sm">
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
                        Paste a custom SRGS XML or JavaScript grammar to
                        influence recognition (advanced).
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Textarea
                    id="customGrammar"
                    placeholder="Paste SRGS XML or JS grammar"
                    value={customGrammar}
                    onChange={(e) => setCustomGrammar(e.target.value)}
                    className="w-full min-h-16 md:min-h-20 text-xs md:text-sm"
                  />
                </div>
                {/* Recognition History as Collapsible */}
                <Collapsible className="mt-1">
                  <CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold">
                    <ChevronDown className="w-3 h-3" />
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
                    <div className="flex flex-wrap gap-1 mt-1">
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
        </aside>
        {/* Main Area: Recognition UI and Transcript */}
        <main className="flex flex-col gap-2 flex-1">
          {/* Main Recognition UI */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <div className="flex flex-wrap gap-1 w-full md:w-auto justify-start md:justify-end">
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
            <label
              htmlFor="final_text"
              className="font-semibold text-sm md:text-base"
            >
              Final text
            </label>
            <Textarea
              id="final_text"
              value={processedFinalTranscript}
              readOnly
              className="w-full min-h-20 md:min-h-28 resize-y mt-1 text-sm md:text-base"
              aria-label="Final recognized text"
            />
          </div>
          <div>
            <label
              htmlFor="interim_text"
              className="font-semibold text-sm md:text-base"
            >
              Interim text
            </label>
            <Input
              id="interim_text"
              value={processedInterimTranscript}
              readOnly
              className="w-full mt-1 text-sm md:text-base text-muted-foreground"
              aria-label="Interim recognized text"
            />
          </div>
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            <span>
              Tip: Press <kbd>Space</kbd> to start, <kbd>Escape</kbd> to stop
              recognition.
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
