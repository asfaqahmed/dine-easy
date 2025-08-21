import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";

export default function OrderStats({ orders }) {
  const pendingCount = orders.filter(o => ["pending", "confirmed"].includes(o.status)).length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;
  const readyCount = orders.filter(o => o.status === "ready").length;
  const completedToday = orders.filter(o => {
    const today = new Date().toDateString();
    return o.status === "delivered" && new Date(o.created_date).toDateString() === today;
  }).length;
  
  const todayRevenue = orders
    .filter(o => {
      const today = new Date().toDateString();
      return o.status === "delivered" && new Date(o.created_date).toDateString() === today;
    })
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const avgOrderValue = orders.length > 0 
    ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length 
    : 0;

  const stats = [
    {
      title: "New Orders",
      value: pendingCount,
      icon: AlertTriangle,
      bgColor: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Preparing",
      value: preparingCount,
      icon: Clock,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Ready",
      value: readyCount,
      icon: CheckCircle,
      bgColor: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Today's Orders",
      value: completedToday,
      icon: TrendingUp,
      bgColor: "bg-indigo-500",
      textColor: "text-indigo-600"
    },
    {
      title: "Today's Revenue",
      value: `LKR ${todayRevenue.toFixed(0)}`,
      icon: DollarSign,
      bgColor: "bg-amber-500",
      textColor: "text-amber-600"
    },
    {
      title: "Avg Order Value",
      value: `LKR ${avgOrderValue.toFixed(0)}`,
      icon: Users,
      bgColor: "bg-purple-500",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 ${stat.bgColor} rounded-full opacity-10`} />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} bg-opacity-10`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}