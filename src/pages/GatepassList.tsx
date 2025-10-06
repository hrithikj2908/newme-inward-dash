import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Package, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { mockGatepasses } from "@/data/mockData";

export default function GatepassList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredGatepasses = mockGatepasses.filter((gp) => {
    const matchesSearch = gp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || gp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilters = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "In Transit", value: "in-transit" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inwarding</h1>
              <p className="text-muted-foreground mt-1">Manage gatepass deliveries</p>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-primary">Newme POS</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by Gatepass ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-base"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Filter Chips */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              onClick={() => setStatusFilter(filter.value)}
              className="btn-touch whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Gatepass Grid */}
        {filteredGatepasses.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No active gatepasses</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No results found for your search" : "All gatepasses have been processed"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGatepasses.map((gatepass) => (
              <Card
                key={gatepass.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/gatepass/${gatepass.id}`)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{gatepass.id}</h3>
                      <StatusBadge status={gatepass.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2 font-medium">{new Date(gatepass.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <span className="ml-2 font-medium">{gatepass.from} → {gatepass.to}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Boxes:</span>
                        <span className="ml-2 font-medium">{gatepass.boxesCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Qty:</span>
                        <span className="ml-2 font-medium">{gatepass.totalQty} items</span>
                      </div>
                    </div>
                  </div>
                  <Button size="lg" className="btn-touch">
                    View Details
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
