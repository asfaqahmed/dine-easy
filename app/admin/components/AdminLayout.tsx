'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChefHat, 
  Users, 
  DollarSign, 
  Clock,
  Home,
  Menu,
  LogOut,
  Settings,
  BarChart3,
  QrCode,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AdminLayoutProps {
  user: any
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
}

export default function AdminLayout({ user, activeTab, onTabChange, children }: AdminLayoutProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin/logout', { method: 'POST' })
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'menu', label: 'Menu Items', icon: Menu },
    { id: 'orders', label: 'Orders', icon: ChefHat },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'tables', label: 'Tables', icon: QrCode },
    { id: 'users', label: 'Admin Users', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-amber-600">Welcome, {user.full_name}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/kitchen">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChefHat className="w-4 h-4" />
                  Kitchen
                  <Badge variant="secondary" className="ml-1">Live</Badge>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}