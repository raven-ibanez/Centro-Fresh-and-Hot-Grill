import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular: boolean;
          available: boolean;
          image_url: string | null;
          discount_price: number | null;
          discount_start_date: string | null;
          discount_end_date: string | null;
          discount_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          base_price: number;
          category: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          discount_price?: number | null;
          discount_start_date?: string | null;
          discount_end_date?: string | null;
          discount_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          base_price?: number;
          category?: string;
          popular?: boolean;
          available?: boolean;
          image_url?: string | null;
          discount_price?: number | null;
          discount_start_date?: string | null;
          discount_end_date?: string | null;
          discount_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      variations: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          created_at?: string;
        };
      };
      add_ons: {
        Row: {
          id: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          name: string;
          price: number;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          name?: string;
          price?: number;
          category?: string;
          created_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          account_number: string;
          account_name: string;
          qr_code_url: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          account_number?: string;
          account_name?: string;
          qr_code_url?: string;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          value: string;
          type: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          value: string;
          type?: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      // POS System Tables
      customers: {
        Row: {
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
          customer_type: string;
          loyalty_points: number;
          total_orders: number;
          total_spent: number;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_code: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          date_of_birth?: string | null;
          customer_type?: string;
          loyalty_points?: number;
          total_orders?: number;
          total_spent?: number;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_code?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          date_of_birth?: string | null;
          customer_type?: string;
          loyalty_points?: number;
          total_orders?: number;
          total_spent?: number;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          staff_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          role: string;
          permissions: any;
          hourly_rate: number | null;
          hire_date: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          staff_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          role: string;
          permissions?: any;
          hourly_rate?: number | null;
          hire_date?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          staff_code?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          role?: string;
          permissions?: any;
          hourly_rate?: number | null;
          hire_date?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          staff_id: string | null;
          order_type: string;
          status: string;
          service_type: string;
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
          payment_status: string;
          payment_method: string | null;
          payment_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          staff_id?: string | null;
          order_type: string;
          status?: string;
          service_type: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          table_number?: string | null;
          party_size?: number;
          order_notes?: string | null;
          delivery_address?: string | null;
          delivery_instructions?: string | null;
          delivery_fee?: number;
          order_time?: string;
          estimated_ready_time?: string | null;
          actual_ready_time?: string | null;
          completed_time?: string | null;
          subtotal?: number;
          tax_amount?: number;
          service_charge?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_status?: string;
          payment_method?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          staff_id?: string | null;
          order_type?: string;
          status?: string;
          service_type?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          table_number?: string | null;
          party_size?: number;
          order_notes?: string | null;
          delivery_address?: string | null;
          delivery_instructions?: string | null;
          delivery_fee?: number;
          order_time?: string;
          estimated_ready_time?: string | null;
          actual_ready_time?: string | null;
          completed_time?: string | null;
          subtotal?: number;
          tax_amount?: number;
          service_charge?: number;
          discount_amount?: number;
          total_amount?: number;
          payment_status?: string;
          payment_method?: string | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
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
          status: string;
          prepared_by: string | null;
          prepared_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          menu_item_id: string;
          item_name: string;
          item_description?: string | null;
          base_price: number;
          selected_variation_id?: string | null;
          selected_variation_name?: string | null;
          selected_variation_price?: number;
          quantity?: number;
          unit_price: number;
          total_price: number;
          special_instructions?: string | null;
          status?: string;
          prepared_by?: string | null;
          prepared_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          menu_item_id?: string;
          item_name?: string;
          item_description?: string | null;
          base_price?: number;
          selected_variation_id?: string | null;
          selected_variation_name?: string | null;
          selected_variation_price?: number;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          special_instructions?: string | null;
          status?: string;
          prepared_by?: string | null;
          prepared_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_item_addons: {
        Row: {
          id: string;
          order_item_id: string;
          addon_id: string;
          addon_name: string;
          addon_price: number;
          addon_category: string | null;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          addon_id: string;
          addon_name: string;
          addon_price: number;
          addon_category?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          addon_id?: string;
          addon_name?: string;
          addon_price?: number;
          addon_category?: string | null;
          quantity?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          payment_method_id: string | null;
          payment_type: string;
          amount: number;
          reference_number: string | null;
          transaction_id: string | null;
          status: string;
          notes: string | null;
          processed_by: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          payment_method_id?: string | null;
          payment_type: string;
          amount: number;
          reference_number?: string | null;
          transaction_id?: string | null;
          status?: string;
          notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          payment_method_id?: string | null;
          payment_type?: string;
          amount?: number;
          reference_number?: string | null;
          transaction_id?: string | null;
          status?: string;
          notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
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
        };
        Insert: {
          id?: string;
          item_name: string;
          item_code?: string | null;
          category?: string | null;
          unit: string;
          current_stock?: number;
          minimum_stock?: number;
          maximum_stock?: number | null;
          unit_cost?: number | null;
          supplier?: string | null;
          location?: string | null;
          expiry_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          item_code?: string | null;
          category?: string | null;
          unit?: string;
          current_stock?: number;
          minimum_stock?: number;
          maximum_stock?: number | null;
          unit_cost?: number | null;
          supplier?: string | null;
          location?: string | null;
          expiry_date?: string | null;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          inventory_id: string;
          transaction_type: string;
          quantity: number;
          unit_cost: number | null;
          total_cost: number | null;
          reference_type: string | null;
          reference_id: string | null;
          reason: string | null;
          notes: string | null;
          processed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inventory_id: string;
          transaction_type: string;
          quantity: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          reference_type?: string | null;
          reference_id?: string | null;
          reason?: string | null;
          notes?: string | null;
          processed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inventory_id?: string;
          transaction_type?: string;
          quantity?: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          reference_type?: string | null;
          reference_id?: string | null;
          reason?: string | null;
          notes?: string | null;
          processed_by?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_code: string;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          payment_method: string | null;
          reference_number: string | null;
          vendor: string | null;
          receipt_url: string | null;
          approved_by: string | null;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          expense_code: string;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          payment_method?: string | null;
          reference_number?: string | null;
          vendor?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          expense_code?: string;
          category?: string;
          description?: string;
          amount?: number;
          expense_date?: string;
          payment_method?: string | null;
          reference_number?: string | null;
          vendor?: string | null;
          receipt_url?: string | null;
          approved_by?: string | null;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          report_type: string;
          report_name: string;
          report_data: any;
          date_from: string | null;
          date_to: string | null;
          generated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_type: string;
          report_name: string;
          report_data: any;
          date_from?: string | null;
          date_to?: string | null;
          generated_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_type?: string;
          report_name?: string;
          report_data?: any;
          date_from?: string | null;
          date_to?: string | null;
          generated_by?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          action_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          title: string;
          message: string;
          type?: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          action_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
};