import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'

export function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-black text-white">
      {/* Newsletter section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter and get the latest deals and product updates.
            </p>
            <div className="flex max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white text-black border-0 rounded-r-none"
              />
              <Button className="bg-white text-black hover:bg-gray-200 rounded-l-none">
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-xl font-bold mb-4" >
              TECHSTORE
            </h3>
            <p className="text-gray-300 mb-4">
              Your one-stop destination for the latest technology and electronics.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4" >
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/cart')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Shopping Cart
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Wishlist
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4" >
              Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Laptops
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Smartphones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Audio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/products')}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Gaming
                </button>
              </li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold mb-4">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 TechStore. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Payment methods:</span>
                <div className="flex space-x-1">
                  <div className="w-8 h-5 bg-gray-700 rounded text-xs flex items-center justify-center text-white">
                    Visa
                  </div>
                  <div className="w-8 h-5 bg-gray-700 rounded text-xs flex items-center justify-center text-white">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-gray-700 rounded text-xs flex items-center justify-center text-white">
                    PP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}