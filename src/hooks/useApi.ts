import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  userApi, 
  categoryApi, 
  itemApi, 
  supplierApi, 
  incomingGoodsApi, 
  outgoingGoodsApi, 
  itemRequestApi, 
  purchaseOrderApi, 
  stockMovementApi,
  dashboardApi,
} from '@/lib/api';
import { 
  User, 
  Category, 
  Item, 
  Supplier, 
  IncomingGoods, 
  OutgoingGoods, 
  ItemRequest, 
  PurchaseOrder 
} from '@/types';

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  categories: ['categories'] as const,
  items: ['items'] as const,
  suppliers: ['suppliers'] as const,
  incomingGoods: ['incomingGoods'] as const,
  outgoingGoods: ['outgoingGoods'] as const,
  itemRequests: ['itemRequests'] as const,
  purchaseOrders: ['purchaseOrders'] as const,
  stockMovements: ['stockMovements'] as const,
  dashboard: ['dashboard'] as const,
};

// Users Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: userApi.getAll,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) => userApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
};

// Categories Hooks
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: categoryApi.getAll,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) => categoryApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
    },
  });
};

// Items Hooks
export const useItems = () => {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: itemApi.getAll,
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: [...queryKeys.items, 'lowStock'],
    queryFn: itemApi.getLowStock,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => itemApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Item> }) => itemApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

// Suppliers Hooks
export const useSuppliers = () => {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: supplierApi.getAll,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) => supplierApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
    },
  });
};

// Incoming Goods Hooks
export const useIncomingGoods = () => {
  return useQuery({
    queryKey: queryKeys.incomingGoods,
    queryFn: incomingGoodsApi.getAll,
  });
};

export const useCreateIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IncomingGoods, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>) =>
      incomingGoodsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
    },
  });
};

export const useUpdateIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<IncomingGoods> }) =>
      incomingGoodsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
    },
  });
};

export const useSubmitIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomingGoodsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
    },
  });
};

export const useApproveIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, signature , items, status}: { id: string; userId: string; signature: string, items: any, status: any }) =>
      incomingGoodsApi.approve(id, userId, signature, items, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useRejectIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, reason, status }: { id: string; userId: string; reason: string, status:string }) =>
      incomingGoodsApi.reject(id, userId, reason, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
    },
  });
};

export const useDeleteIncomingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incomingGoodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incomingGoods });
    },
  });
};

// Outgoing Goods Hooks
export const useOutgoingGoods = () => {
  return useQuery({
    queryKey: queryKeys.outgoingGoods,
    queryFn: outgoingGoodsApi.getAll,
  });
};

export const useCreateOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<OutgoingGoods, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>) =>
      outgoingGoodsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
    },
  });
};

export const useUpdateOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<OutgoingGoods> }) =>
      outgoingGoodsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
    },
  });
};

export const useSubmitOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outgoingGoodsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
    },
  });
};

export const useApproveOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, signature, status, items }: { id: string; userId: string; signature: string, status: any, items: any }) =>
      outgoingGoodsApi.approve(id, userId, signature, status, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useRejectOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, reason, status }: { id: string; userId: string; reason: string, status: string }) =>
      outgoingGoodsApi.reject(id, userId, reason, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
    },
  });
};

export const useDeleteOutgoingGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outgoingGoodsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.outgoingGoods });
    },
  });
};

// Item Request Hooks
export const useItemRequests = () => {
  return useQuery({
    queryKey: queryKeys.itemRequests,
    queryFn: itemRequestApi.getAll,
  });
};

export const useCreateItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ItemRequest, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>) =>
      itemRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
    },
  });
};

export const useUpdateItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ItemRequest> }) =>
      itemRequestApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
    },
  });
};

export const useSubmitItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemRequestApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
    },
  });
};

export const useApproveItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, signature, status, items }: { id: string; userId: string; signature: string, status: string, items: any }) =>
      itemRequestApi.approve(id, userId, signature, status, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useRejectItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, reason, status }: { id: string; userId: string; reason: string, status: string }) =>
      itemRequestApi.reject(id, userId, reason, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
    },
  });
};

export const useDeleteItemRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemRequests });
    },
  });
};

// Purchase Order Hooks
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: queryKeys.purchaseOrders,
    queryFn: purchaseOrderApi.getAll,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PurchaseOrder, 'id' | 'transactionNumber' | 'status' | 'createdAt' | 'updatedAt'>) =>
      purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PurchaseOrder> }) =>
      purchaseOrderApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    },
  });
};

export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, signature, status, items }: { id: string; userId: string; signature: string, status: string, items:any }) =>
      purchaseOrderApi.approve(id, userId, signature, status, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.stockMovements });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, reason, status }: { id: string; userId: string; reason: string, status }) =>
      purchaseOrderApi.reject(id, userId, reason, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
    },
  });
};

// Stock Movement Hooks
export const useStockMovements = () => {
  return useQuery({
    queryKey: queryKeys.stockMovements,
    queryFn: stockMovementApi.getAll,
  });
};

export const useStockMovementsByItem = (itemId: string) => {
  return useQuery({
    queryKey: [...queryKeys.stockMovements, itemId],
    queryFn: () => stockMovementApi.getByItemId(itemId),
    enabled: !!itemId,
  });
};

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.getStats,
  });
};
