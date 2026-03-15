import { useState, useEffect } from 'react'
import { Badge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { Modal } from '../../components/Modal'
import { PageLoader } from '../../components/Loader'
import { VerifiedBadge, RatingDisplay } from '../../components/Rating'
import { adminAPI } from '../../api'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [filters, setFilters] = useState({ role: '', status: '', search: '' })

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers({ ...filters })
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async () => {
    if (!selectedUser) return

    try {
      if (actionType === 'suspend') {
        await adminAPI.suspendUser(selectedUser._id)
      } else if (actionType === 'activate') {
        await adminAPI.activateUser(selectedUser._id)
      } else if (actionType === 'delete') {
        await adminAPI.deleteUser(selectedUser._id)
      }
      setShowActionModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Failed to perform action:', error)
    }
  }

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'company', label: 'Company Owner' },
    { value: 'lorry', label: 'Lorry Owner' }
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ]

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-600 mt-1">View and moderate platform users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            options={roleOptions}
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
          />
          <Button variant="secondary" onClick={fetchUsers}>Apply Filters</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-green-700">
            {users.filter(u => !u.isSuspended).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Suspended Users</h3>
          <p className="text-3xl font-bold text-red-700">
            {users.filter(u => u.isSuspended).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-primary-800 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{user.name}</span>
                        <VerifiedBadge verified={user.isVerified} size="sm" />
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.ratingAverage > 0 && (
                        <div className="mt-1">
                          <RatingDisplay 
                            rating={parseFloat(user.ratingAverage)} 
                            count={user.ratingCount}
                            size="sm"
                            showCount={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.role === 'company' ? 'primary' : 'info'}>
                    {user.role === 'company' ? 'Company' : 'Lorry Owner'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isSuspended ? (
                    <Badge variant="error">Suspended</Badge>
                  ) : user.isVerified ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {user.isSuspended ? (
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setActionType('activate')
                        setShowActionModal(true)
                      }}
                      className="text-green-700 hover:underline mr-3"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setActionType('suspend')
                        setShowActionModal(true)
                      }}
                      className="text-yellow-700 hover:underline mr-3"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setActionType('delete')
                      setShowActionModal(true)
                    }}
                    className="text-red-700 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} User`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {actionType} user <strong>{selectedUser?.name}</strong>?
          </p>

          {actionType === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              This action cannot be undone. All user data will be permanently deleted.
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUserAction}
              variant={actionType === 'delete' ? 'error' : 'primary'}
              className="flex-1"
            >
              Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageUsers
