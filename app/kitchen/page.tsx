'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChefHat, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Home,
  Settings,
  RefreshCw,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  table_number?: string
  status: string
  order_type: string
  total_amount: number
  created_at: string
  items: {
    id: string
    menu_item_name: string
    quantity: number
    special_instructions?: string
  }[]
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success('Order status updated')
        fetchOrders()
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-orange-100 text-orange-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'preparing':
        return <ChefHat className="w-4 h-4" />
      case 'ready':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'active') return ['pending', 'confirmed', 'preparing'].includes(order.status)
    return order.status === filter
  })

  const getOrderCounts = () => {
    const pending = orders.filter(o => o.status === 'pending').length
    const preparing = orders.filter(o => o.status === 'preparing').length
    const ready = orders.filter(o => o.status === 'ready').length
    return { pending, preparing, ready }
  }

  const counts = getOrderCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>
                <p className="text-xs text-green-600">Real-time Order Management</p>
              </div>
            </div>

            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOrders}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Preparing</p>
                  <p className="text-2xl font-bold text-orange-600">{counts.preparing}</p>
                </div>
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready</p>
                  <p className="text-2xl font-bold text-green-600">{counts.ready}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Orders
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active Only
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'preparing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('preparing')}
          >
            Preparing
          </Button>
          <Button
            variant={filter === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('ready')}
          >
            Ready
          </Button>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {filter === 'all' ? 'No orders have been placed yet.' : `No ${filter} orders found.`}
              </p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <Card key={order.id} className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.customer_name} • {order.table_number || 'Takeaway'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(new Date(order.created_at))}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.menu_item_name}</span>
                        {item.special_instructions && (
                          <span className="text-orange-600 text-xs">
                            Note: {item.special_instructions}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Total:</span>
                      <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Confirm
                      </Button>
                    )}
                    
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        Start Preparing
                      </Button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Mark Ready
                      </Button>
                    )}
                    
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                      >
                        Complete
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${order.customer_phone}`)}
                      className="px-3"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}