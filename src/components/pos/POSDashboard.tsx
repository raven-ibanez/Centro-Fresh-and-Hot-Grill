import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Coffee,
  Utensils,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useInventory } from '../../hooks/useInventory';
import { useCustomers } from '../../hooks/useCustomers';
import OrderList from './OrderList';
import OrderForm from './OrderForm';
import CustomerManager from './CustomerManager';
import InventoryManager from './InventoryManager';
import SalesAnalytics from './SalesAnalytics';

const POSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'new-order' | 'customers' | 'inventory' | 'analytics'>('orders');
  const { orders, getTodaysOrders, getOrdersByStatus, clearAllData } = useOrders();
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { getInventoryStats, getLowStockItems } = useInventory();
  const { customers } = useCustomers();

  const todaysOrders = getTodaysOrders();
  const pendingOrders = getOrdersByStatus('pending');
  const preparingOrders = getOrdersByStatus('preparing');
  const readyOrders = getOrdersByStatus('ready');
  const completedOrders = getOrdersByStatus('completed');

  const inventoryStats = getInventoryStats();
  const lowStockItems = getLowStockItems();

  const todaysRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = completedOrders.length > 0 ? todaysRevenue / completedOrders.length : 0;

  const handleClearAllData = async () => {
    try {
      setIsClearing(true);
      await clearAllData();
      setShowClearDataModal(false);
      alert('All POS data has been cleared successfully.');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: todaysOrders.length },
    { id: 'new-order', label: 'New Order', icon: Plus, count: null },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'inventory', label: 'Inventory', icon: Package, count: lowStockItems.length },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Coffee className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-playfair font-semibold text-black">POS System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <button
                onClick={() => setShowClearDataModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                title="Clear All POS Data"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₱{todaysRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{todaysOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-semibold text-gray-900">₱{averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-600 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-semibold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-2xl font-semibold text-blue-600">{preparingOrders.length}</p>
              </div>
              <Utensils className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready</p>
                <p className="text-2xl font-semibold text-green-600">{readyOrders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-600">{completedOrders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tab.id === 'inventory' && tab.count > 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm">
          {activeTab === 'orders' && <OrderList />}
          {activeTab === 'new-order' && <OrderForm onOrderCreated={() => setActiveTab('orders')} />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'analytics' && <SalesAnalytics />}
        </div>
      </div>

      {/* Clear All Data Confirmation Modal */}
      {showClearDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear All POS Data</h3>
                </div>
                <button
                  onClick={() => setShowClearDataModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  This action will permanently delete <strong>ALL</strong> orders and order data from the POS system. This includes:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• All orders (pending, completed, cancelled)</li>
                  <li>• All order items and details</li>
                  <li>• All order history and analytics data</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ This action cannot be undone!
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearDataModal(false)}
                  disabled={isClearing}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isClearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Clear All Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSDashboard;
