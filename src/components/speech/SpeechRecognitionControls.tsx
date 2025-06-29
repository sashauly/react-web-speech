import React from "react";
import { Button } from "../ui/button";
import { CirclePlay, CircleStop, RefreshCcw, Copy, Trash2 } from "lucide-react";

interface SpeechRecognitionControlsProps {
  isListening: boolean;
  copyStatus: "idle" | "copied";
  onStart: () => void;
  onStop: () => void;
  onAbort: () => void;
  onCopy: () => void;
  onClear: () => void;
}

const SpeechRecognitionControls: React.FC<SpeechRecognitionControlsProps> = ({
  isListening,
  copyStatus,
  onStart,
  onStop,
  onAbort,
  onCopy,
  onClear,
}) => (
  <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
    <Button
      className="start"
      onClick={onStart}
      disabled={isListening}
      title="Start speech recognition"
    >
      <CirclePlay className="inline align-middle mr-2" />
      <span>Start</span>
    </Button>
    <Button
      className="stop"
      onClick={onStop}
      disabled={!isListening}
      variant="destructive"
      title="Stop speech recognition"
    >
      <CircleStop className="inline align-middle mr-2" />
      <span>Stop</span>
    </Button>
    <Button
      className="abort"
      onClick={onAbort}
      variant="secondary"
      title="Reset recognition session"
    >
      <RefreshCcw className="inline align-middle mr-2" />
      <span>Reset</span>
    </Button>
    <Button
      className="copy"
      onClick={onCopy}
      variant="secondary"
      title="Copy recognized text to clipboard"
    >
      <Copy className="inline align-middle mr-2" />
      <span>{copyStatus === "copied" ? "Done" : "Copy"}</span>
    </Button>
    <Button
      className="clear"
      onClick={onClear}
      variant="secondary"
      title="Clear recognized text"
    >
      <Trash2 className="inline align-middle mr-2" />
      <span>Clear</span>
    </Button>
  </div>
);

export default SpeechRecognitionControls;
