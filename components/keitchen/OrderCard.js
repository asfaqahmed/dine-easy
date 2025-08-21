import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

export default function OrderCard({ order, onStatusUpdate, showActions = true }) {
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

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
      case "confirmed":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const getActionText = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
      case "confirmed":
        return "Start Cooking";
      case "preparing":
        return "Mark Ready";
      case "ready":
        return "Mark Delivered";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const actionText = getActionText(order.status);

  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">
                Order #{order.id?.slice(-6)}
              </h3>
              <Badge className={`${getStatusColor(order.status)} border`}>
                {order.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              {format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a")}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-amber-600">
              LKR {order.total_amount?.toFixed(2)}
            </div>
            {order.payment_status === "paid" && (
              <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                <CreditCard className="w-3 h-3 mr-1" />
                Paid
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {order.table_number === "takeaway" ? "Takeaway Order" : `Table ${order.table_number}`}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Order Items:</h4>
          <div className="space-y-2">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs bg-white">
                    {item.quantity}x
                  </Badge>
                  <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">
                  LKR {item.total?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {order.special_requests && (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Special Instructions:</h4>
                <p className="text-sm text-blue-700 mt-1">{order.special_requests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && nextStatus && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onStatusUpdate(order.id, nextStatus)}
              className="flex-1 bg-amber-600 hover:bg-amber-700 h-11 font-semibold"
            >
              {actionText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
        
        {order.status === "delivered" && (
          <div className="text-center py-2 text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Order Completed
          </div>
        )}
      </CardContent>
    </Card>
  );
}