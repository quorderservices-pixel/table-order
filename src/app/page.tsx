"use client";

import { useState } from "react";

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required?: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  modifierGroups?: ModifierGroup[];
}

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  selectedModifiers: SelectedModifier[];
  itemTotal: number;
  quantity: number;
  specialInstructions?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "classic-smash",
    name: "Classic Smash Burger",
    description: "Aged beef patty, American cheese, house sauce, pickles.",
    price: 8.5,
    modifierGroups: [
      {
        id: "patty",
        name: "Patty Selection",
        required: true,
        options: [
          { id: "single", name: "Single Patty", price: 0 },
          { id: "double", name: "Double Patty", price: 2.5 },
          { id: "triple", name: "Triple Patty", price: 4.0 },
        ],
      },
      {
        id: "cheese",
        name: "Extra Cheese",
        options: [
          { id: "extra-american", name: "Extra American Cheese", price: 1.0 },
        ],
      },
      {
        id: "removals",
        name: "Customization / Removals",
        options: [
          { id: "no-pickles", name: "No Pickles", price: 0 },
          { id: "no-sauce", name: "No House Sauce", price: 0 },
        ],
      },
    ],
  },
  {
    id: "bacon-double",
    name: "Bacon Double Cheeseburger",
    description: "Two smashed patties, crispy smoked bacon, double cheese.",
    price: 11.0,
    modifierGroups: [
      {
        id: "removals",
        name: "Customization / Removals",
        options: [
          { id: "no-bacon", name: "No Bacon", price: 0 },
          { id: "no-cheese", name: "No Cheese", price: 0 },
        ],
      },
    ],
  },
  {
    id: "nashville-chicken",
    name: "Nashville Hot Chicken Burger",
    description: "Spicy fried chicken, slaw, spicy mayo.",
    price: 9.5,
  },
  {
    id: "rosemary-fries",
    name: "Rosemary Salt Fries",
    description: "Crispy skin-on fries tossed in rosemary sea salt.",
    price: 3.5,
  },
  {
    id: "coke",
    name: "Coke / Diet Coke",
    description: "330ml chilled can.",
    price: 2.0,
  },
];

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModifierModal = (item: MenuItem) => {
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setModalItem(item);
      setSelectedModifiers([]);
      setSpecialInstructions("");
    } else {
      // Direct add for items without modifiers (fries, drinks)
      addDirectToCart(item);
    }
  };

  const addDirectToCart = (item: MenuItem) => {
    const newItem: CartItem = {
      cartItemId: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      selectedModifiers: [],
      itemTotal: item.price,
      quantity: 1,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const toggleModifier = (groupName: string, option: ModifierOption, isRequiredGroup?: boolean) => {
    setSelectedModifiers((prev) => {
      if (isRequiredGroup) {
        // Replace previous option from same required group
        const filtered = prev.filter((mod) => mod.groupName !== groupName);
        return [...filtered, { groupName, optionName: option.name, price: option.price }];
      } else {
        // Toggle optional extra/removal
        const exists = prev.some(
          (mod) => mod.groupName === groupName && mod.optionName === option.name
        );
        if (exists) {
          return prev.filter(
            (mod) => !(mod.groupName === groupName && mod.optionName === option.name)
          );
        } else {
          return [...prev, { groupName, optionName: option.name, price: option.price }];
        }
      }
    });
  };

  const handleAddModalItemToCart = () => {
    if (!modalItem) return;

    const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
    const itemTotal = modalItem.price + modifierTotal;

    const newItem: CartItem = {
      cartItemId: `${modalItem.id}-${Date.now()}`,
      menuItemId: modalItem.id,
      name: modalItem.name,
      basePrice: modalItem.price,
      selectedModifiers,
      itemTotal,
      quantity: 1,
      specialInstructions,
    };

    setCart((prev) => [...prev, newItem]);
    setModalItem(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.itemTotal * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const orderPayload = {
      tableNumber: 1,
      items: cart,
      totalAmount: cartTotal,
      timestamp: new Date().toISOString(),
    };

    try {
      // Send order to KDS API route
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      setCart([]);
      alert("Order submitted to kitchen!");
    } catch (err) {
      console.error("Order submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Brim Burgers</h1>
          <p className="text-sm text-neutral-400">Fast Table Ordering</p>
        </div>
        <span className="bg-red-900/40 text-red-400 border border-red-800 px-3 py-1 rounded-full text-xs font-semibold">
          Table 1
        </span>
      </header>

      <section className="space-y-4">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-xs text-neutral-400 mt-1">{item.description}</p>
              <p className="text-emerald-400 font-bold mt-2">£{item.price.toFixed(2)}</p>
            </div>
            <button
              onClick={() => openModifierModal(item)}
              className="bg-white text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-neutral-200"
            >
              Add
            </button>
          </div>
        ))}
      </section>

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-2xl mx-auto bg-neutral-900 border border-neutral-700 p-4 rounded-xl flex justify-between items-center shadow-xl">
          <div>
            <p className="text-xs text-neutral-400">{cart.length} item(s) selected</p>
            <p className="text-lg font-bold text-emerald-400">£{cartTotal.toFixed(2)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="bg-emerald-500 text-black font-bold px-6 py-2 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Place Order"}
          </button>
        </div>
      )}

      {/* Item Customization Modal */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-xl font-bold">{modalItem.name}</h3>
              <p className="text-xs text-neutral-400 mt-1">{modalItem.description}</p>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {modalItem.modifierGroups?.map((group) => (
                <div key={group.id} className="border-t border-neutral-800 pt-3">
                  <h4 className="text-sm font-semibold text-neutral-300 mb-2">{group.name}</h4>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isSelected = selectedModifiers.some(
                        (mod) => mod.groupName === group.name && mod.optionName === opt.name
                      );
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleModifier(group.name, opt, group.required)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center border ${
                            isSelected
                              ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                              : "bg-neutral-800/50 border-neutral-700 text-neutral-300"
                          }`}
                        >
                          <span>{opt.name}</span>
                          <span>{opt.price > 0 ? `+£${opt.price.toFixed(2)}` : "Free"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="border-t border-neutral-800 pt-3">
                <label className="text-xs text-neutral-400 block mb-1">Special Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Extra crispy fries, sauce on side"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModalItem(null)}
                className="w-1/2 bg-neutral-800 text-neutral-300 py-2 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddModalItemToCart}
                className="w-1/2 bg-emerald-500 text-black py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
