import React, { useState, useEffect } from "react";
import { Table } from "@/entities/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  QrCode,
  Users,
  MapPin,
  Download
} from "lucide-react";
import { toast } from "sonner";

export default function TableManagement({ onUpdate }) {
  const [tables, setTables] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    table_number: "",
    seats: "",
    status: "available"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const fetchedTables = await Table.list();
      setTables(fetchedTables);
    } catch (error) {
      toast.error("Failed to load tables");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tableData = {
        ...formData,
        seats: parseInt(formData.seats),
        qr_code: `TABLE_${formData.table_number}_QR`
      };

      if (editingTable) {
        await Table.update(editingTable.id, tableData);
        toast.success("Table updated successfully");
      } else {
        await Table.create(tableData);
        toast.success("Table created successfully");
      }

      setShowDialog(false);
      setEditingTable(null);
      setFormData({
        table_number: "",
        seats: "",
        status: "available"
      });
      loadTables();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to save table");
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      table_number: table.table_number || "",
      seats: table.seats?.toString() || "",
      status: table.status || "available"
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    
    try {
      await Table.delete(id);
      toast.success("Table deleted successfully");
      loadTables();
      onUpdate?.();
    } catch (error) {
      toast.error("Failed to delete table");
    }
  };

  const generateQRCode = (tableNumber) => {
    const tableUrl = `${window.location.origin}/menu?table=${tableNumber}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`;
  };

  const downloadQRCode = (tableNumber) => {
    const qrUrl = generateQRCode(tableNumber);
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `table-${tableNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "occupied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "maintenance":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
          <p className="text-gray-600">Manage restaurant tables and QR codes</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTable(null);
            setFormData({
              table_number: "",
              seats: "",
              status: "available"
            });
            setShowDialog(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </Button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map(table => (
          <Card key={table.id} className="border-none shadow-lg bg-white">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    Table {table.table_number}
                  </CardTitle>
                </div>
                <Badge className={`${getStatusColor(table.status)} border`}>
                  {table.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Table Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">{table.seats} seats</span>
                </div>
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">QR Code Ready</span>
                </div>
              </div>

              {/* QR Code Preview */}
              <div className="text-center">
                <div className="p-4 bg-white border rounded-xl mb-3">
                  <img
                    src={generateQRCode(table.table_number)}
                    alt={`QR Code for Table ${table.table_number}`}
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQRCode(table.table_number)}
                  className="gap-2"
                >
                  <Download className="w-3 h-3" />
                  Download QR
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(table)}
                  className="flex-1 gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(table.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tables found</h3>
          <p className="text-gray-500 mb-6">Add your first table to get started.</p>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Table
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="table_number">Table Number</Label>
              <Input
                id="table_number"
                value={formData.table_number}
                onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                placeholder="e.g., 1, A1, VIP-1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Number of Seats</Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="20"
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: e.target.value})}
                placeholder="e.g., 4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
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
                {editingTable ? "Update Table" : "Add Table"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}