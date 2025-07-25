import React, {useState} from "react";
import axios from 'axios';
import {getSessionId} from "./utils";
import MermaidDiagramGenrator from "./Mermaid"

export default function App() {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sessionId = getSessionId();
        const res = await axios.post('http://localhost:4000/api/submit-prompt', {
            prompt, sessionId
        });
        setResult(res.data);
    };

    return (
       <div>
        <h1>Architecture Playground</h1>
        <form onSubmit={handleSubmit}>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} />
            <button type="submit">submit</button>
        </form>
        {result?.mermaid && <MermaidDiagramGenrator code={result.mermaid} />}
       </div>
    )
}