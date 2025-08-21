import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Minus, X, ShoppingCart, CreditCard } from "lucide-react";

export default function CartSidebar({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  total 
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-white">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="w-6 h-6 text-amber-600" />
            Your Order
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-center">Add some delicious items from our menu!</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 py-6">
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                    <img
                      src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop`}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(item.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="h-7 w-7 p-0 rounded-full"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-medium text-sm min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="h-7 w-7 p-0 rounded-full bg-amber-600 hover:bg-amber-700"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-bold text-amber-600">
                            LKR {(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            LKR {item.price} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Total and Checkout */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-amber-600">LKR {total.toFixed(2)}</span>
              </div>
              
              <Button 
                onClick={onCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 h-12 text-lg font-semibold rounded-xl"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}