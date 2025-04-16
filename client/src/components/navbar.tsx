import { useState } from "react";
import { Link, useLocation } from "wouter";
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
  Heart, 
  LogOut, 
  UserCircle, 
  Settings, 
  Store 
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

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
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <SheetClose asChild>
                <Link to="/" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  Home
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/electronics" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  Electronics
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/fashion" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  Fashion
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/home" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  Home & Garden
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link to="/category/books" className="block py-2 px-4 hover:bg-gray-100 rounded">
                  Books
                </Link>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          Uzum Market 2.0
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="font-medium hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <Link to="/category/electronics" className="font-medium hover:text-primary transition-colors">
            Elektronika
          </Link>
          <Link to="/category/fashion" className="font-medium hover:text-primary transition-colors">
            Kiyim-kechak
          </Link>
          <Link to="/category/home" className="font-medium hover:text-primary transition-colors">
            Uy jihozlari
          </Link>
          <Link to="/category/books" className="font-medium hover:text-primary transition-colors">
            Kitoblar
          </Link>
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          {/* Search button */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[150px]">
              <SheetHeader className="mb-4">
                <SheetTitle>Qidirish</SheetTitle>
              </SheetHeader>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Mahsulotlarni qidiring..." 
                  className="flex-1" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Handle search here
                      setIsSearchOpen(false);
                    }
                  }}
                />
                <Button>Qidirish</Button>
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
                      <span>Sotuvchi paneli</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/account")}>
                      <UserCircle className="h-4 w-4 mr-2" />
                      <span>Mening hisobim</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <Heart className="h-4 w-4 mr-2" />
                    <span>Istaklar ro'yxati</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account?tab=settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Sozlamalar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()} 
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Chiqish</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <User className="h-4 w-4 mr-2" />
                    <span>Kirish / Ro'yxatdan o'tish</span>
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