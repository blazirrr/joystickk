import { trpc } from "@/lib/trpc";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import { Loader2, ShoppingCart, ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { user } = useAuth();

  const { data: product, isLoading } = trpc.store.getProductBySlug.useQuery(
    { slug: params?.slug || "" },
    { enabled: !!params?.slug }
  );

  const addToCartMutation = trpc.store.addToCart.useMutation({
    onSuccess: () => {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    },
  });

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Product not found</h1>
            <Link href="/products">
              <a>
                <Button variant="outline" className="italic">
                  Back to Products
                </Button>
              </a>
            </Link>
          </div>
        </section>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-accent/20 to-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products">
            <a className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </a>
          </Link>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-square bg-background/50 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">No image available</div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-4 italic -skew-x-12">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-accent">
                  ${(product.price / 100).toFixed(2)}
                </span>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-foreground mb-3 italic">DESCRIPTION</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  product.stock > 0
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <label className="font-bold text-foreground">Quantity:</label>
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 text-muted-foreground hover:text-foreground transition"
                      >
                        −
                      </button>
                      <span className="px-6 py-3 font-semibold border-l border-r border-border">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-3 text-muted-foreground hover:text-foreground transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      addToCartMutation.mutate({
                        productId: product.id,
                        quantity,
                      });
                    }}
                    disabled={addToCartMutation.isPending}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground italic py-6 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>

                  {addedToCart && (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-400">
                      ✓ Added to cart successfully!
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-lg font-bold text-foreground mb-6 italic">KEY FEATURES</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span className="text-muted-foreground">Premium gaming-grade materials</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span className="text-muted-foreground">Ergonomic design for extended gaming</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span className="text-muted-foreground">Worldwide warranty included</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-accent">✓</span>
                    <span className="text-muted-foreground">Fast and free shipping</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
