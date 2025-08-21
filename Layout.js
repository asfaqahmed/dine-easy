import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Home, 
  Menu, 
  ChefHat, 
  Settings, 
  QrCode, 
  Phone,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/entities/User";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // User not authenticated - this is fine for public pages
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    navigate(createPageUrl("Home"));
  };

  const handleLogin = async () => {
    try {
      await User.login();
      // After successful login, refresh user state
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const isPublicPage = ['Home', 'Menu'].includes(currentPageName);
  const isAdminPage = ['Admin', 'Kitchen'].includes(currentPageName);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <style>{`
        :root {
          --primary: #d97706;
          --primary-foreground: #ffffff;
          --secondary: #f59e0b;
          --accent: #fbbf24;
          --muted: #f3f4f6;
          --card: #ffffff;
        }
      `}</style>

      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RestaurantOrder</h1>
                <p className="text-xs text-amber-600">Smart Dining Experience</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              <Link to={createPageUrl("Home")}>
                <Button 
                  variant={currentPageName === "Home" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link to={createPageUrl("Menu")}>
                <Button 
                  variant={currentPageName === "Menu" ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Menu className="w-4 h-4" />
                  Menu
                </Button>
              </Link>
              {user && (
                <>
                  <Link to={createPageUrl("Kitchen")}>
                    <Button 
                      variant={currentPageName === "Kitchen" ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      Kitchen
                      <Badge variant="secondary" className="ml-1">Live</Badge>
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Admin")}>
                    <Button 
                      variant={currentPageName === "Admin" ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="text-sm text-gray-600 hidden sm:block">
                    Welcome, {user.full_name}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={handleLogin}
                >
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-amber-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">RestaurantOrder</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Revolutionizing dining with contactless ordering and smart kitchen management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link to={createPageUrl("Menu")} className="block text-sm text-gray-600 hover:text-amber-600">
                  View Menu
                </Link>
                <button onClick={handleLogin} className="block text-sm text-gray-600 hover:text-amber-600">
                  Staff Login
                </button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Phone className="w-4 h-4" />
                +94 11 234 5678
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <QrCode className="w-4 h-4" />
                Scan QR for instant ordering
              </div>
            </div>
          </div>
          <div className="border-t border-amber-100 mt-8 pt-4 text-center text-sm text-gray-500">
            © 2024 RestaurantOrder. Built with Next.js & base44.
          </div>
        </div>
      </footer>
    </div>
  );
}