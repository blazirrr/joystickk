import { trpc } from "@/lib/trpc";
import ForumLayout from "@/components/ForumLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function CommunitiesList() {
  const { data: communities, isLoading } = trpc.forum.getCommunities.useQuery();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

  const createCommunityMutation = trpc.forum.createCommunity.useMutation({
    onSuccess: () => {
      setFormData({ name: "", slug: "", description: "" });
      setShowCreateForm(false);
      trpc.useUtils().forum.getCommunities.invalidate();
    },
  });

  const handleCreateCommunity = () => {
    if (formData.name && formData.slug && formData.description) {
      createCommunityMutation.mutate(formData);
    }
  };

  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">Communities</h1>
          <p className="text-muted-foreground mb-6">
            Explore or create communities to connect with other gamers.
          </p>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Create Community Form */}
        {showCreateForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create New Community</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Community Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gaming"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Slug (URL)</label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">c/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                  placeholder="gaming"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your community..."
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateCommunity}
                disabled={createCommunityMutation.isPending || !formData.name || !formData.slug || !formData.description}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {createCommunityMutation.isPending ? "Creating..." : "Create Community"}
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Communities List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="border-b border-border p-4 bg-background/50">
            <h2 className="text-lg font-bold text-foreground">All Communities</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : communities && communities.length > 0 ? (
            <div className="divide-y divide-border">
              {communities.map((community: any) => (
                <Link key={community.id} href={`/c/${community.slug}`}>
                  <a className="block p-4 hover:bg-background/50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground hover:text-accent text-lg">
                          c/{community.slug}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">{community.description}</p>
                        <p className="text-muted-foreground/70 text-xs mt-2">{community.memberCount || 0} members</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Join
                      </Button>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No communities yet. Create one to get started!</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Create First Community
              </Button>
            </div>
          )}
        </div>
      </div>
    </ForumLayout>
  );
}
