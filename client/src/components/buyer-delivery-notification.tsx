import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Clock, AlertCircle, ShieldCheck, X } from "lucide-react";

interface BuyerDeliveryNotificationProps {
  orderId: number;
  deliveryDate: string;
  deliveryTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'alternative';
  alternativeDate?: string;
  alternativeTime?: string;
  reason?: string;
  onAcceptAlternative?: (orderId: number) => void;
  onRejectAlternative?: (orderId: number) => void;
}

export default function BuyerDeliveryNotification({
  orderId,
  deliveryDate,
  deliveryTime,
  status,
  alternativeDate,
  alternativeTime,
  reason,
  onAcceptAlternative,
  onRejectAlternative
}: BuyerDeliveryNotificationProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (status === 'accepted') {
    return (
      <Alert className="bg-green-50 border-green-200 mt-4">
        <ShieldCheck className="h-4 w-4 text-green-600" />
        <AlertTitle>{t("Yetkazib berish vaqti tasdiqlandi")}</AlertTitle>
        <AlertDescription>
          {t("Sotuvchi sizning yetkazib berish vaqtingizni tasdiqladi.")} 
          {t("Buyurtmangiz {{date}} kuni {{time}} oralig'ida yetkaziladi.", { 
            date: deliveryDate, 
            time: deliveryTime 
          })}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'pending') {
    return (
      <Alert className="bg-yellow-50 border-yellow-200 mt-4">
        <Clock className="h-4 w-4 text-yellow-600" />
        <AlertTitle>{t("Yetkazib berish vaqti tasdiqlanmoqda")}</AlertTitle>
        <AlertDescription>
          {t("Sotuvchi hali yetkazib berish vaqtini tasdiqlamadi.")}
          {t("Buyurtma holati yangilanganda sizga xabar yuboramiz.")}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'alternative' && alternativeDate && alternativeTime) {
    return (
      <>
        <Alert className="bg-yellow-50 border-yellow-200 mt-4">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>{t("Sotuvchi muqobil yetkazib berish vaqtini taklif qildi")}</AlertTitle>
          <AlertDescription>
            {t("Sotuvchi siz tanlagan vaqt ({{date}}, {{time}}) o'rniga", { 
              date: deliveryDate, 
              time: deliveryTime 
            })}
            {t("{{altDate}}, {{altTime}} vaqtida yetkazishni taklif qilmoqda.", { 
              altDate: alternativeDate, 
              altTime: alternativeTime 
            })}
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                onClick={() => onAcceptAlternative?.(orderId)}
              >
                <Check className="h-4 w-4 mr-1" /> {t("Qabul qilish")}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                onClick={() => setIsDialogOpen(true)}
              >
                <X className="h-4 w-4 mr-1" /> {t("Rad etish")}
              </Button>
              {reason && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={() => setIsDialogOpen(true)}
                >
                  {t("Sababni ko'rish")}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Muqobil yetkazib berish vaqti")}</DialogTitle>
              <DialogDescription>
                {t("Sotuvchi quyidagi sabablarga ko'ra muqobil vaqtni taklif qildi.")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-md text-sm">
                <p><strong>{t("Boshlang'ich vaqt:")}</strong> {deliveryDate}, {deliveryTime}</p>
                <p><strong>{t("Muqobil vaqt:")}</strong> {alternativeDate}, {alternativeTime}</p>
                {reason && (
                  <>
                    <p className="mt-2"><strong>{t("Sabab:")}</strong></p>
                    <p>{reason}</p>
                  </>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                {t("Yopish")}
              </Button>
              <Button type="button" variant="destructive" onClick={() => {
                onRejectAlternative?.(orderId);
                setIsDialogOpen(false);
              }}>
                {t("Rad etish")}
              </Button>
              <Button type="button" onClick={() => {
                onAcceptAlternative?.(orderId);
                setIsDialogOpen(false);
              }}>
                {t("Qabul qilish")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Default fallback - shouldn't normally reach here
  return null;
}