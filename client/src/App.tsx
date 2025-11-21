import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { getAppType } from "./lib/subdomain";
import LandingPage from "./pages/LandingPage";
import StoreHome from "./pages/StoreHome";
import ForumHome from "./pages/ForumHome";
import PostDetail from "./pages/PostDetail";
import CommunitiesList from "./pages/CommunitiesList";
import ProductsCatalog from "./pages/ProductsCatalog";
import ProductDetail from "./pages/ProductDetail";
import ShoppingCart from "./pages/ShoppingCart";
import Checkout from "./pages/Checkout";
import CommunityDetail from "./pages/CommunityDetail";
import CreateCommunity from "./pages/CreateCommunity";
import Messages from "./pages/Messages";
import Saved from "./pages/Saved";

import AccountSettings from "./pages/AccountSettings";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import Returns from "./pages/Returns";
import Admin from "./pages/Admin";

function Router() {
  const appType = getAppType();

  return (
    <Switch>
      {/* Explicit routes for testing */}
      <Route path={"/landing"} component={LandingPage} />
      <Route path={"/forum"} component={ForumHome} />
      <Route path={"/post/:id"} component={PostDetail} />
      <Route path={"/communities"} component={CommunitiesList} />
      <Route path={"/c/:slug"} component={CommunityDetail} />
      <Route path={"/create-community"} component={CreateCommunity} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/saved"} component={Saved} />

      <Route path={"/@:username/settings"} component={AccountSettings} />
      <Route path={"/admin"} component={Admin} />
      
      {/* Store routes */}
      <Route path={"/store"} component={StoreHome} />
      <Route path={"/products"} component={ProductsCatalog} />
      <Route path={"/product/:slug"} component={ProductDetail} />
      <Route path={"/cart"} component={ShoppingCart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/contact"} component={ContactUs} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/returns"} component={Returns} />

      {/* Default routing based on subdomain */}
      {appType === "landing" && <Route path={"/"} component={LandingPage} />}
      {appType === "forum" && <Route path={"/"} component={ForumHome} />}
      {appType === "store" && <Route path={"/"} component={StoreHome} />}
      
      {/* Fallback for root if no subdomain detected */}
      {appType === "landing" && <Route path={"/"} component={LandingPage} />}

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
