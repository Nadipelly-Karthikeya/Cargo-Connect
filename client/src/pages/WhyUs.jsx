import { FaCommentDots, FaBullseye } from 'react-icons/fa';
import { FaLock, FaCheck, FaMapMarkerAlt, FaBolt } from 'react-icons/fa';
import { Link } from 'react-router-dom'
import { Button } from '../components/FormElements'

const WhyUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/" className="text-primary-200 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Why Choose Cargo Connect?</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Building India's most trusted logistics platform with technology, transparency, and trust
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div id="story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 mb-4">
              Cargo Connect was born from a simple vision: to bridge the gap between businesses needing logistics 
              and transport providers across India. We understand the challenges of traditional freight management—
              lack of transparency, delayed payments, and trust issues.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              That's why we built a platform that puts transparency first. Every transaction is recorded, 
              every transporter is verified, and every shipment is tracked in real-time.
            </p>
            <p className="text-lg text-gray-700">
              Today, we're proud to serve thousands of businesses and transport owners, facilitating millions 
              in logistics transactions monthly.
            </p>
          </div>
          <div className="bg-primary-100 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-900 mb-2">5000+</div>
                <div className="text-gray-700">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-900 mb-2">15K+</div>
                <div className="text-gray-700">Loads Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-900 mb-2">28</div>
                <div className="text-gray-700">States Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-900 mb-2">98%</div>
                <div className="text-gray-700">On-Time Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Differentiators */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">What Makes Us Different</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCheck />,
                title: '100% Verified Network',
                desc: 'Every transporter undergoes thorough verification including vehicle documents, driver licenses, and background checks.'
              },
              {
                icon: <FaBolt />,
                title: 'Lightning Fast Matching',
                desc: 'Our AI-powered system matches your load with the right transporter in seconds, not days.'
              },
              {
                icon: <FaLock />,
                title: 'Secure Payments',
                desc: 'Escrow-based payment system ensures transporters get paid on time and businesses get delivery confirmation first.'
              },
              {
                icon: <FaMapMarkerAlt />,
                title: 'Real-Time Tracking',
                desc: 'Know exactly where your cargo is at every moment with GPS tracking and automated status updates.'
              },
              {
                icon: <FaCommentDots />,
                title: 'Transparent Reviews',
                desc: 'Both parties can rate each other after every transaction, building a reputation-based ecosystem.'
              },
              {
                icon: <FaBullseye />,
                title: 'Dedicated Support',
                desc: '24/7 customer support team ready to resolve any issues and ensure smooth operations.'
              }
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div id="team" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-12">
          We're a diverse team of logistics experts, software engineers, and customer success professionals 
          united by a common mission: revolutionizing freight logistics in India.
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { name: 'Rajesh Kumar', role: 'Founder & CEO', expertise: 'Logistics Strategy' },
            { name: 'Priya Sharma', role: 'CTO', expertise: 'Technology & Innovation' },
            { name: 'Amit Patel', role: 'Head of Operations', expertise: 'Supply Chain Management' },
            { name: 'Sneha Reddy', role: 'Head of Customer Success', expertise: 'Client Relations' }
          ].map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-32 h-32 bg-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-primary-900">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
              <p className="text-primary-800 mb-1">{member.role}</p>
              <p className="text-sm text-gray-600">{member.expertise}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Logistics?</h2>
          <p className="text-xl text-primary-200 mb-8">
            Join thousands of businesses and transporters already using Cargo Connect
          </p>
          <Link to="/register">
            <Button className="bg-white text-primary-900 hover:bg-gray-100 px-8 py-3">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WhyUs
