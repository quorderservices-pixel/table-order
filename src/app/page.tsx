"use client";

import { useEffect, useState } from "react";

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  name: string;
  required: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "burgers" | "chicken" | "sides" | "drinks" | "desserts" | string;
  image?: string;
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

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dynamic menu from API
  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Failed to load menu items:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    setModalItem(item);
    setSelectedModifiers([]);
    setSpecialInstructions("");

    if (item.modifierGroups) {
      const defaults: SelectedModifier[] = [];
      item.modifierGroups.forEach((group) => {
        if (group.required && group.options.length > 0) {
          defaults.push({
            groupName: group.name,
            optionName: group.options[0].name,
            price: group.options[0].price,
          });
        }
      });
      setSelectedModifiers(defaults);
    }
  };

  const toggleModifier = (
    groupName: string,
    option: ModifierOption,
    isRequiredGroup: boolean
  ) => {
    setSelectedModifiers((prev) => {
      if (isRequiredGroup) {
        const filtered = prev.filter((mod) => mod.groupName !== groupName);
        return [
          ...filtered,
          { groupName, optionName: option.name, price: option.price },
        ];
      } else {
        const exists = prev.some(
          (mod) =>
            mod.groupName === groupName && mod.optionName === option.name
        );
        if (exists) {
          return prev.filter(
            (mod) =>
              !(mod.groupName === groupName && mod.optionName === option.name)
          );
        } else {
          return [
            ...prev,
            { groupName, optionName: option.name, price: option.price },
          ];
        }
      }
    });
  };

  const handleAddModalItemToCart = () => {
    if (!modalItem) return;

    const modifierTotal = selectedModifiers.reduce(
      (sum, mod) => sum + mod.price,
      0
    );
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

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.itemTotal * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const orderPayload = {
      table: 1,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.itemTotal,
        selectedModifiers: item.selectedModifiers,
        specialInstructions: item.specialInstructions,
      })),
      total: cartTotal,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "new",
    };

    try {
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
    <main className="min-h-screen bg-neutral-950 text-white p-6 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Table 1 Order</h1>
          <p className="text-sm text-neutral-400">Select items to add to your order</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-neutral-200">Menu</h2>
          <div className="grid grid-cols-1 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-xs text-neutral-400 mb-2">{item.description}</p>
                  <span className="font-semibold text-emerald-400">
                    £{Number(item.price).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-neutral-200 text-sm"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 h-fit">
          <h2 className="text-xl font-bold mb-4">Your Order</h2>
          {cart.length === 0 ? (
            <p className="text-neutral-500 text-sm">Cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="border-b border-neutral-800 pb-3"
                >
                  <div className="flex justify-between font-bold text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>£{(item.itemTotal * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.selectedModifiers.length > 0 && (
                    <ul className="text-xs text-yellow-300 pl-3 mt-1 list-disc">
                      {item.selectedModifiers.map((mod, idx) => (
                        <li key={idx}>
                          {mod.optionName}{" "}
                          {mod.price > 0 ? `(+£${mod.price.toFixed(2)})` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs italic text-neutral-400 mt-1">
                      Note: {item.specialInstructions}
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-2 flex justify-between font-bold text-lg border-t border-neutral-800">
                <span>Total</span>
                <span className="text-emerald-400">£{cartTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Place Order"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modalItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{modalItem.name}</h3>
                <p className="text-xs text-neutral-400">{modalItem.description}</p>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="text-neutral-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {modalItem.modifierGroups?.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {group.name} {group.required ? "(Required)" : "(Optional)"}
                </h4>
                <div className="space-y-1.5">
                  {group.options.map((option, oIdx) => {
                    const isSelected = selectedModifiers.some(
                      (mod) =>
                        mod.groupName === group.name &&
                        mod.optionName === option.name
                    );
                    return (
                      <button
                        key={oIdx}
                        onClick={() =>
                          toggleModifier(group.name, option, group.required)
                        }
                        className={`w-full flex justify-between items-center p-3 rounded-lg text-sm border transition ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-500 text-white"
                            : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                        }`}
                      >
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="text-xs font-semibold text-emerald-400">
                            +£{option.price.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-400 mb-1">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Sauce on the side"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleAddModalItemToCart}
              className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
