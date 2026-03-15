import { FaPhoneAlt } from 'react-icons/fa';
import { FaEnvelope, FaCommentDots, FaMap } from 'react-icons/fa';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom'
import { Button, Input, Textarea } from '../components/FormElements'
import { useState } from 'react'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would call an API
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/" className="text-primary-200 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Have questions? We're here to help. Reach out to our team and we'll get back to you within 24 hours.
          </p>
        </div>
      </div>

      {/* Contact Options & Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl"><FaPhoneAlt className="inline mb-1" /></span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-700 mb-1">+91 1800-123-4567 (Toll Free)</p>
              <p className="text-sm text-gray-600">Mon-Sat, 9 AM - 7 PM IST</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl"><FaEnvelope className="inline mb-1" />️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-700 mb-1">support@cargoconnect.in</p>
              <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl"><FaMapMarkerAlt className="inline mb-1" /></span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Office</h3>
              <p className="text-gray-700 mb-1">
                Tower A, 5th Floor<br />
                Cyber City, DLF Phase 2<br />
                Gurugram, Haryana 122002
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl"><FaCommentDots className="inline mb-1" /></span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-700 mb-3">Get instant help from our support team</p>
              <Button variant="secondary" className="w-full">
                Start Chat
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                  <Input
                    label="Subject"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <Textarea
                  label="Message"
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  required
                />

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>

            {/* FAQ */}
            <div className="mt-8 bg-primary-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <details className="group">
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    How do I register as a company?
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-2 text-sm">
                    Click on "Company Owner" button on the homepage, fill in your business details including GST number, 
                    and verify your email. You'll be able to start posting loads immediately.
                  </p>
                </details>
                <details className="group">
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    How does the payment system work?
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-2 text-sm">
                    Companies upload payment proof after load creation. Transporters get paid after successful delivery 
                    confirmation. All transactions are tracked for transparency.
                  </p>
                </details>
                <details className="group">
                  <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    How are transporters verified?
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-2 text-sm">
                    All lorry owners must upload vehicle documents (RC, insurance) and driver licenses. 
                    Our admin team verifies these documents before activating the account.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <div className="bg-gray-200 h-96 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <span className="text-6xl mb-4 block"><FaMap className="inline mb-1" />️</span>
          <p className="text-lg">Interactive Map Coming Soon</p>
          <p className="text-sm">Cyber City, Gurugram, Haryana</p>
        </div>
      </div>
    </div>
  )
}

export default Contact
