function createMermaidDiagram(architecture) {
  const lines = ['graph TD'];
  for (const component of architecture.components) {
    const name = component.name.replace(/\s+/g, '_');
    const label = component.type || 'component';
    lines.push(`    ${name}[${label}]`);
  }
  for (const flow of architecture.flows) {
    const from = flow.from.replace(/\s+/g, '_');
    const to = flow.to.replace(/\s+/g, '_');
    const via = flow.via || 'calls';
    lines.push(`    ${from} -->|${via}| ${to}`);
  }
  return lines.join('\n');
}
module.exports = { createMermaidDiagram };
