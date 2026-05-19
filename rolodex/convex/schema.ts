import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }).searchIndex("search_name", { searchField: "name" }),

  notes: defineTable({
    contactId: v.id("contacts"),
    body: v.string(),
  }).index("by_contact", ["contactId"]),
});
