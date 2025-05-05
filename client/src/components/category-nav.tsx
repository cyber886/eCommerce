import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Category } from "@shared/schema";
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Utensils, 
  Heart, 
  Gamepad, 
  BookOpen, 
  Dumbbell 
} from "lucide-react";

// Map category names to icons
const categoryIcons: Record<string, React.ReactNode> = {
  "Electronics": <Smartphone className="text-lg mb-1" />,
  "Fashion": <Shirt className="text-lg mb-1" />,
  "Home": <Home className="text-lg mb-1" />,
  "Kitchen": <Utensils className="text-lg mb-1" />,
  "Health": <Heart className="text-lg mb-1" />,
  "Toys": <Gamepad className="text-lg mb-1" />,
  "Books": <BookOpen className="text-lg mb-1" />,
  "Sports": <Dumbbell className="text-lg mb-1" />,
};

export default function CategoryNav() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 md:space-x-6 py-3 overflow-x-auto scrollbar-hide text-sm whitespace-nowrap">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.name.toLowerCase()}`}
              className="flex flex-col items-center p-2 hover:text-primary"
            >
              {categoryIcons[category.name] || <div className="text-lg mb-1" dangerouslySetInnerHTML={{ __html: category.icon }} />}
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
