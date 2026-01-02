import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useItems, useCategories, useIncomingGoods, useOutgoingGoods, useItemRequests, usePurchaseOrders, useStockMovements } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, ClipboardList, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: items = [] } = useItems();
  const { data: categories = [] } = useCategories();
  const { data: incomingGoods = [] } = useIncomingGoods();
  const { data: outgoingGoods = [] } = useOutgoingGoods();
  const { data: itemRequests = [] } = useItemRequests();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: stockMovements = [] } = useStockMovements();

  const lowStockItems = items.filter(item => item.currentStock <= item.minStock);
  const totalStock = items.reduce((sum, item) => sum + item.currentStock, 0);
  
  const pendingIncoming = incomingGoods.filter(t => t.status === 'WAITING_APPROVAL').length;
  const pendingOutgoing = outgoingGoods.filter(t => t.status === 'WAITING_APPROVAL').length;
  const pendingRequests = itemRequests.filter(t => t.status === 'WAITING_APPROVAL').length;
  const pendingPurchaseOrders = purchaseOrders.filter(t => t.status === 'WAITING_APPROVAL').length;
  const totalPending = pendingIncoming + pendingOutgoing + pendingRequests + pendingPurchaseOrders;

  const recentMovements = stockMovements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentApproved = [
    ...incomingGoods.filter(t => t.status === 'APPROVED'),
    ...outgoingGoods.filter(t => t.status === 'APPROVED'),
    ...itemRequests.filter(t => t.status === 'APPROVED'),
    ...purchaseOrders.filter(t => t.status === 'APPROVED'),
  ]
    .sort((a, b) => new Date(b.approvedAt || b.createdAt).getTime() - new Date(a.approvedAt || a.createdAt).getTime())
    .slice(0, 5);

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item?.name || 'Unknown Item';
  };

  const isHeadOfWarehouse = user?.role === 'head_of_warehouse';
  const isDepartmentUser = user?.role === 'department_user';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">{categories.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">units in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-waiting" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-waiting">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">items need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-xs text-muted-foreground">transactions waiting</p>
          </CardContent>
        </Card>
      </div>

      {/* Head of Warehouse - Pending Approvals Summary */}
      {isHeadOfWarehouse && totalPending > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/approvals?type=incoming" className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownCircle className="h-4 w-4 text-status-approved" />
                  <span className="text-sm font-medium">Incoming</span>
                </div>
                <p className="text-2xl font-bold">{pendingIncoming}</p>
              </Link>
              <Link to="/approvals?type=outgoing" className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpCircle className="h-4 w-4 text-status-rejected" />
                  <span className="text-sm font-medium">Outgoing</span>
                </div>
                <p className="text-2xl font-bold">{pendingOutgoing}</p>
              </Link>
              <Link to="/approvals?type=requests" className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Requests</span>
                </div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
              </Link>
              <Link to="/approvals?type=purchase" className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-status-waiting" />
                  <span className="text-sm font-medium">Purchase Orders</span>
                </div>
                <p className="text-2xl font-bold">{pendingPurchaseOrders}</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        {!isDepartmentUser && lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-status-waiting" />
                Low Stock Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-status-waiting">{item.currentStock} / {item.minStock}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Stock Movements */}
        {!isDepartmentUser && recentMovements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.map((movement) => (

                  movement.quantityChange =   movement.newStock - movement.previousStock,
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {movement.quantityChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-status-approved" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-status-rejected" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{getItemName(movement.itemId)}</p>
                        <p className="text-xs text-muted-foreground">{movement.transactionNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${movement.quantityChange > 0 ? 'text-status-approved' : 'text-status-rejected'}`}>
                        {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(movement.createdAt), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Department User - My Requests */}
        {isDepartmentUser && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">My Item Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {itemRequests.filter(r => r.createdBy === user?.id).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No requests yet. Create your first item request.</p>
              ) : (
                <div className="space-y-3">
                  {itemRequests
                    .filter(r => r.createdBy === user?.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{request.transactionNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Approved Transactions */}
        {!isDepartmentUser && recentApproved.length > 0 && (
          <Card className={lowStockItems.length === 0 ? 'lg:col-span-2' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Recently Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApproved.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.transactionNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.approvedAt && format(new Date(transaction.approvedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <StatusBadge status={transaction.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
