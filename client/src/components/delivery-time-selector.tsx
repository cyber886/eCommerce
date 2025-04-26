import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { getDeliveryDates, formatDeliveryDate, timeSlots } from "@/lib/utils";
import { Truck, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface DeliveryTimeSelectorProps {
  onDateChange: (date: string) => void;
  onTimeSlotChange: (timeSlot: string) => void;
  onDeliveryTypeChange: (deliveryType: string) => void;
  selectedDate: string;
  selectedTimeSlot: string;
  selectedDeliveryType: string;
  isSeller?: boolean; // New prop to determine if the component is being used in seller view
  onAcceptDelivery?: () => void; // Optional callback for seller to accept delivery
  deliveryStatus?: 'pending' | 'accepted' | 'rejected'; // Current status of delivery time request
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
  // Use a ref to track initialization
  const isInitialized = useRef(false);
  
  // Format delivery dates only once 
  const formattedDates = useRef(getDeliveryDates(1, 7).map(date => ({
    date,
    formattedDate: formatDeliveryDate(date),
    available: true, // All dates are available by default
  })));
  
  // Initialize default date selection only once
  useEffect(() => {
    if (!isInitialized.current && !selectedDate && formattedDates.current.length > 0) {
      onDateChange(formattedDates.current[0].formattedDate.fullDate);
      isInitialized.current = true;
    }
  }, [selectedDate, onDateChange]);

  // Check if a specific time slot should be disabled
  const isTimeSlotDisabled = (slotId: number): boolean => {
    // Disable the last slot for demonstration purposes
    return slotId > 6;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Delivery Time</h2>
      
      <div className="mb-6">
        {isSeller && selectedDate && selectedTimeSlot ? (
          <div className="mb-6">
            <Alert className={deliveryStatus === 'accepted' ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
              <AlertCircle className={deliveryStatus === 'accepted' ? "h-4 w-4 text-green-600" : "h-4 w-4 text-yellow-600"} />
              <AlertTitle className="font-medium">
                {deliveryStatus === 'accepted' 
                  ? "Delivery time confirmed" 
                  : "Buyer requested delivery time"}
              </AlertTitle>
              <AlertDescription>
                The buyer has requested delivery on {selectedDate} between {selectedTimeSlot}.
                {deliveryStatus !== 'accepted' && (
                  <Button 
                    onClick={onAcceptDelivery} 
                    size="sm" 
                    className="mt-2 bg-green-600 hover:bg-green-700"
                  >
                    <ShieldCheck className="h-4 w-4 mr-1" /> Accept Delivery Time
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
                <div className="font-medium">Delivery Service</div>
                <div className="text-xs opacity-70">Select your preferred delivery time</div>
              </div>
            </Button>
            {!isSeller && (
              <div className="mt-2 text-xs text-gray-500">
                <Badge variant="outline" className="text-green-600 bg-green-50">Note</Badge> Delivery times are subject to seller acceptance
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Select preferred delivery date:
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {formattedDates.current.map(({ date, formattedDate, available }) => (
              <Button
                key={date.toISOString()}
                type="button"
                variant={selectedDate === formattedDate.fullDate ? "default" : "outline"}
                className="flex flex-col items-center p-2 h-auto"
                disabled={!available || (isSeller && deliveryStatus === 'accepted')}
                onClick={() => onDateChange(formattedDate.fullDate)}
              >
                <div className="font-medium">{formattedDate.dayName}</div>
                <div className="text-sm">{formattedDate.month} {formattedDate.dayNumber}</div>
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Select preferred time slot:
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot.id}
                type="button"
                variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                className="text-center p-2"
                disabled={isTimeSlotDisabled(slot.id) || (isSeller && deliveryStatus === 'accepted')}
                onClick={() => onTimeSlotChange(slot.time)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}