import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { lorryAPI } from '../../api'

const ManageVehicles = () => {
  const [lorries, setLorries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '' })

  useEffect(() => {
    fetchLorries()
  }, [filters])

  const fetchLorries = async () => {
    try {
      const response = await lorryAPI.getMyLorries()
      // API returns { success, count, lorries }
      let data = response.data.lorries || []
      
      if (filters.status === 'available') {
        data = data.filter(l => l.isAvailable)
      } else if (filters.status === 'in-use') {
        data = data.filter(l => !l.isAvailable)
      }
      
      setLorries(data)
    } catch (error) {
      console.error('Failed to fetch lorries:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: '', label: 'All Vehicles' },
    { value: 'available', label: 'Available' },
    { value: 'in-use', label: 'In Use' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage your fleet of vehicles</p>
        </div>
        <Link to="/lorry/vehicles/add">
          <Button>Add New Vehicle</Button>
        </Link>
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

      {/* Vehicles Grid */}
      {lorries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lorries.map((lorry) => (
            <div key={lorry._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{lorry.vehicleNumber}</h3>
                  <p className="text-sm text-gray-600 capitalize mt-1">{lorry.vehicleType}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {lorry.isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                  {lorry.isAvailable ? (
                    <Badge variant="info">Available</Badge>
                  ) : (
                    <Badge variant="error">In Use</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{lorry.capacity} tons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Location:</span>
                  <span className="font-medium">
                    {lorry.currentLocation?.city && lorry.currentLocation?.state 
                      ? `${lorry.currentLocation.city}, ${lorry.currentLocation.state}`
                      : lorry.currentLocation?.city || lorry.currentLocation?.state || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance Valid Till:</span>
                  <span className="font-medium">
                    {new Date(lorry.insuranceExpiry).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-1">
                  {lorry.rcDocumentUrl && (
                    <a href={lorry.rcDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      RC Copy
                    </a>
                  )}
                  {lorry.insuranceDocumentUrl && (
                    <a href={lorry.insuranceDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      Insurance
                    </a>
                  )}
                  {lorry.licenseDocumentUrl && (
                    <a href={lorry.licenseDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-800 hover:underline block">
                      License
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Link to={`/lorry/vehicles/${lorry._id}/edit`}>
                  <Button variant="secondary" className="w-full">Edit Vehicle</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No vehicles found</p>
          <p className="text-gray-600 mb-6">Add your first vehicle to start accepting loads</p>
          <Link to="/lorry/vehicles/add">
            <Button>Add Vehicle</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default ManageVehicles
