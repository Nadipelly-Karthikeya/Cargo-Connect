import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { RatingModal } from '../../components/RatingModal'
import { calculateETA, getETAStatusColor } from '../../utils/calculations'
import { loadAPI, ratingAPI } from '../../api'

const MyLoads = () => {
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProofModal, setShowProofModal] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState(null)
  const [deliveryProof, setDeliveryProof] = useState(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [filters, setFilters] = useState({ status: '' })
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingLoadId, setRatingLoadId] = useState(null)
  const [ratedLoads, setRatedLoads] = useState(new Set())

  useEffect(() => {
    fetchLoads()
  }, [filters])

  const fetchLoads = async () => {
    try {
      const response = await loadAPI.getMyAcceptedLoads({ ...filters })
      const loadsList = response.data.loads || []
      setLoads(loadsList)
      
      // Check rating status for completed loads
      loadsList
        .filter(load => load.status === 'Completed')
        .forEach(async (load) => {
          try {
            const ratingResponse = await ratingAPI.canRate(load._id)
            if (ratingResponse.data.alreadyRated) {
              setRatedLoads(prev => new Set([...prev, load._id]))
            }
          } catch (error) {
            console.error('Failed to check rating:', error)
          }
        })
    } catch (error) {
      console.error('Failed to fetch loads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (loadId, status) => {
    try {
      await loadAPI.updateStatus(loadId, { status })
      fetchLoads()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleProofUpload = async () => {
    if (!deliveryProof || !selectedLoad) return

    setUploadingProof(true)
    try {
      await loadAPI.uploadDeliveryProof(selectedLoad._id, { deliveryProof })
      setShowProofModal(false)
      setDeliveryProof(null)
      setSelectedLoad(null)
      fetchLoads()
    } catch (error) {
      console.error('Failed to upload proof:', error)
    } finally {
      setUploadingProof(false)
    }
  }

  const handleRatingSubmit = async (ratingData) => {
    const load = loads.find(l => l._id === ratingLoadId)
    if (!load) return

    try {
      await ratingAPI.createRating({
        ...ratingData,
        toUserId: load.companyId._id,
        loadId: ratingLoadId
      })
      setRatedLoads(prev => new Set([...prev, ratingLoadId]))
      alert('Thank you for your rating!')
    } catch (error) {
      throw error
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Loads</h1>
        <p className="text-gray-600 mt-1">Track and manage your accepted loads</p>
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

      {/* Loads Grid */}
      {loads.length > 0 ? (
        <div className="space-y-6">
          {loads.map((load) => (
            <div key={load._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">#{load._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-600 mt-1">{load.goodsType} - {load.weight} tons</p>
                </div>
                <LoadStatusBadge status={load.status} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Pickup:</span>
                  <p className="font-medium">{load.pickupLocation.city}</p>
                  <p className="text-xs text-gray-500">{load.pickupLocation.state}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Delivery:</span>
                  <p className="font-medium">{load.dropLocation.city}</p>
                  <p className="text-xs text-gray-500">{load.dropLocation.state}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Distance:</span>
                  <p className="font-medium">{load.distance} km</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Earnings:</span>
                  <p className="font-medium text-green-700">₹{load.estimatedCost.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* ETA Display for active loads */}
              {(load.status === 'accepted' || load.status === 'in-transit') && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">ETA:</span>
                      <span className="font-medium text-gray-900">
                        {(() => {
                          const eta = calculateETA(
                            load.distance,
                            load.pickupLocation.city,
                            load.dropLocation.city,
                            load.status,
                            load.pickupDate,
                            0
                          )
                          return (
                            <>
                              {eta.formattedETA}
                              <span className={`ml-2 text-sm ${getETAStatusColor(eta.status)}`}>
                                {eta.countdown}
                              </span>
                            </>
                          )
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {load.status === 'accepted' && (
                  <Button
                    onClick={() => handleStatusUpdate(load._id, 'in-transit')}
                    variant="primary"
                  >
                    Start Transit
                  </Button>
                )}
                
                {load.status === 'in-transit' && !load.deliveryProof && (
                  <Button
                    onClick={() => {
                      setSelectedLoad(load)
                      setShowProofModal(true)
                    }}
                    variant="success"
                  >
                    Upload Delivery Proof
                  </Button>
                )}

                {load.deliveryProof && (
                  <a
                    href={load.deliveryProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Delivery Proof
                  </a>
                )}

                <Link to={`/lorry/loads/${load._id}`}>
                  <Button variant="secondary">View Details</Button>
                </Link>
              </div>

              {load.status === 'delivered' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  Load delivered successfully! Payment will be processed soon.
                </div>
              )}

              {load.status === 'Completed' && !ratedLoads.has(load._id) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-yellow-800">How was your experience with this company?</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setRatingLoadId(load._id)
                        setShowRatingModal(true)
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Rate Company
                    </Button>
                  </div>
                </div>
              )}

              {ratedLoads.has(load._id) && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium">Thank you for rating this company!</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">No loads accepted yet</p>
          <p className="text-gray-600 mb-6">Browse available loads to start earning</p>
          <Link to="/lorry/loads/available">
            <Button>Browse Loads</Button>
          </Link>
        </div>
      )}

      {/* Delivery Proof Upload Modal */}
      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Upload Delivery Proof"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Upload a photo or document as proof of delivery</p>
          
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setDeliveryProof(e.target.files[0])}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            Once you upload delivery proof, the admin will verify it and mark the load as delivered.
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowProofModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProofUpload}
              disabled={!deliveryProof || uploadingProof}
              className="flex-1"
            >
              {uploadingProof ? 'Uploading...' : 'Upload Proof'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rating Modal */}
      {ratingLoadId && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            setRatingLoadId(null)
          }}
          onSubmit={handleRatingSubmit}
          recipientName={loads.find(l => l._id === ratingLoadId)?.companyId?.name || 'Company'}
          recipientType="Company"
        />
      )}
    </div>
  )
}

export default MyLoads
