'use client'

import { SessionProvider } from "next-auth/react"

export function ClientProvider({ children, session }: { children: React.ReactNode, session: any }) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

