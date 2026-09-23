import { NextResponse } from "next/server";

// In-memory array storing live active orders
let orders: any[] = [];

export async function GET() {
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newOrder = {
      id: `ord-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder); // Add new order to top of queue
    return NextResponse.json(newOrder, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    orders = orders.filter((o) => o.id !== id);
  }
  return NextResponse.json({ success: true });
}
