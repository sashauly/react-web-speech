import { useReducer } from "react";

export const initialState = {
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

export type Action =
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

export function reducer(state: typeof initialState, action: Action) {
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

export function useSpeechRecognitionState() {
  return useReducer(reducer, initialState);
}
