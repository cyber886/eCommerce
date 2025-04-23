import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ProductPage from "@/pages/product-page";
import CategoryPage from "@/pages/category-page";
import CheckoutPage from "@/pages/checkout-page";
import AuthPage from "@/pages/auth-page";
import AccountPage from "@/pages/account-page";
import SellerPage from "@/pages/seller-page";
import OrderTrackingPage from "@/pages/order-tracking-page";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationsProvider } from "@/hooks/use-notifications";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={HomePage}/>
      <Route path="/product/:id" component={ProductPage}/>
      <Route path="/category/:category" component={CategoryPage}/>
      <ProtectedRoute path="/checkout" component={CheckoutPage}/>
      <ProtectedRoute path="/account" component={AccountPage}/>
      <Route path="/tracking" component={OrderTrackingPage}/>
      <Route path="/auth">
        {user ? <Redirect to="/" /> : <AuthPage />}
      </Route>
      <Route path="/seller-page">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <Redirect to="/auth" />
        ) : user.role !== "seller" ? (
          <Redirect to="/account" />
        ) : (
          <SellerPage />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <NotificationsProvider>
            <Router />
            <Toaster />
          </NotificationsProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
