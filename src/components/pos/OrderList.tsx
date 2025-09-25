import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Utensils,
  Truck,
  Home,
  Monitor,
  X,
  ShoppingCart
} from 'lucide-react';
import { useOrders, OrderWithItems } from '../../hooks/useOrders';

const OrderList: React.FC = () => {
  const { orders, updateOrderStatus, updateOrder, deleteOrder, loading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'preparing':
        return <Utensils className="h-4 w-4 text-orange-600" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'served':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'dine-in':
        return <Home className="h-4 w-4 text-blue-600" />;
      case 'takeout':
        return <Truck className="h-4 w-4 text-green-600" />;
      case 'delivery':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'online':
        return <Monitor className="h-4 w-4 text-indigo-600" />;
      default:
        return <Home className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, newStatus as any);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditOrder = (order: OrderWithItems) => {
    setEditingOrder(order);
  };

  const handleSaveOrder = async (updatedOrder: Partial<OrderWithItems>) => {
    if (!editingOrder) return;
    
    try {
      setIsUpdating(true);
      await updateOrder(editingOrder.id, updatedOrder);
      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsUpdating(true);
      // Update order status to cancelled instead of actually deleting
      await updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompletedOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to permanently delete completed order ${orderNumber}? This action cannot be undone and will remove the order from the database.`)) {
      return;
    }

    try {
      setIsUpdating(true);
      await deleteOrder(orderId);
      alert('Order has been permanently deleted.');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-semibold text-black mb-4 md:mb-0">
          Orders ({filteredOrders.length})
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.table_number && `Table ${order.table_number}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer_name || 'Walk-in Customer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getOrderTypeIcon(order.order_type)}
                    <span className="text-sm text-gray-900 capitalize">
                      {order.order_type.replace('-', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ₱{order.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.order_time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {order.status === 'completed' ? (
                      <button
                        onClick={() => handleDeleteCompletedOrder(order.id, order.order_number)}
                        disabled={isUpdating}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Delete Order Permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : order.status !== 'cancelled' ? (
                      <>
                        <button
                          onClick={() => handleEditOrder(order)}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.order_number)}
                          disabled={isUpdating}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 disabled:opacity-50"
                          title="Cancel Order"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={isUpdating}
                          className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Number</label>
                    <p className="text-sm text-gray-900">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedOrder.status}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.customer_name || 'Walk-in Customer'}
                  </p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-gray-500">{selectedOrder.customer_phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Order Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{item.item_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">₱{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold">₱{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Order</h3>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={editingOrder.order_number}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingOrder.status}
                      onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={editingOrder.customer_name || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, customer_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                    <input
                      type="text"
                      value={editingOrder.customer_phone || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, customer_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select
                      value={editingOrder.order_type}
                      onChange={(e) => setEditingOrder({...editingOrder, order_type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="dine-in">Dine In</option>
                      <option value="takeout">Takeout</option>
                      <option value="delivery">Delivery</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                    <input
                      type="text"
                      value={editingOrder.table_number || ''}
                      onChange={(e) => setEditingOrder({...editingOrder, table_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes</label>
                  <textarea
                    value={editingOrder.order_notes || ''}
                    onChange={(e) => setEditingOrder({...editingOrder, order_notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveOrder(editingOrder)}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
