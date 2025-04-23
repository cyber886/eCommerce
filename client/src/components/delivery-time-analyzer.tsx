import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const [alternativeDate, setAlternativeDate] = useState<string>("tomorrow");
  const [alternativeTime, setAlternativeTime] = useState<string>("10-12");
  const [reason, setReason] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Map the alternative date values to actual formatted dates
  const getFormattedDate = (dateKey: string): string => {
    const today = new Date();
    switch (dateKey) {
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toLocaleDateString();
      case "day-after":
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        return dayAfter.toLocaleDateString();
      default:
        return dateKey;
    }
  };

  // Map the time slot values to actual time ranges
  const getFormattedTime = (timeKey: string): string => {
    switch (timeKey) {
      case "10-12":
        return "10:00 - 12:00";
      case "12-14":
        return "12:00 - 14:00";
      case "14-16":
        return "14:00 - 16:00";
      case "16-18":
        return "16:00 - 18:00";
      default:
        return timeKey;
    }
  };

  const handleSubmitAlternative = () => {
    onSuggestAlternative(
      orderId,
      getFormattedDate(alternativeDate),
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
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-2">
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p><strong>Mijoz tanlagan vaqti:</strong></p>
                  <p>{deliveryDate}, {deliveryTime}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="alternativeDate">Muqobil sana</Label>
                    <Select 
                      defaultValue="tomorrow"
                      onValueChange={(value) => setAlternativeDate(value)}
                    >
                      <SelectTrigger id="alternativeDate">
                        <SelectValue placeholder="Sanani tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tomorrow">Ertaga</SelectItem>
                        <SelectItem value="day-after">Ertadan keyin</SelectItem>
                        <SelectItem value="custom">Boshqa sana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alternativeTime">Muqobil vaqt</Label>
                    <Select 
                      defaultValue="10-12"
                      onValueChange={(value) => setAlternativeTime(value)}
                    >
                      <SelectTrigger id="alternativeTime">
                        <SelectValue placeholder="Vaqtni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10-12">10:00 - 12:00</SelectItem>
                        <SelectItem value="12-14">12:00 - 14:00</SelectItem>
                        <SelectItem value="14-16">14:00 - 16:00</SelectItem>
                        <SelectItem value="16-18">16:00 - 18:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="reason">Sabab (ixtiyoriy)</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="Nima uchun vaqtni o'zgartirish kerakligini tushuntiring" 
                    className="mt-1"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Bekor qilish</Button>
              <Button type="button" onClick={handleSubmitAlternative}>Mijozga yuborish</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}