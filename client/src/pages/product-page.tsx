import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import CategoryNav from "@/components/category-nav";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import ProductReviews from "@/components/product-reviews";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getDiscountPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Truck, 
  RotateCcw, 
  Star, 
  StarHalf 
} from "lucide-react";
import { useState } from "react";
import { Product } from "@shared/schema";

export default function ProductPage() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  const { isCartOpen, addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Handle invalid product ID
  if (isNaN(productId)) {
    return <div>Invalid product ID</div>;
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="flex-grow py-6 md:py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Error loading product. Please try again later.
            </div>
          ) : product ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Product Image */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-auto object-contain rounded-lg"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                
                {/* Product Details */}
                <div>
                  <nav className="flex text-sm text-gray-500 mb-4">
                    <a href="/" className="hover:text-primary">Home</a>
                    <span className="mx-2">/</span>
                    <a href={`/category/${product.category}`} className="hover:text-primary">{product.category}</a>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">{product.name}</span>
                  </nav>
                  
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
                  
                  {/* We'll get actual rating data from the reviews component */}
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400 mr-2">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <StarHalf className="h-5 w-5 fill-current" />
                    </div>
                    <a href="#reviews" className="text-sm text-gray-500 hover:text-primary">View all reviews</a>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <>
                          <span className="text-gray-500 line-through ml-2">
                            {formatCurrency(product.originalPrice)}
                          </span>
                          <span className="text-green-600 ml-2">
                            {getDiscountPercentage(product.originalPrice, product.price)}% off
                          </span>
                        </>
                      )}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="h-9 w-9 rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="h-9 px-4 border-y flex items-center justify-center min-w-[3rem]">
                        {quantity}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={increaseQuantity}
                        className="h-9 w-9 rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button 
                      className="flex-1" 
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Heart className="mr-2 h-5 w-5" />
                      Add to Wishlist
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Truck className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Free Shipping</h4>
                        <p className="text-sm text-gray-600">On orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <RotateCcw className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Easy Returns</h4>
                        <p className="text-sm text-gray-600">30 day return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reviews Section */}
              <div id="reviews" className="border-t pt-8">
                <ProductReviews productId={product.id} />
              </div>
              
              {/* Reviews Section */}
              <div id="reviews" className="mt-12 border-t pt-8">
                <ProductReviews productId={product.id} />
              </div>
            </div>
          ) : (
            <div className="text-center">Product not found</div>
          )}
        </div>
      </main>
      <Footer />
      {isCartOpen && <CartSidebar />}
    </div>
  );
}
