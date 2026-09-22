const fs = require('fs');
const appPath = '/Users/efrendz/Downloads/chatwoot/chatbot-saas/frontend/src/App.tsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Fix NodeType definition
code = code.replace(
  "type NodeType = 'MESSAGE' | 'MENU' | 'INPUT' | 'WEBHOOK' | 'AI' | 'HANDOFF';",
  "type NodeType = 'MESSAGE' | 'MENU' | 'INPUT' | 'WEBHOOK' | 'AI' | 'HANDOFF' | 'DYNAMIC_MENU';"
);

// 2. Fix update calls for DYNAMIC_MENU
const badUpdates = [
  "updateNodeType(node.id, 'DYNAMIC_MENU', { arrayVariable: e.target.value })",
  "updateNodeType(node.id, 'DYNAMIC_MENU', { titleTemplate: e.target.value })",
  "updateNodeType(node.id, 'DYNAMIC_MENU', { valueKey: e.target.value })",
  "updateNodeType(node.id, 'DYNAMIC_MENU', { variableName: e.target.value })",
  "updateNodeType(node.id, 'DYNAMIC_MENU', { targetNodeId: e.target.value })"
];

const goodUpdates = [
  "setNodes(prev => prev.map(n => n.id === node.id ? { ...n, arrayVariable: e.target.value } : n))",
  "setNodes(prev => prev.map(n => n.id === node.id ? { ...n, titleTemplate: e.target.value } : n))",
  "setNodes(prev => prev.map(n => n.id === node.id ? { ...n, valueKey: e.target.value } : n))",
  "setNodes(prev => prev.map(n => n.id === node.id ? { ...n, variableName: e.target.value } : n))",
  "setNodes(prev => prev.map(n => n.id === node.id ? { ...n, targetNodeId: e.target.value } : n))"
];

for (let i = 0; i < badUpdates.length; i++) {
  // Use regex with global flag to replace all occurrences if needed
  code = code.split(badUpdates[i]).join(goodUpdates[i]);
}

// 3. Fix 'arr' not found. It was likely passed to the recursive function `renderNode(node, idx, arr...` 
// Ah, `arr` inside `renderNode` is passed as `nodes`. Let's check `renderNode` signature.
// It's `const renderNode = (node: FlowNode, idx: number, arr: FlowNode[], parentId: string | null, branchIndex: number = 0, isSuccess: boolean = false, isError: boolean = false) => {`
// So `arr` DOES exist in `renderNode`... but maybe I placed the new code outside `renderNode`?
// No, I inserted it after `INPUT` block, but wait, maybe I messed up the nesting.
// The `INPUT` block might not have `arr`?
// Let's replace `arr` with `nodes` which is the global state variable.
code = code.replace(
  "{arr.filter(n => n.id !== node.id).map(n => (",
  "{nodes.filter((n: any) => n.id !== node.id).map((n: any) => ("
);

fs.writeFileSync(appPath, code, 'utf8');
