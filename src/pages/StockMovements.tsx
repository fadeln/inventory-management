import React from 'react';
import { useStockMovements, useItems, useUsers } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const StockMovements: React.FC = () => {
  const { data: movements = [], isLoading } = useStockMovements();
  const { data: items = [] } = useItems();
  const { data: users = [] } = useUsers();

  const getItemName = (itemId: string) => items.find(i => i.id === itemId)?.name || 'Unknown';
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

  const sortedMovements = [...movements].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Movements</h1>
        <p className="text-muted-foreground">View all stock movement history (read-only)</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : sortedMovements.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No stock movements recorded yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Stock (Before → After)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMovements.map((m) => (
                  m.quantityChange =   m.newStock - m.previousStock,
                  <TableRow key={m.id}>
                    <TableCell>{format(new Date(m.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{getItemName(m.itemId)}</TableCell>
                    <TableCell>{m.reference}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1 font-medium ${m.quantityChange > 0 ? 'text-status-approved' : 'text-destructive'}`}>
                        
                        {m.quantityChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {m.quantityChange > 0 ? '+' : ''}{m.quantityChange}
                      </span>
                    </TableCell>
                    <TableCell>{m.previousStock} → {m.newStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovements;
