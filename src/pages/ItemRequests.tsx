import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useItemRequests,
  useItems,
  useUsers,
  useCreateItemRequest,
  useUpdateItemRequest,
  useSubmitItemRequest,
  useDeleteItemRequest,
} from "@/hooks/useApi";
import { ItemRequest as ItemRequestType, TransactionItem } from "@/types";
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
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Send, Eye, X } from "lucide-react";
import { format } from "date-fns";

const ItemRequests: React.FC = () => {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useItemRequests();
  const { data: items = [] } = useItems();
  const { data: users = [] } = useUsers();
  const createRequest = useCreateItemRequest();
  const updateRequest = useUpdateItemRequest();
  const submitRequest = useSubmitItemRequest();
  const deleteRequest = useDeleteItemRequest();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ItemRequestType | null>(
    null
  );
  const [viewingRequest, setViewingRequest] = useState<ItemRequestType | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitId, setSubmitId] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    department: department || "",
    requestedBy: user?.name || "",
    requiredDate: new Date().toISOString().split("T")[0],
    notes: "",
    items: [] as TransactionItem[],
  });

  const [newItem, setNewItem] = useState({ itemId: "", quantity: 0 });

  const isDepartmentUser = user?.role === "department_user";

  // Filter requests based on role
  const filteredRequests = requests
    .filter((r) => {
      if (isDepartmentUser) {
        return r.createdBy === user?.id;
      }
      return true;
    })
    .filter((r) => 
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase())

      // console.log(r)
    );

  const getItemName = (itemId: string) => {
    return items.find((i) => i.id === itemId)?.name || "Unknown";
  };

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown";
  };

  const resetForm = () => {
    setFormData({
      department: department || "",
      requestedBy: user?.name || "",
      requiredDate: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    });
    setNewItem({ itemId: "", quantity: 0 });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingRequest(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (request: ItemRequestType) => {
    if (request.status !== "DRAFT") {
      toast.error("Only draft requests can be edited");
      return;
    }
    setFormData({
      department: request.department,
      requestedBy: request.requestedBy,
      requiredDate: request.requiredDate.split("T")[0],
      notes: request.notes,
      items: request.items,
    });
    setEditingRequest(request);
    setIsDialogOpen(true);
  };

  const openViewDialog = (request: ItemRequestType) => {
    setViewingRequest(request);
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
      !formData.department ||
      !formData.requestedBy ||
      formData.items.length === 0
    ) {
      toast.error("Please fill all required fields and add at least one item");
      return;
    }

    console.log("form dataa" , { ...formData });

    try {
      if (editingRequest) {
        await updateRequest.mutateAsync({
          id: editingRequest.id,
          updates: formData,
        });
        toast.success("Request updated successfully");
      } else {
        await createRequest.mutateAsync({
          ...formData,
          createdBy: user?.id || "",
          requestNumber: undefined,
        });
        toast.success("Request created successfully");
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save request");
    }
  };

  const handleSubmit = async () => {
    if (!submitId) return;
    try {
      await submitRequest.mutateAsync(submitId);
      toast.success("Request submitted for approval");
      setSubmitId(null);
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRequest.mutateAsync(deleteId);
      toast.success("Request deleted successfully");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Item Requests</h1>
          <p className="text-muted-foreground">
            {isDepartmentUser
              ? "Submit requests for items you need"
              : "Manage item requests from departments"}
          </p>
        </div>
        {(isDepartmentUser ||
          user?.role === "admin" ||
          user?.role === "warehouse_staff") && (
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : filteredRequests.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No requests found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Required Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.requestNumber}
                      </TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{r.requestedBy}</TableCell>
                      <TableCell>
                        {format(new Date(r.requiredDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {r.status === "DRAFT" && (
                        
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(r)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSubmitId(r.id)}
                              >
                                <Send className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(r.id)}
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
              {editingRequest ? "Edit Request" : "New Item Request"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Your department"
                  // readOnly={department}
                />
              </div>
              <div className="space-y-2">
                <Label>Requested By</Label>
                <Input
                  value={formData.requestedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedBy: e.target.value })
                  }
                  placeholder="Your name"
                  readOnly={isDepartmentUser}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Required Date</Label>
              <Input
                type="date"
                value={formData.requiredDate}
                onChange={(e) =>
                  setFormData({ ...formData, requiredDate: e.target.value })
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
                placeholder="Additional notes or justification..."
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
              {editingRequest ? "Update" : "Create"} as Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Request Number
                  </Label>
                  <p className="font-medium">
                    {viewingRequest.requestNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={viewingRequest.status} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Department</Label>
                  <p className="font-medium">{viewingRequest.department}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested By</Label>
                  <p className="font-medium">{viewingRequest.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Required Date</Label>
                  <p className="font-medium">
                    {format(
                      new Date(viewingRequest.requiredDate),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>
              </div>

              {viewingRequest.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p>{viewingRequest.notes}</p>
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
                      {viewingRequest.items.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{getItemName(item.itemId)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {viewingRequest.status === "APPROVED" &&
                viewingRequest.signatureImage && (
                  <div>
                    <Label className="text-muted-foreground">
                      Approval Signature
                    </Label>
                    <div className="border rounded-lg p-2 mt-2 bg-card">
                      <img
                        src={viewingRequest.signatureImage}
                        alt="Signature"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Approved by {getUserName(viewingRequest.approvedBy || "")}{" "}
                      on{" "}
                      {viewingRequest.approvedAt &&
                        format(
                          new Date(viewingRequest.approvedAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                    </p>
                  </div>
                )}

              {viewingRequest.status === "REJECTED" && (
                console.log(viewingRequest),
                <div>
                  <Label className="text-muted-foreground">
                    Rejection Reason
                  </Label>
                  <p className="text-destructive">
                    {viewingRequest.rejectReason}
                  </p>
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
              Are you sure you want to submit this request for approval? You
              won't be able to edit it after submission.
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
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this request? This action cannot
              be undone.
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

export default ItemRequests;
