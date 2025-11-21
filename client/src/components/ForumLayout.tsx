import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Home, Compass, Bookmark, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface ForumLayoutProps {
  children: React.ReactNode;
}

export default function ForumLayout({ children }: ForumLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16 gap-8">
            {/* Search bar - centered */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search communities and posts..."
                className="w-full px-4 py-2 bg-input rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 absolute right-4">
              <Link href="/store">
                <a>
                  <Button size="sm" variant="outline">
                    Store
                  </Button>
                </a>
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <a href="/api/oauth/discord/login">
                  <Button
                    size="sm"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.076.076 0 00-.041.107c.352.699.764 1.364 1.225 1.994a.077.077 0 00.084.028 19.963 19.963 0 006.002-3.03.076.076 0 00.032-.057c.5-4.506-.838-8.962-3.368-12.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
                    </svg>
                    <span className="hidden sm:inline">Login with Discord</span>
                  </Button>
                </a>
              )}

              {/* Sidebar toggle */}
              <button
                className="md:hidden p-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-64 bg-card border-r border-border p-4 overflow-y-auto`}
        >
          <div className="space-y-2 mb-6">
            <button
              onClick={() => navigate("/forum")}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition text-left"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <Link href="/communities">
              <a className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                <Compass className="w-5 h-5" />
                <span>Communities</span>
              </a>
            </Link>
            {user && (
              <>
                <Link href="/saved">
                  <a className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                    <Bookmark className="w-5 h-5" />
                    <span>Saved</span>
                  </a>
                </Link>
                <Link href="/messages">
                  <a className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </a>
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3 px-4">Popular Communities</h3>
            <div className="space-y-2">
              <Link href="/c/gaming">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  c/gaming
                </a>
              </Link>
              <Link href="/c/hardware">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  c/hardware
                </a>
              </Link>
              <Link href="/c/esports">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  c/esports
                </a>
              </Link>
            </div>
          </div>

          {user && (
            <div className="mt-6 pt-4 border-t border-border">
              <Link href="/create-community">
                <a className="block w-full">
                  <Button className="w-full">Create Community</Button>
                </a>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
