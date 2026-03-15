import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input } from '../../components/FormElements'
import { authAPI } from '../../api'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail } = useAuth()
  const [email, setEmail] = useState(location.state?.email || '')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    
    if (!email || !token) {
      setError('Please enter both email and verification code')
      return
    }

    if (token.length !== 6) {
      setError('Verification code must be 6 digits')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await verifyEmail(email, token)
      setSuccess('Email verified successfully! Redirecting...')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err) {
      console.error('Verification error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Verification failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await authAPI.resendVerification({ email })
      setSuccess(response.data.message || 'Verification code sent to your email!')
    } catch (err) {
      console.error('Resend verification error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resend verification code'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-primary-200">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="text"
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              className="text-primary-800 font-semibold hover:underline"
              disabled={loading}
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
