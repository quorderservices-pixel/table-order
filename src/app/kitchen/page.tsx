'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  quantity?: number;
  qty?: number;
  price: number | string;
}

interface Order {
  id: string;
  table: string | number;
  items: OrderItem[];
  total: number | string;
  time: string;
  status: 'new' | 'done';
}

function playKitchenChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.error('Audio chime error:', e);
  }
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/order');
      const data = await res.json();
      if (data.orders) {
        setOrders((prev) => {
          if (data.orders.length > prev.length && prev.length > 0) {
            playKitchenChime();
          }
          return data.orders;
        });
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const markAsReady = async (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));

    try {
      await fetch('/api/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to mark order as done:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 font-sans">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kitchen Display System</h1>
          <p className="text-sm text-neutral-400">Live incoming table orders</p>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Feed
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 font-medium">
          Waiting for incoming orders...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const tableLabel = order.table
              ? order.table.toString().toLowerCase().includes('table')
                ? order.table
                : `Table ${order.table}`
              : 'Table 1';

            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3 border-b border-neutral-800 pb-3">
                    <span className="bg-amber-500 text-black font-extrabold text-sm px-2.5 py-1 rounded-md uppercase">
                      {tableLabel}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">{order.time}</span>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {order.items?.map((item, idx) => {
                      const qty = item.quantity ?? item.qty ?? 1;
                      const rawPrice = Number(item.price);
                      const unitPrice = isNaN(rawPrice) ? 0 : rawPrice;
                      const lineTotal = unitPrice * qty;

                      return (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="font-semibold text-neutral-200">
                            {qty}x {item.name}
                          </span>
                          <span className="text-neutral-400">
                            {lineTotal > 0 ? `£${lineTotal.toFixed(2)}` : ''}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <div className="border-t border-neutral-800 pt-3 flex justify-between items-center text-sm font-bold">
                    <span>Total</span>
                    <span>
                      £{isNaN(Number(order.total)) ? '0.00' : Number(order.total).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => markAsReady(order.id)}
                    className="mt-4 w-full py-2.5 bg-neutral-800 hover:bg-emerald-600 hover:text-white text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                  >
                    Mark as Ready
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}