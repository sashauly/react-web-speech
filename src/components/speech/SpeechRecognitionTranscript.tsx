import React from "react";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";

interface SpeechRecognitionTranscriptProps {
  processedFinalTranscript: string;
  processedInterimTranscript: string;
  error: string | null;
}

const SpeechRecognitionTranscript: React.FC<
  SpeechRecognitionTranscriptProps
> = ({ processedFinalTranscript, processedInterimTranscript, error }) => (
  <>
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
  </>
);

export default SpeechRecognitionTranscript;
