import { Package, PackageOpen } from "lucide-react";
import { RiReceiptLine } from "@remixicon/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();
  
  const isInwarding = location.pathname.includes("/gatepass") || location.pathname === "/";
  const isOutwarding = location.pathname.includes("/outwarding");
  const isBilling = location.pathname.includes("/billing");

  return (
    <aside className="w-20 bg-card border-r border-border flex flex-col items-center py-6 gap-6">
      <Link
        to="/"
        className={cn(
          "flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full",
          isInwarding
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Package className="w-6 h-6" />
        <span className="text-xs font-medium">Inwarding</span>
      </Link>
      
      <Link
        to="/outwarding"
        className={cn(
          "flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full",
          isOutwarding
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <PackageOpen className="w-6 h-6" />
        <span className="text-xs font-medium">Outwarding</span>
      </Link>
      
      <Link
        to="/billing"
        className={cn(
          "flex flex-col items-center gap-2 px-4 py-3 rounded-lg transition-colors w-full",
          isBilling
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <RiReceiptLine className="w-6 h-6" />
        <span className="text-xs font-medium">Billing</span>
      </Link>
    </aside>
  );
}
