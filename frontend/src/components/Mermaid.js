import mermaid from "mermaid";
import { useRef, useEffect } from "react";

export default function MermaidDiagramGenrator( {code} ) {
    const ref = useRef();

    useEffect(() => {
        if (code && ref.current) {
            mermaid.initialize({ startOnLoad: true});
            mermaid.render('theGraph', code, svgCode => [
                ref.current.innerHtml = svgCode
            ]);
        }
    }, [code]);

    return <div ref={ref} />;
}