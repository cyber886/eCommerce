import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE'
        });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId: product.id })
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  // Check initial wishlist status
  useEffect(() => {
    fetch(`/api/wishlist/check/${product.id}`)
      .then(res => res.json())
      .then(data => setIsWishlisted(data.inWishlist))
      .catch(console.error);
  }, [product.id]);

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white text-gray-500 hover:text-primary rounded-full h-8 w-8 shadow"
              onClick={toggleWishlist}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2 left-2">
              <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
                -{product.discount}%
              </span>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
          <div className="text-sm text-gray-500 mb-2">{product.category}</div>
          <div className="flex justify-between items-center mt-auto">
            <div>
              <span className="font-semibold">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-1">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <Button 
              variant="outline"
              size="icon"
              className="text-primary hover:bg-primary hover:text-white border border-primary rounded-full h-8 w-8 flex items-center justify-center transition-colors"
              onClick={handleAddToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
