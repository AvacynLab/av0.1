import { NextResponse } from 'next/server';
import { createExecution, updateExecution, getAgentById, getToolsByIds } from '@/lib/db/queries';
import { generateText, CoreTool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Tool {
  id: string;
  name: string;
  type: string;
  description: string | null;
  parameters: unknown;
}

function parseParameters(parameters: unknown): z.ZodObject<any> {
  if (typeof parameters === 'string') {
    try {
      parameters = JSON.parse(parameters);
    } catch (error) {
      console.error('Failed to parse parameters string:', error);
      return z.object({});
    }
  }

  if (typeof parameters !== 'object' || parameters === null) {
    console.error('Invalid parameters:', parameters);
    return z.object({});
  }

  const zodShape: z.ZodRawShape = {};

  for (const [key, value] of Object.entries(parameters)) {
    switch (typeof value) {
      case 'string':
        zodShape[key] = z.string();
        break;
      case 'number':
        zodShape[key] = z.number();
        break;
      case 'boolean':
        zodShape[key] = z.boolean();
        break;
      default:
        zodShape[key] = z.any();
    }
  }

  return z.object(zodShape);
}

function transformTool(tool: Tool): CoreTool<any, any> {
  return {
    type: 'function',
    parameters: parseParameters(tool.parameters),
    description: tool.description || '',
    execute: async (args: any) => {
      console.log(`Executing tool ${tool.name} with args:`, args);
      return "Tool execution result";
    },
  };
}

export async function POST(req: Request) {
  const { agentId, input } = await req.json();
  
  // Récupérer l'agent
  const [agent] = await getAgentById(agentId);
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Récupérer les outils de l'agent
  const agentTools = agent.tools ? await getToolsByIds(agent.tools) : [];

  // Créer un enregistrement d'exécution
  const [execution] = await createExecution({
    agentId,
    input,
    status: 'started',
  });

  // Transformer les outils en CoreTools
  const tools: Record<string, CoreTool<any, any>> = {};
  agentTools.forEach((tool) => {
    tools[tool.name] = transformTool(tool);
  });

  try {
    // Utiliser le SDK AI pour traiter l'entrée
    const { text, steps } = await generateText({
      model: openai('gpt-4'),
      messages: [
        { role: 'system', content: agent.prompt || 'You are a helpful assistant.' },
        { role: 'user', content: input }
      ],
      tools,
      maxSteps: 5, // Allow up to 5 steps for multi-step reasoning
    });

    // Mettre à jour l'enregistrement d'exécution avec le résultat
    const [updatedExecution] = await updateExecution(execution.id, {
      output: text,
      status: 'completed',
      completedAt: new Date(),
    });

    return NextResponse.json({ ...updatedExecution, steps });
  } catch (error) {
    console.error('Error during execution:', error);

    // Mettre à jour l'enregistrement d'exécution avec l'erreur
    const [updatedExecution] = await updateExecution(execution.id, {
      output: 'An error occurred during execution.',
      status: 'failed',
      completedAt: new Date(),
    });

    return NextResponse.json(updatedExecution, { status: 500 });
  }
}

