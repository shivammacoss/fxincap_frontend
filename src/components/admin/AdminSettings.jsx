import React, { useState } from 'react'
import { Lock, Eye, EyeOff, Shield, Check, AlertCircle } from 'lucide-react'

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${API_URL}/admin/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--accent-blue)' }}>
          <Shield className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Admin Settings
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage your account security settings
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <div 
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock size={20} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Change Password
          </h3>
        </div>

        {message.text && (
          <div 
            className={`flex items-center gap-2 p-4 rounded-xl mb-6 ${
              message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}
          >
            {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-blue)' }}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div 
        className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Security Tips
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Use a strong password with at least 8 characters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Include uppercase, lowercase, numbers, and special characters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Never share your password with anyone
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Change your password regularly for better security
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AdminSettings
