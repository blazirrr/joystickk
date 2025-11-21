import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingCart as CartIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface CartItem {
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
  };
}

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId: number) => {
    setCartItems(items => items.filter(item => item.productId !== productId));
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </StoreLayout>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <StoreLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-foreground italic -skew-x-12 flex items-center gap-3">
            <CartIcon className="w-10 h-10" />
            SHOPPING CART
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <CartIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-4 italic">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Start shopping to add items to your cart</p>
              <Link href="/products">
                <a>
                  <Button className="bg-accent hover:bg-accent/90 italic">
                    Continue Shopping
                  </Button>
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <div
                    key={item.productId}
                    className="bg-card border border-border rounded-lg p-6 flex gap-6"
                  >
                    {/* Product Image */}
                    {item.product?.imageUrl && (
                      <div className="w-24 h-24 bg-background/50 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-2 italic">
                        {item.product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-accent font-bold mb-4">
                        ${((item.product?.price || 0) / 100).toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-semibold border-l border-r border-border">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-2 text-muted-foreground hover:text-foreground transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm mb-2">Subtotal</p>
                      <p className="text-2xl font-bold text-accent">
                        ${(((item.product?.price || 0) * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                  <h3 className="text-lg font-bold text-foreground mb-6 italic">ORDER SUMMARY</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${(subtotal / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax (10%)</span>
                      <span>${(tax / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-accent mb-6">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>

                  <Link href="/checkout">
                    <a>
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground italic py-6">
                        Proceed to Checkout
                      </Button>
                    </a>
                  </Link>

                  <Link href="/products">
                    <a>
                      <Button
                        variant="outline"
                        className="w-full mt-3 italic"
                      >
                        Continue Shopping
                      </Button>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </StoreLayout>
  );
}
