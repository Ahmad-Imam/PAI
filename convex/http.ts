import { openai } from "@ai-sdk/openai";
import { getAuthUserId } from "@convex-dev/auth/server";
import { convertToModelMessages, streamText, tool, UIMessage } from "ai";
import { httpRouter } from "convex/server";
import { z } from "zod";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
    path: "/api/chat",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages }: { messages: UIMessage[] } = await req.json();

        const lastMessages = messages.slice(-10);

        const result = streamText({
            model: openai("gpt-4.1-nano"),
            system: `
    You are a helpful assistant that searches the user's notes.
    For each user message, call the tool exactly once:
    - Use findRelevantNotes(query) to fetch the latest data.
    - Prefer fresh tool results over anything said earlier in the chat.
    - After receiving tool results, provide a final answer; do not call the tool again in the same turn.
    If the requested information is not available in the tool results, reply: "Sorry, I can't find that information in your notes".
    Use concise markdown. Link to notes using relative URLs: '/notes?noteId=<note-id>'.
    `,
            messages: convertToModelMessages(lastMessages),
            tools: {
                findRelevantNotes: tool({
                    description:
                        "Retrieve relevant notes from the database based on the user's query",
                    parameters: z.object({
                        query: z.string().describe("The user's query"),
                    }),
                    execute: async ({ query }) => {
                        // console.log("findRelevantNotes query:", query);

                        const relevantNotes = await ctx.runAction(
                            internal.notesActions.findRelevantNotes,
                            {
                                query,
                                userId,
                            }
                        );

                        return relevantNotes.map((note) => ({
                            id: note._id.toString(),
                            title: note.title,
                            body: note.body,
                            creationTime: note._creationTime,
                        }));
                    },
                }),
            },
            onError(error) {
                console.error("streamText error:", error);
            },
        });

        return result.toUIMessageStreamResponse({
            headers: new Headers({
                "Access-Control-Allow-Origin": "*",
                Vary: "origin",
            }),
        });
    }),
});

http.route({
    path: "/api/chat",
    method: "OPTIONS",
    handler: httpAction(async (_, request) => {
        const headers = request.headers;
        if (
            headers.get("Origin") !== null &&
            headers.get("Access-Control-Request-Method") !== null &&
            headers.get("Access-Control-Request-Headers") !== null
        ) {
            return new Response(null, {
                headers: new Headers({
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST",
                    "Access-Control-Allow-Headers": "Content-Type, Digest, Authorization",
                    "Access-Control-Max-Age": "86400",
                }),
            });
        } else {
            return new Response();
        }
    }),
});

export default http;