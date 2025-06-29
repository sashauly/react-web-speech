import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Info, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

function getDeviceType() {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

const MDN_LINKS = {
  SpeechRecognition:
    "https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition",
  SpeechGrammarList:
    "https://developer.mozilla.org/en-US/docs/Web/API/SpeechGrammarList",
  Permissions:
    "https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API",
  MediaDevices: "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices",
  WebkitSpeechRecognition:
    "https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition",
};

const DESCRIPTIONS = {
  start: "Starts speech recognition.",
  stop: "Stops speech recognition.",
  abort: "Aborts speech recognition.",
  lang: "Language for recognition.",
  continuous: "Continuous mode.",
  interimResults: "Show interim results.",
  maxAlternatives: "Number of alternatives.",
  grammars: "SpeechGrammarList for recognition.",
  onresult: "Result event handler.",
  onerror: "Error event handler.",
  onend: "End event handler.",
  addFromString: "Add grammar from string.",
  addFromURI: "Add grammar from URI.",
  length: "Number of grammars.",
  item: "Get grammar by index.",
  query: "Query permission status.",
  getUserMedia: "Access media devices.",
  enumerateDevices: "List media devices.",
  webkitSpeechRecognition: "WebKit SpeechRecognition (legacy).",
  webkitSpeechGrammarList: "WebKit SpeechGrammarList (legacy).",
};

function FeatureBadge({
  available,
  label,
  desc,
}: {
  available: boolean;
  label: string;
  desc?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={available ? "default" : "destructive"}
            className="flex items-center gap-1 px-2 py-1 text-xs font-mono cursor-help"
          >
            {available ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            {label}
            {desc && <Info className="w-3 h-3 text-muted-foreground ml-1" />}
          </Badge>
        </TooltipTrigger>
        {desc && <TooltipContent>{desc}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

export default function EnvDebugInfo() {
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "N/A";
  const deviceType = getDeviceType();
  const isHttps =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false;

  // SpeechRecognition
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  const srProto = SpeechRecognition ? SpeechRecognition.prototype : undefined;
  const srMethods = {
    start: !!(srProto && srProto.start),
    stop: !!(srProto && srProto.stop),
    abort: !!(srProto && srProto.abort),
  };
  const srProps = {
    lang: !!(srProto && "lang" in srProto),
    continuous: !!(srProto && "continuous" in srProto),
    interimResults: !!(srProto && "interimResults" in srProto),
    maxAlternatives: !!(srProto && "maxAlternatives" in srProto),
    grammars: !!(srProto && "grammars" in srProto),
  };
  const srEvents = {
    onresult: !!(srProto && "onresult" in srProto),
    onerror: !!(srProto && "onerror" in srProto),
    onend: !!(srProto && "onend" in srProto),
  };

  // SpeechGrammarList
  const SpeechGrammarList =
    typeof window !== "undefined" &&
    (window.SpeechGrammarList || window.webkitSpeechGrammarList);
  const sglProto = SpeechGrammarList ? SpeechGrammarList.prototype : undefined;
  const sglMethods = {
    addFromString: !!(sglProto && sglProto.addFromString),
    addFromURI: !!(sglProto && sglProto.addFromURI),
  };
  const sglProps = {
    length: !!(sglProto && "length" in sglProto),
    item: !!(sglProto && sglProto.item),
  };

  // Permissions API
  const hasPermissionsAPI =
    typeof navigator !== "undefined" && !!navigator.permissions;
  const hasPermissionsQuery =
    hasPermissionsAPI && typeof navigator.permissions.query === "function";

  // MediaDevices
  const hasMediaDevices =
    typeof navigator !== "undefined" && !!navigator.mediaDevices;
  const md = hasMediaDevices ? navigator.mediaDevices : undefined;
  const mdMethods = {
    getUserMedia: !!(md && typeof md.getUserMedia === "function"),
    enumerateDevices: !!(md && typeof md.enumerateDevices === "function"),
  };

  // Webkit-specific
  const hasWebkitSpeechRecognition =
    typeof window !== "undefined" && "webkitSpeechRecognition" in window;
  const hasWebkitSpeechGrammarList =
    typeof window !== "undefined" && "webkitSpeechGrammarList" in window;

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-2 w-full px-6 py-4 text-base font-semibold cursor-pointer select-none border-b">
        <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180" />
        <span>Environment Debug Info</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-6 py-4 space-y-2 text-xs font-mono">
        <div>
          User Agent:{" "}
          <span className="break-all text-muted-foreground">{userAgent}</span>
        </div>
        <div>
          Device Type: <Badge variant="outline">{deviceType}</Badge>
        </div>
        <div>
          HTTPS:{" "}
          <FeatureBadge
            available={isHttps}
            label={isHttps ? "Yes" : "No"}
            desc="Page is served over HTTPS."
          />
        </div>
        <div className="pt-2 font-semibold flex items-center gap-2">
          <span>SpeechRecognition</span>
          <a
            href={MDN_LINKS.SpeechRecognition}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-blue-600 dark:text-blue-400 ml-2"
          >
            MDN
          </a>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {Object.entries(srMethods).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {Object.entries(srProps).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(srEvents).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="pt-2 font-semibold flex items-center gap-2">
          <span>SpeechGrammarList</span>
          <a
            href={MDN_LINKS.SpeechGrammarList}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-blue-600 dark:text-blue-400 ml-2"
          >
            MDN
          </a>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {Object.entries(sglMethods).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(sglProps).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="pt-2 font-semibold flex items-center gap-2">
          <span>Permissions API</span>
          <a
            href={MDN_LINKS.Permissions}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-blue-600 dark:text-blue-400 ml-2"
          >
            MDN
          </a>
        </div>
        <div className="flex flex-wrap gap-1">
          <FeatureBadge
            available={hasPermissionsQuery as boolean}
            label="query"
            desc={DESCRIPTIONS.query}
          />
        </div>
        <div className="pt-2 font-semibold flex items-center gap-2">
          <span>MediaDevices</span>
          <a
            href={MDN_LINKS.MediaDevices}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-blue-600 dark:text-blue-400 ml-2"
          >
            MDN
          </a>
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(mdMethods).map(([k, v]) => (
            <FeatureBadge
              key={k}
              available={v}
              label={k}
              desc={DESCRIPTIONS[k as keyof typeof DESCRIPTIONS]}
            />
          ))}
        </div>
        <div className="pt-2 font-semibold flex items-center gap-2">
          <span>Webkit</span>
          <a
            href={MDN_LINKS.WebkitSpeechRecognition}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-xs text-blue-600 dark:text-blue-400 ml-2"
          >
            MDN
          </a>
        </div>
        <div className="flex flex-wrap gap-1">
          <FeatureBadge
            available={hasWebkitSpeechRecognition}
            label="webkitSpeechRecognition"
            desc={DESCRIPTIONS.webkitSpeechRecognition}
          />
          <FeatureBadge
            available={hasWebkitSpeechGrammarList}
            label="webkitSpeechGrammarList"
            desc={DESCRIPTIONS.webkitSpeechGrammarList}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
