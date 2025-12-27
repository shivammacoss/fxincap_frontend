import React from 'react'
import { X, Users2, Copy, Headphones, User, LogOut, Moon, Sun, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const MobileMore = ({ onClose, onNavigate }) => {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  const menuItems = [
    { id: 'ib', label: 'IB Program', icon: Users2, desc: 'Refer & earn commissions' },
    { id: 'copy', label: 'Copy Trade', icon: Copy, desc: 'Follow expert traders' },
    { id: 'support', label: 'Support', icon: Headphones, desc: 'Get help' },
    { id: 'profile', label: 'Profile', icon: User, desc: 'Account settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div 
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>More</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--bg-hover)' }}
                >
                  <item.icon size={18} color="#22c55e" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {isDark ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#3b82f6" />}
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{isDark ? 'Light' : 'Dark'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}
          >
            <LogOut size={16} color="#ef4444" />
            <span className="text-sm" style={{ color: '#ef4444' }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileMore
