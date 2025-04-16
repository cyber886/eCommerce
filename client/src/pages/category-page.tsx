import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import CategoryNav from "@/components/category-nav";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import { useCart } from "@/hooks/use-cart";
import ProductCard from "@/components/product-card";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid2X2, 
  List 
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function CategoryPage() {
  const { category } = useParams();
  const { isCartOpen } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Convert category slug to readable name
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: [`/api/products/category/${category}`],
    enabled: !!category,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CategoryNav />
      <main className="flex-grow py-6">
        <div className="container mx-auto px-4">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{categoryName}</h1>
            <p className="text-gray-600">Explore our collection of {categoryName.toLowerCase()} products</p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters - Desktop */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-medium text-lg mb-4">Filters</h2>
                <Separator className="mb-4" />
                
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="price-1" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="price-1" className="text-sm">Under $50</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-2" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="price-2" className="text-sm">$50 - $100</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-3" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="price-3" className="text-sm">$100 - $200</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-4" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="price-4" className="text-sm">Over $200</label>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-3">Brand</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="brand-1" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="brand-1" className="text-sm">Brand A</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="brand-2" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="brand-2" className="text-sm">Brand B</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="brand-3" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="brand-3" className="text-sm">Brand C</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Availability</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="in-stock" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="in-stock" className="text-sm">In Stock</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="on-sale" className="rounded text-primary focus:ring-primary mr-2" />
                      <label htmlFor="on-sale" className="text-sm">On Sale</label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-4 bg-white rounded-lg shadow-sm p-3">
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden md:inline">Sort by:</span>
                  <select className="text-sm bg-white border rounded px-2 py-1">
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Products */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h3 className="font-medium text-lg mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your filters or browse other categories</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex">
                      <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        <div className="text-sm text-gray-600 mb-2">{product.category}</div>
                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button size="sm" onClick={() => (document.getElementById(`add-to-cart-${product.id}`) as HTMLButtonElement)?.click()}>
                            Add to Cart
                          </Button>
                          {/* Hidden button that will be clicked programmatically */}
                          <button 
                            id={`add-to-cart-${product.id}`} 
                            className="hidden"
                            onClick={() => {}} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {isCartOpen && <CartSidebar />}
    </div>
  );
}
