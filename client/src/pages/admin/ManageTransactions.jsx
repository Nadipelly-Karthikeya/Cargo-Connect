import { useState, useEffect } from 'react'
import { Badge } from '../../components/Badge'
import { Button, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { VerifiedBadge } from '../../components/Rating'
import { adminAPI } from '../../api'

const ManageTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [filters, setFilters] = useState({ status: '' })

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      const response = await adminAPI.getTransactions({ ...filters })
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPayment = async (approved) => {
    if (!selectedTransaction) return

    try {
      await adminAPI.verifyPayment(selectedTransaction._id, { approved })
      setShowVerifyModal(false)
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error('Failed to verify payment:', error)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Transactions' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'verified', label: 'Verified' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Transactions</h1>
        <p className="text-gray-600 mt-1">Verify and monitor payment transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Verification</h3>
          <p className="text-3xl font-bold text-yellow-700">
            {transactions.filter(t => !t.paymentVerified && t.paymentProof).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-green-700">
            ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Load Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{transaction.load?.goodsType || 'N/A'}</div>
                    <div className="text-xs text-gray-400">
                      {transaction.load?.pickupLocation?.city} → {transaction.load?.dropLocation?.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>{transaction.company?.name || transaction.payer?.name || 'N/A'}</span>
                      {(transaction.company || transaction.payer) && (
                        <VerifiedBadge 
                          verified={transaction.company?.isVerified || transaction.payer?.isVerified} 
                          size="sm" 
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{transaction.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.paymentVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : transaction.paymentProof ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : (
                      <Badge variant="error">No Proof</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.paymentProof && (
                      <a
                        href={transaction.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-800 hover:underline mr-3"
                      >
                        View Proof
                      </a>
                    )}
                    {!transaction.paymentVerified && transaction.paymentProof && (
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction)
                          setShowVerifyModal(true)
                        }}
                        className="text-primary-800 hover:underline"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Verify Payment"
      >
        <div className="space-y-4">
          {selectedTransaction && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">#{selectedTransaction._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₹{selectedTransaction.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{selectedTransaction.company?.name || 'N/A'}</span>
                </div>
              </div>

              {selectedTransaction.paymentProof && (
                <div>
                  <a
                    href={selectedTransaction.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-800 hover:underline text-sm"
                  >
                    View Payment Proof →
                  </a>
                </div>
              )}

              <p className="text-gray-600 text-sm">
                Review the payment proof and confirm if the payment is valid.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleVerifyPayment(false)}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerifyPayment(true)}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default ManageTransactions
