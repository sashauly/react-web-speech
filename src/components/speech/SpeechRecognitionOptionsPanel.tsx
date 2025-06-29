import React from "react";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Info } from "lucide-react";

interface RegionOption {
  region: string;
  label: string;
}

interface SpeechRecognitionOptionsPanelProps {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  uniqueLanguages: string[];
  regionOptions: RegionOption[];
  continuous: boolean;
  setContinuous: (val: boolean) => void;
  interimResults: boolean;
  setInterimResults: (val: boolean) => void;
  maxAlternatives: number;
  setMaxAlternatives: (val: number) => void;
  customGrammar: string;
  setCustomGrammar: (val: string) => void;
  autoStart: boolean;
  setAutoStart: (val: boolean) => void;
  autoStop: boolean;
  setAutoStop: (val: boolean) => void;
  micPermission: string | null;
  lastConfidence: number | null;
}

const SpeechRecognitionOptionsPanel: React.FC<
  SpeechRecognitionOptionsPanelProps
> = ({
  selectedLanguage,
  setSelectedLanguage,
  selectedRegion,
  setSelectedRegion,
  uniqueLanguages,
  regionOptions,
  continuous,
  setContinuous,
  interimResults,
  setInterimResults,
  maxAlternatives,
  setMaxAlternatives,
  customGrammar,
  setCustomGrammar,
  autoStart,
  setAutoStart,
  autoStop,
  setAutoStop,
  micPermission,
  lastConfidence,
}) => {
  return (
    <TooltipProvider>
      <div className="space-y-4">
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
                setSelectedLanguage(val);
              }}
            >
              <SelectTrigger className="w-full mt-1" aria-label="Language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {uniqueLanguages.map((langCode) => (
                  <SelectItem key={langCode} value={langCode}>
                    {langCode}
                  </SelectItem>
                ))}
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
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
                  Show partial (interim) results as you speak, before the final
                  result is ready.
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
              onChange={(e) => setMaxAlternatives(Number(e.target.value))}
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
                  Automatically start recognition when the page loads or when
                  toggled on.
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
                  Automatically stop recognition after a phrase or when toggled
                  on.
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
                  Confidence score (0-1) of the last recognized phrase. Higher
                  is more certain.
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
            onChange={(e) => setCustomGrammar(e.target.value)}
            className="w-full min-h-20"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SpeechRecognitionOptionsPanel;
