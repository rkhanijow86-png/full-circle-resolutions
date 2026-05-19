import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contacts").order("asc").collect();
  },
});

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    if (!q) return await ctx.db.query("contacts").order("asc").collect();
    return await ctx.db.query("contacts").withSearchIndex("search_name", (s) => s.search("name", q)).collect();
  },
});

export const get = query({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contacts", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("contacts"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("contacts") },
  handler: async (ctx, { id }) => {
    const notes = await ctx.db.query("notes").withIndex("by_contact", (q) => q.eq("contactId", id)).collect();
    for (const note of notes) await ctx.db.delete(note._id);
    await ctx.db.delete(id);
  },
});
