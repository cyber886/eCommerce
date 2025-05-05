import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, PlusCircle, Clock, ArrowUpDown, 
  ShoppingCart, Truck, CheckCircle2, XCircle, 
  Edit, Trash2, LogOut, Loader2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DeliveryTimeSelector from "@/components/delivery-time-selector";
import SellerNavbar from "@/components/seller-navbar";
import Notifications from "@/components/notifications";
import { useTranslation } from "react-i18next";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logoutMutation } = useAuth();
  const { addNotification } = useNotifications();
  const [, navigate] = useLocation();
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productAction, setProductAction] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Check localStorage for product selections and send notifications
  useEffect(() => {
    if (!user || user.role !== "seller") return;
    
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    const productSelectionKeys = keys.filter(key => key.startsWith('product_selected_'));
    
    // Process each product selection and send notification
    productSelectionKeys.forEach(key => {
      try {
        const selectionData = JSON.parse(localStorage.getItem(key) || '');
        if (selectionData) {
          // Add notification for product selection
          addNotification({
            title: "Yangi mahsulot tanlandi",
            message: `${selectionData.productName} mahsuloti savatchaga qo'shildi. Miqdori: ${selectionData.quantity}`,
            type: "order",
          });
          
          // Remove the localStorage item after processing
          localStorage.removeItem(key);
        }
      } catch (err) {
        console.error("Failed to process product selection notification", err);
      }
    });
  }, [user, addNotification]);

  // Parse URL params to get the active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
    
    const orderId = searchParams.get('order');
    if (orderId) {
      const order = recentOrders.find(o => o.id === parseInt(orderId));
      if (order) {
        openOrderDetailsDialog(order);
      }
    }
  }, [window.location.search]); // Re-run when URL changes

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  // Redirect non-sellers to auth page
  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Sotuvchi boshqaruv paneli</h1>
        <p className="mb-6">Sotuvchi boshqaruv paneliga kirish uchun tizimga kiring</p>
        <Button onClick={() => navigate("/auth")}>Kirish sahifasiga o'tish</Button>
      </div>
    );
  }

  // Redirect non-sellers to buyer account
  if (user.role !== "seller") {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Ruxsat berilmadi</h1>
        <p className="mb-6">Bu sahifaga kirish uchun sotuvchi hisobi kerak</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/account")}>Hisobingizga o'tish</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Bosh sahifaga qaytish</Button>
        </div>
      </div>
    );
  }

  // Mock data for seller dashboard
  const recentOrders = [
    { 
      id: 1001, 
      customer: "Alisher Davronov", 
      items: 3, 
      total: 129.99, 
      status: "Pending", 
      date: "2023-06-01",
      address: "Toshkent sh., Chilonzor tumani, 19-kvartal, 42-uy",
      phone: "+998 90 123 4567",
      products: [
        { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 1 },
        { id: 3, name: "Vintage Polaroid Camera", price: 149.99, quantity: 1 },
        { id: 5, name: "Wireless Earbuds Pro", price: 129.99, quantity: 1 }
      ],
      deliveryDate: "2023-06-05",
      deliveryTimeSlot: "14:00 - 16:00",
      paymentMethod: "card"
    },
    { 
      id: 1002, 
      customer: "Dilshod Safarov", 
      items: 1, 
      total: 79.99, 
      status: "Processing", 
      date: "2023-06-02",
      address: "Toshkent sh., Yunusobod tumani, 4-kvartal, 17-uy",
      phone: "+998 90 765 4321",
      products: [
        { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 1 }
      ],
      deliveryDate: "2023-06-07",
      deliveryTimeSlot: "10:00 - 12:00",
      paymentMethod: "cash"
    },
    { 
      id: 1003, 
      customer: "Gulnora Yusupova", 
      items: 2, 
      total: 159.99, 
      status: "Shipped", 
      date: "2023-06-03",
      address: "Toshkent sh., Mirobod tumani, 10-kvartal, 5-uy",
      phone: "+998 90 555 4433",
      products: [
        { id: 2, name: "Smart Watch Series 5", price: 199.99, quantity: 1 },
        { id: 4, name: "Smart Home Speaker", price: 89.99, quantity: 1 }
      ],
      deliveryDate: "2023-06-05",
      deliveryTimeSlot: "16:00 - 18:00",
      paymentMethod: "card"
    },
    { 
      id: 1004, 
      customer: "Otabek Mahmudov", 
      items: 4, 
      total: 249.99, 
      status: "Delivered", 
      date: "2023-06-04",
      address: "Toshkent sh., Sergeli tumani, 7-kvartal, 23-uy",
      phone: "+998 90 333 2211",
      products: [
        { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 2 },
        { id: 3, name: "Vintage Polaroid Camera", price: 149.99, quantity: 1 },
        { id: 5, name: "Wireless Earbuds Pro", price: 129.99, quantity: 1 }
      ],
      deliveryDate: "2023-06-04",
      deliveryTimeSlot: "12:00 - 14:00",
      paymentMethod: "cash"
    }
  ];

  const products = [
    { id: 1, name: "Wireless Headphones", stock: 15, price: 79.99, category: "Electronics", description: "Premium wireless headphones with noise cancellation technology", imageUrl: "https://example.com/headphones.jpg" },
    { id: 2, name: "Smart Watch Series 5", stock: 8, price: 199.99, category: "Electronics", description: "Latest smart watch with health monitoring features", imageUrl: "https://example.com/smartwatch.jpg" },
    { id: 3, name: "Vintage Polaroid Camera", stock: 5, price: 149.99, category: "Electronics", description: "Retro-style instant photo camera", imageUrl: "https://example.com/camera.jpg" },
    { id: 4, name: "Smart Home Speaker", stock: 12, price: 89.99, category: "Electronics", description: "Voice-controlled smart speaker for your home", imageUrl: "https://example.com/speaker.jpg" },
    { id: 5, name: "Wireless Earbuds Pro", stock: 20, price: 129.99, category: "Electronics", description: "Compact wireless earbuds with premium sound quality", imageUrl: "https://example.com/earbuds.jpg" }
  ];

  const addNewProduct = (productData: any) => {
    // In a real implementation, this would send an API request
    console.log("Adding new product:", productData);
    setShowProductDialog(false);
  };

  const editProduct = (productData: any) => {
    // In a real implementation, this would send an API request
    console.log("Editing product:", productData);
    setShowProductDialog(false);
  };

  const deleteProduct = (productId: number) => {
    // In a real implementation, this would send an API request
    console.log("Deleting product:", productId);
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    // In a real implementation, this would send an API request
    console.log("Updating order status:", orderId, status);
    setShowOrderDetailsDialog(false);
  };

  const openProductDialog = (action: "add" | "edit", product?: any) => {
    setProductAction(action);
    setSelectedProduct(product);
    setShowProductDialog(true);
  };

  const [deliveryStatus, setDeliveryStatus] = useState<Record<number, 'pending' | 'accepted' | 'rejected'>>({
    1001: 'pending',
    1002: 'pending',
    1003: 'pending',
    1004: 'pending',
  });
  
  const openOrderDetailsDialog = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };
  
  const handleAcceptDelivery = (orderId: number) => {
    // In a real implementation, this would send an API request
    setDeliveryStatus(prev => ({
      ...prev,
      [orderId]: 'accepted'
    }));
    console.log("Accepted delivery time for order:", orderId);
  };

  // Status badge component
  const OrderStatusBadge = ({ status }: { status: string }) => {
    let color = "";
    let icon = null;

    switch (status) {
      case "Pending":
        color = "bg-amber-100 text-amber-700 border-amber-200";
        icon = <Clock className="w-3 h-3 mr-1" />;
        break;
      case "Processing":
        color = "bg-blue-100 text-blue-700 border-blue-200";
        icon = <ShoppingCart className="w-3 h-3 mr-1" />;
        break;
      case "Shipped":
        color = "bg-indigo-100 text-indigo-700 border-indigo-200";
        icon = <Truck className="w-3 h-3 mr-1" />;
        break;
      case "Delivered":
        color = "bg-green-100 text-green-700 border-green-200";
        icon = <CheckCircle2 className="w-3 h-3 mr-1" />;
        break;
      case "Cancelled":
        color = "bg-red-100 text-red-700 border-red-200";
        icon = <XCircle className="w-3 h-3 mr-1" />;
        break;
      default:
        color = "bg-gray-100 text-gray-700 border-gray-200";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {icon}
        {status}
      </span>
    );
  };

  const { t } = useTranslation();

  return (
    <div className="flex h-screen">
      <SellerNavbar />
      
      <div className="flex-1 ml-64 p-8 overflow-y-auto"> {/* Adjust margin to match the width of the sidebar */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('manageOrdersAndProducts')}
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            // Update URL without full page reload
            const url = new URL(window.location.href);
            url.searchParams.set('tab', value);
            window.history.pushState({}, '', url);
          }}
          className="space-y-6"
        >
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Jami savdo</CardTitle>
                  <CardDescription>Oylik daromad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,550.75</div>
                  <p className="text-sm text-green-600 mt-1">↑ 12% o'tgan oyga nisbatan</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Buyurtmalar</CardTitle>
                  <CardDescription>Oylik jami</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                  <p className="text-sm text-green-600 mt-1">↑ 8% o'tgan oyga nisbatan</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Mahsulotlar</CardTitle>
                  <CardDescription>Jami faol mahsulotlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-sm text-muted-foreground mt-1">5 ta kam qoldiq</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>So'nggi buyurtmalar</CardTitle>
                <CardDescription>Eng yangi mijoz buyurtmalari</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyurtma ID</TableHead>
                      <TableHead>Mijoz</TableHead>
                      <TableHead>Mahsulotlar</TableHead>
                      <TableHead>Jami</TableHead>
                      <TableHead>Holati</TableHead>
                      <TableHead>Sana</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openOrderDetailsDialog(order)}
                          >
                            Ko'rish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t('ordersManagement')}</CardTitle>
                    <CardDescription>{t('manageCustomerOrders')}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder={t('searchOrders')} className="w-[250px]" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder={t('filterOrders')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allOrders')}</SelectItem>
                        <SelectItem value="pending">{t('pending')}</SelectItem>
                        <SelectItem value="processing">{t('processing')}</SelectItem>
                        <SelectItem value="shipped">{t('shipped')}</SelectItem>
                        <SelectItem value="delivered">{t('delivered')}</SelectItem>
                        <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>{t('orderID')}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>{t('customerInfo')}</TableHead>
                      <TableHead>{t('products')}</TableHead>
                      <TableHead>{t('total')}</TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>{t('deliveryStatus')}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>{t('orderDate')}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-right">{t('updateStatus')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openOrderDetailsDialog(order)}
                            >
                              {t('view')}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openOrderDetailsDialog(order)}
                            >
                              {t('update')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Mahsulotlar boshqaruvi</CardTitle>
                    <CardDescription>Inventaringizni boshqaring</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openProductDialog("add")}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Yangi mahsulot qo'shish
                    </Button>
                    <Input placeholder="Mahsulotlarni qidirish..." className="w-[250px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Mahsulot nomi</TableHead>
                      <TableHead>Zaxira</TableHead>
                      <TableHead>Narx</TableHead>
                      <TableHead>Kategoriya</TableHead>
                      <TableHead className="text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>#{product.id}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <span className={product.stock < 10 ? "text-red-600" : "text-green-600"}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openProductDialog("edit", product)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Tahrirlash
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              O'chirish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Do'kon sozlamalari</CardTitle>
                <CardDescription>Do'kon uchun asosiy sozlamalarni boshqaring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storeName" className="text-right">
                      Do'kon nomi
                    </Label>
                    <Input id="storeName" defaultValue={user.fullName || user.username} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storeEmail" className="text-right">
                      Email
                    </Label>
                    <Input id="storeEmail" defaultValue={user.email} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storePhone" className="text-right">
                      Telefon
                    </Label>
                    <Input id="storePhone" defaultValue="+998 90 123 4567" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storeAddress" className="text-right">
                      Manzil
                    </Label>
                    <Input id="storeAddress" defaultValue="Toshkent sh., Chilonzor tumani" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storeLogo" className="text-right">
                      Logotip
                    </Label>
                    <Input id="storeLogo" type="file" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="storeDescription" className="text-right">
                      Tavsif
                    </Label>
                    <Textarea
                      id="storeDescription"
                      placeholder="Do'kon haqida ma'lumot"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Saqlash</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order details dialog */}
      <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Buyurtma ma'lumotlari #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Buyurtma qilingan sana: {selectedOrder?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Mijoz ma'lumotlari</h3>
                  <p className="text-sm">{selectedOrder.customer}</p>
                  <p className="text-sm">{selectedOrder.phone}</p>
                  <p className="text-sm">{selectedOrder.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Buyurtma ma'lumotlari</h3>
                  <p className="text-sm">To'lov usuli: {selectedOrder.paymentMethod === 'card' ? 'Karta orqali' : 'Naqd pul'}</p>
                  <p className="text-sm">Yetkazib berish vaqti: {selectedOrder.deliveryDate}, {selectedOrder.deliveryTimeSlot}</p>
                  <p className="text-sm">Joriy holati: <OrderStatusBadge status={selectedOrder.status} /></p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Mahsulotlar</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mahsulot</TableHead>
                      <TableHead className="text-right">Miqdori</TableHead>
                      <TableHead className="text-right">Narxi</TableHead>
                      <TableHead className="text-right">Jami</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.products.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(product.price * product.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Jami:</TableCell>
                      <TableCell className="text-right font-bold">${selectedOrder.total.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Yetkazib berish vaqti</h3>
                <DeliveryTimeSelector
                  onDateChange={() => {}}
                  onTimeSlotChange={() => {}}
                  onDeliveryTypeChange={() => {}}
                  selectedDate={selectedOrder.deliveryDate}
                  selectedTimeSlot={selectedOrder.deliveryTimeSlot}
                  selectedDeliveryType="standard"
                  isSeller={true}
                  onAcceptDelivery={() => handleAcceptDelivery(selectedOrder.id)}
                  deliveryStatus={deliveryStatus[selectedOrder.id]}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Buyurtma holatini yangilash</h3>
                <div className="flex gap-2">
                  <Select defaultValue={selectedOrder.status.toLowerCase()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Holat tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Kutilmoqda</SelectItem>
                      <SelectItem value="processing">Jarayonda</SelectItem>
                      <SelectItem value="shipped">Jo'natildi</SelectItem>
                      <SelectItem value="delivered">Yetkazildi</SelectItem>
                      <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => updateOrderStatus(selectedOrder.id, "Processing")}>
                    Yangilash
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product add/edit dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productAction === "add" ? "Yangi mahsulot qo'shish" : "Mahsulotni tahrirlash"}
            </DialogTitle>
            <DialogDescription>
              {productAction === "add" 
                ? "Do'koningiz uchun yangi mahsulot qo'shing" 
                : "Mavjud mahsulot ma'lumotlarini tahrirlang"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">
                Nomi
              </Label>
              <Input 
                id="productName" 
                defaultValue={selectedProduct?.name || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productDescription" className="text-right">
                Tavsif
              </Label>
              <Textarea
                id="productDescription"
                defaultValue={selectedProduct?.description || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productPrice" className="text-right">
                Narxi
              </Label>
              <Input 
                id="productPrice" 
                type="number" 
                defaultValue={selectedProduct?.price || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productStock" className="text-right">
                Zaxirada
              </Label>
              <Input 
                id="productStock" 
                type="number" 
                defaultValue={selectedProduct?.stock || ""} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productCategory" className="text-right">
                Kategoriya
              </Label>
              <Select defaultValue={selectedProduct?.category || "electronics"}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Elektronika</SelectItem>
                  <SelectItem value="clothing">Kiyim-kechak</SelectItem>
                  <SelectItem value="home">Uy jihozlari</SelectItem>
                  <SelectItem value="books">Kitoblar</SelectItem>
                  <SelectItem value="sports">Sport jihozlari</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productImage" className="text-right">
                Rasm
              </Label>
              <Input id="productImage" type="file" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => productAction === "add" ? addNewProduct({}) : editProduct({})}>
              {productAction === "add" ? "Qo'shish" : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}