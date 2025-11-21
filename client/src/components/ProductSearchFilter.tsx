import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import AutocompleteDropdown from "./AutocompleteDropdown";

interface ProductSearchFilterProps {
  onResultsChange?: (results: any[]) => void;
}

export default function ProductSearchFilter({ onResultsChange }: ProductSearchFilterProps) {
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [featured, setFeatured] = useState<boolean | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = trpc.store.getCategories.useQuery();
  const { data: autocompleteResults, isLoading: autocompleteLoading } = trpc.store.autocompleteProducts.useQuery(
    { query, limit: 8 },
    { enabled: query.length > 0 }
  );
  const { data: results, refetch } = trpc.store.searchProducts.useQuery({
    query: query || undefined,
    minPrice,
    maxPrice,
    categoryId,
    featured,
  });

  useEffect(() => {
    if (onResultsChange && results) {
      onResultsChange(results);
    }
  }, [results, onResultsChange]);

  const handleSearch = () => {
    setShowAutocomplete(false);
    refetch();
  };

  const handleReset = () => {
    setQuery("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCategoryId(undefined);
    setFeatured(undefined);
    setShowAutocomplete(false);
    refetch();
  };

  const handleAutocompleteSelect = (item: any) => {
    setQuery(item.name);
    setShowAutocomplete(false);
    refetch();
  };

  const hasActiveFilters = query || minPrice || maxPrice || categoryId || featured;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products by name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAutocomplete(true);
            }}
            onFocus={() => query.length > 0 && setShowAutocomplete(true)}
            onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
          {showAutocomplete && (
            <AutocompleteDropdown
              items={autocompleteResults || []}
              isLoading={autocompleteLoading}
              isOpen={showAutocomplete}
              onSelect={handleAutocompleteSelect}
              onClose={() => setShowAutocomplete(false)}
              itemType="product"
              query={query}
            />
          )}
        </div>
        <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90">
          Search
        </Button>
        {hasActiveFilters && (
          <Button onClick={handleReset} variant="outline" className="gap-1">
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-accent hover:text-accent/80 font-medium"
      >
        {isOpen ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Filters */}
      {isOpen && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="€0"
                value={minPrice || ""}
                onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="€1000"
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Categories</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured || false}
              onChange={(e) => setFeatured(e.target.checked ? true : undefined)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="featured" className="text-sm font-medium text-foreground cursor-pointer">
              Featured Products Only
            </label>
          </div>

          <Button onClick={handleSearch} className="w-full bg-accent hover:bg-accent/90">
            Apply Filters
          </Button>
        </div>
      )}

      {/* Results Count */}
      {results && (
        <div className="text-sm text-muted-foreground">
          Found {results.length} product{results.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
