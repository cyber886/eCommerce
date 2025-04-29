import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogOut, ShoppingBag, Heart, User, Settings, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Get purchase history
  const { data: purchaseHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/purchase-history'],
    // This route is authenticated, so will return 401 if not logged in
    enabled: !!user,
  });

  // Get wishlist
  const { data: wishlist, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['/api/wishlist'],
    // This route is authenticated, so will return 401 if not logged in
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Account Page</h1>
        <p className="mb-6">Please log in to view your account</p>
        <Button onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  // Format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
            <p className="text-sm text-muted-foreground mt-1 capitalize">Account type: {user.role}</p>
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
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Заказы</span>
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Wishlist</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="col-span-2">{user.fullName || "-"}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Username</p>
                  <p className="col-span-2">{user.username}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Email</p>
                  <p className="col-span-2">{user.email}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="col-span-2 capitalize">{user.role}</p>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="col-span-2">{formatDate(user.createdAt as unknown as string)}</p>
                </div>
              </div>
              <Button className="mt-4" variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your recent orders and track their status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : purchaseHistory && Array.isArray(purchaseHistory) && purchaseHistory.length > 0 ? (
                <div className="space-y-6">
                  {purchaseHistory.map((orderData: any) => (
                    <Card key={orderData.order.id} className="overflow-hidden">
                      <div className="bg-muted p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">Order #{orderData.order.id}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(orderData.order.createdAt as unknown as string)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${orderData.order.total.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              Delivery: {orderData.order.deliveryDate} ({orderData.order.deliveryTimeSlot})
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          {orderData.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between">
                              <div>
                                <p>{item.productId} x {item.quantity}</p>
                              </div>
                              <p>${item.price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 flex gap-3">
                          <Button variant="outline" size="sm" onClick={() => navigate(`/order/${orderData.order.id}`)}>
                            Order Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/order/${orderData.order.id}/track`)}>
                            Track Delivery
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No orders yet</h3>
                  <p className="text-muted-foreground">When you make a purchase, it will appear here.</p>
                  <Button className="mt-4" onClick={() => navigate("/")}>Start Shopping</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Manage your saved products</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWishlist ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : wishlist && Array.isArray(wishlist) && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{item.product.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-medium">${item.product.price.toFixed(2)}</p>
                          <Button size="sm" onClick={() => navigate(`/product/${item.product.id}`)}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Your wishlist is empty</h3>
                  <p className="text-muted-foreground">Save items that you like by clicking the heart icon.</p>
                  <Button className="mt-4" onClick={() => navigate("/")}>Discover Products</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
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
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Manage email notification preferences</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">Change your language preferences</p>
                  </div>
                  <Button variant="outline">Change</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>View your recent notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">You're all caught up! We'll notify you when there's news.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}