import { NextResponse } from 'next/server'
import { getUser, updateUser } from '@/lib/db/queries'
import { auth } from '@/app/(auth)/auth';

export async function GET() {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const user = await getUser(session.user.id)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to get user:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const data = await req.json()
    const updatedUser = await updateUser(session.user.id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

