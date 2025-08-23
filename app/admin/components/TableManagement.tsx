'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  QrCode, 
  Users, 
  Table as TableIcon,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface Table {
  id: string
  table_number: string
  qr_code?: string
  capacity: number
  is_active: boolean
  created_at: string
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '',
    qr_code: ''
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables')
      const data = await response.json()
      setTables(data.tables || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast.error('Failed to fetch tables')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.table_number || !formData.capacity) {
        toast.error('Table number and capacity are required')
        return
      }

      const url = editingTable ? `/api/admin/tables/${editingTable.id}` : '/api/admin/tables'
      const method = editingTable ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity)
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingTable ? 'Table updated!' : 'Table created!')
        fetchTables()
        resetForm()
        setIsAddDialogOpen(false)
        setEditingTable(null)
      } else {
        toast.error(result.error || 'Failed to save table')
      }
    } catch (error) {
      console.error('Error saving table:', error)
      toast.error('Failed to save table')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return

    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Table deleted!')
        fetchTables()
      } else {
        toast.error('Failed to delete table')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      toast.error('Failed to delete table')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Table ${!currentStatus ? 'activated' : 'deactivated'}!`)
        fetchTables()
      } else {
        toast.error('Failed to update table status')
      }
    } catch (error) {
      console.error('Error updating table status:', error)
      toast.error('Failed to update table status')
    }
  }

  const generateQRCode = (tableNumber: string) => {
    const qrUrl = `${window.location.origin}/table/${tableNumber}`
    return qrUrl
  }

  const resetForm = () => {
    setFormData({
      table_number: '',
      capacity: '',
      qr_code: ''
    })
  }

  const startEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      table_number: table.table_number,
      capacity: table.capacity.toString(),
      qr_code: table.qr_code || ''
    })
    setIsAddDialogOpen(true)
  }

  const filteredTables = tables.filter(table => {
    return table.table_number.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Calculate stats
  const stats = {
    total: tables.length,
    active: tables.filter(t => t.is_active).length,
    inactive: tables.filter(t => !t.is_active).length,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
          <p className="text-gray-600">Manage restaurant tables and QR codes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTable ? 'Edit Table' : 'Add New Table'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Number</label>
                <Input
                  value={formData.table_number}
                  onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                  placeholder="e.g., T01, A1, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="Number of seats"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">QR Code URL (Optional)</label>
                <Input
                  value={formData.qr_code}
                  onChange={(e) => setFormData({...formData, qr_code: e.target.value})}
                  placeholder="Custom QR code URL"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to auto-generate: /table/{formData.table_number}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {editingTable ? 'Update' : 'Create'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingTable(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TableIcon className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold">{stats.totalCapacity}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{table.table_number}</h3>
                    <p className="text-sm text-gray-600">{table.capacity} seats</p>
                  </div>
                  <Badge 
                    className={table.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  >
                    {table.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <QrCode className="w-4 h-4" />
                    {table.qr_code ? 'Custom QR' : 'Auto QR'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Added: {formatDate(new Date(table.created_at))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(table)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(table.id, table.is_active)}
                    className={table.is_active ? 'text-red-600' : 'text-green-600'}
                  >
                    {table.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(table.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {table.is_active && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const qrUrl = table.qr_code || generateQRCode(table.table_number)
                        window.open(qrUrl, '_blank')
                      }}
                      className="w-full text-amber-600 hover:text-amber-700"
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      View QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tables found
          </div>
        )}
      </div>
    </div>
  )
}