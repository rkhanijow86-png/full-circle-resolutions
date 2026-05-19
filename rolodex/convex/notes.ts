import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { contactId: v.id("contacts") },
  handler: async (ctx, { contactId }) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_contact", (q) => q.eq("contactId", contactId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { contactId: v.id("contacts"), body: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notes", args);
  },
});

export const remove = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
