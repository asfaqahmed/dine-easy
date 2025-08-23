'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  QrCode, 
  Smartphone, 
  ChefHat, 
  Clock,
  Star,
  Users,
  Utensils,
  ArrowRight,
  Download,
  Home,
  Menu
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  useEffect(() => {
    generateTakeawayQR()
  }, [])

  const generateTakeawayQR = () => {
    const takeawayUrl = `${window.location.origin}/menu?type=takeaway`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(takeawayUrl)}`
    setQrCodeUrl(qrUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DineEasy</h1>
                <p className="text-xs text-amber-600">Smart Dining Experience</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button variant="default" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Menu className="w-4 h-4" />
                  Menu
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Admin Login
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Smart Dining
                  <span className="block text-amber-600">Made Simple</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Experience the future of restaurant dining with contactless ordering, 
                  real-time kitchen updates, and seamless payment processing.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Utensils className="w-5 h-5 mr-2" />
                    View Menu
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-amber-50">
                    <ChefHat className="w-5 h-5 mr-2" />
                    Staff Login
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">50+</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">24/7</div>
                  <div className="text-sm text-gray-600">Service</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">4.9★</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Takeaway QR Code</h3>
                  <p className="text-gray-600">Scan to order for pickup</p>
                  
                  {qrCodeUrl && (
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <img 
                        src={qrCodeUrl} 
                        alt="Takeaway QR Code"
                        className="w-48 h-48 mx-auto rounded-xl"
                      />
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.print()}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Print QR Code
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to your perfect meal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">1. Scan QR Code</h3>
                <p className="text-gray-600">
                  Simply scan the QR code at your table or use our takeaway code to access the digital menu instantly.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">2. Order & Pay</h3>
                <p className="text-gray-600">
                  Browse our menu, add items to cart, and pay securely through PayHere gateway with your mobile.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">3. Enjoy Your Meal</h3>
                <p className="text-gray-600">
                  Receive SMS updates on your order status and enjoy your freshly prepared meal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">
                Why Choose Our System?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Faster Service</h3>
                    <p className="text-gray-600">Orders go directly to kitchen, reducing wait times by up to 40%.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Contactless Experience</h3>
                    <p className="text-gray-600">Safe and hygienic ordering without physical menus or cash handling.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Better Experience</h3>
                    <p className="text-gray-600">Real-time updates and seamless payment for customer satisfaction.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>No app download required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Works on any smartphone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Secure payment processing</span>
                  </div>
                </div>
                <Link href="/menu">
                  <Button size="lg" variant="secondary" className="bg-white text-amber-600 hover:bg-gray-50 font-semibold">
                    Start Ordering Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">DineEasy</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Revolutionizing dining with contactless ordering and smart kitchen management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/menu" className="block text-sm text-gray-600 hover:text-amber-600">
                  View Menu
                </Link>
                <Link href="/admin" className="block text-sm text-gray-600 hover:text-amber-600">
                  Staff Login
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <QrCode className="w-4 h-4" />
                Scan QR for instant ordering
              </div>
            </div>
          </div>
          <div className="border-t border-amber-100 mt-8 pt-4 text-center text-sm text-gray-500">
            © 2024 DineEasy. Built with Next.js & PostgreSQL.
          </div>
        </div>
      </footer>
    </div>
  )
}