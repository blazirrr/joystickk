import { trpc } from "@/lib/trpc";
import StoreLayout from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ArrowRight, Filter } from "lucide-react";
import { useState } from "react";

export default function ProductsCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: products, isLoading } = trpc.store.getAllProducts.useQuery();

  const categories = [
    { id: "1", name: "Controllers", slug: "controllers" },
    { id: "2", name: "Keyboards", slug: "keyboards" },
    { id: "3", name: "Mice", slug: "mice" },
    { id: "4", name: "Headsets", slug: "headsets" },
    { id: "5", name: "Accessories", slug: "accessories" },
  ];

  const filteredProducts = selectedCategory
    ? products?.filter((p: any) => p.categoryId === parseInt(selectedCategory))
    : products;

  return (
    <StoreLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-foreground italic -skew-x-12">
            ALL PRODUCTS
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse our complete collection of gaming gear
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 italic">
                  <Filter className="w-5 h-5" />
                  CATEGORIES
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === null
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-input"
                    }`}
                  >
                    All Products
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === category.id
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-input"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProducts.map((product: any) => (
                    <Link key={product.id} href={`/product/${product.slug}`}>
                      <a className="group">
                        <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent transition h-full flex flex-col">
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
                          <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-foreground mb-2 group-hover:text-accent transition line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                              {product.description}
                            </p>

                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-accent">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
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
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                    className="italic"
                  >
                    View All Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
