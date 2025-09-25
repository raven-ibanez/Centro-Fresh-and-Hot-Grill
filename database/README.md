# Centro Fresh and Hot Grill - POS System Database

This database schema extends your existing menu system to support a complete Point of Sale (POS) system for your restaurant.

## 🗄️ Database Overview

The POS system includes the following main components:

### Core Tables
- **Menu System** (existing): `menu_items`, `variations`, `add_ons`, `categories`
- **Customer Management**: `customers` - Track customer information and loyalty
- **Staff Management**: `staff` - Manage employees and their roles
- **Order Management**: `orders`, `order_items`, `order_item_addons` - Complete order tracking
- **Payment Processing**: `payments` - Track all payment transactions
- **Inventory Management**: `inventory`, `inventory_transactions` - Stock tracking
- **Business Operations**: `expenses`, `reports`, `notifications` - Business analytics

## 🚀 Quick Setup

### 1. Run the Database Schema

```sql
-- First, run the main schema
\i database/pos_schema.sql

-- Then run the migration script
\i database/migration_script.sql
```

### 2. Environment Variables

Make sure your `.env` file has the Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Verify Installation

Check if all tables were created successfully:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'customers', 'staff', 'orders', 'order_items', 'order_item_addons',
    'payments', 'inventory', 'inventory_transactions', 'expenses',
    'reports', 'notifications'
);
```

## 📊 Key Features

### Order Management
- **Order Types**: Dine-in, Takeout, Delivery, Online
- **Order Status**: Pending → Confirmed → Preparing → Ready → Served → Completed
- **Service Types**: Dine-in, Pickup, Delivery
- **Order Tracking**: Complete order lifecycle with timestamps

### Customer Management
- **Customer Profiles**: Contact info, preferences, loyalty points
- **Customer Types**: Regular, VIP, Wholesale
- **Order History**: Track all customer orders and spending

### Staff Management
- **Role-Based Access**: Admin, Manager, Cashier, Kitchen, Waiter, Delivery
- **Permissions**: Granular control over system access
- **Activity Tracking**: Login times, order processing

### Payment Processing
- **Multiple Payment Methods**: Cash, GCash, Maya, Bank Transfer, Credit/Debit Cards
- **Payment Tracking**: Reference numbers, transaction IDs
- **Payment Status**: Pending, Completed, Failed, Refunded

### Inventory Management
- **Stock Tracking**: Current stock, minimum/maximum levels
- **Transaction History**: All inventory movements (in/out/adjustments)
- **Low Stock Alerts**: Automatic notifications when stock is low
- **Supplier Management**: Track suppliers and costs

### Business Analytics
- **Sales Reports**: Daily, monthly, yearly sales summaries
- **Top Selling Items**: Most popular menu items
- **Customer Analytics**: Customer spending patterns
- **Inventory Reports**: Stock levels and usage

## 🔧 Database Functions

### Built-in Functions

1. **`generate_order_number()`** - Auto-generates order numbers (ORD-2024-001)
2. **`calculate_order_total(order_id)`** - Calculates order totals with tax and service charge
3. **`get_low_stock_alerts()`** - Returns items that need restocking
4. **`update_inventory_on_order_completion()`** - Updates inventory when orders are completed

### Useful Views

1. **`daily_sales_summary`** - Today's sales statistics
2. **`monthly_sales_summary`** - Current month sales
3. **`top_selling_items`** - Most popular menu items
4. **`low_stock_items`** - Items that need restocking

## 📈 Sample Queries

### Get Today's Sales
```sql
SELECT * FROM daily_sales_summary;
```

### Get Low Stock Items
```sql
SELECT * FROM low_stock_items;
```

### Get Order Details with Customer Info
```sql
SELECT 
    o.order_number,
    o.customer_name,
    o.total_amount,
    o.status,
    o.order_time
FROM orders o
WHERE o.order_time >= CURRENT_DATE
ORDER BY o.order_time DESC;
```

### Get Top Selling Items
```sql
SELECT * FROM top_selling_items LIMIT 10;
```

## 🛠️ Configuration

### Site Settings

The system includes configurable settings in the `site_settings` table:

- `pos_tax_rate` - Tax rate (default: 0.12 for 12% VAT)
- `pos_service_charge_rate` - Service charge for dine-in (default: 0.10 for 10%)
- `pos_delivery_fee` - Standard delivery fee (default: 50.00)
- `pos_minimum_order` - Minimum order for delivery (default: 100.00)
- `pos_currency_symbol` - Currency symbol (default: ₱)

### Update Settings

```sql
UPDATE site_settings 
SET value = '0.15' 
WHERE id = 'pos_tax_rate';
```

## 🔐 Security

### Row Level Security (RLS)

The database includes RLS policies for data protection:

- Only authenticated staff can access customer data
- Staff can only view orders they have permission to see
- Payment data is protected with appropriate access controls

### User Roles

- **Admin**: Full system access
- **Manager**: Order management, reports, staff management
- **Cashier**: Order processing, payment handling
- **Kitchen**: Order preparation, inventory updates
- **Waiter**: Order taking, customer service
- **Delivery**: Delivery management

## 📱 Integration with Frontend

The database is designed to work seamlessly with your existing React frontend:

1. **TypeScript Types**: Updated `src/lib/supabase.ts` with all new table types
2. **Hooks**: Create custom hooks for each table (similar to `useMenu`)
3. **Components**: Build POS components that interact with the database

### Example Hook for Orders

```typescript
// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        customers (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, refetch: fetchOrders };
};
```

## 🚨 Important Notes

### Data Migration
- The migration script includes sample data for testing
- Always backup your existing data before running migrations
- Test the migration on a development database first

### Performance
- The database includes proper indexes for optimal performance
- Use the provided views for common queries
- Consider partitioning large tables (orders, order_items) by date for better performance

### Maintenance
- Regular database maintenance is recommended
- Monitor the `inventory_transactions` table for growth
- Archive old orders periodically to maintain performance

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**: Check RLS policies and user authentication
2. **Foreign Key Violations**: Ensure referenced records exist before inserting
3. **Duplicate Key Errors**: Check for unique constraints (order_number, customer_code, etc.)

### Getting Help

- Check the database logs for detailed error messages
- Verify all foreign key relationships are correct
- Ensure all required fields are provided in inserts

## 📋 Next Steps

1. **Run the Migration**: Execute the SQL files in your Supabase database
2. **Test the System**: Use the sample data to test all functionality
3. **Build Frontend Components**: Create React components for POS operations
4. **Configure Settings**: Update site settings for your business needs
5. **Train Staff**: Set up user accounts and train staff on the system

---

**Database Version**: 1.0.0  
**Last Updated**: January 2024  
**Compatible with**: Supabase PostgreSQL 15+
