import { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ShoppingBag, 
  CheckCheck 
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type DeliveryStatus = 
  'order_placed' | 
  'processing' | 
  'shipped' | 
  'out_for_delivery' | 
  'delivered' | 
  'delayed';

export type DeliveryEvent = {
  status: DeliveryStatus;
  timestamp: Date;
  description: string;
  location?: string;
};

interface DeliveryTimelineProps {
  orderId: string | number;
  estimatedDelivery: Date;
  events: DeliveryEvent[];
  onRefresh?: () => void;
  className?: string;
}

export default function DeliveryTimeline({
  orderId,
  estimatedDelivery,
  events,
  onRefresh,
  className
}: DeliveryTimelineProps) {
  const [currentStatus, setCurrentStatus] = useState<DeliveryStatus>(
    events.length > 0 ? events[0].status : 'order_placed'
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Find the latest event
    if (events.length > 0) {
      const latestEvent = events.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      setCurrentStatus(latestEvent.status);
      
      // Calculate progress based on status
      const statusMap: { [key in DeliveryStatus]: number } = {
        'order_placed': 0,
        'processing': 20,
        'shipped': 40,
        'out_for_delivery': 80,
        'delivered': 100,
        'delayed': -1 // Special case, handled below
      };
      
      setProgress(statusMap[latestEvent.status]);
    }
  }, [events]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('uz-UZ', {
      month: 'short',
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'order_placed':
        return <ShoppingBag className="w-5 h-5 text-primary" />;
      case 'processing':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'delivered':
        return <CheckCheck className="w-5 h-5 text-green-500" />;
      case 'delayed':
        return <Clock className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case 'order_placed':
        return 'Buyurtma qabul qilindi';
      case 'processing':
        return 'Buyurtma jarayonda';
      case 'shipped':
        return 'Jo\'natildi';
      case 'out_for_delivery':
        return 'Yetkazib berish yo\'lida';
      case 'delivered':
        return 'Yetkazib berildi';
      case 'delayed':
        return 'Kechiktirildi';
      default:
        return status;
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'order_placed':
        return 'bg-primary text-primary-foreground';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isDelayed = currentStatus === 'delayed';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Buyurtma #{orderId} kuzatuvi</CardTitle>
            <CardDescription>
              {isDelayed ? (
                <span className="text-red-500">Kechikish bilan</span>
              ) : (
                <span>Taxminiy yetkazish: {formatDate(estimatedDelivery)}</span>
              )}
            </CardDescription>
          </div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-primary hover:text-primary/80 p-1 rounded-full"
              aria-label="Yangilash"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
            </button>
          )}
        </div>
        {currentStatus !== 'delayed' && (
          <div className="mt-4 space-y-1">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Buyurtma qabul qilindi</span>
              <span>Yetkazib berildi</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {events.map((event, index) => (
            <div key={index} className="relative">
              {index !== events.length - 1 && (
                <div 
                  className="absolute top-7 left-5 bottom-0 w-0.5 bg-gray-200"
                  style={{ height: 'calc(100% - 28px)' }}
                ></div>
              )}
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(event.status)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                    <div className="font-medium flex items-center gap-2">
                      {getStatusLabel(event.status)}
                      <Badge className={`${getStatusColor(event.status)} font-normal`}>
                        {event.status === 'delayed' ? 'Kechikish' : 'Yangilandi'}
                      </Badge>
                    </div>
                    <time className="text-sm text-muted-foreground">
                      {formatDate(event.timestamp)}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  {event.location && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Joylashuv: {event.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}