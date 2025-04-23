import React, { useState, useEffect } from "react";
import { Bell, ShoppingBag, X, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslation } from "react-i18next";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "order" | "delivery" | "system";
  read: boolean;
  timestamp: Date;
  orderId?: number;
  data?: {
    deliveryDate?: string;
    deliveryTime?: string;
    customerName?: string;
    status?: 'pending' | 'accepted' | 'rejected';
    alternativeDate?: string;
    alternativeTime?: string;
  };
};

interface NotificationsProps {
  role: "seller" | "buyer";
  onViewOrder?: (orderId: number) => void;
}

export default function Notifications({ role, onViewOrder }: NotificationsProps) {
  const { notifications, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  // Mock notifications for sellers - in a real app, we'd fetch these from an API
  useEffect(() => {
    // Only add these mock notifications once when component mounts
    if (notifications.length === 0) {
      if (role === "seller") {
        addNotification({
          title: "Yangi buyurtma",
          message: "Alisher Davronov tomonidan yangi buyurtma qabul qilindi.",
          type: "order",
          orderId: 1001,
        });
        
        // Add with a slight delay to ensure different timestamps
        setTimeout(() => {
          addNotification({
            title: "Yangi buyurtma",
            message: "Dilshod Safarov tomonidan yangi buyurtma qabul qilindi.",
            type: "order",
            orderId: 1002,
          });
        }, 100);
        
        setTimeout(() => {
          addNotification({
            title: "Yetkazib berish vaqti tanlandi",
            message: "Gulnora Yusupova buyurtma uchun yetkazib berish vaqtini tanladi.",
            type: "delivery",
            orderId: 1003,
            data: {
              deliveryDate: "2023-06-05",
              deliveryTime: "16:00 - 18:00",
              customerName: "Gulnora Yusupova",
              status: 'pending'
            },
          });
        }, 200);
      } else {
        // Buyer notifications would be different
        addNotification({
          title: "Buyurtma tasdiqlandi",
          message: "Sizning buyurtmangiz tasdiqlandi va jarayonga qo'yildi.",
          type: "order",
          orderId: 1001,
        });
        
        setTimeout(() => {
          addNotification({
            title: "Buyurtma jo'natildi",
            message: "Sizning buyurtmangiz jo'natildi va yo'lda.",
            type: "delivery",
            orderId: 1002,
          });
        }, 100);
      }
    }
  }, [role, addNotification, notifications.length]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleViewOrder = (orderId: number, notificationId: string) => {
    markAsRead(notificationId);
    setIsOpen(false);
    if (onViewOrder) {
      onViewOrder(orderId);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} daqiqa oldin`;
    } else if (diffHours < 24) {
      return `${diffHours} soat oldin`;
    } else {
      return `${diffDays} kun oldin`;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 hover:bg-red-600"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-medium">{t('notifications')}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              {t('markAllAsRead')}
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t('noNotifications')}
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 p-3 border-b transition-colors hover:bg-muted/50",
                  notification.read ? "opacity-70" : "bg-muted/30"
                )}
              >
                <div className="flex-shrink-0">
                  {notification.type === "order" ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.orderId && (
                    <div className="mt-1 flex gap-2 items-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 h-auto text-xs"
                        onClick={() => handleViewOrder(notification.orderId!, notification.id)}
                      >
                        {t('viewOrder')}
                      </Button>
                      
                      {/* For delivery notifications with pending status - show accept/suggest options */}
                      {role === 'seller' && notification.type === 'delivery' && notification.data?.status === 'pending' && (
                        <div className="flex gap-1 ml-auto">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                              >
                                <Clock className="h-3 w-3 mr-1" /> Taklif
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Yetkazib berish vaqtini taklif qilish</DialogTitle>
                                <DialogDescription>
                                  Mijoz {notification.data.customerName} uchun muqobil vaqtni taklif qiling
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex flex-col space-y-2">
                                  <div className="bg-muted p-3 rounded-md text-sm">
                                    <p><strong>Mijoz tanlagan vaqti:</strong></p>
                                    <p>{notification.data.deliveryDate}, {notification.data.deliveryTime}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                      <Label htmlFor="alternativeDate">Muqobil sana</Label>
                                      <Select defaultValue="tomorrow">
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
                                      <Select defaultValue="10-12">
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
                                    <Textarea id="reason" placeholder="Nima uchun vaqtni o'zgartirish kerakligini tushuntiring" className="mt-1" />
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => {}}>Bekor qilish</Button>
                                <Button type="button" onClick={() => {}}>Mijozga yuborish</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            onClick={() => {
                              // Signal to parent component to update the delivery status
                              if (notification.orderId) {
                                const orderId = notification.orderId;
                                if (typeof window !== 'undefined') {
                                  window.dispatchEvent(new CustomEvent('acceptDelivery', { detail: { orderId } }));
                                  markAsRead(notification.id);
                                }
                              }
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" /> Qabul
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">{t('markAsRead')}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}