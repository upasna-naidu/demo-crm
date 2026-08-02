import { query, run } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: automationId } = await params;
    const { triggeredBy, triggeredValue, testMode } = await request.json();

    const executionId = uuidv4();

    await run(
      `INSERT INTO "AutomationExecution" (id, "automationId", "triggeredBy", "triggeredValue", status) VALUES ($1, $2, $3, $4, $5)`,
      [executionId, automationId, triggeredBy, triggeredValue, 'running']
    );

    const automation = await query(
      `SELECT * FROM "Automation" WHERE id = $1`,
      [automationId]
    );

    const nodes = await query(
      `SELECT * FROM "AutomationNode" WHERE "automationId" = $1 ORDER BY "createdAt"`,
      [automationId]
    );

    const edges = await query(
      `SELECT * FROM "AutomationEdge" WHERE "automationId" = $1`,
      [automationId]
    );

    try {
      const result = await executeAutomation(
        executionId,
        automation[0],
        nodes,
        edges,
        triggeredValue,
        testMode
      );

      await run(
        `UPDATE "AutomationExecution" SET status = $1, result = $2, "completedAt" = CURRENT_TIMESTAMP WHERE id = $3`,
        ['completed', JSON.stringify(result), executionId]
      );

      return Response.json({
        executionId,
        status: 'completed',
        result,
      });
    } catch (executionError) {
      console.error('[Execution Error]:', executionError);

      await run(
        `UPDATE "AutomationExecution" SET status = $1, "completedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
        ['failed', executionId]
      );

      return Response.json({
        executionId,
        status: 'failed',
        error: String(executionError),
      });
    }
  } catch (error) {
    console.error('[Automation Execute API] Error:', error);
    return Response.json({ error: 'Failed to execute automation' }, { status: 500 });
  }
}

async function executeAutomation(
  executionId: string,
  automation: any,
  nodes: any[],
  edges: any[],
  triggeredValue: string,
  testMode: boolean
) {
  const result = {
    actionsExecuted: 0,
    nodeResults: [] as any[],
  };

  if (nodes.length === 0) {
    return result;
  }

  const triggerNode = nodes[0];

  await logNodeExecution(executionId, triggerNode.id, 'completed', { triggeredValue }, {});

  result.nodeResults.push({
    nodeId: triggerNode.id,
    type: 'trigger',
    status: 'completed',
  });

  const nextNodes = edges.filter((e) => e.fromNodeId === triggerNode.id);

  for (const edge of nextNodes) {
    const nextNode = nodes.find((n) => n.id === edge.toNodeId);
    if (nextNode) {
      await executeNode(
        executionId,
        nextNode,
        nodes,
        edges,
        { triggeredValue },
        testMode,
        result
      );
    }
  }

  return result;
}

async function executeNode(
  executionId: string,
  node: any,
  nodes: any[],
  edges: any[],
  context: any,
  testMode: boolean,
  result: any
) {
  try {
    const config = JSON.parse(node.config || '{}');

    let output: any = { status: 'executed' };

    if (node.type === 'action') {
      if (!testMode) {
        output = await executeAction(node, config, context);
        result.actionsExecuted++;
      } else {
        output = { status: 'test_mode_skipped' };
      }
    } else if (node.type === 'condition') {
      output = evaluateCondition(config, context);
    } else if (node.type === 'delay') {
      output = { status: 'delayed', delay: config.delay || 0 };
    }

    await logNodeExecution(executionId, node.id, 'completed', context, output);

    result.nodeResults.push({
      nodeId: node.id,
      type: node.type,
      status: 'completed',
      output,
    });

    const nextEdges = edges.filter((e) => e.fromNodeId === node.id);

    for (const edge of nextEdges) {
      const nextNode = nodes.find((n) => n.id === edge.toNodeId);
      if (nextNode) {
        if (node.type === 'condition' && output.branch) {
          if (edge.label === output.branch) {
            await executeNode(
              executionId,
              nextNode,
              nodes,
              edges,
              context,
              testMode,
              result
            );
          }
        } else if (node.type !== 'condition') {
          await executeNode(
            executionId,
            nextNode,
            nodes,
            edges,
            context,
            testMode,
            result
          );
        }
      }
    }
  } catch (error) {
    console.error('[Node Execution Error]:', error);
    await logNodeExecution(executionId, node.id, 'failed', {}, { error: String(error) });
    throw error;
  }
}

async function executeAction(node: any, config: any, context: any) {
  try {
    const { actionHandlers } = await import('@/lib/automationActions');
    const actionLabel = node.label || config.actionType;
    const handler = actionHandlers[actionLabel];

    if (handler) {
      return await handler(config, context);
    }

    return { success: true, message: `Action executed: ${actionLabel}`, status: 'executed' };
  } catch (error) {
    return { success: false, message: 'Action execution failed', error: String(error) };
  }
}

function evaluateCondition(config: any, context: any): { branch: string } {
  if (config.type === 'score_check') {
    const score = parseInt(context.triggeredValue) || 0;
    return { branch: score > config.value ? 'yes' : 'no' };
  }

  return { branch: 'default' };
}

async function logNodeExecution(
  executionId: string,
  nodeId: string,
  status: string,
  input: any,
  output: any
) {
  const logId = uuidv4();

  await run(
    `INSERT INTO "AutomationExecutionLog" (id, "executionId", "nodeId", status, input, output) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      logId,
      executionId,
      nodeId,
      status,
      JSON.stringify(input),
      JSON.stringify(output),
    ]
  );
}
