import "./App.css";
import useTranscribe from "./hooks/useTranscribe";

function App() {
  const { startTranscription, stopTranscription, transcripts, recording } =
    useTranscribe();

  return (
    <>
      <div>
        <button onClick={startTranscription} disabled={recording}>
          Start Transcribe
        </button>
        <button onClick={stopTranscription} disabled={!recording}>
          Stop Transcribe
        </button>
      </div>
      <div>
        <ul>
          {transcripts.map((t, i) => (
            <li key={i}>{t.transcript}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
