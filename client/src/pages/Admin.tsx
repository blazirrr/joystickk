import { useAuth } from "@/_core/hooks/useAuth";
import AdminProductManager from "@/components/AdminProductManager";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Lock, Package, ShoppingBag, Users } from "lucide-react";
import { getDiscordLoginUrl } from "@/const";

const ADMIN_DISCORD_ID = "discord_1148160421262544938";

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users">("products");

  // Check if user is the admin
  const isAdmin = user?.openId === ADMIN_DISCORD_ID;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">Please log in to access the admin panel</p>
          <Button 
            onClick={() => (window.location.href = getDiscordLoginUrl())}
            className="bg-accent hover:bg-accent/90"
          >
            Login with Discord
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto text-red-500 mb-4 opacity-50" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-muted-foreground mb-8">Your Discord ID: {user.openId}</p>
          <Button 
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Go Back to Store
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-foreground italic -skew-x-12">ADMIN PANEL</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-2 border-b-2 font-semibold flex items-center gap-2 transition ${
                activeTab === "products"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-5 h-5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`py-4 px-2 border-b-2 font-semibold flex items-center gap-2 transition ${
                activeTab === "orders"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-2 border-b-2 font-semibold flex items-center gap-2 transition ${
                activeTab === "users"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-5 h-5" />
              Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "products" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 italic -skew-x-12">PRODUCT MANAGEMENT</h2>
            <AdminProductManager />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Order Management</h2>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">Order management coming soon</p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">User Management</h2>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">User management coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
