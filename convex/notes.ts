import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createNote = mutation({
    args: { title: v.string(), body: v.string() },
    returns: v.id("notes"),
    handler: async (ctx, { title, body }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        return await ctx.db.insert("notes", {
            title,
            body,
            userId,
        });
    },
});

export const getUserNotes = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("notes"),
            title: v.string(),
            body: v.string(),
        })
    ),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }
        const notes = await ctx.db
            .query("notes")
            .withIndex("by_userId", q => q.eq("userId", userId))
            .order("desc")
            .collect();

        return notes.map(n => ({
            _id: n._id,
            //   _creationTime: n._creationTime,
            title: n.title,
            body: n.body,
            //   userId: n.userId,
        }));
    },
});

export const deleteNote = mutation({
    args: { noteId: v.id("notes") },
    returns: v.boolean(),
    handler: async (ctx, { noteId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const note = await ctx.db.get(noteId);
        if (!note) {
            throw new Error("Note not found");
        }
        if (note.userId !== userId) {
            throw new Error("Not authorized to delete this note");
        }

        await ctx.db.delete(noteId);
        return true;
    },
});