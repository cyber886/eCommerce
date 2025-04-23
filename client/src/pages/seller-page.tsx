import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, ShoppingBag, PackageOpen, User, Settings, Bell, FileText, BarChart, PlusCircle, Clock, ArrowUpDown, ShoppingCart, Truck, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import DeliveryTimeSelector from "@/components/delivery-time-selector";
import Notifications, { Notification } from "@/components/notifications";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [productAction, setProductAction] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {user.fullName?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1 capitalize">Sotuvchi hisobi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Notifications 
            role="seller"
            onViewOrder={(orderId) => {
              const order = recentOrders.find(o => o.id === orderId);
              if (order) {
                openOrderDetailsDialog(order);
              }
            }}
          />
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="flex items-center" 
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Chiqish
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Boshqaruv paneli</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Buyurtmalar</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4" />
            <span>Mahsulotlar</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Sozlamalar</span>
          </TabsTrigger>
        </TabsList>

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
                  <CardTitle>Buyurtmalar boshqaruvi</CardTitle>
                  <CardDescription>Mijoz buyurtmalarini boshqaring</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Buyurtmalarni qidirish..." className="w-[250px]" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filtrlash" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Barcha buyurtmalar</SelectItem>
                      <SelectItem value="pending">Kutilayotgan</SelectItem>
                      <SelectItem value="processing">Jarayonda</SelectItem>
                      <SelectItem value="shipped">Jo'natilgan</SelectItem>
                      <SelectItem value="delivered">Yetkazilgan</SelectItem>
                      <SelectItem value="cancelled">Bekor qilingan</SelectItem>
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
                        <span>Buyurtma ID</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Mijoz</TableHead>
                    <TableHead>Mahsulotlar</TableHead>
                    <TableHead>Jami</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span>Holati</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-1">
                        <span>Sana</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
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
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openOrderDetailsDialog(order)}
                          >
                            Ko'rish
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openOrderDetailsDialog(order)}
                          >
                            Yangilash
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

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sotuvchi profili</CardTitle>
              <CardDescription>Sotuvchi ma'lumotlaringizni boshqaring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Do'kon nomi</p>
                  <p className="col-span-2">{user.fullName || user.username}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Email</p>
                  <p className="col-span-2">{user.email}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Foydalanuvchi nomi</p>
                  <p className="col-span-2">{user.username}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Hisob turi</p>
                  <p className="col-span-2 capitalize">{user.role}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">A'zo bo'lgan vaqt</p>
                  <p className="col-span-2">{new Date(user.createdAt as unknown as string).toLocaleDateString()}</p>
                </div>
              </div>
              <Button className="mt-4" variant="outline">Profilni tahrirlash</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hisob sozlamalari</CardTitle>
              <CardDescription>Sotuvchi hisob sozlamalaringizni boshqaring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Parol</p>
                    <p className="text-sm text-muted-foreground">Parolingizni o'zgartiring</p>
                  </div>
                  <Button variant="outline">O'zgartirish</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Do'kon ma'lumotlari</p>
                    <p className="text-sm text-muted-foreground">Do'kon tafsilotlaringizni yangilang</p>
                  </div>
                  <Button variant="outline">Tahrirlash</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">To'lov usullari</p>
                    <p className="text-sm text-muted-foreground">To'lov sozlamalaringizni boshqaring</p>
                  </div>
                  <Button variant="outline">Sozlash</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bildirishnomalar</p>
                    <p className="text-sm text-muted-foreground">Bildirishnoma afzalliklarini sozlang</p>
                  </div>
                  <Button variant="outline">Sozlamalar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {productAction === "add" ? "Yangi mahsulot qo'shish" : "Mahsulotni tahrirlash"}
            </DialogTitle>
            <DialogDescription>
              {productAction === "add" 
                ? "Inventaringizga yangi mahsulot qo'shing" 
                : "Mavjud mahsulot ma'lumotlarini tahrirlang"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Mahsulot nomi
              </Label>
              <Input
                id="name"
                defaultValue={selectedProduct?.name || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Narx
              </Label>
              <Input
                id="price"
                type="number"
                defaultValue={selectedProduct?.price || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Zaxira
              </Label>
              <Input
                id="stock"
                type="number"
                defaultValue={selectedProduct?.stock || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Kategoriya
              </Label>
              <Select defaultValue={selectedProduct?.category || ""}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Elektronika</SelectItem>
                  <SelectItem value="Clothing">Kiyim-kechak</SelectItem>
                  <SelectItem value="Home">Uy-ro'zg'or</SelectItem>
                  <SelectItem value="Books">Kitoblar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Tavsif
              </Label>
              <Textarea
                id="description"
                defaultValue={selectedProduct?.description || ""}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Rasm URL
              </Label>
              <Input
                id="image"
                defaultValue={selectedProduct?.imageUrl || ""}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProductDialog(false)}
            >
              Bekor qilish
            </Button>
            <Button onClick={() => productAction === "add" ? addNewProduct({}) : editProduct({})}>
              {productAction === "add" ? "Qo'shish" : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Buyurtma #{selectedOrder?.id} tafsilotlari</DialogTitle>
            <DialogDescription>
              Buyurtma ma'lumotlari va holati
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Mijoz ma'lumotlari</h3>
                  <p><span className="font-medium">Ism:</span> {selectedOrder.customer}</p>
                  <p><span className="font-medium">Telefon:</span> {selectedOrder.phone}</p>
                  <p><span className="font-medium">Manzil:</span> {selectedOrder.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Buyurtma ma'lumotlari</h3>
                  <p><span className="font-medium">Buyurtma sanasi:</span> {selectedOrder.date}</p>
                  <p><span className="font-medium">To'lov usuli:</span> {selectedOrder.paymentMethod === "card" ? "Karta" : "Naqd pul"}</p>
                  <p className="mt-2"><span className="font-medium">Holati:</span> <OrderStatusBadge status={selectedOrder.status} /></p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Buyurtma mahsulotlari</h3>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahsulot nomi</TableHead>
                        <TableHead className="text-right">Miqdori</TableHead>
                        <TableHead className="text-right">Narx</TableHead>
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
                        <TableCell colSpan={3} className="text-right font-medium">Jami summa</TableCell>
                        <TableCell className="text-right font-bold">${selectedOrder.total.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Yetkazib berish vaqti</h3>
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
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Holati o'zgartirish</h3>
                <div className="flex gap-2">
                  <Select defaultValue={selectedOrder.status.toLowerCase()}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Holatni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Kutilayotgan</SelectItem>
                      <SelectItem value="processing">Jarayonda</SelectItem>
                      <SelectItem value="shipped">Jo'natilgan</SelectItem>
                      <SelectItem value="delivered">Yetkazilgan</SelectItem>
                      <SelectItem value="cancelled">Bekor qilingan</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => updateOrderStatus(selectedOrder.id, "processing")}>
                    Saqlash
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}