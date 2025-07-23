function createMermaidDiagram(architecture) {
    const header = "graph TD";

    const nodes = architecture.components.map(component => `"${component.name}"[${component.type}]`).join('\n');

    const edges = architecture.flows.map(flow =>`"${flow.from}" -->|"${flow.via}"| "${flow.to}"`).join('\n');

    return `${header}\n${nodes}\n${edges}`;
}

module.exports = {createMermaidDiagram}