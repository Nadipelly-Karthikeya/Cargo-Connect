import { useState, useEffect } from 'react'
import { Badge } from '../../components/Badge'
import { Button, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { VerifiedBadge } from '../../components/Rating'
import { adminAPI } from '../../api'

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [filters, setFilters] = useState({ status: '' })

  useEffect(() => {
    fetchVehicles()
  }, [filters])

  const fetchVehicles = async () => {
    try {
      const response = await adminAPI.getVehicles({ ...filters })
      setVehicles(response.data)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyVehicle = async (approved) => {
    if (!selectedVehicle) return

    try {
      await adminAPI.verifyVehicle(selectedVehicle._id, { approved })
      setShowVerifyModal(false)
      setSelectedVehicle(null)
      fetchVehicles()
    } catch (error) {
      console.error('Failed to verify vehicle:', error)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Vehicles' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Vehicles</h1>
        <p className="text-gray-600 mt-1">Verify and monitor registered vehicles</p>
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
          <h3 className="text-sm text-gray-600 mb-2">Total Vehicles</h3>
          <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Verification</h3>
          <p className="text-3xl font-bold text-yellow-700">
            {vehicles.filter(v => !v.isVerified && v.verificationStatus !== 'rejected').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Verified</h3>
          <p className="text-3xl font-bold text-green-700">
            {vehicles.filter(v => v.isVerified).length}
          </p>
        </div>
      </div>

      {/* Vehicles Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{vehicle.vehicleNumber}</h3>
                  <p className="text-sm text-gray-600 capitalize mt-1">{vehicle.vehicleType}</p>
                </div>
                {vehicle.isVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : vehicle.verificationStatus === 'rejected' ? (
                  <Badge variant="error">Rejected</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Owner:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{vehicle.owner?.name}</span>
                    <VerifiedBadge verified={vehicle.owner?.isVerified} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{vehicle.currentLocation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance Valid Till:</span>
                  <span className="font-medium">
                    {new Date(vehicle.insuranceExpiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-1">
                  {vehicle.rcCopy && (
                    <a href={vehicle.rcCopy} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      RC Copy
                    </a>
                  )}
                  {vehicle.insurance && (
                    <a href={vehicle.insurance} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      Insurance
                    </a>
                  )}
                  {vehicle.permit && (
                    <a href={vehicle.permit} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      Permit
                    </a>
                  )}
                </div>
              </div>

              {!vehicle.isVerified && vehicle.verificationStatus !== 'rejected' && (
                <Button
                  onClick={() => {
                    setSelectedVehicle(vehicle)
                    setShowVerifyModal(true)
                  }}
                  className="w-full"
                >
                  Review Verification
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No vehicles found</p>
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        title="Vehicle Verification"
      >
        <div className="space-y-4">
          {selectedVehicle && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle Number:</span>
                  <span className="font-medium">{selectedVehicle.vehicleNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium">{selectedVehicle.owner?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{selectedVehicle.vehicleType}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm">
                Review the uploaded documents and verify if all information is correct.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleVerifyVehicle(false)}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerifyVehicle(true)}
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

export default ManageVehicles
