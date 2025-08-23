'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ChefHat, 
  Users, 
  DollarSign, 
  Clock,
  Home,
  Menu,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import AdminLayout from './components/AdminLayout'
import Dashboard from './components/Dashboard'
import MenuManagement from './components/MenuManagement'
import CustomerManagement from './components/CustomerManagement'
import OrderManagement from './components/OrderManagement'
import TableManagement from './components/TableManagement'
import AdminUserManagement from './components/AdminUserManagement'
import Analytics from './components/Analytics'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/admin/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoggingIn(true)

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success('Login successful!')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' })
      setUser(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">DineEasy</h1>
                  <p className="text-xs text-amber-600">Admin Panel</p>
                </div>
              </Link>

              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Login Form */}
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="admin@starbucks.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 px-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center text-sm text-gray-500">
                <p>Demo credentials:</p>
                <p>Email: admin@starbucks.com</p>
                <p>Password: starbucks@123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'menu':
        return <MenuManagement />
      case 'orders':
        return <OrderManagement />
      case 'customers':
        return <CustomerManagement />
      case 'tables':
        return <TableManagement />
      case 'users':
        return <AdminUserManagement />
      case 'analytics':
        return <Analytics />
      case 'settings':
        return <div className="p-6">Settings - Coming Soon</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <AdminLayout 
      user={user} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </AdminLayout>
  )
}