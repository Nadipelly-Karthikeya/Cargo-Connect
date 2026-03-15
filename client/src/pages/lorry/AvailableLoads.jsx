import { FaMapMarkerAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { RatingDisplay, VerifiedBadge } from '../../components/Rating'
import { loadAPI, lorryAPI } from '../../api'

const AvailableLoads = () => {
  const [loads, setLoads] = useState([])
  const [lorries, setLorries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState(null)
  const [selectedLorry, setSelectedLorry] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [filters, setFilters] = useState({
    vehicleType: '',
    search: '',
    goodsType: '',
    pickupCity: '',
    dropCity: ''
  })

  useEffect(() => {
    // Get user's location for "Near You" feature
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied, showing all loads')
        }
      )
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [filters, userLocation])

  const fetchData = async () => {
    try {
      const queryParams = { ...filters }
      
      // Add user location for "Near You" sorting
      if (userLocation) {
        queryParams.userLat = userLocation.lat
        queryParams.userLng = userLocation.lng
      }
      
      const [loadsData, lorriesData] = await Promise.all([
        loadAPI.getAvailableLoads(queryParams),
        lorryAPI.getMyLorries()
      ])
      setLoads(loadsData.data.loads || [])
      // Lorry API returns { lorries } not { data }
      const lorryList = lorriesData.data.lorries || []
      // Filter only by availability - allow pending verification vehicles to accept loads
      setLorries(lorryList.filter(l => l.isAvailable))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptLoad = async () => {
    if (!selectedLoad || !selectedLorry) return

    try {
      await loadAPI.acceptLoad(selectedLoad._id, { lorryId: selectedLorry })
      setShowAcceptModal(false)
      fetchData()
    } catch (error) {
      console.error('Failed to accept load:', error)
    }
  }

  const vehicleTypes = [
    { value: '', label: 'All Vehicle Types' },
    { value: 'Mini Truck', label: 'Mini Truck' },
    { value: 'Small Truck', label: 'Small Truck' },
    { value: 'Medium Truck', label: 'Medium Truck' },
    { value: 'Large Truck', label: 'Large Truck' },
    { value: 'Container 20ft', label: 'Container 20ft' },
    { value: 'Container 40ft', label: 'Container 40ft' },
    { value: 'Trailer', label: 'Trailer' },
    { value: 'Tanker', label: 'Tanker' }
  ]

  const goodsTypes = [
    { value: '', label: 'All Goods Types' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Food', label: 'Food' },
    { value: 'Chemicals', label: 'Chemicals' },
    { value: 'Textiles', label: 'Textiles' },
    { value: 'Machinery', label: 'Machinery' },
    { value: 'Automotive Parts', label: 'Automotive Parts' },
    { value: 'Construction Materials', label: 'Construction Materials' },
    { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'General Cargo', label: 'General Cargo' },
    { value: 'Other', label: 'Other' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Available Loads</h1>
          {loads.length > 0 && (
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              {loads.length} load{loads.length !== 1 ? 's' : ''} available
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-1">
          Browse and accept loads for your vehicles
          {userLocation && <span className="text-green-600 font-medium"> • Sorted by nearest first</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input
            placeholder="Search by material or location..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="lg:col-span-2"
          />
          <Input
            placeholder="Pickup City..."
            value={filters.pickupCity}
            onChange={(e) => setFilters({ ...filters, pickupCity: e.target.value })}
          />
          <Input
            placeholder="Drop City..."
            value={filters.dropCity}
            onChange={(e) => setFilters({ ...filters, dropCity: e.target.value })}
          />
          <Select
            value={filters.goodsType}
            onChange={(e) => setFilters({ ...filters, goodsType: e.target.value })}
            options={goodsTypes}
          />
          <Select
            value={filters.vehicleType}
            onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
            options={vehicleTypes}
          />
        </div>
        {userLocation && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <FaMapMarkerAlt className="inline mb-1" /> Showing loads nearest to you
          </p>
        )}
      </div>

      {/* Loads Grid */}
      {loads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loads.map((load) => (
            <div key={load._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">#{load._id.slice(-6).toUpperCase()}</h3>
                    {load.distanceFromUser !== null && load.distanceFromUser < 100 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        <FaMapMarkerAlt className="inline mb-1" /> Near You
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{load.goodsType}</p>
                  
                  {/* Company Rating */}
                  {load.companyId && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600">Company:</span>
                      <div className="flex items-center gap-1">
                        <VerifiedBadge verified={load.companyId.isVerified} size="sm" />
                        {load.companyId.ratingAverage > 0 && (
                          <RatingDisplay 
                            rating={parseFloat(load.companyId.ratingAverage)} 
                            count={load.companyId.ratingCount}
                            size="sm"
                            showCount={false}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <LoadStatusBadge status={load.status} />
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Route:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium">{load.pickupLocation.city}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="font-medium">{load.dropLocation.city}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Weight:</span>
                    <p className="font-medium">{load.weight} tons</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Distance:</span>
                    <p className="font-medium">{load.distance} km</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle Type:</span>
                    <p className="font-medium text-xs">{load.requiredVehicleType}</p>
                  </div>
                  {load.distanceFromUser !== null && (
                    <div>
                      <span className="text-gray-600">From You:</span>
                      <p className="font-medium text-green-600">{load.distanceFromUser} km</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Earnings:</span>
                    <span className="text-2xl font-bold text-green-700">
                      ₹{load.estimatedCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedLoad(load)
                  setShowAcceptModal(true)
                }}
                className="w-full"
                disabled={lorries.length === 0}
              >
                {lorries.length === 0 ? 'No Available Vehicles' : 'Accept Load'}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No loads available</p>
          <p className="text-gray-600">Check back later for new opportunities</p>
        </div>
      )}

      {/* Accept Load Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept Load"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Select a vehicle to accept this load</p>
          
          <Select
            label="Select Vehicle"
            value={selectedLorry}
            onChange={(e) => setSelectedLorry(e.target.value)}
            options={[
              { value: '', label: 'Choose a vehicle' },
              ...lorries.map(l => ({
                value: l._id,
                label: `${l.vehicleNumber} - ${l.vehicleType} (${l.capacity}T)`
              }))
            ]}
            required
          />

          {selectedLoad && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">
                  {selectedLoad.pickupLocation.city} → {selectedLoad.dropLocation.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Earnings:</span>
                <span className="font-medium text-green-700">
                  ₹{selectedLoad.estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptLoad} disabled={!selectedLorry} className="flex-1">
              Confirm Accept
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AvailableLoads
