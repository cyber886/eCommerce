import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Summer Sale is Live!</h1>
            <p className="text-lg mb-6">Get up to 50% off on our top electronics and home appliances. Limited time offer.</p>
            <Link href="/category/electronics">
              <Button className="bg-white text-primary hover:bg-gray-100 px-6 py-3">
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Summer Sale Electronics" 
              className="rounded-lg shadow-xl"
              width="600" 
              height="400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
