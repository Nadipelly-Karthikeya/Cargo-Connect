import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Select, Textarea } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { loadAPI } from '../../api'

const EditLoad = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    goodsType: '',
    weight: '',
    requiredVehicleType: '',
    pickupLocation: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    dropLocation: {
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    distance: '',
    specialInstructions: ''
  })

  useEffect(() => {
    fetchLoadDetails()
  }, [id])

  const fetchLoadDetails = async () => {
    try {
      const response = await loadAPI.getLoadById(id)
      const load = response.data.load || response.data
      
      // Check if load can be edited
      if (!['Posted', 'Approved'].includes(load.status)) {
        setError('This load cannot be edited as it has been accepted or is in progress')
        return
      }

      setFormData({
        goodsType: load.goodsType || '',
        weight: load.weight || '',
        requiredVehicleType: load.requiredVehicleType || '',
        pickupLocation: load.pickupLocation || { address: '', city: '', state: '', pincode: '' },
        dropLocation: load.dropLocation || { address: '', city: '', state: '', pincode: '' },
        distance: load.distance || '',
        specialInstructions: load.specialInstructions || ''
      })
    } catch (error) {
      console.error('Failed to fetch load:', error)
      setError('Failed to load details')
    } finally {
      setLoading(false)
    }
  }

  const goodsTypes = [
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

  const vehicleTypes = [
    { value: 'Mini Truck', label: 'Mini Truck' },
    { value: 'Small Truck', label: 'Small Truck' },
    { value: 'Medium Truck', label: 'Medium Truck' },
    { value: 'Large Truck', label: 'Large Truck' },
    { value: 'Container 20ft', label: 'Container 20ft' },
    { value: 'Container 40ft', label: 'Container 40ft' },
    { value: 'Trailer', label: 'Trailer' },
    { value: 'Tanker', label: 'Tanker' }
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await loadAPI.updateLoad(id, formData)
      navigate('/company/loads')
    } catch (error) {
      console.error('Failed to update load:', error)
      setError(error.response?.data?.message || 'Failed to update load')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  if (error && !formData.goodsType) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate('/company/loads')}>Back to Loads</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Load</h1>
          <p className="text-gray-600 mt-1">Update load details</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/company/loads')}>
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pickup Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address"
              value={formData.pickupLocation.address}
              onChange={(e) => handleAddressChange('pickupLocation', 'address', e.target.value)}
              required
            />
            <Input
              label="City"
              value={formData.pickupLocation.city}
              onChange={(e) => handleAddressChange('pickupLocation', 'city', e.target.value)}
              required
            />
            <Input
              label="State"
              value={formData.pickupLocation.state}
              onChange={(e) => handleAddressChange('pickupLocation', 'state', e.target.value)}
              required
            />
            <Input
              label="Pincode"
              value={formData.pickupLocation.pincode}
              onChange={(e) => handleAddressChange('pickupLocation', 'pincode', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Drop Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Drop Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address"
              value={formData.dropLocation.address}
              onChange={(e) => handleAddressChange('dropLocation', 'address', e.target.value)}
              required
            />
            <Input
              label="City"
              value={formData.dropLocation.city}
              onChange={(e) => handleAddressChange('dropLocation', 'city', e.target.value)}
              required
            />
            <Input
              label="State"
              value={formData.dropLocation.state}
              onChange={(e) => handleAddressChange('dropLocation', 'state', e.target.value)}
              required
            />
            <Input
              label="Pincode"
              value={formData.dropLocation.pincode}
              onChange={(e) => handleAddressChange('dropLocation', 'pincode', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Load Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Load Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Type of Goods"
              value={formData.goodsType}
              onChange={(e) => handleChange('goodsType', e.target.value)}
              options={goodsTypes}
              required
            />
            <Input
              label="Weight (tons)"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              required
            />
            <Select
              label="Required Vehicle Type"
              value={formData.requiredVehicleType}
              onChange={(e) => handleChange('requiredVehicleType', e.target.value)}
              options={vehicleTypes}
              required
            />
            <Input
              label="Distance (km)"
              type="number"
              value={formData.distance}
              onChange={(e) => handleChange('distance', e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Special Instructions (Optional)"
              value={formData.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
              rows={3}
              placeholder="Any special handling requirements..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/company/loads')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? 'Updating...' : 'Update Load'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditLoad
