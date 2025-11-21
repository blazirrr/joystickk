import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Link as LinkIcon, Unlink } from "lucide-react";
import { useState, useEffect } from "react";
import ForumLayout from "@/components/ForumLayout";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordUsername, setDiscordUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLinkDiscord = () => {
    setLoading(true);
    // Redirect to Discord OAuth with a state parameter indicating account linking
    window.location.href = `/api/oauth/discord/login?link=true`;
  };

  const handleUnlinkDiscord = async () => {
    if (!confirm("Are you sure you want to unlink your Discord account?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/unlink-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to unlink Discord account");
      }

      setDiscordLinked(false);
      setDiscordUsername("");
      setMessage("Discord account unlinked successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to unlink Discord");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ForumLayout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-4xl font-bold text-foreground mb-8 italic -skew-x-12">
            ACCOUNT SETTINGS
          </h1>

          {message && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 mb-6">
              <p className="text-green-500 text-sm">{message}</p>
            </div>
          )}

          {/* Account Information */}
          <div className="mb-8 pb-8 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 italic">
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Username
                </label>
                <p className="text-foreground font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email
                </label>
                <p className="text-foreground font-semibold">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Account Type
                </label>
                <p className="text-foreground font-semibold capitalize">
                  {user.loginMethod === "local" ? "Joystick.ee Account" : "Discord Account"}
                </p>
              </div>
            </div>
          </div>

          {/* Discord Linking */}
          <div className="mb-8 pb-8 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 italic">
              Connected Accounts
            </h2>
            <div className="bg-input rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.076.076 0 00-.041.107c.352.699.764 1.364 1.225 1.994a.077.077 0 00.084.028 19.963 19.963 0 006.002-3.03.076.076 0 00.032-.057c.5-4.506-.838-8.962-3.368-12.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-foreground">Discord</p>
                    {discordLinked ? (
                      <p className="text-sm text-muted-foreground">{discordUsername}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {discordLinked ? (
                  <Button
                    onClick={handleUnlinkDiscord}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Unlink className="w-4 h-4" />
                    Unlink
                  </Button>
                ) : (
                  <Button
                    onClick={handleLinkDiscord}
                    disabled={loading}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Link Discord
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <div>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2 text-red-500 hover:text-red-600 border-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </ForumLayout>
  );
}
