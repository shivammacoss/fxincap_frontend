import React, { useState, useEffect } from 'react'
import { ArrowLeft, Users, DollarSign, Copy, Loader2, TrendingUp, Wallet, Clock, Share2, CheckCircle, RefreshCw, UserPlus, ArrowDownToLine } from 'lucide-react'
import axios from 'axios'

const MobileIB = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [commissions, setCommissions] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [profileRes, statsRes, referralsRes, commissionsRes, withdrawalsRes] = await Promise.all([
        axios.get('/ib/profile', getAuthHeader()),
        axios.get('/ib/stats', getAuthHeader()),
        axios.get('/ib/referrals', getAuthHeader()),
        axios.get('/ib/commissions', getAuthHeader()),
        axios.get('/ib/withdrawals', getAuthHeader())
      ])

      if (profileRes.data.success) setProfile(profileRes.data.data)
      if (statsRes.data.success) setStats(statsRes.data.data)
      if (referralsRes.data.success) setReferrals(referralsRes.data.data || [])
      if (commissionsRes.data.success) setCommissions(commissionsRes.data.data || [])
      if (withdrawalsRes.data.success) setWithdrawals(withdrawalsRes.data.data || [])
    } catch (err) {
      console.error('Failed to fetch IB data:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join FX Incap', url: profile?.referralLink })
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    try {
      setSubmitting(true)
      const res = await axios.post('/ib/withdraw-to-wallet', { amount: parseFloat(withdrawAmount) }, getAuthHeader())
      if (res.data.success) {
        alert(res.data.message)
        setWithdrawAmount('')
        fetchData()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw')
    } finally {
      setSubmitting(false)
    }
  }

  const referralLink = profile?.referralLink || (profile?.referralCode ? `${window.location.origin}/register?ref=${profile.referralCode}` : '')

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} color="#6b7280" />
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'commissions', label: 'Commissions' },
    { id: 'withdrawals', label: 'Withdrawals' }
  ]

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <ArrowLeft size={18} color="#9ca3af" />
          </button>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>IB Dashboard</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{profile?.ibId}</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <RefreshCw size={16} color="#9ca3af" />
        </button>
      </div>

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
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <>
            {/* Referral Link Card */}
            <div className="rounded-xl p-4 mb-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <p className="text-blue-100 text-xs mb-1">Your Referral Link</p>
              <p className="text-white font-mono text-xs break-all mb-2">{referralLink}</p>
              <p className="text-blue-200 text-xs">
                Code: <span className="font-bold text-white">{profile?.referralCode}</span>
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {copied ? <CheckCircle size={14} color="#fff" /> : <Copy size={14} color="#fff" />}
                  <span style={{ color: 'var(--text-primary)' }}>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Share2 size={14} color="#fff" />
                  <span style={{ color: 'var(--text-primary)' }}>Share</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <Users size={18} color="#3b82f6" className="mb-1" />
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalReferrals || 0}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Referrals</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <UserPlus size={18} color="#22c55e" className="mb-1" />
                <p className="text-lg font-bold" style={{ color: '#22c55e' }}>{stats?.activeReferrals || 0}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Traders</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <TrendingUp size={18} color="#a855f7" className="mb-1" />
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalTradingVolume?.toFixed(2) || 0} lots</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Trading Volume</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <DollarSign size={18} color="#fbbf24" className="mb-1" />
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${stats?.totalDeposits?.toLocaleString() || 0}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Deposits</p>
              </div>
            </div>

            {/* IB Wallet */}
            <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Wallet size={16} /> IB Wallet
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available Balance</p>
                  <p className="text-lg font-bold" style={{ color: '#22c55e' }}>${stats?.availableBalance?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Earned</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${stats?.totalCommissionEarned?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending Withdrawals</p>
                  <p className="text-lg font-bold" style={{ color: '#fbbf24' }}>${stats?.pendingWithdrawals?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Withdrawn</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>${stats?.totalWithdrawn?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount to withdraw"
                  className="flex-1 p-2 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={submitting || !withdrawAmount}
                  className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                  style={{ backgroundColor: '#22c55e', color: '#000' }}
                >
                  <ArrowDownToLine size={14} />
                  {submitting ? 'Processing...' : 'Transfer'}
                </button>
              </div>
            </div>

            {/* Commission Model */}
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Commission Model</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Type:</span>
                  <span className="text-xs font-medium capitalize" style={{ color: 'var(--text-primary)' }}>{profile?.commissionType?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rate:</span>
                  <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                    {profile?.commissionType === 'per_lot' ? `$${profile?.commissionValue} per lot` :
                     profile?.commissionType === 'percentage_profit' ? `${profile?.commissionValue}% of profit` :
                     `${profile?.commissionValue}%`}
                  </span>
                </div>
                {profile?.firstDepositCommission?.enabled && (
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>First Deposit Bonus:</span>
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>{profile?.firstDepositCommission?.percentage}%</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile?.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {profile?.status}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-2">
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} color="#6b7280" className="mx-auto mb-2" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No referrals yet</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Share your link to start earning!</p>
              </div>
            ) : referrals.map(ref => (
              <div key={ref._id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ref.referredUserId?.firstName} {ref.referredUserId?.lastName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ref.referredUserId?.email}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: ref.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)', color: ref.status === 'active' ? '#22c55e' : '#6b7280' }}>
                    {ref.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Registered</p>
                    <p style={{ color: 'var(--text-primary)' }}>{new Date(ref.registeredAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Volume</p>
                    <p style={{ color: 'var(--text-primary)' }}>{ref.stats?.totalTradingVolume?.toFixed(2) || 0} lots</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)' }}>Commission</p>
                    <p style={{ color: '#22c55e' }}>${ref.stats?.commissionGenerated?.toFixed(2) || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="space-y-2">
            {commissions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign size={32} color="#6b7280" className="mx-auto mb-2" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No commission history yet</p>
              </div>
            ) : commissions.map(com => (
              <div key={com._id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold" style={{ color: '#22c55e' }}>+${com.commissionAmount?.toFixed(2)}</p>
                      <span className="px-2 py-0.5 rounded text-xs capitalize" style={{ backgroundColor: 'var(--bg-hover)', color: '#9ca3af' }}>
                        {com.sourceType?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{com.sourceUserId?.firstName} {com.sourceUserId?.lastName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {com.sourceType === 'trade' ? `${com.symbol} • ${com.lots} lots` : com.sourceType === 'first_deposit' ? `$${com.depositAmount}` : '-'}
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(com.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-2">
            {withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <ArrowDownToLine size={32} color="#6b7280" className="mx-auto mb-2" />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No withdrawal history yet</p>
              </div>
            ) : withdrawals.map(w => (
              <div key={w._id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>${w.amount?.toFixed(2)}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{w.method}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      w.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      w.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {w.status}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileIB
