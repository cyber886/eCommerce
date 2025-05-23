import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

      <Tabs value="profile" className="space-y-6">
        <TabsList className="bg-background border w-full flex justify-start overflow-x-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
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
              <div className="border-t mt-4 pt-4">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  try {
                    const response = await fetch('/api/user/profile', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        fullName: formData.get('fullName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        address: formData.get('address'),
                      }),
                    });
                    if (response.ok) {
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Error updating profile:', error);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">To'liq ism</Label>
                      <Input 
                        id="fullName"
                        name="fullName"
                        defaultValue={user.fullName || ''}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user.email || ''}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        defaultValue={user.phone || ''}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Manzil</Label>
                      <Textarea 
                        id="address"
                        name="address"
                        defaultValue={user.address || ''}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Saqlash
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}