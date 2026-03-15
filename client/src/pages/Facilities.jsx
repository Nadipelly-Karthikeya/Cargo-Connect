import { FaFileAlt, FaBell, FaTractor, FaOilCan, FaSnowflake, FaHardHat, FaRobot, FaMobileAlt } from 'react-icons/fa';
import { FaMapMarkerAlt, FaBolt, FaTruckMoving, FaExclamationTriangle, FaMoneyBillWave, FaBox, FaTruck, FaShuttleVan } from 'react-icons/fa';
import { Link } from 'react-router-dom'
import { Button } from '../components/FormElements'

const Facilities = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/" className="text-primary-200 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Our Facilities & Services</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Comprehensive logistics solutions powered by cutting-edge technology
          </p>
        </div>
      </div>

      {/* Core Services */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Core Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Full Truckload (FTL)',
              desc: 'Dedicated vehicles for large shipments with direct routes and faster delivery times.',
              icon: <FaTruckMoving />
            },
            {
              title: 'Part Load (PTL)',
              desc: 'Cost-effective solution for smaller shipments by sharing truck space with other loads.',
              icon: <FaBox />
            },
            {
              title: 'Express Delivery',
              desc: 'Time-critical shipments with guaranteed delivery windows and real-time tracking.',
              icon: <FaBolt />
            },
            {
              title: 'Cold Chain Logistics',
              desc: 'Temperature-controlled transportation for perishable goods and pharmaceuticals.',
              icon: <FaSnowflake />
            },
            {
              title: 'Hazmat Transport',
              desc: 'Specialized handling for hazardous materials with certified drivers and vehicles.',
              icon: <FaExclamationTriangle />
            },
            {
              title: 'Heavy Equipment',
              desc: 'Transportation of oversized machinery and construction equipment.',
              icon: <FaHardHat />
            }
          ].map((service) => (
            <div key={service.title} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow border border-gray-200">
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-700">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Features */}
      <div id="tracking" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Technology-Powered Features</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaMapMarkerAlt className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time GPS Tracking</h3>
                  <p className="text-gray-700">
                    Track your shipment's exact location at any time through our mobile app or web dashboard. 
                    Get automated alerts for pickup, transit milestones, and delivery.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaRobot className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
                  <p className="text-gray-700">
                    Our intelligent algorithm matches your load with the most suitable transporter based on 
                    location, vehicle type, ratings, and historical performance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaMobileAlt className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile App Access</h3>
                  <p className="text-gray-700">
                    Manage your logistics operations on the go with our iOS and Android apps. 
                    Post loads, accept shipments, and track deliveries from anywhere.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaFileAlt className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Digital Documentation</h3>
                  <p className="text-gray-700">
                    Upload and manage all shipping documents digitally. Generate invoices, PODs, and 
                    e-way bills automatically for every shipment.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaMoneyBillWave className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Cost Estimation</h3>
                  <p className="text-gray-700">
                    Get accurate freight quotes instantly based on distance, vehicle type, and current market rates. 
                    No hidden charges or surprise fees.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  <FaBell className="inline mb-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Notifications</h3>
                  <p className="text-gray-700">
                    Stay informed with push notifications for load updates, payment confirmations, 
                    and important milestones throughout the shipment lifecycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Types */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Available Vehicle Types</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: 'Mini Truck', capacity: 'Up to 1 ton', icon: <FaShuttleVan /> },
            { name: 'Small Truck', capacity: '1-3 tons', icon: <FaTruckMoving /> },
            { name: 'Medium Truck', capacity: '3-7 tons', icon: <FaTruck /> },
            { name: 'Large Truck', capacity: '7-15 tons', icon: <FaTruck /> },
            { name: '20ft Container', capacity: '15-20 tons', icon: <FaBox /> },
            { name: '40ft Container', capacity: '20-25 tons', icon: <FaBox /> },
            { name: 'Trailer', capacity: '25-30 tons', icon: <FaTractor /> },
            { name: 'Tanker', capacity: 'Bulk liquids', icon: <FaOilCan /> }
          ].map((vehicle) => (
            <div key={vehicle.name} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">{vehicle.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{vehicle.name}</h3>
              <p className="text-sm text-gray-600">{vehicle.capacity}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Our Facilities</h2>
          <p className="text-xl text-primary-200 mb-8">
            See why leading businesses choose Cargo Connect for their logistics needs
          </p>
          <Link to="/register">
            <Button className="bg-white text-primary-900 hover:bg-gray-100 px-8 py-3">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Facilities
