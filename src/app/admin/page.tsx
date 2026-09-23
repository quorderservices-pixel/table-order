"use client";

import { useEffect, useState } from "react";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function AdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("burgers");

  const fetchMenu = async () => {
    const res = await fetch("/api/menu");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        category,
      }),
    });

    setName("");
    setDescription("");
    setPrice("");
    fetchMenu();
  };

  const handleDeleteItem = async (id: string) => {
    await fetch("/api/menu", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchMenu();
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Owner Admin Dashboard</h1>
          <p className="text-sm text-neutral-400">Manage menu items, prices, and categories</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleAddItem} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold border-b border-neutral-800 pb-2">Add New Item</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bacon Double Smash"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="burgers">Burgers</option>
              <option value="chicken">Chicken</option>
              <option value="sides">Sides</option>
              <option value="drinks">Drinks</option>
              <option value="desserts">Desserts</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Price (£)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="8.50"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredients, toppings, etc."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition"
          >
            + Add to Menu
          </button>
        </form>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold border-b border-neutral-800 pb-2 mb-4">Active Menu Items</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50"
              >
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <span className="text-xs text-emerald-400 font-semibold">£{item.price.toFixed(2)}</span>
                  <span className="text-xs text-neutral-400 ml-2">({item.category})</span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-400 hover:text-red-300 text-xs font-bold border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
