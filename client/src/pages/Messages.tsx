import ForumLayout from "@/components/ForumLayout";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <ForumLayout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-3xl font-bold text-foreground mb-2 italic -skew-x-12">
            Messages
          </h1>
          <p className="text-muted-foreground mb-6">
            Direct messaging feature coming soon. Connect with other gamers in your communities!
          </p>
        </div>
      </div>
    </ForumLayout>
  );
}
