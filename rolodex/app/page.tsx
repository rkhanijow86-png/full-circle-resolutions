"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function Home() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "" });

  const contacts = useQuery(search ? api.contacts.search : api.contacts.list, search ? { q: search } : {});
  const createContact = useMutation(api.contacts.create);
  const removeContact = useMutation(api.contacts.remove);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createContact({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source || undefined,
    });
    setForm({ name: "", email: "", phone: "", company: "", source: "" });
    setShowForm(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-stone-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-700 transition"
        >
          {showForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-stone-200 rounded-xl p-5 mb-6 space-y-3 shadow-sm">
          <input required placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
          <input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
          <input placeholder="Source (e.g. referral, event)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-400" />
          <button type="submit" className="w-full bg-stone-900 text-white py-2 rounded-lg text-sm hover:bg-stone-700 transition">Save Contact</button>
        </form>
      )}

      <input
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-stone-400 bg-white"
      />

      <div className="space-y-2">
        {contacts === undefined && <p className="text-stone-400 text-sm">Loading...</p>}
        {contacts?.length === 0 && <p className="text-stone-400 text-sm">No contacts yet. Add your first one above.</p>}
        {contacts?.map((c) => (
          <div key={c._id} className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 hover:border-stone-400 transition">
            <Link href={`/contacts/${c._id}`} className="flex-1">
              <p className="font-medium text-sm">{c.name}</p>
              <p className="text-stone-400 text-xs">{[c.company, c.email].filter(Boolean).join(" · ")}</p>
            </Link>
            <button
              onClick={() => removeContact({ id: c._id })}
              className="text-stone-300 hover:text-red-400 text-xs ml-4 transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
