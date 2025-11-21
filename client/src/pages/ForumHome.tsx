import { trpc } from "@/lib/trpc";
import ForumLayout from "@/components/ForumLayout";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import { Link } from "wouter";
import { Loader2, ArrowUp, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { parseValidationError } from "@/lib/errorParser";

export default function ForumHome() {
  const { data: communities, isLoading: communitiesLoading } = trpc.forum.getCommunities.useQuery();
  const { data: posts, isLoading: postsLoading } = trpc.forum.getPosts.useQuery();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const createPostMutation = trpc.forum.createPost.useMutation({
    onSuccess: () => {
      setPostTitle("");
      setPostContent("");
      setSelectedCommunity(undefined);
      setShowCreatePost(false);
      setError(null);
      // Refresh posts
      trpc.useUtils().forum.getPosts.invalidate();
    },
    onError: (err) => {
      const errorMessage = parseValidationError(err);
      setError(errorMessage);
    },
  });

  const handleCreatePost = () => {
    setError(null);
    
    // Client-side validation
    if (!postTitle.trim()) {
      setError("Post title is required");
      return;
    }
    if (postTitle.length < 3) {
      setError("Post title must be at least 3 characters");
      return;
    }
    if (postTitle.length > 200) {
      setError("Post title must be at most 200 characters");
      return;
    }

    if (!postContent.trim()) {
      setError("Post content is required");
      return;
    }
    if (postContent.length < 10) {
      setError("Post content must be at least 10 characters");
      return;
    }
    if (postContent.length > 5000) {
      setError("Post content must be at most 5000 characters");
      return;
    }

    if (!selectedCommunity) {
      setError("Please select a community");
      return;
    }

    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      communityId: selectedCommunity,
    });
  };

  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Hero Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">Joystick.ee Forum</h1>
          <p className="text-muted-foreground mb-6">
            Connect with gaming enthusiasts, share your experiences, and discuss the latest gaming gear and trends.
          </p>
          <Button 
            onClick={() => {
              setShowCreatePost(!showCreatePost);
              setError(null);
            }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create New Post</h2>
            
            {error && <FormError error={error} className="mb-4" />}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Community</label>
              <select
                value={selectedCommunity || ""}
                onChange={(e) => {
                  setSelectedCommunity(Number(e.target.value) || undefined);
                  setError(null);
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Select a community...</option>
                {communities?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    c/{c.slug}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Title ({postTitle.length}/200)
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => {
                  setPostTitle(e.target.value);
                  setError(null);
                }}
                placeholder="Enter post title..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 3 characters</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Content ({postContent.length}/5000)
              </label>
              <textarea
                value={postContent}
                onChange={(e) => {
                  setPostContent(e.target.value);
                  setError(null);
                }}
                placeholder="Enter post content..."
                rows={5}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum 10 characters</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreatePost}
                disabled={createPostMutation.isPending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
              <Button
                onClick={() => {
                  setShowCreatePost(false);
                  setError(null);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Communities Section */}
        <div className="bg-card border border-border overflow-hidden mb-6">
          <div className="border-b border-border p-4 bg-background/50">
            <h2 className="text-lg font-bold text-foreground">Popular Communities</h2>
          </div>

          {communitiesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {communities?.slice(0, 5).map((community: any) => (
                <Link key={community.id} href={`/c/${community.slug}`}>
                  <a className="block p-4 hover:bg-background/50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground hover:text-accent text-lg">
                          c/{community.slug}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">{community.description}</p>
                        <p className="text-muted-foreground/70 text-xs mt-2">{community.memberCount} members</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Join
                      </Button>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-border p-4 bg-background/50">
            <Link href="/communities">
              <a className="text-accent hover:text-accent/80 font-medium">View all communities →</a>
            </Link>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-card border border-border overflow-hidden">
          <div className="border-b border-border p-4 bg-background/50">
            <h2 className="text-lg font-bold text-foreground">Recent Posts</h2>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="divide-y divide-border">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <a className="block p-4 hover:bg-background/50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground hover:text-accent text-lg">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          in c/{post.community?.slug || "unknown"}
                        </p>
                        <p className="text-muted-foreground/70 text-xs mt-2">
                          by {post.author?.name || "Anonymous"} • {post.commentCount || 0} comments
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <ArrowUp className="w-4 h-4" />
                          <span className="text-sm">{post.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.commentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No posts yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </ForumLayout>
  );
}
