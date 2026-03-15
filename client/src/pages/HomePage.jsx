import { Link } from 'react-router-dom'
import { Button } from '../components/FormElements'
import { useState } from 'react'
import { FaLock, FaCheck, FaMapMarkerAlt, FaGlobe, FaBolt, FaChartBar } from 'react-icons/fa'

const HomePage = () => {
  const [openDropdown, setOpenDropdown] = useState(null)

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-900 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-primary-700 bg-primary-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Cargo Connect</h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <button className="text-white hover:text-primary-200 px-3 py-2">
                  Why Us
                </button>
                <div className="absolute hidden group-hover:block pt-2 w-48">
                  <div className="bg-white rounded-lg shadow-xl py-2">
                    <Link to="/why-us" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Our Story
                    </Link>
                    <Link to="/why-us#team" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Our Team
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button className="text-white hover:text-primary-200 px-3 py-2">
                  Facilities
                </button>
                <div className="absolute hidden group-hover:block pt-2 w-48">
                  <div className="bg-white rounded-lg shadow-xl py-2">
                    <Link to="/facilities" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Services
                    </Link>
                    <Link to="/facilities#tracking" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Tracking
                    </Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <button className="text-white hover:text-primary-200 px-3 py-2">
                  Careers
                </button>
                <div className="absolute hidden group-hover:block pt-2 w-48">
                  <div className="bg-white rounded-lg shadow-xl py-2">
                    <Link to="/careers" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Open Positions
                    </Link>
                    <Link to="/careers#culture" className="block px-4 py-2 text-gray-800 hover:bg-primary-50">
                      Culture
                    </Link>
                  </div>
                </div>
              </div>
              <Link to="/contact" className="text-white hover:text-primary-200 px-3 py-2">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bold text-white mb-4">
            Connecting Cargo, Connecting India
          </h2>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto mb-12">
            Smart logistics platform for companies and transport owners. Trusted by thousands across the nation.
          </p>
        </div>

        {/* Trust Indicators Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {[
            { icon: <FaLock />, title: 'Secure Payments', desc: 'Bank-grade security' },
            { icon: <FaCheck />, title: 'Verified Transporters', desc: '100% authenticated' },
            { icon: <FaMapMarkerAlt />, title: 'Transparent Tracking', desc: 'Real-time updates' },
            { icon: <FaGlobe />, title: 'Pan-India Network', desc: 'Nationwide coverage' }
          ].map((item) => (
            <div key={item.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center text-white">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-primary-200">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Company Owner Card */}
          <Link to="/register">
            <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Companies</h3>
              <p className="text-gray-600 mb-6">
                Post loads, track shipments, manage payments, and access a network of verified transport providers.
              </p>
              <ul className="space-y-2 mb-6">
                {['Post unlimited loads', 'Real-time tracking', 'Automated invoicing', 'Secure payments'].map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Register as Company</Button>
            </div>
          </Link>

          {/* Lorry Owner Card */}
          <Link to="/register">
            <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Transport Providers</h3>
              <p className="text-gray-600 mb-6">
                Find loads, manage your fleet, track earnings, and grow your transport business nationwide.
              </p>
              <ul className="space-y-2 mb-6">
                {['Access to verified loads', 'Fleet management', 'Digital documentation', 'Timely payments'].map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Register as Transport Provider</Button>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-12">Why Choose Cargo Connect?</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: <FaLock />, title: 'Secure & Verified', desc: 'All users and vehicles are verified for your safety' },
              { icon: <FaBolt />, title: 'Fast & Efficient', desc: 'Quick load matching and real-time updates' },
              { icon: <FaChartBar />, title: 'Complete Transparency', desc: 'Track every step from booking to delivery' }
            ].map((feature) => (
              <div key={feature.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-primary-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-2xl p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Start Transporting Smarter Today
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of businesses and transporters who trust Cargo Connect for their logistics needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?role=company">
              <Button className="bg-white text-primary-900 hover:bg-gray-100 px-8 py-3">
                Register as Company
              </Button>
            </Link>
            <Link to="/register?role=lorry">
              <Button className="bg-primary-900 text-white hover:bg-primary-800 px-8 py-3">
                Register as Lorry Owner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-primary-700 bg-primary-900/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-300">
          <p>© 2026 Cargo Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
