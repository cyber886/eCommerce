import { Link } from "wouter";

export default function CategoryShowcase() {
  const categoryShowcase = [
    {
      name: "Electronics",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      link: "/category/electronics",
    },
    {
      name: "Fashion",
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      link: "/category/fashion",
    },
    {
      name: "Home & Kitchen",
      image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      link: "/category/home",
    },
    {
      name: "Sports & Outdoors",
      image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250&q=80",
      link: "/category/sports",
    },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Shop By Category</h2>
          <Link href="/category/all" className="text-primary hover:underline">
            View All Categories
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryShowcase.map((category, index) => (
            <Link key={index} href={category.link} className="relative rounded-lg overflow-hidden group">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <span className="text-white font-medium p-4">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
