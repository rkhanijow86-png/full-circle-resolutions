"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ContactPage() {
  const { id } = useParams();
  const contact = useQuery(api.contacts.get, { id: id as Id<"contacts"> });
  const notes = useQuery(api.notes.list, { contactId: id as Id<"contacts"> });
  const addNote = useMutation(api.notes.create);
  const deleteNote = useMutation(api.notes.remove);
  const updateContact = useMutation(api.contacts.update);

  const [noteText, setNoteText] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "" });

  function startEdit() {
    if (!contact) return;
    setForm({
      name: contact.name,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      company: contact.company ?? "",
      source: contact.source ?? "",
    });
    setEditing(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    await updateContact({
      id: id as Id<"contacts">,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source || undefined,
    });
    setEditing(false);
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    await addNote({ contactId: id as Id<"contacts">, body: noteText });
    setNoteText("");
  }

  if (contact === undefined) return <div className="p-10 text-stone-400 text-sm">Loading...</div>;
  if (contact === null) return <div className="p-10 text-stone-400 text-sm">Contact not found.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-stone-400 text-sm hover:text-stone-700 mb-6 inline-block">← Back to contacts</Link>

      <div className="bg-white border border-stone-200 rounded-xl p-6 mb-6 shadow-sm">
        {editing ? (
          <form onSubmit={saveEdit} className="space-y-3">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
            <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Source" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
            <div className="flex gap-2">
              <button type="submit" className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-700 transition">Save</button>
              <button type="button" onClick={() => setEditing(false)} className="text-sm px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 transition">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1">{contact.name}</h1>
              {contact.company && <p className="text-stone-500 text-sm">{contact.company}</p>}
              {contact.email && <p className="text-stone-500 text-sm">{contact.email}</p>}
              {contact.phone && <p className="text-stone-500 text-sm">{contact.phone}</p>}
              {contact.source && <p className="text-stone-400 text-xs mt-2">Source: {contact.source}</p>}
            </div>
            <button onClick={startEdit} className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 rounded-lg px-3 py-1.5 transition">Edit</button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">Notes</h2>
        <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400 bg-white"
          />
          <button type="submit" className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-700 transition">Add</button>
        </form>

        <div className="space-y-2">
          {notes?.length === 0 && <p className="text-stone-400 text-sm">No notes yet.</p>}
          {notes?.map((note) => (
            <div key={note._id} className="flex items-start justify-between bg-white border border-stone-200 rounded-xl px-4 py-3">
              <p className="text-sm text-stone-700 flex-1">{note.body}</p>
              <button onClick={() => deleteNote({ id: note._id })} className="text-stone-300 hover:text-red-400 text-xs ml-4 transition shrink-0">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
