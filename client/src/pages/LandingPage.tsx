import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ShoppingCart, MessageCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">

            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {APP_TITLE}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Your ultimate gaming destination. Shop premium gaming peripherals and connect with the gaming community.
            </p>
          </div>

          {/* Two Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Store Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-accent/20 transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-accent/10 rounded-lg p-4">
                  <ShoppingCart className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">STORE</h2>
              </div>

              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Browse our curated collection of gaming controllers, keyboards, mice, headsets, and accessories. Find the perfect gear for your gaming setup.
              </p>

              <ul className="text-muted-foreground mb-8 space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Premium gaming peripherals</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Competitive pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Fast shipping worldwide</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Expert reviews & guides</span>
                </li>
              </ul>

              <a href="/store">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 text-lg">
                  VISIT STORE →
                </Button>
              </a>
            </div>

            {/* Forum Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-lg hover:shadow-accent/20 transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-accent/10 rounded-lg p-4">
                  <MessageCircle className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">FORUM</h2>
              </div>

              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Join our vibrant gaming community. Share your experiences, discuss gaming gear, ask questions, and connect with fellow gamers worldwide.
              </p>

              <ul className="text-muted-foreground mb-8 space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Active gaming community</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Share game reviews & tips</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Discuss gaming hardware</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent">✓</span>
                  <span>Connect with other gamers</span>
                </li>
              </ul>

              <a href="/forum">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-3 text-lg">
                  VISIT FORUM →
                </Button>
              </a>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 bg-card border border-border rounded-xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              WHY CHOOSE JOYSTICK.EE?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🎮</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">GAMERS BY GAMERS</h4>
                <p className="text-muted-foreground">
                  Built by passionate gamers who understand what you need.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">FAST & RELIABLE</h4>
                <p className="text-muted-foreground">
                  Quick shipping, responsive support, and quality products.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">COMMUNITY DRIVEN</h4>
                <p className="text-muted-foreground">
                  Be part of a thriving community of gaming enthusiasts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. All rights reserved.</p>
          <p className="text-sm mt-2">Your ultimate gaming destination</p>
        </div>
      </footer>
    </div>
  );
}
