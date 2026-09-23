"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MENU_ITEMS = [
  { id: 1, name: "Classic Smash Burger", price: 8.5, desc: "Aged beef patty, American cheese, house sauce, pickles." },
  { id: 2, name: "Bacon Double Cheeseburger", price: 11.0, desc: "Two smashed patties, crispy smoked bacon, double cheese." },
  { id: 3, name: "Nashville Hot Chicken Burger", price: 9.5, desc: "Spicy fried chicken, slaw, spicy mayo." },
  { id: 4, name: "Rosemary Salt Fries", price: 3.5, desc: "Crispy skin-on fries tossed in rosemary sea salt." },
  { id: 5, name: "Coke / Diet Coke", price: 2.0, desc: "330ml chilled can." },
];

function OrderContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table") || "1";

  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [orderSent, setOrderSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id] -= 1;
      else delete updated[id];
      return updated;
    });
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU_ITEMS.find((i) => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    const selectedItems = Object.entries(cart).map(([id, qty]) => {
      const item = MENU_ITEMS.find((i) => i.id === Number(id))!;
      return { name: item.name, qty, price: item.price };
    });

    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: `Table ${tableNumber}`,
          items: selectedItems,
          total: total,
        }),
      });
      setOrderSent(true);
    } catch (err) {
      console.error("Order failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSent) {
    return (
      <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-neutral-800 p-8 rounded-2xl border border-neutral-700 max-w-sm w-full">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-neutral-400 mb-6 text-sm">
            Table {tableNumber} • Total Paid: £{total.toFixed(2)}
          </p>
          <div className="p-3 bg-neutral-900 rounded-lg text-xs font-mono text-emerald-400">
            [KITCHEN TICKET PRINTED]
          </div>
          <button
            onClick={() => {
              setCart({});
              setOrderSent(false);
            }}
            className="mt-6 w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 rounded-xl font-medium text-sm transition"
          >
            Place Another Order
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 pb-32">
      <header className="sticky top-0 bg-neutral-900/90 backdrop-blur border-b border-neutral-800 p-4 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Brim Burgers</h1>
            <p className="text-xs text-neutral-400">Fast Table Ordering</p>
          </div>
          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            Table {tableNumber}
          </span>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-3">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-4 flex justify-between items-start"
          >
            <div className="pr-4 flex-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
              <p className="text-sm font-bold text-emerald-400 mt-2">£{item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center space-y-1">
              {cart[item.id] ? (
                <div className="flex items-center bg-neutral-800 rounded-xl border border-neutral-700">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-300"
                  >
                    -
                  </button>
                  <span className="px-2 text-sm font-semibold">{cart[item.id]}</span>
                  <button
                    onClick={() => addToCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-sm font-bold text-neutral-300"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(item.id)}
                  className="bg-white text-black px-4 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900/90 backdrop-blur border-t border-neutral-800">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-400">Total Bill</p>
              <p className="text-lg font-bold text-white">£{total.toFixed(2)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="flex-1 bg-white text-black font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition disabled:opacity-50"
            >
              <span>{isSubmitting ? "Processing..." : "Pay with"}</span>
              <span className="font-bold tracking-tight">Pay / Card</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TableOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 text-white p-6">Loading menu...</div>}>
      <OrderContent />
    </Suspense>
  );
}