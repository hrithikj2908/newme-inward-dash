import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { mockOutwardRequests } from "@/data/mockOutwardingData";
import { OutwardRequestStatus } from "@/types/outwarding";

export default function OutwardingList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OutwardRequestStatus | "ALL">("ALL");

  const filteredRequests = mockOutwardRequests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.to.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilters: Array<{ label: string; value: OutwardRequestStatus | "ALL" }> = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "COMPLETED" },
    { label: "In Transit", value: "IN_TRANSIT" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">Outwarding</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Request ID, From, or To location..."
            className="pl-12 h-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? "default" : "outline"}
              size="lg"
              onClick={() => setStatusFilter(filter.value)}
              className="h-12 px-6"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Table */}
      <div className="p-8">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">No active outwarding requests</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-6 text-lg font-semibold">Request ID</th>
                  <th className="text-left p-6 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Created Date
                    </div>
                  </th>
                  <th className="text-left p-6 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      From → To
                    </div>
                  </th>
                  <th className="text-center p-6 text-lg font-semibold">Total Items</th>
                  <th className="text-center p-6 text-lg font-semibold">Distinct Items</th>
                  <th className="text-left p-6 text-lg font-semibold">Status</th>
                  <th className="text-center p-6 text-lg font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => {
                  const packedQty = request.items.reduce((sum, item) => sum + item.packedQty, 0);
                  const statusMap: Record<OutwardRequestStatus, "pending" | "in-transit" | "completed" | "inwarding"> = {
                    PENDING: "pending",
                    IN_PROGRESS: "inwarding",
                    COMPLETED: "completed",
                    IN_TRANSIT: "in-transit"
                  };
                  
                  return (
                    <tr
                      key={request.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/outwarding/${request.id}`)}
                    >
                      <td className="p-6">
                        <span className="text-lg font-semibold text-primary">{request.id}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-lg">{new Date(request.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-lg">
                          <span>{request.from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{request.to}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-lg font-semibold">{packedQty}/{request.totalExpectedQty}</span>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-lg font-semibold">{request.distinctItems}</span>
                      </td>
                      <td className="p-6">
                        <StatusBadge status={statusMap[request.status]} />
                      </td>
                      <td className="p-6 text-center">
                        <Button size="lg" className="h-12 px-6">
                          Open
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
