import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

export interface AutomationNode extends Node {
  data: {
    label: string;
    type: 'trigger' | 'action' | 'condition' | 'delay' | 'branch';
    config?: any;
  };
}

export interface AutomationState {
  automationId: string | null;
  automationName: string;
  automationDescription: string;
  enabled: boolean;
  nodes: AutomationNode[];
  edges: Edge[];
  selectedNodeId: string | null;

  setAutomationId: (id: string) => void;
  setAutomationName: (name: string) => void;
  setAutomationDescription: (description: string) => void;
  setEnabled: (enabled: boolean) => void;
  setNodes: (nodes: AutomationNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNodeId: (id: string | null) => void;

  addNode: (node: AutomationNode) => void;
  updateNode: (id: string, data: any) => void;
  deleteNode: (id: string) => void;

  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;

  reset: () => void;
}

const initialState = {
  automationId: null,
  automationName: 'New Automation',
  automationDescription: '',
  enabled: false,
  nodes: [],
  edges: [],
  selectedNodeId: null,
};

export const useAutomationStore = create<AutomationState>((set) => ({
  ...initialState,

  setAutomationId: (id) => set({ automationId: id }),
  setAutomationName: (name) => set({ automationName: name }),
  setAutomationDescription: (description) => set({ automationDescription: description }),
  setEnabled: (enabled) => set({ enabled }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    })),

  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),

  deleteEdge: (id) => set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) })),

  reset: () => set(initialState),
}));
