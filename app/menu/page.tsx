'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock,
  ChefHat,
  Home,
  ArrowLeft,
  User,
  Phone,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  preparation_time: number
  ingredients?: string
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showCartDialog, setShowCartDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const categories = ['appetizers', 'mains', 'desserts', 'beverages', 'specials']

  useEffect(() => {
    fetchMenuItems()
    checkCustomerAuth()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu')
      const data = await response.json()
      setMenuItems(data.menuItems || [])
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const checkCustomerAuth = async () => {
    try {
      const response = await fetch('/api/auth/customer/me')
      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const handleCustomerLogin = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Please enter your name and phone number')
      return
    }

    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customerName,
          phone: customerPhone,
          table_number: 'takeaway'
        })
      })

      const data = await response.json()

      if (response.ok) {
        setCustomer(data.customer)
        setShowLoginDialog(false)
        toast.success('Welcome! You can now place orders.')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
    toast.success(`${item.name} added to cart!`)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handlePlaceOrder = async () => {
    if (!customer) {
      setShowLoginDialog(true)
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsPlacingOrder(true)

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          table_number: 'takeaway'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Order placed successfully! Redirecting to payment...')
        setCart([])
        setShowCartDialog(false)
        
        // Redirect to payment - first try PayHere integration
        if (data.order && data.order.id) {
          // Use the PayHere payment flow
          try {
            const { loadPayHereScript, createPayHerePayment } = await import('@/lib/payhere');
            
            const paymentData = createPayHerePayment({
              orderId: data.order.id,
              amount: getCartTotal(),
              items: cart.map(item => `${item.name} (${item.quantity}x)`).join(', '),
              firstName: customer.name.split(' ')[0] || 'Customer',
              lastName: customer.name.split(' ').slice(1).join(' ') || '',
              email: customer.email || `${customer.phone}@dine-easy.lk`,
              phone: customer.phone,
              address: 'Takeaway Order',
              city: 'Colombo',
              country: 'Sri Lanka',
              returnUrl: `${window.location.origin}/payment/success`,
              cancelUrl: `${window.location.origin}/payment/cancel`,
              notifyUrl: `${window.location.origin}/api/payments/payhere-callback`,
              customFields: {
                custom_1: data.order.id,
              }
            });

            // Get payment hash from API
            const hashResponse = await fetch('/api/payments/payhere?action=start', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                order_id: data.order.id,
                amount: getCartTotal(),
                items: cart.map(item => `${item.name} (${item.quantity}x)`).join(', ')
              }),
            });

            if (hashResponse.ok) {
              const { hash, merchant_id } = await hashResponse.json();
              paymentData.hash = hash;
              paymentData.merchant_id = merchant_id;

              // Load PayHere script and start payment
              const payhere = await loadPayHereScript();
              
              payhere.onCompleted = (orderId: string) => {
                console.log('Payment completed:', orderId);
                toast.success('Payment completed successfully!');
                window.location.href = '/payment/success';
              };

              payhere.onDismissed = () => {
                console.log('Payment dismissed');
                toast('Payment was cancelled', { icon: 'ℹ️' });
              };

              payhere.onError = (error: any) => {
                console.error('Payment error:', error);
                toast.error('Payment failed. Please try again.');
              };

              payhere.startPayment(paymentData);
            } else {
              toast.error('Failed to initialize payment. Please contact support.');
            }
          } catch (paymentError) {
            console.error('PayHere integration error:', paymentError);
            toast.error('Payment system unavailable. Please contact support.');
          }
        }
      } else {
        toast.error(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const getItemsByCategory = (category: string) => {
    return menuItems.filter(item => item.category === category)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Menu</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {customer ? (
                <div className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {customer.name}
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Login to Order
                </Button>
              )}
              
              <Button
                size="sm"
                className="relative bg-amber-600 hover:bg-amber-700"
                onClick={() => setShowCartDialog(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.map(category => {
          const items = getItemsByCategory(category)
          if (items.length === 0) return null

          return (
            <section key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {item.image_url && (
                      <div className="h-48 bg-gray-200">
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="text-right">
                          <div className="font-bold text-amber-600">
                            {formatCurrency(item.price)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {item.preparation_time}min
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                      {item.ingredients && (
                        <p className="text-gray-500 text-xs mb-4">
                          Ingredients: {item.ingredients}
                        </p>
                      )}
                      <Button 
                        onClick={() => addToCart(item)}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* Customer Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                placeholder="Your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input
                placeholder="+94 77 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCustomerLogin}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Your Cart</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(getCartTotal())}</span>
                  </div>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || !customer}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {isPlacingOrder ? 'Placing Order...' : customer ? 'Place Order' : 'Login to Order'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}