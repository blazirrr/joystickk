import { trpc } from "@/lib/trpc";
import ForumLayout from "@/components/ForumLayout";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowUp, MessageCircle, Plus, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CommunityDetail() {
  const [, params] = useRoute("/c/:slug");
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const { data: community, isLoading: communityLoading } = trpc.forum.getCommunity.useQuery(
    params?.slug || "",
    { enabled: !!params?.slug }
  );

  const { data: posts, isLoading: postsLoading } = trpc.forum.getCommunityPosts.useQuery(
    params?.slug || "",
    { enabled: !!params?.slug }
  );

  const createPostMutation = trpc.forum.createPost.useMutation({
    onSuccess: () => {
      setPostTitle("");
      setPostContent("");
      setShowCreatePost(false);
      trpc.useUtils().forum.getCommunityPosts.invalidate();
    },
  });

  const handleCreatePost = () => {
    if (postTitle && postContent && community) {
      createPostMutation.mutate({
        title: postTitle,
        content: postContent,
        communityId: community.id,
      });
    }
  };

  if (communityLoading) {
    return (
      <ForumLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </ForumLayout>
    );
  }

  if (!community) {
    return (
      <ForumLayout>
        <div className="max-w-4xl mx-auto p-4 text-center py-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Community not found</h1>
          <Link href="/communities">
            <a>
              <Button variant="outline" className="italic">
                Back to Communities
              </Button>
            </a>
          </Link>
        </div>
      </ForumLayout>
    );
  }

  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/communities">
            <a className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Communities
            </a>
          </Link>

          <div className="bg-card border border-border rounded-lg p-8">
            <h1 className="text-5xl font-bold text-foreground mb-2 italic -skew-x-12">
              c/{community.slug}
            </h1>
            <p className="text-muted-foreground mb-6">{community.description}</p>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Join Community
            </Button>
          </div>
        </div>

        {/* Create Post Form */}
        {user && (
          <>
            {!showCreatePost ? (
              <Button
                onClick={() => setShowCreatePost(true)}
                className="mb-6 bg-accent hover:bg-accent/90 text-accent-foreground italic"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 italic">Create New Post</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter post title..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Enter post content..."
                    rows={5}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground italic"
                  >
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                  <Button
                    onClick={() => setShowCreatePost(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Posts Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="border-b border-border p-4 bg-background/50">
            <h2 className="text-lg font-bold text-foreground">Posts in c/{community.slug}</h2>
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
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <button className="hover:bg-accent/10 rounded p-1 text-accent">
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-foreground">{post.upvotes || 0}</span>
                        <button className="hover:bg-accent/10 rounded p-1 text-accent">
                          <ArrowUp className="w-5 h-5 rotate-180" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          Posted by u/{post.author?.name}
                        </div>
                        <h3 className="font-bold text-foreground hover:text-accent text-base mb-2">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex gap-4 text-muted-foreground text-xs">
                          <button className="flex items-center gap-1 hover:text-accent">
                            <MessageCircle className="w-4 h-4" />
                            {post.commentCount || 0} comments
                          </button>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No posts yet in this community.</p>
              {user && (
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground italic"
                >
                  Be the first to post!
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </ForumLayout>
  );
}
