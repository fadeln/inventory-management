import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePurchaseOrders, useSuppliers, useItems, useUsers, useCreatePurchaseOrder, useUpdatePurchaseOrder, useSubmitPurchaseOrder, useDeletePurchaseOrder } from '@/hooks/useApi';
import { PurchaseOrder as PurchaseOrderType, TransactionItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search, Send, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

const PurchaseOrders: React.FC = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = usePurchaseOrders();
  const { data: suppliers = [] } = useSuppliers();
  const { data: items = [] } = useItems();
  const { data: users = [] } = useUsers();
  const createOrder = useCreatePurchaseOrder();
  const updateOrder = useUpdatePurchaseOrder();
  const submitOrder = useSubmitPurchaseOrder();
  const deleteOrder = useDeletePurchaseOrder();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrderType | null>(null);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrderType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitId, setSubmitId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: [] as TransactionItem[],
  });

  const [newItem, setNewItem] = useState({ itemId: '', quantity: 0 });

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase())

  // console.log(o)
  );

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || 'Unknown';
  };

  const getItemName = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.name || 'Unknown';
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || 'Unknown';
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      expectedDate: new Date().toISOString().split('T')[0],
      notes: '',
      items: [],
    });
    setNewItem({ itemId: '', quantity: 0 });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingOrder(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (order: PurchaseOrderType) => {
    if (order.status !== 'DRAFT') {
      toast.error('Only draft orders can be edited');
      return;
    }
    setFormData({
      supplierId: order.supplierId,
      expectedDate: order.expectedDate.split('T')[0],
      notes: order.notes,
      items: order.items,
    });
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const openViewDialog = (order: PurchaseOrderType) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const addItem = () => {
    if (!newItem.itemId || newItem.quantity <= 0) {
      toast.error('Please select an item and enter a valid quantity');
      return;
    }
    if (formData.items.some((i) => i.itemId === newItem.itemId)) {
      toast.error('Item already added');
      return;
    }
    setFormData({ ...formData, items: [...formData.items, { ...newItem }] });
    setNewItem({ itemId: '', quantity: 0 });
  };

  const removeItem = (itemId: string) => {
    setFormData({ ...formData, items: formData.items.filter((i) => i.itemId !== itemId) });
  };

  const onSubmit = async () => {
    if (!formData.supplierId || formData.items.length === 0) {
      toast.error('Please fill all required fields and add at least one item');
      return;
    }

    try {
      if (editingOrder) {
        await updateOrder.mutateAsync({ id: editingOrder.id, updates: formData });
        toast.success('Order updated successfully');
      } else {
        await createOrder.mutateAsync({
          ...formData,
          orderNumber: undefined,
          createdBy: ''
        });
        toast.success('Order created successfully');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save order');
    }
  };

  const handleSubmit = async () => {
    if (!submitId) return;
    try {
      await submitOrder.mutateAsync(submitId);
      toast.success('Order submitted for approval');
      setSubmitId(null);
    } catch (error) {
      toast.error('Failed to submit order');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOrder.mutateAsync(deleteId);
      toast.success('Order deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage purchase orders</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.orderNumber}</TableCell>
                      <TableCell>{getSupplierName(o.supplierId)}</TableCell>
                      <TableCell>{format(new Date(o.expectedDate), 'dd/MM/yyyy')}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {o.status === 'DRAFT' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(o)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setSubmitId(o.id)}>
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setDeleteId(o.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'New Purchase Order'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={formData.supplierId} onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="space-y-3">
              <Label>Items</Label>
              <div className="flex gap-2">
                <Select value={newItem.itemId} onValueChange={(v) => setNewItem({ ...newItem, itemId: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.code} - {i.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Qty"
                  className="w-24"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
                <Button type="button" onClick={addItem}>Add</Button>
              </div>

              {formData.items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-24">Quantity</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{getItemName(item.itemId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(item.itemId)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={onSubmit}>{editingOrder ? 'Update' : 'Create'} as Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">PO Number</Label>
                  <p className="font-medium">{viewingOrder.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1"><StatusBadge status={viewingOrder.status} /></div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Supplier</Label>
                  <p className="font-medium">{getSupplierName(viewingOrder.supplierId)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Delivery</Label>
                  <p className="font-medium">{format(new Date(viewingOrder.expectedDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p>{viewingOrder.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Items</Label>
                <div className="border rounded-lg mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-24">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{getItemName(item.itemId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {viewingOrder.status === 'APPROVED' && viewingOrder.signatureImage && (
                <div>
                  <Label className="text-muted-foreground">Approval Signature</Label>
                  <div className="border rounded-lg p-2 mt-2 bg-card">
                    <img src={viewingOrder.signatureImage} alt="Signature" className="max-w-full h-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Approved by {getUserName(viewingOrder.approvedBy || '')} on{' '}
                    {viewingOrder.approvedAt && format(new Date(viewingOrder.approvedAt), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              )}

              {viewingOrder.status === 'REJECTED' && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="text-destructive">{viewingOrder.rejectReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!submitId} onOpenChange={() => setSubmitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this order for approval? You won't be able to edit it after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PurchaseOrders;
