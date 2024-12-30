import { NextResponse } from 'next/server';
import { createTool, getToolById, updateTool, deleteTool, getAllTools } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const data = await req.json();
  try {
    const tool = await createTool({ ...data, userId: session.user.id });
    return NextResponse.json(tool);
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A tool with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An error occurred while creating the tool' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const search = searchParams.get('search') || undefined;

  if (id) {
    const tool = await getToolById(id, session.user.id);
    return NextResponse.json(tool);
  } else {
    const tools = await getAllTools(session.user.id, page, pageSize, search);
    return NextResponse.json(tools);
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const data = await req.json();
  if (id) {
    try {
      const tool = await updateTool(id, session.user.id, data);
      return NextResponse.json(tool);
    } catch (error: any) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A tool with this name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'An error occurred while updating the tool' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'ID is required' }, { status: 400 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const tool = await deleteTool(id, session.user.id);
    return NextResponse.json(tool);
  }
  return NextResponse.json({ error: 'ID is required' }, { status: 400 });
}

