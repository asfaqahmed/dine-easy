import React, { useState, useEffect } from "react";
import { MenuItem } from "@/entities/MenuItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChefHat,
  Clock,
  DollarSign,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function MenuManagement({ onUpdate }) {
  const [menuItems, setMenuItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "mains",
    image_url: "",
    is_available: true,
    preparation_time: "",
    ingredients: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Items" },
    { id: "appetizers", name: "Appetizers" },
    { id: "mains", name: "Main Courses" },
    { id: "desserts", name: "Desserts" },
    { id: "beverages", name: "Beverages" },
    { id: "specials", name: "Chef's Specials" }
  ];

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await MenuItem.list();
      setMenuItems(items);
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        preparation_time: parseInt(formData.preparation_time) || 15
      };

      if (editingItem) {
        await MenuItem.update(editingItem.id, itemData);
        toast.success("Menu item updated successfully");
      } else {
        await MenuItem.create(itemData);
        toast.success("Menu item created successfully");
      }

      setShowDialog(false);
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "mains",
        image_url: "",
        is_available: true,
        preparation_time: "",
        ingredients: ""
      });
      loadMenuItems();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to save menu item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price?.toString() || "",
      category: item.category || "mains",
      image_url: item.image_url || "",
      is_available: item.is_available !== false,
      preparation_time: item.preparation_time?.toString() || "",
      ingredients: item.ingredients || ""
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    
    try {
      await MenuItem.delete(id);
      toast.success("Menu item deleted successfully");
      loadMenuItems();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete menu item");
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await MenuItem.update(item.id, { ...item, is_available: !item.is_available });
      toast.success(`${item.name} ${!item.is_available ? 'enabled' : 'disabled'}`);
      loadMenuItems();
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getCategoryColor = (category) => {
    const colors = {
      appetizers: "bg-blue-100 text-blue-800",
      mains: "bg-green-100 text-green-800",
      desserts: "bg-pink-100 text-pink-800",
      beverages: "bg-purple-100 text-purple-800",
      specials: "bg-amber-100 text-amber-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        <Button 
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: "",
              description: "",
              price: "",
              category: "mains",
              image_url: "",
              is_available: true,
              preparation_time: "",
              ingredients: ""
            });
            setShowDialog(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="rounded-full"
          >
            {category.name}
            {category.id !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {menuItems.filter(item => item.category === category.id).length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="border-none shadow-lg bg-white">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAvailability(item)}
                    className={`h-8 w-8 p-0 ${item.is_available ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-amber-600">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-semibold">LKR {item.price}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.preparation_time || 15}min</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1 gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-500 mb-6">Add your first menu item to get started.</p>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Menu Item
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the dish"
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (LKR)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="mains">Main Courses</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="specials">Chef's Specials</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparation_time">Prep Time (minutes)</Label>
                <Input
                  id="preparation_time"
                  type="number"
                  min="1"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                  placeholder="15"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_available}
                    onCheckedChange={(checked) => setFormData({...formData, is_available: checked})}
                  />
                  Available
                </Label>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="ingredients">Main Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  placeholder="List main ingredients..."
                  className="h-16"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}