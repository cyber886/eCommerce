
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function OrdersPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/purchase-history');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Buyurtmalar tarixi</h1>
        <p className="mb-6">Buyurtmalar tarixini ko'rish uchun tizimga kiring</p>
        <Button onClick={() => navigate("/auth")}>Tizimga kirish</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Mening buyurtmalarim</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Yuklanmoqda...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Mening buyurtmalarim</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p>Hozircha buyurtmalar yo'q</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyurtma №</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Mahsulotlar</TableHead>
                  <TableHead>Summa</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items} ta mahsulot</TableCell>
                    <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Badge>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/tracking?order=${order.id}`)}>
                        Ko'rish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
