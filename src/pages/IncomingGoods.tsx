import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useIncomingGoods,
  useSuppliers,
  useItems,
  useUsers,
  useCreateIncomingGoods,
  useUpdateIncomingGoods,
  useSubmitIncomingGoods,
  useDeleteIncomingGoods,
} from "@/hooks/useApi";
import { IncomingGoods as IncomingGoodsType, TransactionItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Send, Eye, X } from "lucide-react";
import { format } from "date-fns";

const IncomingGoods: React.FC = () => {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useIncomingGoods();
  const { data: suppliers = [] } = useSuppliers();
  const { data: items = [] } = useItems();
  const { data: users = [] } = useUsers();
  const createTransaction = useCreateIncomingGoods();
  const updateTransaction = useUpdateIncomingGoods();
  const submitTransaction = useSubmitIncomingGoods();
  const deleteTransaction = useDeleteIncomingGoods();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<IncomingGoodsType | null>(null);
  const [viewingTransaction, setViewingTransaction] =
    useState<IncomingGoodsType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitId, setSubmitId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    supplierId: "",
    referenceNumber: "",
    receivedAt: new Date().toISOString().split("T")[0],
    notes: "",
    items: [] as TransactionItem[],
  });

  const [newItem, setNewItem] = useState({ itemId: "", quantity: 0 });

  // Utility function to safely format dates
  const safeFormatDate = (
    value?: string | Date | null,
    formatStr: string = "dd/MM/yyyy"
  ) => {
    if (!value) return "-";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "-" : format(date, formatStr);
  };

  // Extract date only from ISO string (for form input)
  const extractDateFromISO = (isoString: string) => {
    try {
      return isoString.split("T")[0];
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.transactionNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || "Unknown";
  };

  const getItemName = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.name || "Unknown";
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown";
  };

  const resetForm = () => {
    setFormData({
      supplierId: "",
      referenceNumber: "",
      receivedAt: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    });
    setNewItem({ itemId: "", quantity: 0 });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaction: IncomingGoodsType) => {
    if (transaction.status !== "DRAFT") {
      toast.error("Only draft transactions can be edited");
      return;
    }
    setFormData({
      supplierId: transaction.supplierId,
      referenceNumber: transaction.referenceNumber,
      receivedAt: extractDateFromISO(transaction.receivedAt),
      notes: transaction.notes,
      items: transaction.items,
    });
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const openViewDialog = (transaction: IncomingGoodsType) => {
    setViewingTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const addItem = () => {
    if (!newItem.itemId || newItem.quantity <= 0) {
      toast.error("Please select an item and enter a valid quantity");
      return;
    }
    if (formData.items.some((i) => i.itemId === newItem.itemId)) {
      toast.error("Item already added");
      return;
    }
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }],
    });
    setNewItem({ itemId: "", quantity: 0 });
  };

  const removeItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.itemId !== itemId),
    });
  };

  const onSubmit = async () => {
    if (
      !formData.supplierId ||
      !formData.referenceNumber ||
      formData.items.length === 0
    ) {
      toast.error("Please fill all required fields and add at least one item");
      return;
    }

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          updates: formData,
        });
        toast.success("Transaction updated successfully");
      } else {
        await createTransaction.mutateAsync({
          ...formData,
          createdBy: user?.id || "",
        });
        toast.success("Transaction created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save transaction");
    }
  };

  const handleSubmit = async () => {
    if (!submitId) return;
    try {
      await submitTransaction.mutateAsync(submitId);
      toast.success("Transaction submitted for approval");
      setSubmitId(null);
    } catch (error) {
      toast.error("Failed to submit transaction");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction.mutateAsync(deleteId);
      toast.success("Transaction deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incoming Goods</h1>
          <p className="text-muted-foreground">
            Manage incoming goods transactions
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No transactions found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Reference #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    // console.log(t),
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.transactionNumber}
                      </TableCell>
                      <TableCell>{t.referenceNumber}</TableCell>
                      <TableCell>{getSupplierName(t.supplierId)}</TableCell>
                      <TableCell>{safeFormatDate(t.receivedAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(t)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {t.status === "DRAFT" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(t)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSubmitId(t.id)}
                              >
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(t.id)}
                              >
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
            <DialogTitle>
              {editingTransaction ? "Edit Transaction" : "New Incoming Goods"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, supplierId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input
                  value={formData.referenceNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceNumber: e.target.value,
                    })
                  }
                  placeholder="e.g., INV-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Received Date</Label>
              <Input
                type="date"
                value={formData.receivedAt}
                onChange={(e) =>
                  setFormData({ ...formData, receivedAt: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
              />
            </div>

            {/* Items Section */}
            <div className="space-y-3">
              <Label>Items</Label>
              <div className="flex gap-2">
                <Select
                  value={newItem.itemId}
                  onValueChange={(v) => setNewItem({ ...newItem, itemId: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.code} - {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Qty"
                  className="w-24"
                  value={newItem.quantity || ""}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <Button type="button" onClick={addItem}>
                  Add
                </Button>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.itemId)}
                            >
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {editingTransaction ? "Update" : "Create"} as Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Transaction Number
                  </Label>
                  <p className="font-medium">
                    {viewingTransaction.transactionNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={viewingTransaction.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Supplier</Label>
                  <p className="font-medium">
                    {getSupplierName(viewingTransaction.supplierId)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Reference Number
                  </Label>
                  <p className="font-medium">
                    {viewingTransaction.referenceNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Received Date</Label>
                  <p className="font-medium">
                    {safeFormatDate(viewingTransaction.receivedAt)}
                    
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created By</Label>
                  <p className="font-medium">
                    {getUserName(viewingTransaction.createdBy)}
                  </p>
                </div>
              </div>

              {viewingTransaction.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p>{viewingTransaction.notes}</p>
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
                      {viewingTransaction.items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{getItemName(item.itemId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {viewingTransaction.status === "APPROVED" &&
                viewingTransaction.signatureImage && (
                  <div>
                    <Label className="text-muted-foreground">
                      Approval Signature
                    </Label>
                    <div className="border rounded-lg p-2 mt-2 bg-card">
                      <img
                        src={viewingTransaction.signatureImage}
                        alt="Signature"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Approved by{" "}
                      {getUserName(viewingTransaction.approvedBy || "")} on{" "}
                      {safeFormatDate(
                        viewingTransaction.approvedAt,
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                  </div>
                )}

              {viewingTransaction.status === "REJECTED" && (
                <div>
                  <Label className="text-muted-foreground">
                    Rejection Reason
                  </Label>
                  <p className="text-destructive">
                    {viewingTransaction.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation */}
      <AlertDialog open={!!submitId} onOpenChange={() => setSubmitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Approval</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this transaction for approval? You
              won't be able to edit it after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomingGoods;
