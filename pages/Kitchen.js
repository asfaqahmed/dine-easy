import React, { useState, useEffect } from "react";
import { Order } from "@/entities/Order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Phone,
  MapPin,
  RefreshCw,
  ChefHat
} from "lucide-react";
import { toast } from "sonner";

import OrderCard from "../components/kitchen/OrderCard";
import OrderStats from "../components/kitchen/OrderStats";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadOrders();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await Order.update(orderId, { status: newStatus });
      await loadOrders();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getFilteredOrders = (status) => {
    if (status === "pending") {
      return orders.filter(order => ["pending", "confirmed"].includes(order.status));
    }
    return orders.filter(order => order.status === status);
  };

  const getStatusCount = (status) => {
    return getFilteredOrders(status).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kitchen dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kitchen Dashboard</h1>
                <p className="text-gray-600">Real-time order management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={loadOrders}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {autoRefresh ? 'Live Updates' : 'Manual Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <OrderStats orders={orders} />

        {/* Order Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl shadow-sm">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              New Orders
              <Badge variant="secondary">{getStatusCount("pending")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="preparing" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Preparing
              <Badge variant="secondary">{getStatusCount("preparing")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ready" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ready
              <Badge variant="secondary">{getStatusCount("ready")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="delivered" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
              <Badge variant="secondary">{getStatusCount("delivered")}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredOrders("pending").map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  showActions={true}
                />
              ))}
              {getFilteredOrders("pending").length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">All caught up!</p>
                  <p>No new orders at the moment.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preparing" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredOrders("preparing").map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  showActions={true}
                />
              ))}
              {getFilteredOrders("preparing").length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">Nothing cooking</p>
                  <p>No orders currently being prepared.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ready" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredOrders("ready").map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  showActions={true}
                />
              ))}
              {getFilteredOrders("ready").length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">No orders ready</p>
                  <p>Orders will appear here when ready for pickup.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="delivered" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredOrders("delivered").slice(0, 10).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  showActions={false}
                />
              ))}
              {getFilteredOrders("delivered").length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold mb-2">No completed orders</p>
                  <p>Delivered orders will be shown here.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}