import React, { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Clock, Loader2, X, Building2, Smartphone, Copy, Check, Upload, Plus, Trash2, ChevronDown, Globe, DollarSign } from 'lucide-react'
import axios from 'axios'

// Same exchange rates as web version
const EXCHANGE_RATES = {
  USD: 1, INR: 83.50, EUR: 0.92, GBP: 0.79, AUD: 1.53,
  CAD: 1.36, JPY: 149.50, SGD: 1.34, AED: 3.67, CNY: 7.24
}

const CURRENCY_SYMBOLS = {
  USD: '$', INR: '₹', EUR: '€', GBP: '£', AUD: 'A$',
  CAD: 'C$', JPY: '¥', SGD: 'S$', AED: 'د.إ', CNY: '¥'
}

const MobileWallet = () => {
  const [activeTab, setActiveTab] = useState('deposit')
  const [balance, setBalance] = useState(0)
  const [bankSettings, setBankSettings] = useState(null)
  const [userBankAccounts, setUserBankAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState('')

  // Deposit form - same as web
  const [depositAmount, setDepositAmount] = useState('')
  const [depositCurrency, setDepositCurrency] = useState('INR')
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [utrNumber, setUtrNumber] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState('')

  // Withdrawal form - same as web
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBankAccount, setSelectedBankAccount] = useState('')
  const [showAddBank, setShowAddBank] = useState(false)
  const [newBankAccount, setNewBankAccount] = useState({
    type: 'bank', bankName: '', accountNumber: '', accountHolderName: '', ifscCode: '', upiId: ''
  })

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })

  const getUSDAmount = (amount, currency) => {
    if (!amount || isNaN(amount)) return 0
    return parseFloat(amount) / (EXCHANGE_RATES[currency] || 1)
  }

  const usdEquivalent = getUSDAmount(depositAmount, depositCurrency)

  useEffect(() => {
    fetchData(true)
  }, [])

  const fetchData = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true)
      const [balanceRes, settingsRes, accountsRes, transRes] = await Promise.all([
        axios.get('/wallet/balance', getAuthHeader()),
        axios.get('/wallet/bank-settings', getAuthHeader()),
        axios.get('/wallet/bank-accounts', getAuthHeader()),
        axios.get('/wallet/transactions?limit=20', getAuthHeader())
      ])

      if (balanceRes.data.success) setBalance(balanceRes.data.data.balance)
      if (settingsRes.data.success) setBankSettings(settingsRes.data.data)
      if (accountsRes.data.success) setUserBankAccounts(accountsRes.data.data || [])
      if (transRes.data.success) setTransactions(transRes.data.data || [])
    } catch (err) {
      console.error('Failed to fetch wallet data:', err)
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setScreenshot(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return alert('Enter valid amount')
    try {
      setSubmitting(true)
      const res = await axios.post('/wallet/deposit', {
        amount: usdEquivalent,
        originalAmount: parseFloat(depositAmount),
        originalCurrency: depositCurrency,
        exchangeRate: EXCHANGE_RATES[depositCurrency],
        paymentMethod, utrNumber, transactionId, screenshot
      }, getAuthHeader())

      if (res.data.success) {
        alert('Deposit request submitted!')
        setDepositAmount(''); setUtrNumber(''); setTransactionId(''); setScreenshot('')
        fetchData()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return alert('Enter valid amount')
    if (!selectedBankAccount) return alert('Select a bank account')
    try {
      setSubmitting(true)
      const res = await axios.post('/wallet/withdraw', {
        amount: parseFloat(withdrawAmount),
        withdrawalMethod: 'bank',
        bankAccountId: selectedBankAccount
      }, getAuthHeader())

      if (res.data.success) {
        alert('Withdrawal request submitted!')
        setWithdrawAmount('')
        fetchData()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddBankAccount = async () => {
    try {
      setSubmitting(true)
      const res = await axios.post('/wallet/bank-accounts', newBankAccount, getAuthHeader())
      if (res.data.success) {
        setUserBankAccounts([...userBankAccounts, res.data.data])
        setShowAddBank(false)
        setNewBankAccount({ type: 'bank', bankName: '', accountNumber: '', accountHolderName: '', ifscCode: '', upiId: '' })
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBankAccount = async (id) => {
    if (!confirm('Delete this account?')) return
    try {
      await axios.delete(`/wallet/bank-accounts/${id}`, getAuthHeader())
      setUserBankAccounts(userBankAccounts.filter(a => a._id !== id))
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#22c55e'
      case 'pending': return '#fbbf24'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className="animate-spin" size={24} color="#6b7280" />
      </div>
    )
  }

  const tabs = [
    { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle, color: '#22c55e' },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle, color: '#ef4444' },
    { id: 'history', label: 'History', icon: Clock, color: '#3b82f6' }
  ]

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Balance */}
      <div className="p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Available Balance</p>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>${balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-2 py-2" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
            style={{ 
              backgroundColor: activeTab === tab.id ? tab.color : 'var(--bg-hover)',
              color: activeTab === tab.id ? (tab.id === 'deposit' ? '#000' : '#fff') : '#6b7280'
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            {/* Payment Method */}
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('bank')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs"
                style={{ backgroundColor: paymentMethod === 'bank' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-hover)', color: paymentMethod === 'bank' ? '#3b82f6' : 'var(--text-muted)', border: paymentMethod === 'bank' ? '1px solid #3b82f6' : '1px solid var(--border-color)' }}
              >
                <Building2 size={16} /> Bank
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs"
                style={{ backgroundColor: paymentMethod === 'upi' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-hover)', color: paymentMethod === 'upi' ? '#8b5cf6' : 'var(--text-muted)', border: paymentMethod === 'upi' ? '1px solid #8b5cf6' : '1px solid var(--border-color)' }}
              >
                <Smartphone size={16} /> UPI
              </button>
            </div>

            {/* Bank Settings Display */}
            {bankSettings && (
              <div className="p-3 rounded-xl space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Payment Details</p>
                {paymentMethod === 'bank' && (
                  <>
                    {bankSettings.bankName && (
                      <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bank</p><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{bankSettings.bankName}</p></div>
                        <button onClick={() => copyToClipboard(bankSettings.bankName, 'bank')} className="p-1">{copied === 'bank' ? <Check size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}</button>
                      </div>
                    )}
                    {bankSettings.accountNumber && (
                      <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Account No.</p><p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{bankSettings.accountNumber}</p></div>
                        <button onClick={() => copyToClipboard(bankSettings.accountNumber, 'acc')} className="p-1">{copied === 'acc' ? <Check size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}</button>
                      </div>
                    )}
                    {bankSettings.ifscCode && (
                      <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                        <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>IFSC</p><p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{bankSettings.ifscCode}</p></div>
                        <button onClick={() => copyToClipboard(bankSettings.ifscCode, 'ifsc')} className="p-1">{copied === 'ifsc' ? <Check size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}</button>
                      </div>
                    )}
                  </>
                )}
                {paymentMethod === 'upi' && bankSettings.upiId && (
                  <div className="flex justify-between items-center p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>UPI ID</p><p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{bankSettings.upiId}</p></div>
                    <button onClick={() => copyToClipboard(bankSettings.upiId, 'upi')} className="p-1">{copied === 'upi' ? <Check size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}</button>
                  </div>
                )}
              </div>
            )}

            {/* Currency Selection */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Currency</p>
              <button onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} className="w-full flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <Globe size={16} color="#3b82f6" />
                  <span style={{ color: 'var(--text-primary)' }}>{depositCurrency} ({CURRENCY_SYMBOLS[depositCurrency]})</span>
                </div>
                <ChevronDown size={16} color="#6b7280" />
              </button>
              {showCurrencyDropdown && (
                <div className="mt-2 rounded-lg max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
                  {Object.keys(EXCHANGE_RATES).map(cur => (
                    <button key={cur} onClick={() => { setDepositCurrency(cur); setShowCurrencyDropdown(false); }} className="w-full flex justify-between p-3 text-sm" style={{ color: depositCurrency === cur ? '#22c55e' : '#fff' }}>
                      <span>{cur} ({CURRENCY_SYMBOLS[cur]})</span>
                      <span style={{ color: 'var(--text-muted)' }}>1 USD = {EXCHANGE_RATES[cur]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Amount ({CURRENCY_SYMBOLS[depositCurrency]})</p>
              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Enter amount" className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>

            {/* USD Conversion */}
            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>You receive (USD)</span>
                  <span className="text-lg font-bold" style={{ color: '#22c55e' }}>${usdEquivalent.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* UTR */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>UTR / Reference</p>
              <input type="text" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} placeholder="Enter UTR number" className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>

            {/* Screenshot */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Payment Screenshot</p>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="mobile-screenshot" />
              <label htmlFor="mobile-screenshot" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed cursor-pointer" style={{ borderColor: '#262626', color: 'var(--text-muted)' }}>
                <Upload size={16} />
                {screenshot ? 'Uploaded ✓' : 'Upload Screenshot'}
              </label>
              {screenshot && <img src={screenshot} alt="Screenshot" className="w-full h-24 object-cover rounded-lg mt-2" />}
            </div>

            <button onClick={handleDeposit} disabled={submitting} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: '#22c55e', color: '#000' }}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Submit Deposit
            </button>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            {/* Bank Accounts */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Your Bank Accounts</p>
              <button onClick={() => setShowAddBank(true)} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs" style={{ backgroundColor: '#3b82f6', color: 'var(--text-primary)' }}>
                <Plus size={14} /> Add
              </button>
            </div>

            {userBankAccounts.length === 0 ? (
              <p className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No bank accounts. Add one to withdraw.</p>
            ) : (
              <div className="space-y-2">
                {userBankAccounts.map(acc => (
                  <div key={acc._id} onClick={() => setSelectedBankAccount(acc._id)} className="p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--bg-secondary)', border: selectedBankAccount === acc._id ? '2px solid #3b82f6' : '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {acc.type === 'bank' ? <Building2 size={16} color="#3b82f6" /> : <Smartphone size={16} color="#8b5cf6" />}
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{acc.type === 'bank' ? acc.bankName : 'UPI'}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{acc.type === 'bank' ? `****${acc.accountNumber?.slice(-4)}` : acc.upiId}</p>
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteBankAccount(acc._id); }}><Trash2 size={14} color="#ef4444" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available for withdrawal</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>${balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>

            {/* Amount */}
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Amount ($)</p>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter amount" max={balance} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>

            <button onClick={handleWithdraw} disabled={submitting || !selectedBankAccount} className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2" style={{ backgroundColor: '#ef4444', color: 'var(--text-primary)' }}>
              {submitting && <Loader2 className="animate-spin" size={16} />}
              Request Withdrawal
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
            ) : transactions.map(tx => (
              <div key={tx._id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {tx.type === 'deposit' ? <ArrowDownCircle size={16} color="#22c55e" /> : <ArrowUpCircle size={16} color="#ef4444" />}
                    <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>{tx.type}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded capitalize" style={{ backgroundColor: `${getStatusColor(tx.status)}20`, color: getStatusColor(tx.status) }}>{tx.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: tx.type === 'deposit' ? '#22c55e' : '#ef4444' }}>{tx.type === 'deposit' ? '+' : '-'}${tx.amount?.toFixed(2)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Bank Modal */}
      {showAddBank && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full p-4 rounded-t-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add Bank Account</h3>
              <button onClick={() => setShowAddBank(false)}><X size={20} color="#6b7280" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setNewBankAccount({ ...newBankAccount, type: 'bank' })} className="flex-1 py-2 rounded-lg text-sm" style={{ backgroundColor: newBankAccount.type === 'bank' ? '#3b82f6' : 'var(--bg-hover)', color: 'var(--text-primary)' }}>Bank</button>
                <button onClick={() => setNewBankAccount({ ...newBankAccount, type: 'upi' })} className="flex-1 py-2 rounded-lg text-sm" style={{ backgroundColor: newBankAccount.type === 'upi' ? '#8b5cf6' : 'var(--bg-hover)', color: 'var(--text-primary)' }}>UPI</button>
              </div>
              {newBankAccount.type === 'bank' ? (
                <>
                  <input type="text" placeholder="Bank Name" value={newBankAccount.bankName} onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                  <input type="text" placeholder="Account Number" value={newBankAccount.accountNumber} onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                  <input type="text" placeholder="Account Holder Name" value={newBankAccount.accountHolderName} onChange={(e) => setNewBankAccount({ ...newBankAccount, accountHolderName: e.target.value })} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                  <input type="text" placeholder="IFSC Code" value={newBankAccount.ifscCode} onChange={(e) => setNewBankAccount({ ...newBankAccount, ifscCode: e.target.value })} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
                </>
              ) : (
                <input type="text" placeholder="UPI ID" value={newBankAccount.upiId} onChange={(e) => setNewBankAccount({ ...newBankAccount, upiId: e.target.value })} className="w-full p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              )}
              <button onClick={handleAddBankAccount} disabled={submitting} className="w-full py-3 rounded-xl font-medium" style={{ backgroundColor: '#22c55e', color: '#000' }}>
                {submitting ? 'Adding...' : 'Add Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileWallet
