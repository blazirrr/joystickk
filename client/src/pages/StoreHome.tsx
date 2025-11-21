import { trpc } from "@/lib/trpc";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ArrowRight } from "lucide-react";

export default function StoreHome() {
  const { data: products, isLoading } = trpc.store.getAllProducts.useQuery();

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent/20 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 italic -skew-x-12">
              PREMIUM GAMING GEAR
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover the ultimate collection of gaming peripherals, keyboards, mice, and accessories. 
              Built by gamers, for gamers.
            </p>
            <Link href="/products">
              <a>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground italic">
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 italic -skew-x-12">
            FEATURED PRODUCTS
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <a className="group">
                    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition">
                      {/* Product Image */}
                      <div className="aspect-square bg-background/50 overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-foreground mb-2 group-hover:text-accent transition line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-accent">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products available</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <a>
                <Button variant="outline" size="lg" className="italic">
                  View All Products <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 italic -skew-x-12">
            SHOP BY CATEGORY
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Keyboards', icon: '⌨️' },
              { name: 'Mice', icon: '🖱️' },
              { name: 'Headsets', icon: '🎧' },
            ].map((category) => (
              <div
                key={category.name}
                className="bg-background border border-border rounded-lg p-8 text-center hover:border-accent transition cursor-pointer"
              >
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold text-foreground mb-2 italic">{category.name}</h3>
                <p className="text-muted-foreground mb-4">Explore our collection</p>
                <Button variant="outline" size="sm" className="italic">
                  Browse <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-foreground mb-12 italic -skew-x-12">
            WHY CHOOSE JOYSTICK.EE?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-foreground mb-2 italic">FAST SHIPPING</h3>
              <p className="text-muted-foreground">
                Quick and reliable worldwide shipping on all orders.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-foreground mb-2 italic">QUALITY ASSURED</h3>
              <p className="text-muted-foreground">
                All products are authentic and come with warranty.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-foreground mb-2 italic">COMMUNITY</h3>
              <p className="text-muted-foreground">
                Join our gaming community and share your passion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
