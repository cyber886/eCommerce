import React, { useState, useEffect } from "react";
import { Bell, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "order" | "delivery" | "system";
  read: boolean;
  timestamp: Date;
  orderId?: number;
  data?: any;
};

interface NotificationsProps {
  role: "seller" | "buyer";
  onViewOrder?: (orderId: number) => void;
}

export default function Notifications({ role, onViewOrder }: NotificationsProps) {
  const { notifications, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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
            },
          });
          
          // Mark this one as read after adding it
          setTimeout(() => {
            markAsRead(notifications[notifications.length - 1].id);
          }, 50);
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
          
          // Mark this one as read
          setTimeout(() => {
            markAsRead(notifications[notifications.length - 1].id);
          }, 50);
        }, 100);
      }
    }
  }, [role, addNotification, markAsRead, notifications.length]);

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

  // This function was moved to our useNotifications hook

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
          <h3 className="font-medium">Bildirishnomalar</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={markAllAsRead}
            >
              Barchasini o'qilgan deb belgilash
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Bildirishnomalar yo'q
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
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 h-auto text-xs mt-1"
                      onClick={() => handleViewOrder(notification.orderId!, notification.id)}
                    >
                      Buyurtmani ko'rish
                    </Button>
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
                    <span className="sr-only">Mark as read</span>
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