import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { loadAPI } from '../../api'

const ManageLoads = () => {
  const navigate = useNavigate()
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })

  useEffect(() => {
    fetchLoads()
  }, [filters])

  const fetchLoads = async () => {
    try {
      const response = await loadAPI.getMyLoads({ ...filters })
      setLoads(response.data.loads)
    } catch (error) {
      console.error('Failed to fetch loads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (load) => {
    setSelectedLoad(load)
    setDeleteReason('')
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedLoad) return

    setDeleting(true)
    try {
      await loadAPI.deleteLoad(selectedLoad._id, { reason: deleteReason })
      setShowDeleteModal(false)
      setSelectedLoad(null)
      fetchLoads()
    } catch (error) {
      console.error('Failed to delete load:', error)
      alert(error.response?.data?.message || 'Failed to delete load')
    } finally {
      setDeleting(false)
    }
  }

  const handleEditClick = (loadId) => {
    navigate(`/company/loads/${loadId}/edit`)
  }

  const canEdit = (load) => {
    return ['Posted', 'Approved'].includes(load.status)
  }

  const canDelete = (load) => {
    return !['Delivered', 'Completed'].includes(load.status)
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Posted', label: 'Posted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Reached Pickup', label: 'Reached Pickup' },
    { value: 'On Route', label: 'On Route' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Loads</h1>
          <p className="text-gray-600 mt-1">Track and manage all your shipments</p>
        </div>
        <Link to="/company/loads/create">
          <Button>Post New Load</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by material or location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
          />
          <Button variant="secondary" onClick={fetchLoads}>Apply Filters</Button>
        </div>
      </div>

      {/* Loads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Load ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loads.length > 0 ? (
              loads.map((load) => (
                <tr key={load._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{load._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{load.pickupLocation.city}</div>
                    <div className="text-xs text-gray-400">↓</div>
                    <div>{load.dropLocation.city}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{load.goodsType}</div>
                    <div className="text-xs text-gray-400">{load.weight} tons</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {load.requiredVehicleType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LoadStatusBadge status={load.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{load.estimatedCost.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link to={`/company/loads/${load._id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                        View
                      </Link>
                      {canEdit(load) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleEditClick(load._id)}
                            className="text-green-600 hover:text-green-800 hover:underline"
                          >
                            Edit
                          </button>
                        </>
                      )}
                      {canDelete(load) && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteClick(load)}
                            className="text-red-600 hover:text-red-800 hover:underline"
                          >
                            {['Posted', 'Approved'].includes(load.status) ? 'Delete' : 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="font-medium">No loads found</p>
                    <p className="text-sm mt-1">Try changing your filters or post a new load</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete/Cancel Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={selectedLoad && ['Posted', 'Approved'].includes(selectedLoad.status) ? 'Delete Load' : 'Cancel Load'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {selectedLoad && ['Posted', 'Approved'].includes(selectedLoad.status)
              ? 'Are you sure you want to delete this load? This action cannot be undone.'
              : 'Are you sure you want to cancel this load? The assigned lorry owner will be notified.'}
          </p>

          {selectedLoad && !['Posted', 'Approved'].includes(selectedLoad.status) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          )}

          {selectedLoad && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Load ID:</span>
                <span className="font-medium">#{selectedLoad._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">
                  {selectedLoad.pickupLocation.city} → {selectedLoad.dropLocation.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <LoadStatusBadge status={selectedLoad.status} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Processing...' : selectedLoad && ['Posted', 'Approved'].includes(selectedLoad.status) ? 'Delete' : 'Cancel Load'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageLoads
