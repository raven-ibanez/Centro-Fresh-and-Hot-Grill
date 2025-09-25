import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  X, 
  Search, 
  ShoppingCart, 
  User, 
  CreditCard,
  Home,
  Truck,
  Monitor,
  Clock
} from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import { useCustomers } from '../../hooks/useCustomers';
import { useOrders } from '../../hooks/useOrders';
import { MenuItem, CartItem } from '../../types';

interface OrderFormProps {
  onOrderCreated: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const { menuItems } = useMenu();
  const { customers, searchCustomers } = useCustomers();
  const { createOrder } = useOrders();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery' | 'online'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [partySize, setPartySize] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'grilled', name: 'Grilled Specialties' },
    { id: 'rice-meals', name: 'Rice Meals' },
    { id: 'noodles', name: 'Noodles & Pasta' },
    { id: 'beverages', name: 'Beverages' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const filteredCustomers = searchCustomers(customerSearch);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => 
      item.id === menuItem.id && 
      JSON.stringify(item.selectedVariation) === JSON.stringify(undefined) &&
      JSON.stringify(item.selectedAddOns) === JSON.stringify([])
    );

    if (existingItem) {
      updateCartQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const cartItem: CartItem = {
        ...menuItem,
        quantity: 1,
        selectedVariation: undefined,
        selectedAddOns: [],
        totalPrice: menuItem.basePrice
      };
      setCart([...cart, cartItem]);
    }
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(cart.map(item => {
      if (item.id === itemId) {
        const basePrice = item.selectedVariation ? 
          item.basePrice + item.selectedVariation.price : 
          item.basePrice;
        const addOnPrice = item.selectedAddOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
        const totalPrice = (basePrice + addOnPrice) * quantity;
        
        return { ...item, quantity, totalPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateItemVariation = (itemId: string, variation: any) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const basePrice = variation ? item.basePrice + variation.price : item.basePrice;
        const addOnPrice = item.selectedAddOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
        const totalPrice = (basePrice + addOnPrice) * item.quantity;
        
        return { 
          ...item, 
          selectedVariation: variation, 
          totalPrice 
        };
      }
      return item;
    }));
  };

  const updateItemAddOns = (itemId: string, addOns: any[]) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const basePrice = item.selectedVariation ? 
          item.basePrice + item.selectedVariation.price : 
          item.basePrice;
        const addOnPrice = addOns.reduce((sum, addon) => sum + addon.price, 0);
        const totalPrice = (basePrice + addOnPrice) * item.quantity;
        
        return { 
          ...item, 
          selectedAddOns: addOns, 
          totalPrice 
        };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.12; // 12% VAT
  };

  const calculateServiceCharge = () => {
    return orderType === 'dine-in' ? calculateSubtotal() * 0.10 : 0; // 10% service charge for dine-in
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateServiceCharge();
  };

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to the cart');
      return;
    }

    try {
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        order_type: orderType,
        service_type: orderType === 'dine-in' ? 'dine-in' : orderType === 'delivery' ? 'delivery' : 'pickup',
        customer_name: selectedCustomer ? 
          `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : 
          'Walk-in Customer',
        customer_phone: selectedCustomer?.phone || null,
        customer_email: selectedCustomer?.email || null,
        table_number: orderType === 'dine-in' ? tableNumber : null,
        party_size: orderType === 'dine-in' ? partySize : 1,
        order_notes: orderNotes,
        delivery_address: orderType === 'delivery' ? deliveryAddress : null,
        subtotal: calculateSubtotal(),
        tax_amount: calculateTax(),
        service_charge: calculateServiceCharge(),
        total_amount: calculateTotal(),
        payment_status: 'pending' as const,
        payment_method: paymentMethod,
      };

      const order = await createOrder(orderData);
      
      // Add order items
      for (const cartItem of cart) {
        await createOrderItem(order.id, cartItem);
      }

      alert('Order created successfully!');
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setTableNumber('');
      setPartySize(1);
      setDeliveryAddress('');
      setOrderNotes('');
      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const createOrderItem = async (orderId: string, cartItem: CartItem) => {
    // This would be implemented to add items to the order
    // For now, we'll just log it
    console.log('Creating order item:', { orderId, cartItem });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Selection */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-playfair font-semibold text-black mb-4">
            Menu Items
          </h2>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <p className="text-sm font-medium text-green-600 mt-2">
                      ₱{item.basePrice}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="ml-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart and Order Details */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-playfair font-semibold text-black mb-4">
            Order Details
          </h2>

          {/* Customer Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {customerSearch && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearch(`${customer.first_name} ${customer.last_name}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dine-in', label: 'Dine-in', icon: Home },
                { id: 'takeout', label: 'Takeout', icon: Truck },
                { id: 'delivery', label: 'Delivery', icon: Truck },
                { id: 'online', label: 'Online', icon: Monitor }
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setOrderType(type.id as any)}
                    className={`flex items-center justify-center space-x-2 p-3 border rounded-lg ${
                      orderType === type.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Specific Fields */}
          {orderType === 'dine-in' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., T01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Size
                </label>
                <input
                  type="number"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          )}

          {orderType === 'delivery' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter delivery address..."
              />
            </div>
          )}

          {/* Cart Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cart ({cart.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={`${item.id}-${JSON.stringify(item.selectedVariation)}-${JSON.stringify(item.selectedAddOns)}`} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      {item.selectedVariation && (
                        <p className="text-sm text-gray-500">{item.selectedVariation.name}</p>
                      )}
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Add-ons: {item.selectedAddOns.map(addon => addon.name).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-medium text-green-600">
                        ₱{item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (12%):</span>
                <span>₱{calculateTax().toFixed(2)}</span>
              </div>
              {calculateServiceCharge() > 0 && (
                <div className="flex justify-between">
                  <span>Service Charge (10%):</span>
                  <span>₱{calculateServiceCharge().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₱{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Order Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Notes
            </label>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Special instructions..."
            />
          </div>

          {/* Create Order Button */}
          <button
            onClick={handleCreateOrder}
            disabled={cart.length === 0}
            className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
