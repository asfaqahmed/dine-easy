import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone } from "lucide-react";
import { toast } from "sonner";

export default function CustomerLoginDialog({ isOpen, onClose, onLogin, orderType, tableNumber }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Sri Lankan phone number
    const phoneRegex = /^(\+94|94|0)?[1-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid Sri Lankan phone number");
      return;
    }

    // Format phone number to +94XXXXXXXXX
    let formattedPhone = formData.phone.replace(/^\+?94|^0/, "");
    formattedPhone = `+94${formattedPhone}`;

    setIsLoading(true);
    try {
      await onLogin({
        ...formData,
        phone: formattedPhone
      });
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Complete Your Order
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            {orderType === "takeaway" 
              ? "Register for takeaway order" 
              : `Register for table ${tableNumber || ""} service`
            }
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="077 123 4567 or +94 77 123 4567"
              required
              className="h-12"
            />
            <p className="text-xs text-gray-500">
              Sri Lankan format: +94 or 0 followed by 9 digits
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Continue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}