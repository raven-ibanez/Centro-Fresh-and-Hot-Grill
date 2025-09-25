import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface InventoryItem {
  id: string;
  item_name: string;
  item_code: string | null;
  category: string | null;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  unit_cost: number | null;
  supplier: string | null;
  location: string | null;
  expiry_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  transaction_type: 'in' | 'out' | 'adjustment' | 'waste' | 'transfer';
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  reference_type: string | null;
  reference_id: string | null;
  reason: string | null;
  notes: string | null;
  processed_by: string | null;
  created_at: string;
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      
      const { data, error: inventoryError } = await supabase
        .from('inventory')
        .select('*')
        .order('item_name', { ascending: true });

      if (inventoryError) throw inventoryError;

      setInventory(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (inventoryId?: string) => {
    try {
      let query = supabase
        .from('inventory_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (inventoryId) {
        query = query.eq('inventory_id', inventoryId);
      }

      const { data, error: transactionsError } = await query;

      if (transactionsError) throw transactionsError;

      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    }
  };

  const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;

      await fetchInventory();
      return data;
    } catch (err) {
      console.error('Error creating inventory item:', err);
      throw err;
    }
  };

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchInventory();
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchInventory();
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      throw err;
    }
  };

  const addTransaction = async (transactionData: Omit<InventoryTransaction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;

      // Update inventory stock
      const { data: inventoryItem } = await supabase
        .from('inventory')
        .select('current_stock')
        .eq('id', transactionData.inventory_id)
        .single();

      if (inventoryItem) {
        const newStock = inventoryItem.current_stock + transactionData.quantity;
        await supabase
          .from('inventory')
          .update({ current_stock: newStock })
          .eq('id', transactionData.inventory_id);
      }

      await fetchInventory();
      await fetchTransactions();
      return data;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const getLowStockItems = () => {
    return inventory.filter(item => 
      item.is_active && item.current_stock <= item.minimum_stock
    );
  };

  const getExpiringItems = (days: number = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return inventory.filter(item => 
      item.is_active && 
      item.expiry_date && 
      new Date(item.expiry_date) <= futureDate
    );
  };

  const getInventoryByCategory = (category: string) => {
    return inventory.filter(item => 
      item.is_active && item.category === category
    );
  };

  const searchInventory = (query: string) => {
    if (!query.trim()) return inventory;
    
    return inventory.filter(item => 
      item.item_name.toLowerCase().includes(query.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const activeItems = inventory.filter(item => item.is_active).length;
    const lowStockItems = getLowStockItems().length;
    const expiringItems = getExpiringItems().length;
    
    const totalValue = inventory.reduce((sum, item) => {
      return sum + (item.current_stock * (item.unit_cost || 0));
    }, 0);

    return {
      totalItems,
      activeItems,
      lowStockItems,
      expiringItems,
      totalValue,
    };
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, []);

  return {
    inventory,
    transactions,
    loading,
    error,
    fetchInventory,
    fetchTransactions,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction,
    getLowStockItems,
    getExpiringItems,
    getInventoryByCategory,
    searchInventory,
    getInventoryStats,
  };
};
