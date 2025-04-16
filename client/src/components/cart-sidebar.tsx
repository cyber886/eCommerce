import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Link, useLocation } from "wouter";

export default function CartSidebar() {
  const { 
    cartItems, 
    updateQuantity, 
    removeItem, 
    cartTotal, 
    setIsCartOpen,
    cartCount
  } = useCart();
  const [, navigate] = useLocation();

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop - click to close */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Cart sidebar */}
      <div className="relative w-full md:w-96 bg-white shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="text-xl font-semibold">Your Cart ({cartCount})</h2>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
              <p className="text-sm">Add some products to your cart</p>
            </div>
            <Button onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-grow px-4 py-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex py-4 border-b">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium text-sm">{item.product.name}</h3>
                    <div className="text-gray-500 text-sm">{item.product.category}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-primary font-medium">
                        {formatCurrency(item.product.price)}
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-r-none p-0"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 h-6 bg-gray-100 flex items-center justify-center text-sm">
                          {item.quantity}
                        </span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-l-none p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="border-t px-4 py-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <Button 
                className="w-full mb-2"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
