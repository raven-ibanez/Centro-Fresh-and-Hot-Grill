import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Customer {
  id: string;
  customer_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  date_of_birth: string | null;
  customer_type: 'regular' | 'vip' | 'wholesale';
  loyalty_points: number;
  total_orders: number;
  total_spent: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      const { data, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      setCustomers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate customer code
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('customer_code')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastCode = existingCustomers?.[0]?.customer_code || 'CUST-000';
      const nextNumber = parseInt(lastCode.split('-')[1]) + 1;
      const customerCode = `CUST-${nextNumber.toString().padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          customer_code: customerCode,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCustomers();
      return data;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  const searchCustomers = (query: string) => {
    if (!query.trim()) return customers;
    
    return customers.filter(customer => 
      customer.first_name.toLowerCase().includes(query.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email?.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.includes(query) ||
      customer.customer_code.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const getVipCustomers = () => {
    return customers.filter(customer => customer.customer_type === 'vip');
  };

  const getActiveCustomers = () => {
    return customers.filter(customer => customer.is_active);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerById,
    getVipCustomers,
    getActiveCustomers,
  };
};
