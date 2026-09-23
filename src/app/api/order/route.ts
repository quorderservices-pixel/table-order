import { NextResponse } from 'next/server';

export interface Order {
  id: string;
  table: string | number;
  items: { name: string; quantity?: number; qty?: number; price: number | string }[];
  total: number | string;
  time: string;
  status: 'new' | 'done';
}

declare global {
  var ordersList: Order[] | undefined;
}

if (!global.ordersList) {
  global.ordersList = [];
}

// Return only active orders
export async function GET() {
  const activeOrders = (global.ordersList || []).filter((o) => o.status !== 'done');
  return NextResponse.json({ orders: activeOrders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newOrder: Order = {
      id: Math.random().toString(36).substring(2, 9),
      table: body.table || '1',
      items: body.items || [],
      total: body.total || 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'new',
    };

    global.ordersList?.unshift(newOrder);
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}

// Mark order as done on the server
export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    if (global.ordersList) {
      const order = global.ordersList.find((o) => o.id === id);
      if (order) order.status = 'done';
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}