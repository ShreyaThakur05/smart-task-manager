'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Zap, Shield } from 'lucide-react'

export default function AuthForm() {
  const [isActive, setIsActive] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, register } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await login(email, password)
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      await register(email, password, name)
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-0">
      <div className={`relative bg-white dark:bg-gray-800 rounded-none shadow-2xl overflow-hidden w-full h-screen transition-all duration-600 ease-in-out ${isActive ? 'active' : ''}`}>
        
        {/* Sign In Form */}
        <motion.div 
          className={`absolute top-0 left-0 w-1/2 h-full z-20 transition-all duration-600 ease-in-out ${
            isActive ? 'translate-x-full' : 'translate-x-0'
          }`}
        >
          <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 flex flex-col items-center justify-center px-10 h-full">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Smart Tasks</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Welcome Back</h2>
            
            <div className="relative w-full mb-4">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-12 py-4 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Email address"
                required
              />
            </div>
            
            <div className="relative w-full mb-4">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-12 py-4 pr-12 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && !isActive && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold tracking-wider uppercase px-12 py-4 rounded-xl mt-4 cursor-pointer transition-colors disabled:opacity-50 w-full"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </motion.div>

        {/* Sign Up Form */}
        <motion.div 
          className={`absolute top-0 left-0 w-1/2 h-full z-10 transition-all duration-600 ease-in-out ${
            isActive ? 'translate-x-full opacity-100 z-50' : 'translate-x-0 opacity-0 z-10'
          }`}
        >
          <form onSubmit={handleRegister} className="bg-white dark:bg-gray-800 flex flex-col items-center justify-center px-10 h-full">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Smart Tasks</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Join Our Community</h2>
            
            <div className="relative w-full mb-4">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-12 py-4 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Full name"
                required
              />
            </div>
            
            <div className="relative w-full mb-4">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-12 py-4 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Email address"
                required
              />
            </div>
            
            <div className="relative w-full mb-4">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-12 py-4 pr-12 text-base outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && isActive && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold tracking-wider uppercase px-12 py-4 rounded-xl mt-4 cursor-pointer transition-colors disabled:opacity-50 w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </motion.div>

        {/* Toggle Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out z-[1000] ${
          isActive 
            ? '-translate-x-full rounded-r-[150px] rounded-bl-[100px]' 
            : 'translate-x-0 rounded-l-[150px] rounded-br-[100px]'
        }`}>
          <div className={`bg-gradient-to-br from-blue-600 to-indigo-600 h-full text-white relative -left-full w-[200%] transition-all duration-600 ease-in-out ${
            isActive ? 'translate-x-1/2' : 'translate-x-0'
          }`}>
            
            {/* Toggle Left Panel */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-12 text-center top-0 transition-all duration-600 ease-in-out ${
              isActive ? 'translate-x-0' : '-translate-x-[200%]'
            }`}>
              <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>
              <p className="text-lg leading-7 tracking-wide mb-8 opacity-90">
                Ready to boost your productivity? Sign in to access your personalized task management dashboard.
              </p>
              <button
                onClick={() => setIsActive(false)}
                className="bg-transparent border-2 border-white text-white text-sm font-semibold tracking-wider uppercase px-12 py-4 rounded-xl cursor-pointer hover:bg-white hover:text-blue-600 transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right Panel */}
            <div className={`absolute right-0 w-1/2 h-full flex flex-col items-center justify-center px-12 text-center top-0 transition-all duration-600 ease-in-out ${
              isActive ? 'translate-x-[200%]' : 'translate-x-0'
            }`}>
              <h1 className="text-3xl font-bold mb-6">Start Your Journey!</h1>
              <p className="text-lg leading-7 tracking-wide mb-8 opacity-90">
                Transform your productivity with intelligent task management. Create your free account and experience the future of organized work.
              </p>
              <button
                onClick={() => setIsActive(true)}
                className="bg-transparent border-2 border-white text-white text-sm font-semibold tracking-wider uppercase px-12 py-4 rounded-xl cursor-pointer hover:bg-white hover:text-blue-600 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}