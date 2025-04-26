import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Clock, AlertCircle, ShieldCheck, CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DeliveryTimeAnalyzerProps {
  orderId: number;
  customerName: string;
  deliveryDate: string;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  onAccept: (orderId: number) => void;
  onSuggestAlternative: (orderId: number, alternativeDate: string, alternativeTime: string, reason: string) => void;
}

export default function DeliveryTimeAnalyzer({
  orderId,
  customerName,
  deliveryDate,
  deliveryTime,
  status,
  onAccept,
  onSuggestAlternative
}: DeliveryTimeAnalyzerProps) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1)); // Default to tomorrow
  const [alternativeTime, setAlternativeTime] = useState<string>("10-12");
  const [reason, setReason] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Available time slots with 2-hour intervals
  const timeSlots = [
    { value: "8-10", label: "8:00 - 10:00" },
    { value: "10-12", label: "10:00 - 12:00" },
    { value: "12-14", label: "12:00 - 14:00" },
    { value: "14-16", label: "14:00 - 16:00" },
    { value: "16-18", label: "16:00 - 18:00" },
    { value: "18-20", label: "18:00 - 20:00" }
  ];

  // Get formatted date string from Date object
  const getFormattedDate = (date?: Date): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  // Map the time slot values to actual time ranges
  const getFormattedTime = (timeKey: string): string => {
    const slot = timeSlots.find(slot => slot.value === timeKey);
    return slot ? slot.label : timeKey;
  };

  const handleSubmitAlternative = () => {
    onSuggestAlternative(
      orderId,
      getFormattedDate(date),
      getFormattedTime(alternativeTime),
      reason
    );
    setDialogOpen(false);
  };

  if (status === 'accepted') {
    return (
      <Alert className="bg-green-50 border-green-200 mt-2">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertTitle>Yetkazib berish vaqti tasdiqlangan</AlertTitle>
        <AlertDescription>
          {customerName} buyurtmasi {deliveryDate} kuni {deliveryTime} oralig'ida yetkaziladi.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle>Mijoz tomonidan yetkazib berish vaqti so'rovi</AlertTitle>
        <AlertDescription>
          {customerName} buyurtmasini {deliveryDate} kuni {deliveryTime} oralig'ida yetkazishni so'ragan.
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2 mt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          onClick={() => onAccept(orderId)}
        >
          <Check className="h-4 w-4 mr-1" /> Qabul qilish
        </Button>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
            >
              <Clock className="h-4 w-4 mr-1" /> Muqobil taklif qilish
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Yetkazib berish vaqtini taklif qilish</DialogTitle>
              <DialogDescription>
                Mijoz {customerName} uchun muqobil vaqtni taklif qiling
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex flex-col space-y-4">
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p><strong>Mijoz tanlagan vaqti:</strong></p>
                  <p>{deliveryDate}, {deliveryTime}</p>
                </div>
                
                <div>
                  <Label htmlFor="alternativeDate" className="text-sm font-medium mb-1.5 block">Muqobil sana</Label>
                  <Select 
                    defaultValue="tomorrow"
                    onValueChange={(value) => {
                      if (value === "tomorrow") {
                        setDate(addDays(new Date(), 1));
                      } else if (value === "dayAfter") {
                        setDate(addDays(new Date(), 2));
                      }
                    }}
                  >
                    <SelectTrigger id="alternativeDate" className="w-full">
                      <SelectValue placeholder="Sanani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tomorrow">Ertaga</SelectItem>
                      <SelectItem value="dayAfter">Ertadan keyin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="alternativeTime" className="text-sm font-medium mb-1.5 block">Muqobil vaqt</Label>
                  <Select 
                    defaultValue="10-12"
                    onValueChange={(value) => setAlternativeTime(value)}
                  >
                    <SelectTrigger id="alternativeTime" className="w-full">
                      <SelectValue placeholder="Vaqtni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.value} value={slot.value}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="reason" className="text-sm font-medium mb-1.5 block">Sabab (ixtiyoriy)</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Nima uchun vaqtni o'zgartirish kerakligini tushuntiring" 
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button type="button" className="bg-blue-500 hover:bg-blue-600" onClick={handleSubmitAlternative}>Mijozga yuborish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}