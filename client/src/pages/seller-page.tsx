import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, ShoppingBag, PackageOpen, User, Settings, Bell, FileText, BarChart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export default function SellerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  // Redirect non-sellers to auth page
  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>
        <p className="mb-6">Please log in to access the seller dashboard</p>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  // Redirect non-sellers to buyer account
  if (user.role !== "seller") {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p className="mb-6">You need a seller account to access this page</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/account")}>Go to Your Account</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  // Mock data for seller dashboard
  const recentOrders = [
    { id: 1001, customer: "John Doe", items: 3, total: 129.99, status: "Pending", date: "2023-06-01" },
    { id: 1002, customer: "Emma Smith", items: 1, total: 79.99, status: "Processing", date: "2023-06-02" },
    { id: 1003, customer: "Michael Johnson", items: 2, total: 159.99, status: "Shipped", date: "2023-06-03" },
    { id: 1004, customer: "Sarah Williams", items: 4, total: 249.99, status: "Delivered", date: "2023-06-04" }
  ];

  const products = [
    { id: 1, name: "Wireless Headphones", stock: 15, price: 79.99, category: "Electronics" },
    { id: 2, name: "Smart Watch Series 5", stock: 8, price: 199.99, category: "Electronics" },
    { id: 3, name: "Vintage Polaroid Camera", stock: 5, price: 149.99, category: "Electronics" },
    { id: 4, name: "Smart Home Speaker", stock: 12, price: 89.99, category: "Electronics" },
    { id: 5, name: "Wireless Earbuds Pro", stock: 20, price: 129.99, category: "Electronics" }
  ];

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
            <p className="text-sm text-muted-foreground mt-1 capitalize">Seller Account</p>
          </div>
        </div>
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
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Total Sales</CardTitle>
                <CardDescription>Monthly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,550.75</div>
                <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Orders</CardTitle>
                <CardDescription>Monthly total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-sm text-green-600 mt-1">↑ 8% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Products</CardTitle>
                <CardDescription>Total active products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground mt-1">5 low in stock</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <span 
                          className={
                            order.status === "Delivered" 
                              ? "text-green-600" 
                              : order.status === "Shipped" 
                                ? "text-blue-600" 
                                : "text-amber-600"
                          }
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">View</Button>
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
                  <CardTitle>Orders Management</CardTitle>
                  <CardDescription>Manage your customer orders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Search orders..." className="w-[250px]" />
                  <Button variant="outline">Filter</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <span 
                          className={
                            order.status === "Delivered" 
                              ? "text-green-600" 
                              : order.status === "Shipped" 
                                ? "text-blue-600" 
                                : "text-amber-600"
                          }
                        >
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Update</Button>
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
                  <CardTitle>Products Management</CardTitle>
                  <CardDescription>Manage your inventory</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button>Add New Product</Button>
                  <Input placeholder="Search products..." className="w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Delete</Button>
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
              <CardTitle>Seller Profile</CardTitle>
              <CardDescription>Manage your seller information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Store Name</p>
                  <p className="col-span-2">{user.fullName || user.username}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Email</p>
                  <p className="col-span-2">{user.email}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Username</p>
                  <p className="col-span-2">{user.username}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="col-span-2 capitalize">{user.role}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="col-span-2">{new Date(user.createdAt as unknown as string).toLocaleDateString()}</p>
                </div>
              </div>
              <Button className="mt-4" variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your seller account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Change your password</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Store Information</p>
                    <p className="text-sm text-muted-foreground">Update your store details</p>
                  </div>
                  <Button variant="outline">Edit</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Methods</p>
                    <p className="text-sm text-muted-foreground">Manage your payment settings</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Customize notification preferences</p>
                  </div>
                  <Button variant="outline">Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}