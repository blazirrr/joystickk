import { Button } from "@/components/ui/button";
import { ShoppingCart, LogOut, Menu, X, Home, LogIn, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Matching Forum Layout */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16 gap-8">
            {/* Search bar - centered */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 bg-input rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4 absolute right-4">
              {/* Cart */}
              <Link href="/cart">
                <a>
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Cart</span>
                  </Button>
                </a>
              </Link>

              {/* Forum Link */}
              <Link href="/forum">
                <a>
                  <Button size="sm" variant="outline">
                    Forum
                  </Button>
                </a>
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-input transition text-foreground"
                  >
                    <span className="text-sm hidden sm:inline">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                      <div className="p-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-input transition"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate("/orders");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-input transition"
                        >
                          Orders
                        </button>
                        <button
                          onClick={() => {
                            navigate("/settings");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-input transition"
                        >
                          Settings
                        </button>
                      </div>
                      <div className="border-t border-border p-2">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-input transition rounded"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a href="/api/oauth/discord/login">
                  <Button size="sm" className="flex items-center gap-2 bg-accent hover:bg-accent/90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.1.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.076.076 0 00-.041.107c.352.699.764 1.364 1.225 1.994a.077.077 0 00.084.028 19.963 19.963 0 006.002-3.03.076.076 0 00.032-.057c.5-4.506-.838-8.962-3.368-12.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
                    </svg>
                    <span className="hidden sm:inline">Login with Discord</span>
                  </Button>
                </a>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2">
              <Link href="/store">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  Home
                </a>
              </Link>
              <Link href="/products">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  Products
                </a>
              </Link>
              <Link href="/forum">
                <a className="block px-4 py-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition">
                  Forum
                </a>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">JOYSTICK.EE</h3>
              <p className="text-sm text-muted-foreground">
                Your ultimate gaming destination. Shop premium gaming peripherals and connect with the gaming community.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products"><a className="hover:text-foreground transition">All Products</a></Link></li>
                <li><Link href="/products"><a className="hover:text-foreground transition">Keyboards</a></Link></li>
                <li><Link href="/products"><a className="hover:text-foreground transition">Mice</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/forum"><a className="hover:text-foreground transition">Forum</a></Link></li>
                <li><Link href="/communities"><a className="hover:text-foreground transition">Communities</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact"><a className="hover:text-foreground transition">Contact Us</a></Link></li>
                <li><Link href="/faq"><a className="hover:text-foreground transition">FAQ</a></Link></li>
                <li><Link href="/returns"><a className="hover:text-foreground transition">Returns</a></Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 Joystick.ee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
