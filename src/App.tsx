import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Items from "@/pages/Items";
import Categories from "@/pages/Categories";
import Suppliers from "@/pages/Suppliers";
import Users from "@/pages/Users";
import IncomingGoods from "@/pages/IncomingGoods";
import OutgoingGoods from "@/pages/OutgoingGoods";
import ItemRequests from "@/pages/ItemRequests";
import PurchaseOrders from "@/pages/PurchaseOrders";
import Approvals from "@/pages/Approvals";
import StockMovements from "@/pages/StockMovements";
import Reports from "@/pages/Reports";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Admin & Warehouse routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_staff']} />}>
                  <Route path="/items" element={<Items />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/incoming-goods" element={<IncomingGoods />} />
                  <Route path="/outgoing-goods" element={<OutgoingGoods />} />
                  <Route path="/purchase-orders" element={<PurchaseOrders />} />
                </Route>
                
                {/* Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/users" element={<Users />} />
                </Route>
                
                {/* Item requests - accessible by admin, warehouse, and department users */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_staff', 'department_user']} />}>
                  <Route path="/item-requests" element={<ItemRequests />} />
                </Route>
                
                {/* Head of Warehouse only */}
                <Route element={<ProtectedRoute allowedRoles={['head_of_warehouse']} />}>
                  <Route path="/approvals" element={<Approvals />} />
                </Route>
                
                {/* Stock movements & reports - admin, warehouse, head */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse_staff', 'head_of_warehouse']} />}>
                  <Route path="/stock-movements" element={<StockMovements />} />
                  <Route path="/reports" element={<Reports />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
