import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ChefHat,
  TrendingUp,
  Calendar,
  BarChart3
} from "lucide-react";

export default function AdminStats({ stats }) {
  const statsCards = [
    {
      title: "Total Revenue",
      value: `LKR ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bgColor: "bg-green-500",
      change: "+12.5%"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      bgColor: "bg-blue-500",
      change: "+8.2%"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      bgColor: "bg-purple-500",
      change: "+23.1%"
    },
    {
      title: "Menu Items",
      value: stats.totalMenuItems,
      icon: ChefHat,
      bgColor: "bg-amber-500",
      change: "+2"
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: Calendar,
      bgColor: "bg-indigo-500",
      change: "+5"
    },
    {
      title: "Today's Revenue",
      value: `LKR ${stats.todayRevenue.toFixed(2)}`,
      icon: TrendingUp,
      bgColor: "bg-rose-500",
      change: "+15.3%"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="border-none shadow-lg bg-white relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 ${stat.bgColor} rounded-full opacity-10`} />
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor} bg-opacity-10`}>
                  <stat.icon className={`w-4 h-4 ${stat.bgColor.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{stat.change}</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold mb-2">Revenue Analytics</p>
              <p className="text-sm">Detailed charts and analytics coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}