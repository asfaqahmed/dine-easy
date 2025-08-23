'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: number
    completedOrders: number
    averageOrderValue: number
    newCustomers: number
    completionRate: number
  }
  charts: {
    dailyRevenue: Array<{ date: string; revenue: number }>
    statusDistribution: Array<{ status: string; count: number }>
    popularItems: Array<{ name: string; quantity: number }>
    paymentMethods: Array<{ method: string; count: number }>
  }
  period: string
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ]

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      const data = await response.json()
      
      if (response.ok) {
        setAnalytics(data.analytics)
      } else {
        toast.error(data.error || 'Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-orange-100 text-orange-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Orders', analytics.overview.totalOrders.toString()],
      ['Total Revenue', analytics.overview.totalRevenue.toString()],
      ['Completed Orders', analytics.overview.completedOrders.toString()],
      ['Average Order Value', analytics.overview.averageOrderValue.toFixed(2)],
      ['New Customers', analytics.overview.newCustomers.toString()],
      ['Completion Rate', analytics.overview.completionRate.toFixed(1) + '%']
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    toast.success('Analytics data exported!')
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          Failed to load analytics data
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button 
            variant="outline" 
            onClick={fetchAnalytics}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            onClick={exportData}
            className="bg-amber-600 hover:bg-amber-700 gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.overview.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{analytics.overview.completedOrders}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-lg font-bold">{formatCurrency(analytics.overview.averageOrderValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-2xl font-bold">{analytics.overview.newCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-xl font-bold">{analytics.overview.completionRate.toFixed(1)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.charts.dailyRevenue.length > 0 ? (
              <div className="space-y-2">
                {analytics.charts.dailyRevenue.slice(-7).map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-bold">
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No revenue data available</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.charts.statusDistribution.length > 0 ? (
              <div className="space-y-2">
                {analytics.charts.statusDistribution.map((status, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                    <span className="text-sm font-medium">{status.count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No status data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Items and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.charts.popularItems.length > 0 ? (
              <div className="space-y-3">
                {analytics.charts.popularItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <div className="text-sm text-gray-500">#{index + 1} most ordered</div>
                    </div>
                    <Badge variant="outline">
                      {item.quantity} sold
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No popular items data available</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.charts.paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {analytics.charts.paymentMethods.map((method, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium capitalize">{method.method}</span>
                    <Badge variant="outline">
                      {method.count} orders
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No payment method data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}