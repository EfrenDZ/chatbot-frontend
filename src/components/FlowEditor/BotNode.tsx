import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowNode, NodeType } from '../../types';

export const BotNode = memo(({ data, isConnectable }: any) => {
  const node: FlowNode = data.node;
  const setNodes: any = data.setNodes;
  const isRoot: boolean = data.isRoot;
  const botMode: string = data.botMode;

  const updateNodeType = (type: NodeType) => {
    setNodes((prev: FlowNode[]) => {
      const newNodes = [...prev];
      const idx = newNodes.findIndex(n => n.id === node.id);
      if (idx === -1) return prev;
      
      const n = { ...newNodes[idx], type };
      
      if (type === 'MENU' && !n.options) n.options = [];
      if ((type === 'INPUT' || type === 'DYNAMIC_MENU') && !n.targetNodeId) {
        const targetId = `node-${Date.now()}`;
        n.targetNodeId = targetId;
        newNodes.push({ id: targetId, type: 'MESSAGE' as NodeType, text: 'Respuesta...', messages: ['Respuesta...'] });
      }
      if (type === 'WEBHOOK' || type === 'CONDITION') {
        if (!n.successNodeId) {
          const sId = `node-s-${Date.now()}`;
          n.successNodeId = sId;
          newNodes.push({ id: sId, type: 'MESSAGE', text: 'Éxito...', messages: ['Éxito...'] });
        }
        if (!n.errorNodeId) {
          const eId = `node-e-${Date.now()}`;
          n.errorNodeId = eId;
          newNodes.push({ id: eId, type: 'MESSAGE', text: 'Error...', messages: ['Error...'] });
        }
      }
      newNodes[idx] = n;
      return newNodes;
    });
  };

  const updateNodeMessages = (newMsgs: string[]) => {
    setNodes((prev: FlowNode[]) => prev.map(n => n.id === node.id ? { ...n, messages: newMsgs, text: newMsgs[newMsgs.length - 1] || '' } : n));
  };

  const addOption = () => {
    setNodes((prev: FlowNode[]) => {
      const newNodes = [...prev];
      const idx = newNodes.findIndex(n => n.id === node.id);
      if (idx === -1) return prev;
      
      const n = { ...newNodes[idx] };
      const optId = `opt-${Date.now()}`;
      const targetId = `node-${Date.now()}`;
      
      n.options = [...(n.options || []), { id: optId, label: 'Nueva Opción', targetNodeId: targetId }];
      newNodes[idx] = n;
      newNodes.push({ id: targetId, type: 'MESSAGE' as NodeType, text: 'Nueva respuesta...', messages: ['Nueva respuesta...'] });
      
      return newNodes;
    });
  };

  const removeOption = (optId: string) => {
    setNodes((prev: FlowNode[]) => prev.map(n => n.id === node.id ? { ...n, options: n.options?.filter(o => o.id !== optId) } : n));
  };

  const updateOptionLabel = (optId: string, label: string) => {
    setNodes((prev: FlowNode[]) => prev.map(n => n.id === node.id ? {
      ...n,
      options: n.options?.map(o => o.id === optId ? { ...o, label } : o)
    } : n));
  };

  const hasSingleTarget = node.type !== 'WEBHOOK' && node.type !== 'CONDITION' && node.type !== 'MENU' && node.type !== 'RESOLVE' && node.type !== 'RESTART';

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-[400px]">
      {!isRoot && <Handle type="target" position={Position.Top} isConnectable={isConnectable} />}

      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-bold uppercase ${isRoot ? 'text-chatwoot' : 'text-gray-500'}`}>
          {isRoot ? 'Inicio' : 'Bloque'}
        </span>
        {!isRoot && (
          <button 
            onClick={() => setNodes((prev: any) => prev.filter((n: any) => n.id !== node.id))}
            className="text-red-400 hover:text-red-600 ml-2 text-xs"
            title="Eliminar bloque"
          >
            🗑️
          </button>
        )}
        <select
          value={node.type}
          onChange={(e) => updateNodeType(e.target.value as NodeType)}
          className="text-sm border border-gray-300 rounded p-1"
        >
          <option value="MESSAGE">Mensaje</option>
          <option value="MENU">Menú</option>
          <option value="DYNAMIC_MENU">Selector Dinámico</option>
          <option value="INPUT">Solicitar Dato</option>
          <option value="WEBHOOK">Webhook</option>
          <option value="CONDITION">Condición IF/ELSE</option>
          {botMode === 'HYBRID' && <option value="AI">Delegar IA</option>}
          <option value="HANDOFF">Transferir Humano</option>
        </select>
      </div>

      <div className="space-y-2">
        {node.type !== 'WEBHOOK' && (node.messages || [node.text]).map((msg, idx, arr) => (
          <textarea
            key={idx}
            rows={2}
            value={msg}
            onChange={(e) => {
              const newMsgs = [...arr];
              newMsgs[idx] = e.target.value;
              updateNodeMessages(newMsgs);
            }}
            className="w-full border rounded p-2 text-sm font-medium text-gray-800 nodrag"
          />
        ))}
      </div>

      {node.type === 'INPUT' && (
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded p-3">
          <label className="text-xs font-bold text-blue-800 uppercase">Variable a Guardar</label>
          <input 
            value={node.variableName || ''} 
            onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, variableName: e.target.value} : n))}
            className="w-full border rounded p-1 mt-1 text-sm nodrag" 
          />
        </div>
      )}

      {node.type === 'MENU' && (
        <div className="mt-3">
          <div className="text-xs font-bold text-gray-500 mb-2">OPCIONES:</div>
          {node.options?.map((opt, idx) => (
            <div key={opt.id} className="flex gap-2 mb-2 items-center relative">
              <span className="text-xs font-bold w-4">{idx + 1}.</span>
              <input
                value={opt.label}
                onChange={e => updateOptionLabel(opt.id, e.target.value)}
                className="flex-1 border border-blue-300 rounded p-1 text-sm nodrag"
              />
              <button onClick={() => removeOption(opt.id)} className="text-red-500 hover:text-red-700">✕</button>
              <Handle type="source" position={Position.Right} id={opt.id} style={{ top: '50%', right: '-20px' }} />
            </div>
          ))}
          <button onClick={addOption} className="text-xs text-blue-600 font-bold mt-1">+ Añadir Opción</button>
        </div>
      )}

      {node.type === 'DYNAMIC_MENU' && (
        <div className="mt-3 bg-purple-50 border border-purple-100 rounded p-3">
          <label className="text-xs font-bold text-purple-800">1. Variable (Array)</label>
          <input value={node.arrayVariable || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, arrayVariable: e.target.value} : n))} className="w-full border rounded p-1 mt-1 mb-2 text-sm nodrag" />
          <label className="text-xs font-bold text-purple-800">2. Plantilla Botón</label>
          <input value={node.titleTemplate || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, titleTemplate: e.target.value} : n))} className="w-full border rounded p-1 mt-1 mb-2 text-sm nodrag" />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-purple-800">3. Llave a Guardar</label>
              <input value={node.valueKey || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, valueKey: e.target.value} : n))} className="w-full border rounded p-1 text-sm nodrag" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-purple-800">4. Guardar Variable</label>
              <input value={node.variableName || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, variableName: e.target.value} : n))} className="w-full border rounded p-1 text-sm nodrag" />
            </div>
          </div>
        </div>
      )}

      {node.type === 'WEBHOOK' && (
        <div className="mt-3 border-t pt-3">
          <label className="text-xs font-bold text-gray-500">URL DEL API:</label>
          <input value={node.url || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, url: e.target.value} : n))} className="w-full border rounded p-1 mt-1 mb-2 text-sm nodrag" />
          <div className="flex justify-between mt-4 text-xs font-bold">
            <span className="text-green-600">✓ ÉXITO (TRUE)</span>
            <span className="text-red-600">✗ FALLA (FALSE)</span>
          </div>
          <Handle type="source" position={Position.Bottom} id="success" style={{ left: '25%', background: '#16a34a' }} />
          <Handle type="source" position={Position.Bottom} id="error" style={{ left: '75%', background: '#dc2626' }} />
        </div>
      )}

      {node.type === 'CONDITION' && (
        <div className="mt-3 bg-orange-50 border border-orange-100 rounded p-3">
          <label className="text-xs font-bold text-orange-800">Variable a Evaluar</label>
          <input value={node.conditionVariable || ''} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, conditionVariable: e.target.value} : n))} className="w-full border rounded p-1 mt-1 mb-2 text-sm nodrag" />
          <label className="text-xs font-bold text-orange-800">Condición</label>
          <select value={node.conditionOperator || 'exists'} onChange={e => setNodes((prev: any) => prev.map((n: any) => n.id === node.id ? {...n, conditionOperator: e.target.value} : n))} className="w-full border rounded p-1 mt-1 text-sm nodrag bg-white">
            <option value="exists">Existe</option>
            <option value="equals">Es igual a</option>
          </select>
          <div className="flex justify-between mt-4 text-xs font-bold">
            <span className="text-green-600">✓ CUMPLE (TRUE)</span>
            <span className="text-red-600">✗ NO CUMPLE (FALSE)</span>
          </div>
          <Handle type="source" position={Position.Bottom} id="success" style={{ left: '25%', background: '#16a34a' }} />
          <Handle type="source" position={Position.Bottom} id="error" style={{ left: '75%', background: '#dc2626' }} />
        </div>
      )}

      {hasSingleTarget && (
        <Handle type="source" position={Position.Bottom} id="target" />
      )}
    </div>
  );
});
