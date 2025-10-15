import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import GatepassList from "./pages/GatepassList";
import GatepassDetail from "./pages/GatepassDetail";
import InwardingWorkflow from "./pages/InwardingWorkflow";
import OutwardingList from "./pages/OutwardingList";
import OutwardRequestDetail from "./pages/OutwardRequestDetail";
import BoxScanningWorkspace from "./pages/BoxScanningWorkspace";
import PackslipView from "./pages/PackslipView";
import BillingWorkspace from "./pages/billing/BillingWorkspace";
import InvoiceView from "./pages/billing/InvoiceView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<GatepassList />} />
              <Route path="/gatepass/:id" element={<GatepassDetail />} />
              <Route path="/gatepass/:gatepassId/box/:boxId" element={<InwardingWorkflow />} />
              <Route path="/outwarding" element={<OutwardingList />} />
              <Route path="/outwarding/:requestId" element={<OutwardRequestDetail />} />
              <Route path="/outwarding/:requestId/workspace" element={<BoxScanningWorkspace />} />
              <Route path="/outwarding/:requestId/packslip" element={<PackslipView />} />
              <Route path="/billing" element={<BillingWorkspace />} />
              <Route path="/billing/invoice/:invoiceId" element={<InvoiceView />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
