import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const [location, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <ShoppingCart className="text-primary text-2xl mr-2" />
            <span className="font-bold text-xl text-gray-800">ShopEase</span>
          </Link>
          
          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for products..."
                className="pl-10 pr-4 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/account" className="text-gray-600 hover:text-primary hidden sm:flex items-center">
              <User className="h-5 w-5 sm:mr-1" />
              <span className="hidden md:inline">Account</span>
            </Link>
            <Link href="/wishlist" className="text-gray-600 hover:text-primary hidden sm:flex items-center">
              <Heart className="h-5 w-5 sm:mr-1" />
              <span className="hidden md:inline">Wishlist</span>
            </Link>
            <button 
              className="text-gray-600 hover:text-primary relative flex items-center"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5 sm:mr-1" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="py-4 flex flex-col h-full">
                  <div className="mb-8">
                    <form onSubmit={handleSearch} className="relative">
                      <Input
                        type="text"
                        placeholder="Search for products..."
                        className="pl-10 pr-4 py-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </form>
                  </div>
                  <nav className="space-y-4">
                    <Link href="/account" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                      <User className="h-5 w-5 mr-3 text-primary" />
                      <span>Account</span>
                    </Link>
                    <Link href="/wishlist" className="flex items-center p-2 hover:bg-gray-100 rounded-md">
                      <Heart className="h-5 w-5 mr-3 text-primary" />
                      <span>Wishlist</span>
                    </Link>
                    <button 
                      className="flex items-center p-2 w-full text-left hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setIsCartOpen(true);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-3 text-primary" />
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Mobile Search (visible only on mobile) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for products..."
              className="pl-10 pr-4 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
