import React, { useState, useEffect } from "react";
import { Order } from "@/entities/Order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Eye, 
  RefreshCw,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function OrderManagement({ onUpdate }) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      const fetchedOrders = await Order.list("-created_date");
      setOrders(fetchedOrders);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_date);
        
        switch (dateFilter) {
          case "today":
            return orderDate >= today;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      toast.success("Order status updated");
      loadOrders();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600">View and manage all restaurant orders</p>
        </div>
        <Button onClick={loadOrders} className="gap-2" variant="outline">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer, phone, or order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-6">
        {filteredOrders.map(order => (
          <Card key={order.id} className="border-none shadow-lg bg-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-3">
                    Order #{order.id?.slice(-6)}
                    <Badge className={`${getStatusColor(order.status)} border`}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {order.order_type}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-xl font-bold text-amber-600">
                    LKR {order.total_amount?.toFixed(2)}
                  </div>
                  {order.payment_status === "paid" && (
                    <Badge className="bg-green-100 text-green-800">
                      <CreditCard className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">Customer</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">{order.customer_phone}</div>
                    <div className="text-xs text-gray-500">Phone</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-sm">
                      {order.table_number === "takeaway" ? "Takeaway" : `Table ${order.table_number}`}
                    </div>
                    <div className="text-xs text-gray-500">Location</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-3">Order Items:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs bg-white">
                          {item.quantity}x
                        </Badge>
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-amber-600">
                        LKR {item.total?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <div className="flex gap-2 pt-4 border-t">
                  {order.status === "pending" || order.status === "confirmed" ? (
                    <Button
                      onClick={() => updateOrderStatus(order.id, "preparing")}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Start Preparing
                    </Button>
                  ) : order.status === "preparing" ? (
                    <Button
                      onClick={() => updateOrderStatus(order.id, "ready")}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Mark Ready
                    </Button>
                  ) : order.status === "ready" ? (
                    <Button
                      onClick={() => updateOrderStatus(order.id, "delivered")}
                      className="bg-gray-600 hover:bg-gray-700"
                      size="sm"
                    >
                      Mark Delivered
                    </Button>
                  ) : null}
                  
                  <Button
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}