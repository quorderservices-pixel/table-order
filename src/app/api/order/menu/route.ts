import { NextResponse } from "next/server";

declare global {
  var menuList: any[] | undefined;
}

if (!global.menuList) {
  global.menuList = [
    {
      id: "smash-burger",
      name: "Classic Smash Burger",
      description: "Aged beef patty, American cheese, house sauce, pickles, brioche bun.",
      price: 8.5,
      category: "burgers",
    },
    {
      id: "crispy-chicken-burger",
      name: "Crispy Chicken Burger",
      description: "Buttermilk fried chicken breast, spicy mayo, lettuce, pickles.",
      price: 9.0,
      category: "chicken",
    },
    {
      id: "rosemary-fries",
      name: "Rosemary Salt Fries",
      description: "Hand-cut crispy fries tossed in fresh rosemary sea salt.",
      price: 3.5,
      category: "sides",
    },
  ];
}

export async function GET() {
  return NextResponse.json(global.menuList);
}

export async function POST(req: Request) {
  try {
    const newItem = await req.json();
    newItem.id = `item-${Date.now()}`;
    global.menuList?.push(newItem);
    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (global.menuList) {
      global.menuList = global.menuList.filter((item) => item.id !== id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
