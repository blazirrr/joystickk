import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormError from "./FormError";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";
import { parseValidationError } from "@/lib/errorParser";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  featured: boolean;
  imageUrl: string | null;
}

export default function AdminProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    featured: false,
  });

  const { data: allProducts, isLoading } = trpc.store.getAllProducts.useQuery();
  const createMutation = trpc.store.createProduct.useMutation({
    onError: (err) => {
      const errorMessage = parseValidationError(err);
      setError(errorMessage);
    },
  });
  const updateMutation = trpc.store.updateProduct.useMutation({
    onError: (err) => {
      const errorMessage = parseValidationError(err);
      setError(errorMessage);
    },
  });
  const deleteMutation = trpc.store.deleteProduct.useMutation();

  // Load products on mount
  if (allProducts && products.length === 0) {
    setProducts(allProducts);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Product slug is required");
      return;
    }
    if (formData.price < 0) {
      setError("Product price must be a positive number");
      return;
    }
    if (formData.stock < 0) {
      setError("Product stock must be a positive number");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        setProducts(
          products.map((p) =>
            p.id === editingId ? { ...p, ...formData } : p
          )
        );
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync({
          ...formData,
        });
        // Refetch products after creation
        if (allProducts) {
          setProducts([...allProducts, { id: Math.max(...allProducts.map(p => p.id), 0) + 1, ...formData, description: formData.description || null, imageUrl: formData.imageUrl || null }]);
        }
        toast.success("Product created successfully");
      }

      setFormData({
        name: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        imageUrl: "",
        featured: false,
      });
      setEditingId(null);
      setIsCreating(false);
    } catch (error) {
      const errorMessage = parseValidationError(error);
      setError(errorMessage);
      toast.error("Failed to save product");
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price / 100,
      stock: product.stock,
      imageUrl: product.imageUrl || "",
      featured: product.featured,
    });
    setEditingId(product.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      featured: false,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-foreground mb-4 italic -skew-x-12">
            {editingId ? "EDIT PRODUCT" : "CREATE PRODUCT"}
          </h3>
          {error && <FormError error={error} className="mb-4" />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Product Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="product-slug"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Price (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Stock
                </label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value),
                    })
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Image URL
              </label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="featured" className="text-sm font-medium text-foreground">
                Featured Product
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground italic -skew-x-12">
            PRODUCTS ({products.length})
          </h3>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-accent hover:bg-accent/90 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-card border border-border rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">{product.slug}</p>
                  {product.description && (
                    <p className="text-sm text-foreground mt-2">
                      {product.description.substring(0, 100)}...
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-accent">€{(product.price / 100).toFixed(2)}</span>
                    <span className="text-muted-foreground">Stock: {product.stock}</span>
                    {product.featured && (
                      <span className="text-yellow-500">★ Featured</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
