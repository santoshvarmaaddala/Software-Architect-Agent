import { useEffect, useRef } from "react";

export default function MermaidWithCDN({ code }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.mermaid || !code || !ref.current) return;

    const render = async () => {
      try {
        const { svg } = await window.mermaid.render("diagram", code);
        ref.current.innerHTML = svg;
      } catch (e) {
        ref.current.innerHTML = `<pre style="color:red;">${e.message}</pre>`;
      }
    };

    render();
  }, [code]);

  return <div ref={ref} />;
}
