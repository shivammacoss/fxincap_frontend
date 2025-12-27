import React from 'react'
import Navigation from './Navigation'
import HeroSection from './HeroSection'
import InvestStockTokens from './InvestStockTokens'
import CryptoPromo from './CryptoPromo'
import PerpetualFutures from './PerpetualFutures'
import SecurityTrust from './SecurityTrust'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div className="landing-page flex flex-col min-h-screen overflow-auto" style={{ backgroundColor: '#110E08' }}>
      <Navigation />
      <main>
        <HeroSection />
        <InvestStockTokens />
        <CryptoPromo />
        <PerpetualFutures />
        <SecurityTrust />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
