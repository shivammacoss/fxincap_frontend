import React, { useState, useEffect } from 'react'
import { Home, ArrowUpDown, LineChart, TrendingUp, Clock, Wallet } from 'lucide-react'
import axios from 'axios'
import MobileMarkets from './MobileMarkets'
import MobileChart from './MobileChart'
import MobileOrder from './MobileOrder'
import MobilePositions from './MobilePositions'

const MobileTrade = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('chart')
  const [selectedSymbol, setSelectedSymbol] = useState(() => {
    return localStorage.getItem('selectedSymbol') || 'XAUUSD'
  })
  const [equity, setEquity] = useState(0)

  // Save selected symbol to localStorage
  useEffect(() => {
    localStorage.setItem('selectedSymbol', selectedSymbol)
  }, [selectedSymbol])

  useEffect(() => {
    const fetchEquity = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const res = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.success) {
          setEquity(res.data.data.balance || 0)
        }
      } catch (err) {}
    }
    fetchEquity()
    const interval = setInterval(fetchEquity, 5000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'markets', label: 'Markets', icon: ArrowUpDown },
    { id: 'chart', label: 'Chart', icon: LineChart },
    { id: 'trade', label: 'Trade', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: Clock },
  ]

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol)
    setActiveTab('chart')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'markets':
        return <MobileMarkets onSelect={handleSymbolSelect} selectedSymbol={selectedSymbol} />
      case 'chart':
        return <MobileChart symbol={selectedSymbol} />
      case 'trade':
        return <MobileOrder symbol={selectedSymbol} />
      case 'orders':
        return <MobilePositions />
      default:
        return <MobileChart symbol={selectedSymbol} />
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <button onClick={onBack} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <Home size={18} color="#9ca3af" />
        </button>
        
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Equity</p>
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>${equity.toFixed(2)}</p>
        </div>
        
        <button onClick={() => onNavigate?.('wallet')} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <Wallet size={18} color="#22c55e" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Trade Navigation */}
      <nav 
        className="flex items-center justify-around py-2"
        style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center py-2 px-4"
          >
            <tab.icon 
              size={20} 
              color={activeTab === tab.id ? '#22c55e' : '#6b7280'} 
            />
            <span 
              className="text-xs mt-1"
              style={{ color: activeTab === tab.id ? '#22c55e' : '#6b7280' }}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default MobileTrade
