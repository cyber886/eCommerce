import { Truck, RotateCcw, Headset } from "lucide-react";

export default function PromoSection() {
  const promos = [
    {
      icon: <Truck className="text-primary text-3xl" />,
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      icon: <RotateCcw className="text-primary text-3xl" />,
      title: "Easy Returns",
      description: "30 day money back guarantee",
    },
    {
      icon: <Headset className="text-primary text-3xl" />,
      title: "24/7 Support",
      description: "Customer service excellence",
    },
  ];

  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promos.map((promo, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm flex items-center">
              <div className="mr-4">{promo.icon}</div>
              <div>
                <h3 className="font-medium mb-1">{promo.title}</h3>
                <p className="text-sm text-gray-600">{promo.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
