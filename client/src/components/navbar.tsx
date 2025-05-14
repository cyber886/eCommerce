import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { 
  Menu, 
  ShoppingCart, 
  User, 
  Search, 
  Package, 
  LogOut, 
  UserCircle, 
  Settings, 
  Store 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LanguageSwitcher from "./language-switcher";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader className="mb-6">
              <SheetTitle>{t('categories')}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <SheetClose asChild>
                <Link to="/" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  {t('home')}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/electronics" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  {t('categories')}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/fashion" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  {t('fashion')}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/home" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  {t('home')}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/tracking" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  {t('realTimeTracking')}
                </Link>
              </SheetClose>
              <div className="pt-4">
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          E-Market
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <Link to="/category/electronics" className="font-medium hover:text-primary transition-colors">
            {t('electronics')}
          </Link>
          <Link to="/category/fashion" className="font-medium hover:text-primary transition-colors">
            {t('fashion')}
          </Link>
          <Link to="/category/home" className="font-medium hover:text-primary transition-colors">
            {t('home')}
          </Link>
          <Link to="/tracking" className="font-medium hover:text-primary transition-colors">
            {t('tracking')}
          </Link>
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          {/* Language switcher */}
          <LanguageSwitcher />
          
          {/* Search button */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[150px]">
              <SheetHeader className="mb-4">
                <SheetTitle>{t('search')}</SheetTitle>
              </SheetHeader>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder={t('search')} 
                  className="flex-1" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Handle search here
                      setIsSearchOpen(false);
                    }
                  }}
                />
                <Button>{t('search')}</Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {user ? (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.fullName?.charAt(0) || user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium truncate">
                    {user.username}
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === "seller" ? (
                    <DropdownMenuItem onClick={() => navigate("/seller-page")}>
                      <Store className="h-4 w-4 mr-2" />
                      <span>{t('dashboard')}</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>{t('account')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/account?tab=orders")}>
                    <Package className="h-4 w-4 mr-2" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account?tab=settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()} 
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>{t('login')} / {t('register')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}