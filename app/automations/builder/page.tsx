'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAutomationStore } from '@/lib/automationStore';
import NodePalette from '@/components/automation/NodePalette';
import NodeConfigPanel from '@/components/automation/NodeConfigPanel';
import AutomationNode from '@/components/automation/AutomationNode';
import BuilderToolbar from '@/components/automation/BuilderToolbar';

const nodeTypes = {
  trigger: AutomationNode,
  action: AutomationNode,
  condition: AutomationNode,
  delay: AutomationNode,
};

export default function AutomationBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const automationId = searchParams.get('id');

  const store = useAutomationStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (automationId) {
      fetchAutomation(automationId);
    } else {
      setLoading(false);
    }
  }, [automationId]);

  const fetchAutomation = async (id: string) => {
    try {
      const response = await fetch(`/api/automations/${id}`);
      const data = await response.json();

      if (data.automation) {
        store.setAutomationId(data.automation.id);
        store.setAutomationName(data.automation.name);
        store.setAutomationDescription(data.automation.description || '');
        store.setEnabled(data.automation.enabled);

        if (data.nodes && data.nodes.length > 0) {
          const processedNodes = data.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: node.position ? JSON.parse(node.position) : { x: 0, y: 0 },
            data: {
              label: node.label,
              type: node.type,
              config: node.config ? JSON.parse(node.config) : {},
            },
          }));
          setNodes(processedNodes);
        }

        if (data.edges && data.edges.length > 0) {
          setEdges(data.edges);
        }
      }
    } catch (error) {
      console.error('Failed to fetch automation:', error);
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = addEdge(connection, edges);
      setEdges(edge);
    },
    [edges, setEdges]
  );

  const handleAddNode = useCallback(
    (nodeType: 'trigger' | 'action' | 'condition' | 'delay') => {
      const id = `${nodeType}_${Date.now()}`;
      const newNode: Node = {
        id,
        type: nodeType,
        position: { x: Math.random() * 300, y: Math.random() * 300 },
        data: {
          label: nodeType === 'trigger' ? 'Lead Created' : `New ${nodeType}`,
          type: nodeType,
          config: {},
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      store.setSelectedNodeId(nodeId);
    },
    [store]
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    store.setSelectedNodeId(null);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const automationData = {
        name: store.automationName,
        description: store.automationDescription,
        enabled: store.enabled,
      };

      let newAutomationId = automationId;

      if (!automationId) {
        const response = await fetch('/api/automations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...automationData,
            companyId: 'default',
            createdBy: 'current_user',
          }),
        });
        const data = await response.json();
        newAutomationId = data.automation?.id;
        if (newAutomationId) {
          store.setAutomationId(newAutomationId);
        }
      } else {
        await fetch(`/api/automations/${automationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(automationData),
        });
      }

      for (const node of nodes) {
        await fetch(`/api/automations/${newAutomationId}/nodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: node.type,
            label: node.data.label,
            position: node.position,
            config: node.data.config || {},
          }),
        });
      }

      for (const edge of edges) {
        await fetch(`/api/automations/${newAutomationId}/edges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromNodeId: edge.source,
            toNodeId: edge.target,
            label: edge.label || 'default',
          }),
        });
      }

      alert('Automation saved successfully!');
      router.push(`/automations?saved=true`);
    } catch (error) {
      console.error('Failed to save automation:', error);
      alert('Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      const response = await fetch(`/api/automations/${automationId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggeredBy: 'manual_test',
          triggeredValue: 'test_lead_001',
          testMode: true,
        }),
      });
      const data = await response.json();
      alert(`Test completed!\n\nStatus: ${data.status}\nActions executed: ${data.result?.actionsExecuted || 0}`);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading automation...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Toolbar */}
      <BuilderToolbar
        automationName={store.automationName}
        onNameChange={(name) => store.setAutomationName(name)}
        onSave={handleSave}
        onTest={handleTest}
        isSaving={isSaving}
      />

      {/* Main Canvas Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Node Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Center - Canvas */}
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#f5f5f5' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => handleNodeSelect(node.id)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Right Sidebar - Node Config */}
        <NodeConfigPanel
          selectedNodeId={store.selectedNodeId}
          nodes={nodes}
          onUpdateNode={(id, data) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...data } } : n
              )
            );
          }}
          onDeleteNode={handleDeleteNode}
        />
      </div>
    </div>
  );
}
