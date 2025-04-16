import { Switch, Route } from "wouter";
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
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

// Navigation guard for seller page
const SellerRoute = ({ path, component: Component }: { path: string, component: React.ComponentType }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Route path={path}><div>Loading...</div></Route>;
  }
  
  if (!user) {
    return <Route path={path}><Route path={path}><Redirect to="/auth" /></Route></Route>;
  }
  
  if (user.role !== "seller") {
    return <Route path={path}><Route path={path}><Redirect to="/account" /></Route></Route>;
  }
  
  return <Route path={path} component={Component} />;
};

import { Redirect } from "wouter";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/" component={HomePage}/>
      <Route path="/product/:id" component={ProductPage}/>
      <Route path="/category/:category" component={CategoryPage}/>
      <ProtectedRoute path="/checkout" component={CheckoutPage}/>
      <ProtectedRoute path="/account" component={AccountPage}/>
      <Route path="/auth" component={AuthPage}/>
      <Route path="/seller">
        {user?.role === "seller" ? <SellerPage /> : <Redirect to="/auth" />}
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
          <Router />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
