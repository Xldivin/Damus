import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import { useAppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const { setIsLoggedIn, setUser, setIsAdmin } = useAppContext()
  
  // Removed hardcoded credentials; using API login
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const resp = await apiService.auth.login({ email: formData.email, password: formData.password })
      setUser(resp.user)
      setIsLoggedIn(true)
      const roles = resp.user?.roles || []
      const roleNames = roles.map((r: any) => String((r.slug || r.name || '')).toLowerCase())
      const isSuperAdmin = roleNames.includes('super-admin')
      const isAdminRole = isSuperAdmin || roleNames.includes('admin')
      setIsAdmin(isAdminRole)

      // Remember me: keep token in localStorage; otherwise clear it on unload
      if (!formData.rememberMe) {
        try {
          window.addEventListener('beforeunload', () => {
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
          })
        } catch {}
      } else {
        try {
          const token = sessionStorage.getItem('authToken')
          if (token) {
            localStorage.setItem('authToken', token)
          }
          localStorage.setItem('authUser', JSON.stringify(resp.user))
        } catch {}
      }
      try {
        sessionStorage.setItem('authUser', JSON.stringify(resp.user))
      } catch {}

      toast.success('Welcome back!')
      navigate(isSuperAdmin ? '/admin' : '/dashboard')
    } catch (err: any) {
      toast.error('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast.success(`${provider} login would be implemented here`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-black rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <Lock className="h-6 w-6 sm:h-10 sm:w-10 text-white" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" >
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center" >
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-11"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-11 pr-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked: string | boolean) => handleInputChange('rememberMe', checked)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => toast.success('Password reset would be implemented here')}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Social Login
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleSocialLogin('Apple')}
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C6.624 0 2.232 4.503 2.232 10.062c0 5.56 4.392 10.063 9.785 10.063s9.785-4.503 9.785-10.063C21.802 4.503 17.41 0 12.017 0zm3.94 16.876c-.817 1.366-1.954 2.045-3.412 2.045s-2.595-.679-3.412-2.045c-.817-1.366-.817-3.587 0-4.953.817-1.366 1.954-2.045 3.412-2.045s2.595.679 3.412 2.045c.817 1.366.817 3.587 0 4.953z"/>
                </svg>
                Apple
              </Button>
            </div> */}

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-600 hover:text-blue-800 p-0"
                  onClick={() => navigate('/signup')}
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}