import EnvDebugInfo from "./components/EnvDebugInfo";
import SpeechRecognition from "./components/SpeechRecognition";

function App() {
  return (
    <div className="container mx-auto py-10 px-5 max-w-2xl">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Web Speech API
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        This is a demo of the{" "}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 dark:text-blue-400"
        >
          Web Speech API
        </a>{" "}
        with a simple voice input form and a speech recognition form. The demo
        also includes a debug info page that shows information about the
        environment and browser.
      </p>

      <SpeechRecognition />

      <EnvDebugInfo />
    </div>
  );
}

export default App;
