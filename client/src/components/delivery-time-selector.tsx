
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDeliveryDates, formatDeliveryDate, timeSlots } from "@/lib/utils";
import { Truck, Clock, AlertCircle, ShieldCheck, XCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DeliveryTimeSelectorProps {
  onDateChange: (date: string) => void;
  onTimeSlotChange: (timeSlot: string) => void;
  onDeliveryTypeChange: (deliveryType: string) => void;
  selectedDate: string;
  selectedTimeSlot: string;
  selectedDeliveryType: string;
  isSeller?: boolean;
  onAcceptDelivery?: () => void;
  deliveryStatus?: 'pending' | 'accepted' | 'rejected';
}

interface TimeSlotAvailability {
  time: string;
  isAvailable: boolean;
  orderedBy?: string;
}

export default function DeliveryTimeSelector({
  onDateChange,
  onTimeSlotChange,
  onDeliveryTypeChange,
  selectedDate,
  selectedTimeSlot,
  selectedDeliveryType,
  isSeller = false,
  onAcceptDelivery,
  deliveryStatus = 'pending'
}: DeliveryTimeSelectorProps) {
  const isInitialized = useRef(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlotAvailability[]>([]);
  
  const formattedDates = useRef(Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date,
      formattedDate: formatDeliveryDate(date),
      available: Math.random() > 0.3, // Simulate availability
    };
  }));

  useEffect(() => {
    if (!isInitialized.current && !selectedDate && formattedDates.current.length > 0) {
      onDateChange(formattedDates.current[0].formattedDate.fullDate);
      isInitialized.current = true;
    }
  }, [selectedDate, onDateChange]);

  // Simulated API call to check time slot availability
  useEffect(() => {
    if (selectedDate) {
      // This would be replaced with actual API call
      const mockAvailability: TimeSlotAvailability[] = timeSlots.map(slot => ({
        time: slot.time,
        isAvailable: Math.random() > 0.3, // Simulate some slots being unavailable
        orderedBy: Math.random() > 0.7 ? 'customer' : undefined
      }));
      setAvailableTimeSlots(mockAvailability);
    }
  }, [selectedDate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Yetkazib berish vaqti</h2>
      
      <div className="mb-6">
        {isSeller && selectedDate && selectedTimeSlot ? (
          <div className="mb-6">
            <Alert className={deliveryStatus === 'accepted' ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
              <AlertCircle className={deliveryStatus === 'accepted' ? "h-4 w-4 text-green-600" : "h-4 w-4 text-yellow-600"} />
              <AlertTitle className="font-medium">
                {deliveryStatus === 'accepted' 
                  ? "Yetkazib berish vaqti tasdiqlangan" 
                  : "Xaridor yetkazib berish vaqtini so'radi"}
              </AlertTitle>
              <AlertDescription>
                Xaridor {selectedDate} kuni {selectedTimeSlot} vaqtida yetkazib berishni so'radi.
                {deliveryStatus !== 'accepted' && (
                  <Button 
                    onClick={onAcceptDelivery} 
                    size="sm" 
                    className="mt-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" /> Yetkazib berish vaqtini tasdiqlash
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="mb-6">
            <Button
              type="button"
              variant="default"
              className="flex items-center justify-center gap-2 py-6 w-full"
              onClick={() => onDeliveryTypeChange("standard")}
            >
              <Truck className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Yetkazib berish xizmati</div>
                <div className="text-xs opacity-70">Qulay yetkazib berish vaqtini tanlang</div>
              </div>
            </Button>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Yetkazib berish sanasini tanlang:
          </h3>
          
          <Input
            type="date"
            className="mb-4"
            min={new Date().toISOString().split('T')[0]}
            max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={isSeller && deliveryStatus === 'accepted'}
          />
          
          {selectedDate && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableTimeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  type="button"
                  variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                  className={`text-center p-2 relative ${!slot.isAvailable || slot.orderedBy ? 'bg-gray-100' : ''}`}
                  disabled={!slot.isAvailable || slot.orderedBy !== undefined || (isSeller && deliveryStatus === 'accepted')}
                  onClick={() => onTimeSlotChange(slot.time)}
                >
                  {slot.time}
                  {slot.orderedBy && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                      Band qilingan
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Yetkazib berish vaqtini tanlang:
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableTimeSlots.map((slot) => (
              <Button
                key={slot.time}
                type="button"
                variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                className={`text-center p-2 relative ${!slot.isAvailable || slot.orderedBy ? 'bg-gray-100' : ''}`}
                disabled={!slot.isAvailable || slot.orderedBy !== undefined || (isSeller && deliveryStatus === 'accepted')}
                onClick={() => onTimeSlotChange(slot.time)}
              >
                {slot.time}
                {slot.orderedBy && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs">
                    Band qilingan
                  </Badge>
                )}
                {!slot.isAvailable && !slot.orderedBy && (
                  <XCircle className="absolute -top-2 -right-2 h-4 w-4 text-red-500" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
