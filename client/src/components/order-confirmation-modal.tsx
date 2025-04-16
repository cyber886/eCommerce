import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface OrderConfirmationModalProps {
  orderId: number;
  deliveryDate: string;
  deliveryTimeSlot: string;
  total: number;
  onContinueShopping: () => void;
}

export default function OrderConfirmationModal({
  orderId,
  deliveryDate,
  deliveryTimeSlot,
  total,
  onContinueShopping,
}: OrderConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your order #{orderId} has been placed successfully.</p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Estimated Delivery</span>
            <span className="font-medium">{deliveryDate}, {deliveryTimeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Total</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">We've sent the order details to your email.</p>
        
        <Button 
          className="w-full"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
