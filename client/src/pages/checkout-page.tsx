import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CartItem, Product, insertOrderSchema } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Landmark, 
  Banknote, 
  CheckCircle2 
} from "lucide-react";
import DeliveryTimeSelector from "@/components/delivery-time-selector";
import OrderConfirmationModal from "@/components/order-confirmation-modal";
import { formatCurrency } from "@/lib/utils";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Create a more specific schema for the checkout form by extending the insert schema
const checkoutFormSchema = insertOrderSchema.extend({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryTimeSlot: z.string().min(1, "Time slot is required"),
  deliveryType: z.string().min(1, "Delivery type is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

// Remove sessionId from the form schema since it's handled on the server
type CheckoutFormValues = Omit<z.infer<typeof checkoutFormSchema>, "sessionId" | "total">;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Calculate tax (8% of subtotal)
  const tax = cartTotal * 0.08;
  // Shipping cost based on delivery type
  const shippingCost = deliveryType === "express" ? 10 : 0;
  // Grand total
  const grandTotal = cartTotal + tax + shippingCost;

  // If cart is empty, redirect to home page
  useQuery({
    queryKey: ["/api/cart"],
    onSuccess: (data: CartItemWithProduct[]) => {
      if (data.length === 0) {
        toast({
          title: "Cart is empty",
          description: "You need to add items to your cart first",
          variant: "destructive",
        });
        navigate("/");
      }
    },
  });

  // Form setup
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema.omit({ sessionId: true, total: true })),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      city: "",
      postalCode: "",
      deliveryDate: "",
      deliveryTimeSlot: "",
      deliveryType: "standard",
      paymentMethod: "credit-card",
    },
  });

  // Update form values when delivery options change
  const updateFormField = (field: keyof CheckoutFormValues, value: string) => {
    form.setValue(field, value);
  };

  // When delivery date changes
  const handleDateChange = (date: string) => {
    setSelectedDeliveryDate(date);
    updateFormField("deliveryDate", date);
  };

  // When time slot changes
  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    updateFormField("deliveryTimeSlot", timeSlot);
  };

  // When delivery type changes
  const handleDeliveryTypeChange = (type: string) => {
    setDeliveryType(type);
    updateFormField("deliveryType", type);
  };

  // When payment method changes
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    updateFormField("paymentMethod", method);
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!selectedDeliveryDate || !selectedTimeSlot) {
      toast({
        title: "Missing delivery information",
        description: "Please select a delivery date and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        ...data,
        total: grandTotal,
        // sessionId is handled on the server
      };

      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      
      // Show confirmation and clear cart
      setOrderId(order.id);
      setIsOrderComplete(true);
      clearCart();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    } catch (error) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    }
  };

  // Return to shopping after order completion
  const handleContinueShopping = () => {
    setIsOrderComplete(false);
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-6 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </div>
              
              {/* Delivery Time Selection */}
              <DeliveryTimeSelector 
                onDateChange={handleDateChange}
                onTimeSlotChange={handleTimeSlotChange}
                onDeliveryTypeChange={handleDeliveryTypeChange}
                selectedDate={selectedDeliveryDate}
                selectedTimeSlot={selectedTimeSlot}
                selectedDeliveryType={deliveryType}
              />
              
              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Button
                    type="button"
                    variant={paymentMethod === "credit-card" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handlePaymentMethodChange("credit-card")}
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span>Credit Card</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "bank-transfer" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handlePaymentMethodChange("bank-transfer")}
                  >
                    <Landmark className="h-6 w-6 mb-2" />
                    <span>Bank Transfer</span>
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "cash-on-delivery" ? "default" : "outline"}
                    className="flex flex-col items-center justify-center py-6"
                    onClick={() => handlePaymentMethodChange("cash-on-delivery")}
                  >
                    <Banknote className="h-6 w-6 mb-2" />
                    <span>Cash on Delivery</span>
                  </Button>
                </div>

                {paymentMethod === "credit-card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <Input type="text" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                        <Input type="text" placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <Input type="text" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank-transfer" && (
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="text-sm text-gray-600">
                      Please transfer the total amount to our bank account. Your order will be processed after payment is confirmed.
                    </p>
                    <div className="mt-2 text-sm">
                      <p><span className="font-medium">Bank:</span> Example Bank</p>
                      <p><span className="font-medium">Account:</span> 1234567890</p>
                      <p><span className="font-medium">Name:</span> ShopEase Inc.</p>
                    </div>
                  </div>
                )}

                {paymentMethod === "cash-on-delivery" && (
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="text-sm text-gray-600">
                      Pay with cash upon delivery. Please note that our delivery personnel will not carry change for large bills.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-16 h-16 flex-shrink-0 mr-4">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium">{item.product.name}</h4>
                        <div className="flex justify-between text-sm">
                          <span>{item.quantity} × {formatCurrency(item.product.price)}</span>
                          <span>{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={cartItems.length === 0}
                >
                  Place Order
                </Button>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  By placing an order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Order Confirmation Modal */}
      {isOrderComplete && (
        <OrderConfirmationModal
          orderId={orderId || 0}
          deliveryDate={selectedDeliveryDate}
          deliveryTimeSlot={selectedTimeSlot}
          total={grandTotal}
          onContinueShopping={handleContinueShopping}
        />
      )}
    </div>
  );
}
