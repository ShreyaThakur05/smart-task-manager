'use client'

import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function AuthForm() {
  const [isActive, setIsActive] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuthStore()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(signInEmail, signInPassword)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await register(signUpEmail, signUpPassword, signUpName)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
      <div className={`auth-container ${isActive ? 'active' : ''}`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1 className="text-2xl font-bold mb-5">Create Account</h1>
            <span className="text-xs mb-4 block text-gray-600 dark:text-gray-400">Use your email for registration</span>
            <input
              type="text"
              placeholder="Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
              className="auth-input"
            />
            {error && <div className="text-red-600 dark:text-red-400 text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded">{error}</div>}
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
            <div className="md:hidden mt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Already have an account?</p>
              <button 
                type="button"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                onClick={() => setIsActive(false)}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleSignIn}>
            <h1 className="text-2xl font-bold mb-5">Sign In</h1>
            <span className="text-xs mb-4 block text-gray-600 dark:text-gray-400">Use your email and password</span>
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
              className="auth-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
              className="auth-input"
            />
            <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 my-3 block">Forget Your Password?</a>
            {error && <div className="text-red-600 dark:text-red-400 text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded">{error}</div>}
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <div className="md:hidden mt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Don't have an account?</p>
              <button 
                type="button"
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                onClick={() => setIsActive(true)}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-sm mb-6">Enter your personal details to use all site features</p>
              <button 
                className="hidden-button" 
                onClick={() => setIsActive(false)}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1 className="text-2xl font-bold mb-4">Hello, Friend!</h1>
              <p className="text-sm mb-6">Register with your personal details to use all site features</p>
              <button 
                className="hidden-button" 
                onClick={() => setIsActive(true)}
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