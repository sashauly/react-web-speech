import React from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../ui/collapsible";
import { Badge } from "../ui/badge";
import { Info, ChevronDown } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";

interface SpeechRecognitionHistoryProps {
  history: string[];
}

const SpeechRecognitionHistory: React.FC<SpeechRecognitionHistoryProps> = ({
  history,
}) => (
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
          <span className="text-muted-foreground text-xs">No history yet.</span>
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
);

export default SpeechRecognitionHistory;
