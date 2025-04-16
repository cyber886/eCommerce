import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDeliveryDates, formatDeliveryDate, timeSlots } from "@/lib/utils";
import { Truck, Clock } from "lucide-react";

interface DeliveryTimeSelectorProps {
  onDateChange: (date: string) => void;
  onTimeSlotChange: (timeSlot: string) => void;
  onDeliveryTypeChange: (deliveryType: string) => void;
  selectedDate: string;
  selectedTimeSlot: string;
  selectedDeliveryType: string;
}

export default function DeliveryTimeSelector({
  onDateChange,
  onTimeSlotChange,
  onDeliveryTypeChange,
  selectedDate,
  selectedTimeSlot,
  selectedDeliveryType,
}: DeliveryTimeSelectorProps) {
  const deliveryDates = getDeliveryDates(1, 7);
  const [availableDates, setAvailableDates] = useState<{ 
    date: Date; 
    formattedDate: ReturnType<typeof formatDeliveryDate>;
    available: boolean;
  }[]>([]);

  useEffect(() => {
    // Format all delivery dates
    const dates = deliveryDates.map(date => ({
      date,
      formattedDate: formatDeliveryDate(date),
      available: true, // All dates are available by default
    }));
    
    setAvailableDates(dates);

    // If no date is selected, select the first available one
    if (!selectedDate && dates.length > 0) {
      onDateChange(dates[0].formattedDate.fullDate);
    }
  }, [deliveryDates, onDateChange, selectedDate]);

  // Check if a specific time slot should be disabled
  const isTimeSlotDisabled = (slotId: number): boolean => {
    // Disable the last slot (9pm-12am) for demonstration purposes
    return slotId === 5;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Delivery Time</h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            type="button"
            variant={selectedDeliveryType === "standard" ? "default" : "outline"}
            className="flex items-center justify-center gap-2 py-6"
            onClick={() => onDeliveryTypeChange("standard")}
          >
            <Truck className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Standard Delivery</div>
              <div className="text-xs opacity-70">Free, 3-5 business days</div>
            </div>
          </Button>
          <Button
            type="button"
            variant={selectedDeliveryType === "express" ? "default" : "outline"}
            className="flex items-center justify-center gap-2 py-6"
            onClick={() => onDeliveryTypeChange("express")}
          >
            <Truck className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Express Delivery</div>
              <div className="text-xs opacity-70">+$10, 1-2 business days</div>
            </div>
          </Button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Select preferred delivery date:
          </h3>
          
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {availableDates.map(({ date, formattedDate, available }) => (
              <Button
                key={date.toISOString()}
                type="button"
                variant={selectedDate === formattedDate.fullDate ? "default" : "outline"}
                className="flex flex-col items-center p-2 h-auto"
                disabled={!available}
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
                disabled={isTimeSlotDisabled(slot.id)}
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
