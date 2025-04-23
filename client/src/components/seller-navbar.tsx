import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, Package, Users, Settings, LogOut, AlertCircle, Loader2 } from "lucide-react";
import Notifications from "./notifications";

export default function SellerNavbar() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState(true);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  if (!user || user.role !== "seller") {
    return null;
  }

  return (
    <div className={`h-screen bg-muted fixed left-0 top-0 z-30 flex flex-col border-r transition-all duration-300 ${expanded ? "w-64" : "w-20"}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <div className={`flex items-center gap-2 ${!expanded && "justify-center w-full"}`}>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.fullName?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {expanded && (
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user.fullName || user.username}</span>
              <span className="text-xs text-muted-foreground">Sotuvchi</span>
            </div>
          )}
        </div>
        {expanded && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setExpanded(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        )}
        {!expanded && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mx-auto" 
            onClick={() => setExpanded(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          <NavItem 
            href="/seller-page" 
            icon={<BarChart3 className="h-5 w-5" />} 
            label="Boshqaruv paneli" 
            expanded={expanded}
          />
          <NavItem 
            href="/seller-page?tab=orders" 
            icon={<Package className="h-5 w-5" />} 
            label="Buyurtmalar" 
            expanded={expanded}
          />
          <NavItem 
            href="/seller-page?tab=products" 
            icon={<Users className="h-5 w-5" />} 
            label="Mahsulotlar" 
            expanded={expanded}
          />
          <NavItem 
            href="/seller-page?tab=settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Sozlamalar" 
            expanded={expanded}
          />
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between mb-4">
          {expanded ? (
            <span className="text-xs text-muted-foreground">Bildirishnomalar</span>
          ) : (
            <span></span>
          )}
          <div>
            <Notifications 
              role="seller" 
              onViewOrder={(orderId) => {
                navigate(`/seller-page?tab=orders&order=${orderId}`);
              }}
            />
          </div>
        </div>
          
        <Button
          variant="outline"
          className={`flex items-center gap-2 w-full ${!expanded && "justify-center"}`}
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {expanded && <span>Chiqish</span>}
        </Button>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, expanded }: { href: string; icon: React.ReactNode; label: string; expanded: boolean }) {
  const [location] = useLocation();
  const isActive = location === href || 
    (href.includes('?tab=') && location.includes(href.split('?')[0]) && location.includes(href.split('?tab=')[1]?.split('&')[0] || ''));

  return (
    <Link href={href}>
      <a
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-foreground/60 hover:text-foreground hover:bg-muted/80"
        } ${!expanded && "justify-center"}`}
      >
        {icon}
        {expanded && <span className="ml-3">{label}</span>}
      </a>
    </Link>
  );
}