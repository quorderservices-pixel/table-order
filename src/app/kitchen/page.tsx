"use client";

import { useEffect, useState } from "react";

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  name: string;
  selectedModifiers: SelectedModifier[];
  itemTotal: number;
  quantity: number;
  specialInstructions?: string;
}

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  timestamp: string;
  status: "pending" | "completed";
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch KDS orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Auto-refresh ticket list every 3s
    return () => clearInterval(interval);
  }, []);

  const markComplete = async (orderId: string) => {
    try {
      await fetch(`/api/order?id=${orderId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Failed to complete order:", err);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <header className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System (KDS)</h1>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/40">
          Live Connection Active
        </span>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No pending orders in queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
                  <span className="text-lg font-extrabold text-red-400">
                    Table {order.tableNumber}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(order.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="border-b border-neutral-800/50 pb-2">
                      <div className="flex justify-between font-bold text-base">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>£{(item.itemTotal * item.quantity).toFixed(2)}</span>
                      </div>

                      {/* Render custom options/modifiers */}
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <ul className="mt-1 pl-4 text-xs text-yellow-300 list-disc space-y-0.5">
                          {item.selectedModifiers.map((mod, mIdx) => (
                            <li key={mIdx}>
                              {mod.optionName}{" "}
                              {mod.price > 0 ? `(+£${mod.price.toFixed(2)})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Render kitchen notes */}
                      {item.specialInstructions && (
                        <p className="mt-1 text-xs italic text-red-400">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-between items-center">
                <span className="font-bold text-emerald-400">
                  Total: £{order.totalAmount.toFixed(2)}
                </span>
                <button
                  onClick={() => markComplete(order.id)}
                  className="bg-emerald-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-emerald-400"
                >
                  Complete Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
