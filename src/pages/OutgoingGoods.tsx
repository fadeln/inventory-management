import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOutgoingGoods,
  useItems,
  useCreateOutgoingGoods,
  useUpdateOutgoingGoods,
  useDeleteOutgoingGoods,
  useSubmitIncomingGoods,
  useSubmitOutgoingGoods,
} from "@/hooks/useApi";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  X,
  AlertTriangle,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";

// Simplified type based on your schema
interface TransactionItem {
  itemId: string;
  quantity: number;
}

interface OutgoingGoodsType {
  id: string;
  transactionNumber: string;
  destination: string;
  recipientName: string;
  notes?: string;
  status: string;
  issuedBy?: { name: string };
  createdAt: string;
  items: TransactionItem[];
}

const OutgoingGoods: React.FC = () => {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useOutgoingGoods();
  const { data: items = [] } = useItems();
  const createTransaction = useCreateOutgoingGoods();
  const updateTransaction = useUpdateOutgoingGoods();
  const deleteTransaction = useDeleteOutgoingGoods();
  const submitTransaction = useSubmitOutgoingGoods();

  const [submitId, setSubmitId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<OutgoingGoodsType | null>(null);
  const [viewingTransaction, setViewingTransaction] =
    useState<OutgoingGoodsType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    destination: "",
    recipientName: "", // Changed from requestedBy to recipientName
    notes: "",
    items: [] as TransactionItem[],
  });

  const [newItem, setNewItem] = useState({ itemId: "", quantity: 0 });

  const filteredTransactions = transactions.filter((t) =>
    t.transactionNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getItemName = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.name || "Unknown";
  };

  const getItemStock = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    return item?.stock || item?.currentStock || 0;
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
  const resetForm = () => {
    setFormData({ destination: "", recipientName: "", notes: "", items: [] });
    setNewItem({ itemId: "", quantity: 0 });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaction: OutgoingGoodsType) => {
    if (transaction.status !== "DRAFT") {
      toast.error("Only draft transactions can be edited");
      return;
    }
    setFormData({
      destination: transaction.destination,
      recipientName: transaction.recipientName, // Use recipientName
      notes: transaction.notes || "",
      items: transaction.items,
    });
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const openViewDialog = (transaction: OutgoingGoodsType) => {
    setViewingTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const addItem = () => {
    if (!newItem.itemId || newItem.quantity <= 0) {
      toast.error("Please select an item and enter a valid quantity");
      return;
    }
    const stock = getItemStock(newItem.itemId);
    if (newItem.quantity > stock) {
      toast.error(`Insufficient stock. Available: ${stock}`);
      return;
    }
    if (formData.items.some((i) => i.itemId === newItem.itemId)) {
      toast.error("Item already added");
      return;
    }
    setFormData({ ...formData, items: [...formData.items, { ...newItem }] });
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
      !formData.destination ||
      !formData.recipientName ||
      formData.items.length === 0
    ) {
      toast.error("Please fill all required fields and add at least one item");
      return;
    }

    try {
      if (editingTransaction) {
        await updateTransaction.mutateAsync({
          id: editingTransaction.id,
          updates: {
            destination: formData.destination,
            recipientName: formData.recipientName,
            notes: formData.notes,
            items: formData.items,
          },
        });
        toast.success("Transaction updated successfully");
      } else {
        await createTransaction.mutateAsync({
          destination: formData.destination,
          recipientName: formData.recipientName,
          notes: formData.notes,
          items: formData.items,
          issuedById: user?.id || "", // Use issuedById instead of createdBy
        });
        toast.success("Transaction created successfully");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save transaction");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTransaction.mutateAsync(deleteId);
      toast.success("Transaction deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to delete transaction"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outgoing Goods</h1>
          <p className="text-muted-foreground">
            Manage outgoing goods transactions
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
                    <TableHead>Destination</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.transactionNumber}
                      </TableCell>
                      <TableCell>{t.destination}</TableCell>
                      <TableCell>{t.recipientName}</TableCell>
                      <TableCell>
                        {format(new Date(t.createdAt), "dd/MM/yyyy")}
                      </TableCell>
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
              {editingTransaction ? "Edit Transaction" : "New Outgoing Goods"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  placeholder="e.g., IT Department"
                />
              </div>
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData({ ...formData, recipientName: e.target.value })
                  }
                  placeholder="Name of recipient"
                />
              </div>
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
                      console.log("lallaa",i),
                      <SelectItem key={i.id} value={i.id}>
                        {i.code || i.sku} - {i.name} (Stock:{" "}
                        {i.stock || i.currentStock || 0})
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
                        <TableHead className="w-24">Stock</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item) => {
                        const stock = getItemStock(item.itemId);
                        const isOverStock = item.quantity > stock;
                        return (
                          <TableRow key={item.itemId}>
                            <TableCell>{getItemName(item.itemId)}</TableCell>
                            <TableCell
                              className={
                                isOverStock
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {item.quantity}
                              {isOverStock && (
                                <AlertTriangle className="h-3 w-3 inline ml-1" />
                              )}
                            </TableCell>
                            <TableCell>{stock}</TableCell>
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
                        );
                      })}
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
              {editingTransaction ? "Update" : "Create"}
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
             console.log("[[[[",viewingTransaction),
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
                  <Label className="text-muted-foreground">Issued By</Label>
                  <p className="font-medium">
                    {viewingTransaction.issuedBy?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination</Label>
                  <p className="font-medium">
                    {viewingTransaction.destination}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Recipient</Label>
                  <p className="font-medium">
                    {viewingTransaction.recipientName}
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
                        // console.log("qqqqwwads",item),
                        <TableRow key={item.itemId}>
                          <TableCell>{getItemName(item.itemId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default OutgoingGoods;
