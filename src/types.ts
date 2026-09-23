export type NodeType = 'MENU' | 'MESSAGE' | 'AI' | 'HANDOFF' | 'RESTART' | 'RESOLVE' | 'INPUT' | 'WEBHOOK' | 'DYNAMIC_MENU' | 'CONDITION';

export interface FlowOption {
  id: string;
  label: string;
  targetNodeId: string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  text: string;
  messages?: string[];
  options?: FlowOption[];
  targetNodeId?: string;
  variableName?: string;
  url?: string;
  method?: string;
  headers?: any;
  successNodeId?: string;
  errorNodeId?: string;
  payloadTemplate?: string;
  arrayVariable?: string;
  titleTemplate?: string;
  valueKey?: string;
  conditionVariable?: string;
  conditionOperator?: 'exists' | 'equals';
  conditionValue?: string;
  position?: { x: number, y: number };
}
