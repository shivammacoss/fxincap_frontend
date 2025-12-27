import React, { useState, useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import axios from 'axios'

const MobilePositions = () => {
  const [activeTab, setActiveTab] = useState('positions')
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrades(true)
    // Auto-refresh every 3 seconds (silent)
    const interval = setInterval(() => fetchTrades(false), 3000)
    
    // Listen for trade events
    const handleTradeEvent = () => fetchTrades(false)
    window.addEventListener('tradeCreated', handleTradeEvent)
    window.addEventListener('tradeClosed', handleTradeEvent)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('tradeCreated', handleTradeEvent)
      window.removeEventListener('tradeClosed', handleTradeEvent)
    }
  }, [])

  const fetchTrades = async (showLoader = false) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      if (showLoader) setLoading(true)
      const res = await axios.get('/trades?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        // Handle both response formats
        const tradesData = res.data.data?.trades || res.data.data || []
        setTrades(tradesData)
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err)
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const closeTrade = async (tradeId) => {
    const token = localStorage.getItem('token')
    if (!confirm('Close this trade?')) return
    try {
      const res = await axios.put(`/trades/${tradeId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        window.dispatchEvent(new Event('tradeClosed'))
        fetchTrades()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close trade')
    }
  }

  const openTrades = trades.filter(t => t.status === 'open')
  const pendingTrades = trades.filter(t => t.status === 'pending')
  const closedTrades = trades.filter(t => t.status === 'closed')

  const tabs = [
    { id: 'positions', label: 'Positions', count: openTrades.length },
    { id: 'pending', label: 'Pending', count: pendingTrades.length },
    { id: 'history', label: 'History', count: closedTrades.length },
  ]

  const getDisplayTrades = () => {
    switch (activeTab) {
      case 'positions': return openTrades
      case 'pending': return pendingTrades
      case 'history': return closedTrades
      default: return openTrades
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin" size={24} color="#6b7280" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 text-xs"
            style={{ 
              color: activeTab === tab.id ? '#22c55e' : '#6b7280',
              borderBottom: activeTab === tab.id ? '2px solid #22c55e' : '2px solid transparent'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {getDisplayTrades().length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab}</p>
          </div>
        ) : (
          getDisplayTrades().map(trade => (
            <div 
              key={trade._id}
              className="p-3"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: trade.type === 'buy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: trade.type === 'buy' ? '#22c55e' : '#ef4444'
                    }}
                  >
                    {trade.type?.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{trade.symbol}</span>
                </div>
                {activeTab === 'positions' && (
                  <button onClick={() => closeTrade(trade._id)} className="p-1">
                    <X size={14} color="#ef4444" />
                  </button>
                )}
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>{trade.amount} lots @ {trade.price?.toFixed(5)}</span>
                <span style={{ color: (trade.profit || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                  {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MobilePositions
