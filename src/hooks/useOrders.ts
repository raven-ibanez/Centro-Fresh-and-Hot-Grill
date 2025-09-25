import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  staff_id: string | null;
  order_type: 'dine-in' | 'takeout' | 'delivery' | 'online';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  service_type: 'dine-in' | 'pickup' | 'delivery';
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  table_number: string | null;
  party_size: number;
  order_notes: string | null;
  delivery_address: string | null;
  delivery_instructions: string | null;
  delivery_fee: number;
  order_time: string;
  estimated_ready_time: string | null;
  actual_ready_time: string | null;
  completed_time: string | null;
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded';
  payment_method: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  item_description: string | null;
  base_price: number;
  selected_variation_id: string | null;
  selected_variation_name: string | null;
  selected_variation_price: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  prepared_by: string | null;
  prepared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email: string | null;
  };
  staff?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          customers (id, first_name, last_name, phone, email),
          staff (id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(data as OrderWithItems[] || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');
      
      const { data, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          order_number: orderNumber,
          order_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      await fetchOrders();
      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchOrders();
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updates: Partial<Order> = { status };
      
      if (status === 'completed') {
        updates.completed_time = new Date().toISOString();
      } else if (status === 'ready') {
        updates.actual_ready_time = new Date().toISOString();
      }

      await updateOrder(id, updates);
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const addOrderItem = async (orderId: string, itemData: Partial<OrderItem>) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert({
          ...itemData,
          order_id: orderId,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
      return data;
    } catch (err) {
      console.error('Error adding order item:', err);
      throw err;
    }
  };

  const updateOrderItem = async (id: string, updates: Partial<OrderItem>) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchOrders();
    } catch (err) {
      console.error('Error updating order item:', err);
      throw err;
    }
  };

  const deleteOrderItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order item:', err);
      throw err;
    }
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const getTodaysOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => 
      order.order_time.startsWith(today)
    );
  };

  const getOrdersByDateRange = (startDate: string, endDate: string) => {
    return orders.filter(order => {
      const orderDate = order.order_time.split('T')[0];
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    addOrderItem,
    updateOrderItem,
    deleteOrderItem,
    getOrdersByStatus,
    getTodaysOrders,
    getOrdersByDateRange,
  };
};
