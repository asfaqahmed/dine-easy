import React, { useState, useEffect } from "react";
import { Customer } from "@/entities/Customer";
import { Order } from "@/entities/Order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  User,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CustomerManagement({ onUpdate }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerOrders, setCustomerOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadData = async () => {
    try {
      const [fetchedCustomers, fetchedOrders] = await Promise.all([
        Customer.list("-created_date"),
        Order.list()
      ]);
      
      setCustomers(fetchedCustomers);
      
      // Group orders by customer
      const ordersByCustomer = {};
      fetchedOrders.forEach(order => {
        if (!ordersByCustomer[order.customer_id]) {
          ordersByCustomer[order.customer_id] = [];
        }
        ordersByCustomer[order.customer_id].push(order);
      });
      setCustomerOrders(ordersByCustomer);
      
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    setFilteredCustomers(filtered);
  };

  const getCustomerStats = (customerId) => {
    const orders = customerOrders[customerId] || [];
    const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const lastOrderDate = orders.length > 0 
      ? new Date(Math.max(...orders.map(o => new Date(o.created_date))))
      : null;

    return { totalSpent, totalOrders, lastOrderDate };
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">View customer information and order history</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Customers: {customers.length}
        </div>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.map(customer => {
          const stats = getCustomerStats(customer.id);
          
          return (
            <Card key={customer.id} className="border-none shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {customer.name}
                    </CardTitle>
                    <div className="text-sm text-gray-500">
                      Joined {format(new Date(customer.created_date), "MMM d, yyyy")}
                    </div>
                  </div>
                  
                  {stats.totalOrders > 0 && (
                    <Badge 
                      className={
                        stats.totalOrders >= 5 
                          ? "bg-purple-100 text-purple-800" 
                          : stats.totalOrders >= 2 
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {stats.totalOrders >= 5 ? "VIP" : stats.totalOrders >= 2 ? "Regular" : "New"}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Customer ID: #{customer.id?.slice(-6)}</span>
                  </div>
                </div>

                {/* Order Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-700">{stats.totalOrders}</div>
                    <div className="text-xs text-blue-600">Orders</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      {stats.totalSpent.toFixed(0)}
                    </div>
                    <div className="text-xs text-green-600">LKR Spent</div>
                  </div>
                  
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-sm font-bold text-amber-700">
                      {stats.lastOrderDate ? format(stats.lastOrderDate, "MMM d") : "-"}
                    </div>
                    <div className="text-xs text-amber-600">Last Order</div>
                  </div>
                </div>

                {/* Recent Orders */}
                {customerOrders[customer.id] && customerOrders[customer.id].length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Recent Orders</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {customerOrders[customer.id].slice(0, 3).map((order, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg text-xs">
                          <div>
                            <span className="font-medium">#{order.id?.slice(-6)}</span>
                            <span className="text-gray-500 ml-2">
                              {format(new Date(order.created_date), "MMM d")}
                            </span>
                          </div>
                          <div className="font-semibold text-amber-600">
                            LKR {order.total_amount?.toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stats.totalOrders === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No orders placed yet
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "Customers will appear here as they place orders."}
          </p>
        </div>
      )}
    </div>
  );
}