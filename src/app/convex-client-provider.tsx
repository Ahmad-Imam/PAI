"use client"

import { ConvexClient } from "convex/browser"
import {ConvexReactClient} from "convex/react"
import {ConvexProvider} from "convex/react"
import {useState} from "react"
import {ConvexAuthNextjsProvider} from "@convex-dev/auth/nextjs"


const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode
}) {

return <ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>


}