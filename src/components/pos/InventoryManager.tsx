import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Truck,
  X
} from 'lucide-react';
import { useInventory, InventoryItem, InventoryTransaction } from '../../hooks/useInventory';

const InventoryManager: React.FC = () => {
  const { 
    inventory, 
    transactions, 
    createInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem, 
    addTransaction,
    getLowStockItems,
    getExpiringItems,
    getInventoryStats,
    searchInventory
  } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    item_name: '',
    item_code: '',
    category: '',
    unit: 'kg',
    current_stock: 0,
    minimum_stock: 0,
    maximum_stock: null,
    unit_cost: null,
    supplier: '',
    location: '',
    expiry_date: null,
    is_active: true,
    notes: ''
  });
  const [transactionData, setTransactionData] = useState<Partial<InventoryTransaction>>({
    transaction_type: 'in',
    quantity: 0,
    unit_cost: null,
    reason: '',
    notes: ''
  });

  const categories = [
    'all', 'Grains', 'Meat', 'Vegetables', 'Cooking', 'Sauces', 'Citrus', 
    'Noodles', 'Beverages', 'Spices', 'Seafood', 'Poultry'
  ];

  const filteredInventory = searchInventory(searchTerm).filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const lowStockItems = getLowStockItems();
  const expiringItems = getExpiringItems();
  const stats = getInventoryStats();

  const handleCreateItem = async () => {
    try {
      await createInventoryItem(formData as Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>);
      setShowForm(false);
      setFormData({
        item_name: '',
        item_code: '',
        category: '',
        unit: 'kg',
        current_stock: 0,
        minimum_stock: 0,
        maximum_stock: null,
        unit_cost: null,
        supplier: '',
        location: '',
        expiry_date: null,
        is_active: true,
        notes: ''
      });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Failed to create inventory item');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    
    try {
      await updateInventoryItem(selectedItem.id, formData);
      setSelectedItem(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (confirm(`Are you sure you want to delete ${item.item_name}?`)) {
      try {
        await deleteInventoryItem(item.id);
      } catch (error) {
        console.error('Error deleting inventory item:', error);
        alert('Failed to delete inventory item');
      }
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleAddTransaction = async () => {
    if (!selectedItem) return;
    
    try {
      await addTransaction({
        ...transactionData,
        inventory_id: selectedItem.id,
        quantity: transactionData.transaction_type === 'in' ? 
          Math.abs(transactionData.quantity || 0) : 
          -Math.abs(transactionData.quantity || 0)
      } as Omit<InventoryTransaction, 'id' | 'created_at'>);
      
      setShowTransactionForm(false);
      setTransactionData({
        transaction_type: 'in',
        quantity: 0,
        unit_cost: null,
        reason: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.current_stock <= item.minimum_stock) {
      return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (item.maximum_stock && item.current_stock >= item.maximum_stock) {
      return { status: 'high', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getExpiryStatus = (item: InventoryItem) => {
    if (!item.expiry_date) return null;
    
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', color: 'text-red-600' };
    if (diffDays <= 7) return { status: 'expiring', color: 'text-orange-600' };
    return { status: 'good', color: 'text-green-600' };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-semibold text-black mb-4 md:mb-0">
          Inventory Management
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Add Item Button */}
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedItem(null);
              setFormData({
                item_name: '',
                item_code: '',
                category: '',
                unit: 'kg',
                current_stock: 0,
                minimum_stock: 0,
                maximum_stock: null,
                unit_cost: null,
                supplier: '',
                location: '',
                expiry_date: null,
                is_active: true,
                notes: ''
              });
            }}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-600 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.expiringItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
              <p className="text-sm text-red-700">
                {lowStockItems.length} item(s) are running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const expiryStatus = getExpiryStatus(item);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                        <div className="text-sm text-gray-500">{item.item_code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.current_stock} {item.unit}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unit_cost ? `₱${item.unit_cost.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.supplier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.expiry_date ? (
                        <span className={expiryStatus?.color}>
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setTransactionData({
                              transaction_type: 'in',
                              quantity: 0,
                              unit_cost: item.unit_cost,
                              reason: '',
                              notes: ''
                            });
                            setShowTransactionForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Add Transaction"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}

      {/* Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.item_name || ''}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Code
                  </label>
                  <input
                    type="text"
                    value={formData.item_code || ''}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(cat => cat !== 'all').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.unit || 'kg'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="liters">Liters (L)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pcs">Pieces</option>
                    <option value="boxes">Boxes</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={formData.current_stock || 0}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    value={formData.minimum_stock || 0}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Stock
                  </label>
                  <input
                    type="number"
                    value={formData.maximum_stock || ''}
                    onChange={(e) => setFormData({ ...formData, maximum_stock: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    value={formData.unit_cost || ''}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date || ''}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedItem ? handleUpdateItem : handleCreateItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {selectedItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Add Transaction</h3>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Item: {selectedItem.item_name}</p>
                <p className="text-sm text-gray-600">Current Stock: {selectedItem.current_stock} {selectedItem.unit}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={transactionData.transaction_type || 'in'}
                    onChange={(e) => setTransactionData({ ...transactionData, transaction_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="in">Stock In (+)</option>
                    <option value="out">Stock Out (-)</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="waste">Waste</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={transactionData.quantity || 0}
                    onChange={(e) => setTransactionData({ ...transactionData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    value={transactionData.unit_cost || ''}
                    onChange={(e) => setTransactionData({ ...transactionData, unit_cost: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={transactionData.reason || ''}
                    onChange={(e) => setTransactionData({ ...transactionData, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Purchase, Sale, Adjustment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={transactionData.notes || ''}
                    onChange={(e) => setTransactionData({ ...transactionData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
