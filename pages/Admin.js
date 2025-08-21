import React, { useState, useEffect } from "react";
import { MenuItem } from "@/entities/MenuItem";
import { Order } from "@/entities/Order";
import { Customer } from "@/entities/Customer";
import { Table } from "@/entities/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  Users,
  ChefHat,
  BarChart3,
  Plus,
  RefreshCw,
  DollarSign,
  TrendingUp,
  ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

import AdminStats from "../components/admin/AdminStats";
import MenuManagement from "../components/admin/MenuManagement";
import OrderManagement from "../components/admin/OrderManagement";
import CustomerManagement from "../components/admin/CustomerManagement";
import TableManagement from "../components/admin/TableManagement";

export default function Admin() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalMenuItems: 0,
    todayOrders: 0,
    todayRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, customers, menuItems, tables] = await Promise.all([
        Order.list(),
        Customer.list(),
        MenuItem.list(),
        Table.list()
      ]);

      const today = new Date().toDateString();
      const todayOrders = orders.filter(o => 
        new Date(o.created_date).toDateString() === today
      );

      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        totalCustomers: customers.length,
        totalMenuItems: menuItems.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      });
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Restaurant management & analytics</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={loadStats}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-white rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Tables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <AdminStats stats={stats} onRefresh={loadStats} />
          </TabsContent>

          <TabsContent value="menu" className="mt-8">
            <MenuManagement onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <OrderManagement onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="customers" className="mt-8">
            <CustomerManagement onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="tables" className="mt-8">
            <TableManagement onUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}