import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, MapPin, Info, Truck, Package, Phone, CheckCircle } from 'lucide-react';
import DeliveryTimeline, { DeliveryEvent } from '@/components/delivery-timeline';
import BuyerDeliveryNotification from '@/components/buyer-delivery-notification';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { formatCurrency } from '@/lib/utils';

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  
  // This would typically come from an API call
  const [orderData, setOrderData] = useState<any>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'accepted' | 'rejected' | 'alternative'>('pending');
  const [alternativeDeliveryInfo, setAlternativeDeliveryInfo] = useState<{
    date: string;
    time: string;
    reason: string;
  } | null>(null);

  // Get orderId from URL if it exists
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = searchParams.get('orderId');
    
    if (orderIdFromUrl) {
      setTrackingId(orderIdFromUrl);
      // Use setTimeout to avoid React state update warning
      setTimeout(() => {
        handleTrack(orderIdFromUrl);
      }, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);
  
  // Check localStorage for any delivery notifications related to this order
  useEffect(() => {
    if (orderData) {
      // Check if there are any delivery status updates in localStorage
      const deliveryResponseKey = `delivery_response_${orderData.id}`;
      const deliveryResponse = localStorage.getItem(deliveryResponseKey);
      
      if (deliveryResponse) {
        try {
          const responseData = JSON.parse(deliveryResponse);
          setDeliveryStatus(responseData.status);
          
          if (responseData.status === 'alternative') {
            setAlternativeDeliveryInfo({
              date: responseData.alternativeDate,
              time: responseData.alternativeTime,
              reason: responseData.reason || ''
            });
          }
        } catch (err) {
          console.error('Failed to parse delivery response', err);
        }
      }
    }
  }, [orderData]);
  
  const { addNotification } = useNotifications();
  
  // Handle accepting alternative delivery time
  const handleAcceptAlternative = (orderId: number) => {
    // Save the accepted alternative to localStorage
    const responseKey = `delivery_response_${orderId}`;
    const acceptedData = {
      status: 'accepted',
      orderId,
      date: alternativeDeliveryInfo?.date,
      time: alternativeDeliveryInfo?.time,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(responseKey, JSON.stringify(acceptedData));
    setDeliveryStatus('accepted');
    
    // Send notification to seller
    addNotification({
      title: 'Alternate delivery time accepted',
      message: `Customer has accepted your alternative delivery time proposal for order #${orderId}`,
      type: 'delivery',
      orderId,
      data: {
        deliveryDate: alternativeDeliveryInfo?.date,
        deliveryTime: alternativeDeliveryInfo?.time,
        status: 'accepted'
      }
    });
  };
  
  // Handle rejecting alternative delivery time
  const handleRejectAlternative = (orderId: number) => {
    // Save the rejection to localStorage
    const responseKey = `delivery_response_${orderId}`;
    const rejectedData = {
      status: 'rejected',
      orderId,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(responseKey, JSON.stringify(rejectedData));
    setDeliveryStatus('rejected');
    
    // Send notification to seller
    addNotification({
      title: 'Alternate delivery time rejected',
      message: `Customer has rejected your alternative delivery time proposal for order #${orderId}`,
      type: 'delivery',
      orderId,
      data: {
        status: 'rejected'
      }
    });
  };
  
  // Mock data - in a real app, this would come from the API
  const mockOrderData = {
    id: '389056',
    customerId: user?.id || 1,
    status: 'out_for_delivery',
    totalPrice: 329.95,
    items: [
      { id: 1, name: 'Wireless Headphones', quantity: 1, price: 79.99 },
      { id: 3, name: 'Vintage Polaroid Camera', quantity: 1, price: 149.99 },
      { id: 5, name: 'Wireless Earbuds Pro', quantity: 1, price: 99.97 },
    ],
    paymentMethod: 'card',
    shipping: {
      address: 'Toshkent sh., Chilonzor tumani, 19-kvartal, 42-uy',
      recipientName: 'Abdurahmon Yusupov',
      phone: '+998 90 123 4567',
      trackingInfo: {
        carrier: 'E-Market Delivery',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        events: [
          {
            status: 'order_placed',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            description: 'Buyurtmangiz muvaffaqiyatli qabul qilindi va tasdiqlanmoqda.'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
            description: 'Buyurtmangiz ombordan yig\'ilmoqda va joylashtirilmoqda.'
          },
          {
            status: 'shipped',
            timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
            description: 'Buyurtmangiz jo\'natildi va yo\'lda.',
            location: 'Toshkent, Markaziy ombor'
          },
          {
            status: 'out_for_delivery',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            description: 'Buyurtmangiz yetkazib berish uchun yo\'lda va bugun yetkazib beriladi.',
            location: 'Toshkent, Chilonzor bo\'limi'
          }
        ] as DeliveryEvent[]
      }
    },
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  };

  // Function to track order - can be called programmatically or from button
  const handleTrack = (orderIdParam?: string): void => {
    const idToTrack = orderIdParam || trackingId;
    
    if (!idToTrack.trim()) {
      setError('Iltimos, buyurtma raqamini kiriting');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // In a real app, this would be an API call to fetch the specific order
    setTimeout(() => {
      setIsLoading(false);
      // Set the mock order ID to match the requested order ID
      const updatedMockData = { ...mockOrderData, id: idToTrack };
      setOrderData(updatedMockData);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call to refresh the order status
    setTimeout(() => {
      setIsLoading(false);
      // Add a new event to the timeline
      if (orderData && orderData.shipping && orderData.shipping.trackingInfo && orderData.shipping.trackingInfo.events) {
        const updatedOrderData = { ...orderData };
        if (updatedOrderData.shipping.trackingInfo.events.length === 4) {
          updatedOrderData.shipping.trackingInfo.events.push({
            status: 'delivered',
            timestamp: new Date(),
            description: 'Buyurtmangiz muvaffaqiyatli yetkazib berildi.',
            location: 'Toshkent, Chilonzor tumani'
          });
          updatedOrderData.status = 'delivered';
          setOrderData(updatedOrderData);
        }
      }
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Buyurtma kuzatuvi</h1>
      
      {!orderData ? (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Buyurtmangizni kuzating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Buyurtmangizni kuzatish uchun buyurtma raqamingizni kiriting.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Buyurtma raqami (misol: 389056)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={() => handleTrack()} disabled={isLoading}>
                    {isLoading ? 'Qidirilmoqda...' : 'Kuzatish'}
                  </Button>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Xato</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  Siz bilasizmi?
                </h3>
                <p className="text-sm text-muted-foreground">
                  E-Market ilovasini yuklab olsangiz, buyurtmalaringizni real vaqtda kuzatishingiz, bildirishnomalarni olishingiz va boshqa ko'plab imkoniyatlarga ega bo'lasiz.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Yordam kerakmi?
            </p>
            <Button variant="link" className="p-0">Qo'llab-quvvatlash bilan bog'lanish</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Kuzatuv</TabsTrigger>
                <TabsTrigger value="details">Buyurtma tafsilotlari</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="pt-4">
                <DeliveryTimeline
                  orderId={orderData.id}
                  estimatedDelivery={orderData.shipping.trackingInfo.estimatedDelivery}
                  events={orderData.shipping.trackingInfo.events}
                  onRefresh={handleRefresh}
                  className="mb-6"
                />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Yetkazib berish manzili
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{orderData.shipping.recipientName}</p>
                      <p className="text-muted-foreground">{orderData.shipping.address}</p>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {orderData.shipping.phone}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Buyurtma #{orderData.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Mahsulotlar</h3>
                        <ul className="divide-y">
                          {orderData.items.map((item: any) => (
                            <li key={item.id} className="py-2 flex justify-between">
                              <div>
                                <p>{item.name}</p>
                                <p className="text-sm text-muted-foreground">Miqdor: {item.quantity}</p>
                              </div>
                              <p className="font-medium">{formatCurrency(item.price)}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h3 className="font-medium mb-2">Buyurtma ma'lumotlari</h3>
                        <dl className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <dt>Buyurtma sanasi:</dt>
                            <dd>{new Date(orderData.orderDate).toLocaleDateString('uz-UZ')}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt>To'lov usuli:</dt>
                            <dd>{orderData.paymentMethod === 'card' ? 'Karta' : 'Naqd pul'}</dd>
                          </div>
                          <div className="flex justify-between text-sm">
                            <dt>Holati:</dt>
                            <dd className="font-medium">
                              {orderData.status === 'delivered' ? 'Yetkazib berildi' : 
                               orderData.status === 'out_for_delivery' ? 'Yetkazib berish yo\'lida' : 
                               orderData.status === 'shipped' ? 'Jo\'natildi' : 
                               orderData.status === 'processing' ? 'Jarayonda' : 'Qabul qilindi'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-medium">
                          <p>Jami:</p>
                          <p>{formatCurrency(orderData.totalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Yetkazib berish ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{orderData.shipping.trackingInfo.carrier}</p>
                    <p className="text-sm text-muted-foreground">
                      Taxminiy yetkazib berish: {' '}
                      {new Date(orderData.shipping.trackingInfo.estimatedDelivery).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Package className="h-4 w-4" /> Buyurtma holati
                    </h3>
                    <p className="text-sm">
                      {orderData.status === 'delivered' ? 'Buyurtmangiz muvaffaqiyatli yetkazib berildi.' : 
                       orderData.status === 'out_for_delivery' ? 'Buyurtmangiz yetkazib berish uchun yo\'lda va bugun yetkazib beriladi.' : 
                       orderData.status === 'shipped' ? 'Buyurtmangiz jo\'natildi va yo\'lda.' : 
                       orderData.status === 'processing' ? 'Buyurtmangiz tayyorlanmoqda.' : 'Buyurtmangiz qabul qilindi.'}
                    </p>
                  </div>
                  
                  {/* Delivery time selection status from seller */}
                  {(deliveryStatus === 'alternative' || deliveryStatus === 'accepted' || deliveryStatus === 'rejected') && (
                    <div className="pt-3 border-t">
                      <BuyerDeliveryNotification
                        orderId={parseInt(orderData.id)}
                        deliveryDate={alternativeDeliveryInfo?.date || ""}
                        deliveryTime={alternativeDeliveryInfo?.time || ""}
                        status={deliveryStatus}
                        alternativeDate={alternativeDeliveryInfo?.date}
                        alternativeTime={alternativeDeliveryInfo?.time}
                        reason={alternativeDeliveryInfo?.reason}
                        onAcceptAlternative={handleAcceptAlternative}
                        onRejectAlternative={handleRejectAlternative}
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleRefresh} 
                    disabled={isLoading || orderData.status === 'delivered'} 
                    className="w-full"
                  >
                    {isLoading ? 'Yangilanmoqda...' : 'Holati yangilash'}
                  </Button>
                  
                  {orderData.status === 'delivered' && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Yetkazib berildi</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Buyurtmangiz muvaffaqiyatli yetkazib berildi. Mahsulotlaringizdan rohatlaning!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => navigate('/')}>
                Bosh sahifaga qaytish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}