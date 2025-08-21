import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Clock, Star } from "lucide-react";

export default function MenuItemCard({ item, onAddToCart, cartQuantity, onUpdateQuantity }) {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-amber-500 text-white">
            LKR {item.price}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{item.preparation_time || 15} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current text-yellow-500" />
            <span>4.8</span>
          </div>
        </div>

        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(-1)}
                className="w-8 h-8 p-0 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-lg min-w-[2rem] text-center">
                {cartQuantity}
              </span>
              <Button
                size="sm"
                onClick={() => onUpdateQuantity(1)}
                className="w-8 h-8 p-0 rounded-full bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-lg font-bold text-amber-600">
              LKR {(item.price * cartQuantity).toFixed(2)}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => onAddToCart(item)}
            className="w-full bg-amber-600 hover:bg-amber-700 rounded-xl"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
}