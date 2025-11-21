import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

export interface AutocompleteItem {
  id: number;
  name?: string;
  title?: string;
  slug?: string;
  price?: number;
  upvotes?: number;
  memberCount?: number;
}

interface AutocompleteDropdownProps {
  items: AutocompleteItem[];
  isLoading: boolean;
  isOpen: boolean;
  onSelect: (item: AutocompleteItem) => void;
  onClose: () => void;
  itemType: "product" | "post" | "community";
  query: string;
}

export default function AutocompleteDropdown({
  items,
  isLoading,
  isOpen,
  onSelect,
  onClose,
  itemType,
  query,
}: AutocompleteDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && items[selectedIndex]) {
            onSelect(items[selectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, items, selectedIndex, onSelect, onClose]);

  if (!isOpen || (!items.length && !isLoading)) return null;

  const getItemLabel = (item: AutocompleteItem): string => {
    switch (itemType) {
      case "product":
        return `${item.name} - €${item.price?.toFixed(2)}`;
      case "post":
        return `${item.title} (${item.upvotes || 0} upvotes)`;
      case "community":
        return `${item.name} (${item.memberCount || 0} members)`;
      default:
        return item.name || item.title || "";
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Searching...
        </div>
      ) : items.length === 0 ? (
        <div className="py-3 px-4 text-sm text-muted-foreground text-center">
          No {itemType}s found for "{query}"
        </div>
      ) : (
        <ul className="py-1">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{getItemLabel(item)}</span>
                  {itemType === "product" && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {item.slug}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
