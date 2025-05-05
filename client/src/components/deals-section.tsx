import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency, getDiscountPercentage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Star, StarHalf } from "lucide-react";

export default function DealsSection() {
  const { addToCart } = useCart();
  
  // Get all products and filter to show only discounted ones
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Get products with discounts
  const dealProducts = allProducts
    .filter(product => product.originalPrice && product.originalPrice > product.price)
    .slice(0, 3); // Limit to 3 products

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Today's Deals</h2>
          <Link href="/category/all?discount=true" className="text-primary hover:underline">
            View All Deals
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dealProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-1/3">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 md:w-2/3">
                <div className="mb-2">
                  {product.discount && (
                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
                      {product.discount > 25 ? 'Flash Sale' : 'Deal of the Day'}
                    </span>
                  )}
                </div>
                <h3 className="font-medium mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 flex">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <StarHalf className="h-4 w-4 fill-current" />
                  </span>
                  <span className="text-xs text-gray-500 ml-1">(125)</span>
                </div>
                <div className="mb-3">
                  <span className="font-bold text-xl">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
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
                <Button 
                  className="w-full"
                  onClick={() => addToCart(product.id)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
