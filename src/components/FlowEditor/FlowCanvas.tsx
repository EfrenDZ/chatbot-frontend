import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  
  type Connection,
  type Edge,
  type Node as ReactFlowNode,
  Background,
  Controls,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import type { FlowNode } from '../../types';
import { BotNode } from './BotNode';

interface FlowCanvasProps {
  nodes: FlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  rootNodeId: string;
  botMode: string;
}

const nodeWidth = 400;
const nodeHeight = 300;

const getLayoutedElements = (nodes: ReactFlowNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export const FlowCanvas: React.FC<FlowCanvasProps> = ({ nodes, setNodes, rootNodeId, botMode }) => {
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Initialize nodes and edges from FlowNode[]
  useEffect(() => {
    if (nodes.length === 0) return;

    let newEdges: Edge[] = [];
    const newRfNodes: ReactFlowNode[] = nodes.map((n) => {
      // Build edges based on targetNodeId, successNodeId, errorNodeId, options
      if (n.type === 'WEBHOOK' || n.type === 'CONDITION') {
        if (n.successNodeId) newEdges.push({ id: `e-${n.id}-success`, source: n.id, sourceHandle: 'success', target: n.successNodeId });
        if (n.errorNodeId) newEdges.push({ id: `e-${n.id}-error`, source: n.id, sourceHandle: 'error', target: n.errorNodeId });
      } else if (n.type === 'MENU' && n.options) {
        n.options.forEach((opt) => {
          if (opt.targetNodeId) newEdges.push({ id: `e-${n.id}-${opt.id}`, source: n.id, sourceHandle: opt.id, target: opt.targetNodeId });
        });
      } else if (n.targetNodeId) {
        newEdges.push({ id: `e-${n.id}-target`, source: n.id, sourceHandle: 'target', target: n.targetNodeId });
      }

      return {
        id: n.id,
        type: 'botNode',
        position: n.position || { x: 0, y: 0 },
        data: { node: n, setNodes, isRoot: n.id === rootNodeId, botMode },
      };
    });

    // Auto-layout only if position is (0,0) for the root node (first load)
    const rootNode = newRfNodes.find(n => n.id === rootNodeId);
    if (rootNode && rootNode.position.x === 0 && rootNode.position.y === 0) {
      const layouted = getLayoutedElements(newRfNodes, newEdges);
      setRfNodes(layouted.nodes);
      setRfEdges(layouted.edges);
      
      // Save initial layout back to setNodes so we don't recalculate
      setNodes((prev) => prev.map(n => {
        const layoutNode = layouted.nodes.find(ln => ln.id === n.id);
        return layoutNode ? { ...n, position: layoutNode.position } : n;
      }));
    } else {
      setRfNodes(newRfNodes);
      setRfEdges(newEdges);
    }
  }, [nodes, rootNodeId, setNodes, botMode]);

  const onConnect = useCallback((params: Connection) => {
    // When a connection is made, update the underlying setNodes data structure
    setNodes((prev) => {
      const newNodes = [...prev];
      const sourceIdx = newNodes.findIndex(n => n.id === params.source);
      if (sourceIdx === -1) return prev;
      
      const sourceNode = { ...newNodes[sourceIdx] };
      
      if (params.sourceHandle === 'success') {
        sourceNode.successNodeId = params.target;
      } else if (params.sourceHandle === 'error') {
        sourceNode.errorNodeId = params.target;
      } else if (sourceNode.type === 'MENU' && params.sourceHandle?.startsWith('opt-')) {
        sourceNode.options = sourceNode.options?.map(o => o.id === params.sourceHandle ? { ...o, targetNodeId: params.target } : o);
      } else {
        sourceNode.targetNodeId = params.target;
      }
      
      newNodes[sourceIdx] = sourceNode;
      return newNodes;
    });
  }, [setNodes]);

  const onNodeDragStop = useCallback((_event: any, node: ReactFlowNode) => {
    // Save position on drag stop
    setNodes((prev) => prev.map(n => n.id === node.id ? { ...n, position: node.position } : n));
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({ botNode: BotNode }), []);

  return (
    <div style={{ width: '100%', height: '80vh', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#f9fafb' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background gap={16} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
};
