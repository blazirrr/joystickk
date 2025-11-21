import ForumLayout from "@/components/ForumLayout";
import { Bookmark } from "lucide-react";

export default function Saved() {
  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold text-foreground mb-2 italic -skew-x-12">
            Saved Posts
          </h1>
          <p className="text-muted-foreground mb-6">
            You haven't saved any posts yet. Bookmark your favorite posts to find them later!
          </p>
        </div>
      </div>
    </ForumLayout>
  );
}
