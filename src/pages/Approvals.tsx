import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useIncomingGoods,
  useOutgoingGoods,
  useItemRequests,
  usePurchaseOrders,
  useItems,
  useSuppliers,
  useUsers,
  useApproveIncomingGoods,
  useRejectIncomingGoods,
  useApproveOutgoingGoods,
  useRejectOutgoingGoods,
  useApproveItemRequest,
  useRejectItemRequest,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
} from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { format } from "date-fns";

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const { data: incomingGoods = [] } = useIncomingGoods();
  const { data: outgoingGoods = [] } = useOutgoingGoods();
  const { data: itemRequests = [] } = useItemRequests();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: items = [] } = useItems();
  const { data: suppliers = [] } = useSuppliers();
  const { data: users = [] } = useUsers();

  const approveIncoming = useApproveIncomingGoods();
  const rejectIncoming = useRejectIncomingGoods();
  const approveOutgoing = useApproveOutgoingGoods();
  const rejectOutgoing = useRejectOutgoingGoods();
  const approveRequest = useApproveItemRequest();
  const rejectRequest = useRejectItemRequest();
  const approvePO = useApprovePurchaseOrder();
  const rejectPO = useRejectPurchaseOrder();

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectedItems, setRejectedItems] = useState<Set<string>>(new Set());

  const pendingIncoming = incomingGoods.filter(
    (t) => t.status === "WAITING_APPROVAL"
  );
  const pendingOutgoing = outgoingGoods.filter(
    (t) => t.status === "WAITING_APPROVAL"
  );
  const pendingRequests = itemRequests.filter(
    (t) => t.status === "WAITING_APPROVAL"
  );
  const pendingPOs = purchaseOrders.filter(
    (t) => t.status === "WAITING_APPROVAL"
  );

  const getItemName = (itemId: string) =>
    items.find((i) => i.id === itemId)?.name || "Unknown";
  const getSupplierName = (supplierId: string) =>
    suppliers.find((s) => s.id === supplierId)?.name || "Unknown";
  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || "Unknown";

  const openApproveDialog = (transaction: any, type: string) => {
    setSelectedTransaction(transaction);
    setTransactionType(type);
    setSignature("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (transaction: any, type: string) => {
    setSelectedTransaction(transaction);
    setTransactionType(type);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const toggleRejectItem = (itemId: string) => {
    setRejectedItems((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleApprove = async () => {
    console.log("//././",rejectedItems)
    if (!signature) {
      toast.error("Please provide your signature");
      return;
    }
    try {
      const params = {
        id: selectedTransaction.id,
        userId: user?.id || "",
        signature,
        items:  Array.from(rejectedItems),
        status: "APPROVED",
      };


      console.log(params)
      if (transactionType === "incoming")
        await approveIncoming.mutateAsync(params);
      else if (transactionType === "outgoing")
        await approveOutgoing.mutateAsync(params);
      else if (transactionType === "request")
        await approveRequest.mutateAsync(params);
      else if (transactionType === "purchase")
        await approvePO.mutateAsync(params);
      toast.success("Transaction approved successfully");
      setIsApproveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to approve transaction");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      const params = {
        id: selectedTransaction.id,
        userId: user?.id || "",
        reason: rejectionReason,
        status: "REJECTED",
      };
      if (transactionType === "incoming")
        await rejectIncoming.mutateAsync(params);
      else if (transactionType === "outgoing")
        await rejectOutgoing.mutateAsync(params);
      else if (transactionType === "request")
        await rejectRequest.mutateAsync(params);
      else if (transactionType === "purchase")
        await rejectPO.mutateAsync(params);
      toast.success("Transaction rejected");
      setIsRejectDialogOpen(false);
    } catch (error) {
      toast.error("Failed to reject transaction");
    }
  };

  const TransactionTable = ({ data, type }: { data: any[]; type: string }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead className="w-[120px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center text-muted-foreground py-8"
            >
              No pending approvals
            </TableCell>
          </TableRow>
        ) : (
          data.map((t) => (
            console.log("asdasda",t),
            <TableRow key={t.id}>
              <TableCell className="font-medium">
                {t.requestNumber || t.orderNumber || t.transactionNumber}
              </TableCell>
              <TableCell>
                {format(new Date(t.createdAt), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{t.items?.length || 0} items</TableCell>
              <TableCell>{t.createdBy?.name || t.receivedBy?.name || t.issuedBy?.name || t.approvedBy?.name || "unknown"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openApproveDialog(t, type)}
                  >
                    <Check className="h-4 w-4 text-status-approved" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openRejectDialog(t, type)}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve pending transactions
        </p>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">
            Incoming ({pendingIncoming.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing ({pendingOutgoing.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="purchase">
            Purchase ({pendingPOs.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="incoming">
          <Card>
            <CardContent className="pt-6">
              <TransactionTable data={pendingIncoming} type="incoming" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outgoing">
          <Card>
            <CardContent className="pt-6">
              <TransactionTable data={pendingOutgoing} type="outgoing" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardContent className="pt-6">
              <TransactionTable data={pendingRequests} type="request" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchase">
          <Card>
            <CardContent className="pt-6">
              <TransactionTable data={pendingPOs} type="purchase" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Transaction</Label>
                <p className="font-medium">
                  {selectedTransaction.transactionNumber}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Items</Label>
                <ul className="text-sm mt-1 space-y-4 flex-row ">
                  {selectedTransaction.items?.map((item: any) => (
                    <li
                      key={item.itemId}
                      className={`${
                        rejectedItems.has(item.itemId) ? "line-through bg-red-100" : ""
                      } 
                      
                      flex flex-row justify-between items-center bg-gray-200 p-2 rounded-lg font-semibold
                      `}
                    >
                      {getItemName(item.itemId)} x {item.quantity}
                      <span>
                        <Button
                          variant={`${
                            rejectedItems.has(item.itemId)
                              ? "outline" 
                              : "destructive"
                          }`}
                          // className="border-red-500 border rounded-lg px-3 py-2 mx-4"
                          onClick={() => toggleRejectItem(item.itemId)}
                        >
                          {rejectedItems.has(item.itemId)
                            ? "Undo Reject"
                            : "Reject"}
                        </Button>

                        {/* <button>Approve</button> */}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <SignatureCanvas onSave={setSignature} />
              {signature && (
                <p className="text-sm text-status-approved">
                  Signature captured
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={!signature}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
