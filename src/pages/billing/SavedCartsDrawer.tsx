import { useState, useEffect } from "react";
import { RiDeleteBinLine, RiPlayLine } from "@remixicon/react";
import { Button } from "@/components/alignui/button";
import { Badge } from "@/components/alignui/badge";
import * as Drawer from "@/components/alignui/drawer";
import { useToast } from "@/hooks/use-toast";
import type { SavedCart, Cart } from "@/types/billing";
import { getSavedCarts, deleteSavedCart, resumeCart } from "@/services/billingMockService";

interface SavedCartsDrawerProps {
  onClose: () => void;
  onResume: (cart: Partial<Cart>) => void;
}

export function SavedCartsDrawer({ onClose, onResume }: SavedCartsDrawerProps) {
  const { toast } = useToast();
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SAVED" | "EXPIRED">("ALL");

  useEffect(() => {
    loadSavedCarts();
  }, [filter]);

  const loadSavedCarts = async () => {
    setLoading(true);
    try {
      const carts = await getSavedCarts({
        status: filter === "ALL" ? undefined : filter,
      });
      setSavedCarts(carts);
    } catch (error) {
      toast({ title: "Failed to load saved carts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (savedCart: SavedCart) => {
    try {
      const { cart, repricingChanges } = await resumeCart(savedCart.id);

      if (repricingChanges.length > 0) {
        toast({
          title: "Prices updated",
          description: `${repricingChanges.length} items have been repriced`,
        });
      }

      onResume(cart);
    } catch (error) {
      toast({ title: "Failed to resume cart", variant: "destructive" });
    }
  };

  const handleDelete = async (cartId: string) => {
    if (!confirm("Are you sure you want to delete this cart?")) return;

    try {
      await deleteSavedCart(cartId);
      toast({ title: "Cart deleted" });
      loadSavedCarts();
    } catch (error) {
      toast({ title: "Failed to delete cart", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: SavedCart["status"]) => {
    switch (status) {
      case "SAVED":
        return "success";
      case "EXPIRED":
        return "destructive";
      case "LOCKED":
        return "warning";
      case "PENDING_SYNC":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <Drawer.Root open onOpenChange={onClose}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Saved Carts</Drawer.Title>
        </Drawer.Header>

        <div className="px-6 py-3 border-b border-border">
          <div className="flex gap-2">
            {(["ALL", "SAVED", "EXPIRED"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        <Drawer.Body>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Loading carts...</p>
            </div>
          ) : savedCarts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No saved carts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCarts.map((cart) => (
                <div
                  key={cart.id}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{cart.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {cart.customer?.name || "Guest"}{" "}
                        {cart.customer?.phone && `• ${cart.customer.phone}`}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(cart.status)}>
                      {cart.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Items</div>
                      <div className="font-medium">{cart.lines.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Subtotal</div>
                      <div className="font-medium">
                        ₹{cart.subtotalAtSave.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium">
                        {new Date(cart.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResume(cart)}
                      disabled={cart.status === "LOCKED"}
                    >
                      <RiPlayLine className="w-4 h-4" />
                      Resume
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cart.id)}
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </Button>
                  </div>

                  {cart.status === "LOCKED" && (
                    <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-2 rounded">
                      Cart is open elsewhere. Contact admin to take over.
                    </div>
                  )}

                  {cart.status === "EXPIRED" && (
                    <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950 p-2 rounded">
                      Cart expired. Resume will reprice items.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer.Root>
  );
}
