import { trpc } from "@/lib/trpc";
import ForumLayout from "@/components/ForumLayout";
import { Button } from "@/components/ui/button";
import FormError from "@/components/FormError";
import { useRoute } from "wouter";
import { Loader2, ArrowUp, MessageCircle, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { parseValidationError } from "@/lib/errorParser";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const postId = params?.id ? Number(params.id) : undefined;
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingPostTitle, setEditingPostTitle] = useState("");
  const [editingPostContent, setEditingPostContent] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: post, isLoading: postLoading, refetch: refetchPost } = trpc.forum.getPost.useQuery(
    postId!,
    { enabled: !!postId }
  );

  const createCommentMutation = trpc.forum.createComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setCommentError(null);
      refetchPost();
      toast.success("Comment posted!");
    },
    onError: (err) => {
      const errorMessage = parseValidationError(err);
      setCommentError(errorMessage);
    },
  });

  const updateCommentMutation = trpc.forum.updateComment.useMutation({
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingCommentText("");
      setCommentError(null);
      refetchPost();
      toast.success("Comment updated!");
    },
    onError: (err) => {
      const errorMessage = parseValidationError(err);
      setCommentError(errorMessage);
    },
  });

  const deleteCommentMutation = trpc.forum.deleteComment.useMutation({
    onSuccess: () => {
      refetchPost();
      toast.success("Comment deleted!");
    },
  });

  const voteCommentMutation = trpc.forum.voteComment.useMutation({
    onSuccess: () => {
      refetchPost();
    },
  });

  const updatePostMutation = trpc.forum.updatePost.useMutation({
    onSuccess: () => {
      setEditingPostId(null);
      setPostError(null);
      refetchPost();
      toast.success("Post updated!");
    },
  });

  const deletePostMutation = trpc.forum.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted!");
      window.location.href = "/forum";
    },
  });

  const votePostMutation = trpc.forum.votePost.useMutation({
    onSuccess: () => {
      refetchPost();
    },
  });

  const handleCreateComment = () => {
    setCommentError(null);
    
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    if (commentText.length < 1) {
      setCommentError("Comment is too short");
      return;
    }
    if (commentText.length > 5000) {
      setCommentError("Comment is too long (maximum 5000 characters)");
      return;
    }
    if (!postId) {
      setCommentError("Post not found");
      return;
    }

    createCommentMutation.mutate({
      postId,
      content: commentText,
    });
  };

  const handleEditComment = (commentId: number, content: string | null) => {
    setEditingCommentId(commentId);
    setEditingCommentText(content || "");
  };

  const handleSaveCommentEdit = (commentId: number) => {
    if (editingCommentText) {
      updateCommentMutation.mutate({
        commentId,
        content: editingCommentText,
      });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleEditPost = () => {
    if (post) {
      setEditingPostId(post.id);
      setEditingPostTitle(post.title);
      setEditingPostContent(post.content || "");
    }
  };

  const handleSavePostEdit = () => {
    setPostError(null);
    
    if (!editingPostTitle.trim()) {
      setPostError("Post title is required");
      return;
    }
    if (editingPostTitle.length < 3) {
      setPostError("Post title must be at least 3 characters");
      return;
    }
    if (editingPostTitle.length > 200) {
      setPostError("Post title must be at most 200 characters");
      return;
    }
    if (!editingPostContent.trim()) {
      setPostError("Post content is required");
      return;
    }
    if (editingPostContent.length < 10) {
      setPostError("Post content must be at least 10 characters");
      return;
    }
    if (editingPostContent.length > 5000) {
      setPostError("Post content must be at most 5000 characters");
      return;
    }
    if (!postId) {
      setPostError("Post not found");
      return;
    }

    updatePostMutation.mutate({
      postId,
      title: editingPostTitle,
      content: editingPostContent,
    });
  };

  const handleDeletePost = () => {
    if (postId && window.confirm("Delete this post? This cannot be undone.")) {
      deletePostMutation.mutate(postId);
    }
  };

  if (postLoading) {
    return (
      <ForumLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </ForumLayout>
    );
  }

  if (!post) {
    return (
      <ForumLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </ForumLayout>
    );
  }

  const isPostAuthor = user?.id === post.author?.id;

  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        {/* Post */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          {editingPostId === post.id ? (
            // Edit mode
            <div className="space-y-4">
              {postError && <FormError error={postError} />}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title ({editingPostTitle.length}/200)
                </label>
                <input
                  type="text"
                  value={editingPostTitle}
                  onChange={(e) => {
                    setEditingPostTitle(e.target.value);
                    setPostError(null);
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content ({editingPostContent.length}/5000)
                </label>
                <textarea
                  value={editingPostContent}
                  onChange={(e) => {
                    setEditingPostContent(e.target.value);
                    setPostError(null);
                  }}
                  rows={6}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Post content"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSavePostEdit}
                  disabled={updatePostMutation.isPending}
                  className="bg-accent hover:bg-accent/90"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingPostId(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <button
                  onClick={() => votePostMutation.mutate({ postId: post.id, voteType: "upvote" })}
                  disabled={votePostMutation.isPending}
                  className="hover:bg-accent/10 rounded p-1 text-accent disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-foreground">{post.upvotes || 0}</span>
                <button
                  onClick={() => votePostMutation.mutate({ postId: post.id, voteType: "downvote" })}
                  disabled={votePostMutation.isPending}
                  className="hover:bg-accent/10 rounded p-1 text-accent disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5 rotate-180" />
                </button>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-2">
                  Posted by u/{post.author?.name || 'unknown'} in c/{post.community?.slug || 'unknown'}
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{post.title}</h1>
                <p className="text-muted-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                <div className="flex gap-4 text-muted-foreground text-sm">
                  <button className="flex items-center gap-1 hover:text-accent">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments?.length || 0} comments
                  </button>
                  {isPostAuthor && (
                    <>
                      <button
                        onClick={handleEditPost}
                        className="flex items-center gap-1 hover:text-accent text-accent"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeletePost}
                        disabled={deletePostMutation.isPending}
                        className="flex items-center gap-1 hover:text-red-500 text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        {user ? (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Add a Comment</h2>
            {commentError && <FormError error={commentError} className="mb-4" />}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Comment ({commentText.length}/5000)
              </label>
              <textarea
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                  setCommentError(null);
                }}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <Button
              onClick={handleCreateComment}
              disabled={createCommentMutation.isPending || !commentText}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 text-center">
            <p className="text-muted-foreground">Please log in to comment</p>
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Comments</h2>

          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: any) => {
              const isCommentAuthor = user?.id === comment.author?.id;
              const isEditing = editingCommentId === comment.id;

              return (
                <div key={comment.id} className="bg-card border border-border rounded-lg p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveCommentEdit(comment.id)}
                          disabled={updateCommentMutation.isPending}
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingCommentId(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <button
                          onClick={() =>
                            voteCommentMutation.mutate({
                              commentId: comment.id,
                              voteType: "upvote",
                            })
                          }
                          disabled={voteCommentMutation.isPending}
                          className="hover:bg-accent/10 rounded p-1 text-accent text-xs disabled:opacity-50"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold text-foreground">
                          {comment.upvotes || 0}
                        </span>
                        <button
                          onClick={() =>
                            voteCommentMutation.mutate({
                              commentId: comment.id,
                              voteType: "downvote",
                            })
                          }
                          disabled={voteCommentMutation.isPending}
                          className="hover:bg-accent/10 rounded p-1 text-accent text-xs disabled:opacity-50"
                        >
                          <ArrowUp className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-muted-foreground">u/{comment.author?.name || 'unknown'}</div>
                          {isCommentAuthor && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(comment.id, comment.content)}
                                className="text-xs text-accent hover:text-accent/80"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deleteCommentMutation.isPending}
                                className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </ForumLayout>
  );
}
