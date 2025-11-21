import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import AutocompleteDropdown from "./AutocompleteDropdown";

interface ForumSearchFilterProps {
  onResultsChange?: (results: any[]) => void;
  onCommunitiesChange?: (communities: any[]) => void;
}

export default function ForumSearchFilter({
  onResultsChange,
  onCommunitiesChange,
}: ForumSearchFilterProps) {
  const [query, setQuery] = useState("");
  const [communityId, setCommunityId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"recent" | "trending" | "top">("recent");
  const [searchType, setSearchType] = useState<"posts" | "communities">("posts");
  const [isOpen, setIsOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: communities } = trpc.forum.getCommunities.useQuery();
  
  const { data: postAutocompleteResults, isLoading: postAutocompleteLoading } = trpc.forum.autocompletePosts.useQuery(
    { query, limit: 8 },
    { enabled: query.length > 0 && searchType === "posts" }
  );
  
  const { data: communityAutocompleteResults, isLoading: communityAutocompleteLoading } = trpc.forum.autocompleteCommunities.useQuery(
    { query, limit: 8 },
    { enabled: query.length > 0 && searchType === "communities" }
  );

  const { data: postResults, refetch: refetchPosts } = trpc.forum.searchPosts.useQuery({
    query: query || undefined,
    communityId,
    sortBy,
  });

  const { data: communityResults, refetch: refetchCommunities } = trpc.forum.searchCommunities.useQuery({
    query: query || undefined,
  });

  useEffect(() => {
    if (searchType === "posts" && onResultsChange && postResults) {
      onResultsChange(postResults);
    }
  }, [postResults, onResultsChange, searchType]);

  useEffect(() => {
    if (searchType === "communities" && onCommunitiesChange && communityResults) {
      onCommunitiesChange(communityResults);
    }
  }, [communityResults, onCommunitiesChange, searchType]);

  const handleSearch = () => {
    setShowAutocomplete(false);
    if (searchType === "posts") {
      refetchPosts?.();
    } else {
      refetchCommunities?.();
    }
  };

  const handleReset = () => {
    setQuery("");
    setCommunityId(undefined);
    setSortBy("recent");
    setShowAutocomplete(false);
    refetchPosts?.();
    refetchCommunities?.();
  };

  const handleAutocompleteSelect = (item: any) => {
    if (searchType === "posts") {
      setQuery(item.title);
    } else {
      setQuery(item.name);
    }
    setShowAutocomplete(false);
    handleSearch();
  };

  const hasActiveFilters = query || communityId || (searchType === "posts" && sortBy !== "recent");
  const autocompleteResults = searchType === "posts" ? postAutocompleteResults : communityAutocompleteResults;
  const autocompleteLoading = searchType === "posts" ? postAutocompleteLoading : communityAutocompleteLoading;

  return (
    <div className="space-y-4">
      {/* Search Type Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setSearchType("posts")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            searchType === "posts"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setSearchType("communities")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            searchType === "communities"
              ? "text-accent border-b-2 border-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Communities
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={
              searchType === "posts"
                ? "Search posts by title..."
                : "Search communities..."
            }
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
              itemType={searchType === "posts" ? "post" : "community"}
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

      {/* Post Filters */}
      {searchType === "posts" && (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm text-accent hover:text-accent/80 font-medium"
          >
            {isOpen ? "Hide Filters" : "Show Filters"}
          </button>

          {isOpen && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              {/* Community Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Community
                </label>
                <select
                  value={communityId || ""}
                  onChange={(e) => setCommunityId(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">All Communities</option>
                  {communities?.map((comm: any) => (
                    <option key={comm.id} value={comm.id}>
                      {comm.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recent" | "trending" | "top")}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="trending">Trending</option>
                  <option value="top">Top Voted</option>
                </select>
              </div>

              <Button onClick={handleSearch} className="w-full bg-accent hover:bg-accent/90">
                Apply Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Results Count */}
      {searchType === "posts" && postResults && (
        <div className="text-sm text-muted-foreground">
          Found {postResults.length} post{postResults.length !== 1 ? "s" : ""}
        </div>
      )}
      {searchType === "communities" && communityResults && (
        <div className="text-sm text-muted-foreground">
          Found {communityResults.length} communit{communityResults.length !== 1 ? "ies" : "y"}
        </div>
      )}
    </div>
  );
}
