import { trpc } from "@/lib/trpc";
import ForumLayout from "@/components/ForumLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CreateCommunity() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");

  const createCommunityMutation = trpc.forum.createCommunity.useMutation({
    onSuccess: (_, input) => {
      navigate(`/c/${input.slug}`);
    },
    onError: (err) => {
      setError(err.message || "Failed to create community");
    },
  });

  const handleCreateCommunity = () => {
    setError("");
    if (!formData.name || !formData.slug || !formData.description) {
      setError("All fields are required");
      return;
    }
    if (formData.name.length < 3) {
      setError("Community name must be at least 3 characters");
      return;
    }
    if (formData.slug.length < 3) {
      setError("Slug must be at least 3 characters");
      return;
    }
    createCommunityMutation.mutate(formData);
  };

  if (loading) {
    return (
      <ForumLayout>
        <div className="flex justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ForumLayout>
    );
  }

  if (!user) {
    return (
      <ForumLayout>
        <div className="max-w-2xl mx-auto p-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 italic -skew-x-12">
            Create Community
          </h1>
          <p className="text-muted-foreground mb-6">You must be logged in to create a community.</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground italic">
            Log In
          </Button>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 italic -skew-x-12">
            Create Community
          </h1>
          <p className="text-muted-foreground mb-8">
            Start a new community to bring gamers together around shared interests.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Community Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Competitive Gaming"
                maxLength={50}
                className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.name.length}/50 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Community Slug (URL)
              </label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2 font-medium">c/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                    setFormData({ ...formData, slug: value });
                  }}
                  placeholder="competitive-gaming"
                  maxLength={50}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.slug.length}/50 characters (lowercase, numbers, hyphens, underscores only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this community is about..."
                maxLength={500}
                rows={5}
                className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateCommunity}
                disabled={createCommunityMutation.isPending || !formData.name || !formData.slug || !formData.description}
                className="bg-accent hover:bg-accent/90 text-accent-foreground italic flex-1"
              >
                {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
              </Button>
              <Button
                onClick={() => navigate("/communities")}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ForumLayout>
  );
}
