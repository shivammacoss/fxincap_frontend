import React, { useState, useEffect } from 'react'
import { Loader2, X, Edit2, XCircle } from 'lucide-react'
import axios from 'axios'

const MobilePositions = () => {
  const [activeTab, setActiveTab] = useState('positions')
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [modifyingTrade, setModifyingTrade] = useState(null)
  const [modifyForm, setModifyForm] = useState({ stopLoss: '', takeProfit: '' })
  const [submitting, setSubmitting] = useState(false)
  const [prices, setPrices] = useState({})

  useEffect(() => {
    fetchTrades(true)
    fetchPrices()
    // Auto-refresh every 2 seconds for prices, 3 seconds for trades
    const priceInterval = setInterval(fetchPrices, 2000)
    const tradeInterval = setInterval(() => fetchTrades(false), 3000)
    
    // Listen for trade events
    const handleTradeEvent = () => fetchTrades(false)
    window.addEventListener('tradeCreated', handleTradeEvent)
    window.addEventListener('tradeClosed', handleTradeEvent)
    
    return () => {
      clearInterval(priceInterval)
      clearInterval(tradeInterval)
      window.removeEventListener('tradeCreated', handleTradeEvent)
      window.removeEventListener('tradeClosed', handleTradeEvent)
    }
  }, [])

  const fetchPrices = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await axios.get('/trades/prices', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setPrices(res.data.data)
      }
    } catch (err) {
      // Silent fail for price updates
    }
  }

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

  const cancelOrder = async (tradeId) => {
    const token = localStorage.getItem('token')
    if (!confirm('Cancel this pending order?')) return
    try {
      const res = await axios.put(`/trades/${tradeId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        window.dispatchEvent(new Event('tradeClosed'))
        fetchTrades()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const modifyTrade = async () => {
    const token = localStorage.getItem('token')
    if (!modifyingTrade) return
    
    setSubmitting(true)
    try {
      const res = await axios.put(`/trades/${modifyingTrade._id}/modify`, {
        stopLoss: modifyForm.stopLoss ? parseFloat(modifyForm.stopLoss) : null,
        takeProfit: modifyForm.takeProfit ? parseFloat(modifyForm.takeProfit) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setModifyingTrade(null)
        fetchTrades()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to modify trade')
    } finally {
      setSubmitting(false)
    }
  }

  const openModifyModal = (trade) => {
    setModifyingTrade(trade)
    setModifyForm({ 
      stopLoss: trade.stopLoss || '', 
      takeProfit: trade.takeProfit || '' 
    })
  }

  // Calculate live P/L using current prices
  const calculatePnL = (trade) => {
    const price = prices[trade.symbol]
    if (!price) return trade.profit || 0
    
    const currentPrice = trade.type === 'buy' ? price.bid : price.ask
    const priceDiff = trade.type === 'buy' 
      ? currentPrice - trade.price 
      : trade.price - currentPrice
    
    // Contract size based on symbol
    let contractSize = 100000
    if (trade.symbol.includes('XAU')) contractSize = 100
    else if (trade.symbol.includes('XAG')) contractSize = 5000
    else if (trade.symbol.includes('BTC') || trade.symbol.includes('ETH')) contractSize = 1
    
    return priceDiff * trade.amount * contractSize
  }

  const getCurrentPrice = (trade) => {
    const price = prices[trade.symbol]
    if (!price) return trade.price
    return trade.type === 'buy' ? price.bid : price.ask
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
      {/* Total P/L for open positions */}
      {openTrades.length > 0 && (
        <div className="flex justify-between items-center px-3 py-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Floating P/L</span>
          <span 
            className="text-sm font-bold"
            style={{ color: openTrades.reduce((sum, t) => sum + calculatePnL(t), 0) >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {openTrades.reduce((sum, t) => sum + calculatePnL(t), 0) >= 0 ? '+' : ''}
            ${openTrades.reduce((sum, t) => sum + calculatePnL(t), 0).toFixed(2)}
          </span>
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  {(activeTab === 'positions' || activeTab === 'pending') && (
                    <button onClick={() => openModifyModal(trade)} className="p-1">
                      <Edit2 size={14} color="#6b7280" />
                    </button>
                  )}
                  {activeTab === 'positions' && (
                    <button onClick={() => closeTrade(trade._id)} className="p-1">
                      <X size={14} color="#ef4444" />
                    </button>
                  )}
                  {activeTab === 'pending' && (
                    <button onClick={() => cancelOrder(trade._id)} className="p-1">
                      <XCircle size={14} color="#ef4444" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-muted)' }}>
                  {trade.amount} lots @ {trade.price?.toFixed(5)}
                  {activeTab === 'positions' && prices[trade.symbol] && (
                    <span style={{ color: 'var(--text-primary)' }}> → {getCurrentPrice(trade)?.toFixed(5)}</span>
                  )}
                </span>
                {activeTab === 'positions' ? (
                  <span style={{ color: calculatePnL(trade) >= 0 ? '#22c55e' : '#ef4444' }}>
                    {calculatePnL(trade) >= 0 ? '+' : ''}${calculatePnL(trade).toFixed(2)}
                  </span>
                ) : (
                  <span style={{ color: (trade.profit || 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                    {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                  </span>
                )}
              </div>
              {/* Show SL/TP if set */}
              {(trade.stopLoss || trade.takeProfit) && (
                <div className="flex gap-3 text-xs">
                  {trade.stopLoss && (
                    <span style={{ color: '#ef4444' }}>SL: {trade.stopLoss}</span>
                  )}
                  {trade.takeProfit && (
                    <span style={{ color: '#22c55e' }}>TP: {trade.takeProfit}</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modify SL/TP Modal */}
      {modifyingTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Modify {modifyingTrade.symbol}
            </h3>
            
            {/* Trade Info */}
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-hover)' }}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Type</span>
                <span style={{ color: modifyingTrade.type === 'buy' ? '#22c55e' : '#ef4444' }}>
                  {modifyingTrade.type?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Entry</span>
                <span style={{ color: 'var(--text-primary)' }}>{modifyingTrade.price?.toFixed(5)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Stop Loss</label>
                <input
                  type="number"
                  step="0.00001"
                  value={modifyForm.stopLoss}
                  onChange={(e) => setModifyForm({ ...modifyForm, stopLoss: e.target.value })}
                  placeholder="Leave empty to remove"
                  className="w-full px-3 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Take Profit</label>
                <input
                  type="number"
                  step="0.00001"
                  value={modifyForm.takeProfit}
                  onChange={(e) => setModifyForm({ ...modifyForm, takeProfit: e.target.value })}
                  placeholder="Leave empty to remove"
                  className="w-full px-3 py-3 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModifyingTrade(null)}
                  className="flex-1 py-3 rounded-xl font-medium"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={modifyTrade}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#22c55e', opacity: submitting ? 0.5 : 1 }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobilePositions
