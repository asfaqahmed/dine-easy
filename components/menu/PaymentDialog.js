import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, User, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export default function PaymentDialog({ 
  isOpen, 
  onClose, 
  cart, 
  customer, 
  total, 
  onSuccess,
  orderType,
  tableNumber 
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate PayHere payment integration
      const paymentData = {
        merchant_id: "1231078", // Hardcoded merchant ID
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`,
        notify_url: `${window.location.origin}/api/payment/notify`,
        order_id: `ORD-${Date.now()}`,
        items: cart.map(item => item.name).join(", "),
        amount: total.toFixed(2),
        currency: "LKR",
        first_name: customer.name.split(" ")[0],
        last_name: customer.name.split(" ").slice(1).join(" ") || "",
        email: "customer@example.com", // Hardcoded as requested
        phone: customer.phone,
        address: "123 Main Street", // Hardcoded
        city: "Colombo", // Hardcoded
        country: "Sri Lanka", // Hardcoded
        delivery_address: "Restaurant Pickup", // Hardcoded
        delivery_city: "Colombo", // Hardcoded
        delivery_country: "Sri Lanka" // Hardcoded
      };

      // In real implementation, this would integrate with PayHere
      // For demo, we'll simulate successful payment
      setTimeout(() => {
        const mockPaymentResponse = {
          payment_id: `PAY_${Date.now()}`,
          status: "success",
          amount: total.toFixed(2),
          currency: "LKR"
        };

        onSuccess(mockPaymentResponse);
        toast.success("Payment successful! Your order has been placed.");
        setIsProcessing(false);
      }, 3000);

    } catch (error) {
      toast.error("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-amber-600" />
            Confirm Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{customer.name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{customer.phone}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {orderType === "takeaway" ? "Takeaway Order" : `Table ${tableNumber || "Service"}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Estimated: 20-30 minutes</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Order Summary</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.quantity}x
                    </Badge>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span className="text-amber-600">LKR {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-amber-50 rounded-xl p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Payment Method</h3>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-700">PayHere Secure Payment Gateway</span>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Supports Visa, MasterCard, American Express, and mobile payments
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay LKR {total.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}