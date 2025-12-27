import React, { useEffect, useRef } from 'react'

const MobileChart = ({ symbol }) => {
  const containerRef = useRef(null)

  // Map symbols to TradingView format
  const getSymbol = (sym) => {
    const symbolMap = {
      // Major Forex
      'EURUSD': 'FX:EURUSD',
      'GBPUSD': 'FX:GBPUSD',
      'USDJPY': 'FX:USDJPY',
      'USDCHF': 'FX:USDCHF',
      'AUDUSD': 'FX:AUDUSD',
      'NZDUSD': 'FX:NZDUSD',
      'USDCAD': 'FX:USDCAD',
      // Cross pairs
      'EURGBP': 'FX:EURGBP',
      'EURJPY': 'FX:EURJPY',
      'EURCHF': 'FX:EURCHF',
      'GBPJPY': 'FX:GBPJPY',
      'AUDCAD': 'FX:AUDCAD',
      'AUDCHF': 'FX:AUDCHF',
      'AUDJPY': 'FX:AUDJPY',
      'AUDNZD': 'FX:AUDNZD',
      'CADCHF': 'FX:CADCHF',
      'CADJPY': 'FX:CADJPY',
      'CHFJPY': 'FX:CHFJPY',
      'EURAUD': 'FX:EURAUD',
      'EURCAD': 'FX:EURCAD',
      'EURNZD': 'FX:EURNZD',
      'GBPAUD': 'FX:GBPAUD',
      'GBPCAD': 'FX:GBPCAD',
      'GBPCHF': 'FX:GBPCHF',
      'GBPNZD': 'FX:GBPNZD',
      'NZDCAD': 'FX:NZDCAD',
      'NZDCHF': 'FX:NZDCHF',
      'NZDJPY': 'FX:NZDJPY',
      // Metals
      'XAUUSD': 'TVC:GOLD',
      'XAGUSD': 'TVC:SILVER',
      'XAUEUR': 'TVC:GOLDEUR',
      // Indices
      'US30': 'TVC:DJI',
      'US500': 'TVC:SPX',
      'US100': 'NASDAQ:NDX',
      'DE30': 'XETR:DAX',
      'UK100': 'TVC:UKX',
      'JP225': 'TVC:NI225',
      // Crypto
      'BTCUSD': 'BINANCE:BTCUSDT',
      'ETHUSD': 'BINANCE:ETHUSDT',
      'LTCUSD': 'BINANCE:LTCUSDT',
      'XRPUSD': 'BINANCE:XRPUSDT',
      // Energy
      'USOIL': 'TVC:USOIL',
      'UKOIL': 'TVC:UKOIL',
      'XNGUSD': 'TVC:NATURALGAS',
    }
    return symbolMap[sym] || `FX:${sym}`
  }

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: getSymbol(symbol),
          interval: '15',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#000000',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: true,
          save_image: false,
          container_id: 'mobile-chart-container',
          backgroundColor: '#0a0e17',
          gridColor: '#1f2937',
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [symbol])

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Symbol Header */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{symbol}</span>
        <span className="text-xs" style={{ color: '#22c55e' }}>+0.00%</span>
      </div>

      {/* Chart */}
      <div 
        id="mobile-chart-container" 
        ref={containerRef}
        className="flex-1"
        style={{ minHeight: '300px' }}
      />
    </div>
  )
}

export default MobileChart
