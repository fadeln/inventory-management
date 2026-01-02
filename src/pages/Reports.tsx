import React from 'react';
import { useItems, useCategories, useIncomingGoods, useOutgoingGoods, useItemRequests, usePurchaseOrders, useStockMovements } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const { data: items = [] } = useItems();
  const { data: categories = [] } = useCategories();
  const { data: incomingGoods = [] } = useIncomingGoods();
  const { data: outgoingGoods = [] } = useOutgoingGoods();
  const { data: itemRequests = [] } = useItemRequests();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: stockMovements = [] } = useStockMovements();

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Unknown';

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
  };

  const exportStock = () => {
    const data = items.map(i => ({ code: i.code, name: i.name, category: getCategoryName(i.categoryId), stock: i.stock, minStock: i.minStock, unit: i.unit, location: i.location }));
    exportToCSV(data, 'stock_report', ['code', 'name', 'category', 'stock', 'minStock', 'unit', 'location']);
  };

  const exportIncoming = () => {
    const data = incomingGoods.filter(t => t.status === 'APPROVED').map(t => ({ transactionNumber: t.transactionNumber, referenceNumber: t.referenceNumber, receivedDate: t.receivedDate, status: t.status, approvedAt: t.approvedAt }));
    exportToCSV(data, 'incoming_report', ['transactionNumber', 'referenceNumber', 'receivedDate', 'status', 'approvedAt']);
  };

  const exportOutgoing = () => {
    const data = outgoingGoods.filter(t => t.status === 'APPROVED').map(t => ({ transactionNumber: t.transactionNumber, destination: t.destination, requestedBy: t.requestedBy, status: t.status, approvedAt: t.approvedAt }));
    exportToCSV(data, 'outgoing_report', ['transactionNumber', 'destination', 'requestedBy', 'status', 'approvedAt']);
  };

  const exportRequests = () => {
    const data = itemRequests.map(r => ({ transactionNumber: r.transactionNumber, department: r.department, requestedBy: r.requestedBy, requiredDate: r.requiredDate, status: r.status }));
    exportToCSV(data, 'requests_report', ['transactionNumber', 'department', 'requestedBy', 'requiredDate', 'status']);
  };

  const exportPurchaseOrders = () => {
    const data = purchaseOrders.map(p => ({ transactionNumber: p.transactionNumber, expectedDate: p.expectedDate, status: p.status, approvedAt: p.approvedAt }));
    exportToCSV(data, 'purchase_orders_report', ['transactionNumber', 'expectedDate', 'status', 'approvedAt']);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Export inventory reports to CSV</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">Stock Report</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Current inventory levels for all items ({items.length} items)</p>
            <Button onClick={exportStock}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Incoming Goods Report</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Approved incoming transactions ({incomingGoods.filter(t => t.status === 'APPROVED').length} records)</p>
            <Button onClick={exportIncoming}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Outgoing Goods Report</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Approved outgoing transactions ({outgoingGoods.filter(t => t.status === 'APPROVED').length} records)</p>
            <Button onClick={exportOutgoing}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Item Requests Report</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">All item requests ({itemRequests.length} records)</p>
            <Button onClick={exportRequests}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Purchase Orders Report</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">All purchase orders ({purchaseOrders.length} records)</p>
            <Button onClick={exportPurchaseOrders}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
