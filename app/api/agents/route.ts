import { NextResponse } from 'next/server';
import { createAgent, getAgentById, updateAgent, deleteAgent, getAllAgents } from '@/lib/db/queries';

export async function POST(req: Request) {
  const data = await req.json();
  try {
    const agent = await createAgent(data);
    return NextResponse.json(agent);
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An agent with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An error occurred while creating the agent' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || undefined;

  if (id) {
    const agent = await getAgentById(id);
    return NextResponse.json(agent);
  } else {
    const agents = await getAllAgents(page, pageSize, search);
    return NextResponse.json(agents);
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const data = await req.json();
  if (id) {
    try {
      const agent = await updateAgent(id, data);
      return NextResponse.json(agent);
    } catch (error: any) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An agent with this name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'An error occurred while updating the agent' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'ID is required' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const agent = await deleteAgent(id);
    return NextResponse.json(agent);
  }
  return NextResponse.json({ error: 'ID is required' }, { status: 400 });
}

