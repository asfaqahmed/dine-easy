import React, { useState, useEffect } from "react";
import { MenuItem } from "@/entities/MenuItem";
import { Customer } from "@/entities/Customer";
import { Order } from "@/entities/Order";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star,
  Clock,
  Phone,
  User,
  CreditCard,
  QrCode
} from "lucide-react";
import { toast } from "sonner";

import MenuItemCard from "../components/menu/MenuItemCard";
import CartSidebar from "../components/menu/CartSidebar";
import CustomerLoginDialog from "../components/menu/CustomerLoginDialog";
import PaymentDialog from "../components/menu/PaymentDialog";

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderType, setOrderType] = useState("dine-in");
  const [tableNumber, setTableNumber] = useState("");

  const categories = [
    { id: "all", name: "All Items", count: 0 },
    { id: "appetizers", name: "Appetizers", count: 0 },
    { id: "mains", name: "Main Courses", count: 0 },
    { id: "desserts", name: "Desserts", count: 0 },
    { id: "beverages", name: "Beverages", count: 0 },
    { id: "specials", name: "Chef's Specials", count: 0 }
  ];

  useEffect(() => {
    loadMenuItems();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    const table = urlParams.get("table");
    
    if (type === "takeaway") {
      setOrderType("takeaway");
    }
    if (table) {
      setTableNumber(table);
      setOrderType("dine-in");
    }
  };

  const loadMenuItems = async () => {
    try {
      const items = await MenuItem.list();
      setMenuItems(items.filter(item => item.is_available));
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (menuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...menuItem, quantity: 1 }];
    });
    toast.success("Added to cart!");
  };

  const updateCartQuantity = (itemId, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    toast.success("Removed from cart");
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    
    if (!customer) {
      setShowLogin(true);
      return;
    }
    
    setShowPayment(true);
  };

  const handleCustomerLogin = async (customerData) => {
    try {
      // Create or find customer
      const newCustomer = await Customer.create({
        ...customerData,
        table_number: orderType === "takeaway" ? "takeaway" : tableNumber || "1"
      });
      setCustomer(newCustomer);
      setShowLogin(false);
      toast.success("Welcome! You can now place your order.");
    } catch (error) {
      toast.error("Failed to register customer");
    }
  };

  const handleOrderSuccess = async (paymentData) => {
    try {
      const orderData = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        table_number: orderType === "takeaway" ? "takeaway" : tableNumber || "1",
        items: cart.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        total_amount: getCartTotal(),
        payment_status: "paid",
        payment_id: paymentData.payment_id,
        order_type: orderType,
        status: "confirmed"
      };

      await Order.create(orderData);
      
      // Clear cart and close dialogs
      setCart([]);
      setShowPayment(false);
      
      toast.success("Order placed successfully! SMS confirmation sent.");
      
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Our Menu</h1>
              <p className="text-gray-600 mt-1">
                {orderType === "takeaway" ? "Order for Takeaway" : `Table ${tableNumber || "Service"}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {customer && (
                <div className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {customer.name}
                </div>
              )}
              <Button
                onClick={() => setShowCart(true)}
                className="relative bg-amber-600 hover:bg-amber-700"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
                {getCartItemsCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500">
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
              cartQuantity={cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
              onUpdateQuantity={(change) => updateCartQuantity(item.id, change)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>

      {/* Floating Checkout Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleCheckout}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 shadow-2xl rounded-full px-8 py-4"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Checkout • LKR {getCartTotal().toFixed(2)}
          </Button>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        total={getCartTotal()}
      />

      {/* Customer Login Dialog */}
      <CustomerLoginDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleCustomerLogin}
        orderType={orderType}
        tableNumber={tableNumber}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        cart={cart}
        customer={customer}
        total={getCartTotal()}
        onSuccess={handleOrderSuccess}
        orderType={orderType}
        tableNumber={tableNumber}
      />
    </div>
  );
}