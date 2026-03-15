# Cargo Connect - Logistics Platform

A full-stack MERN logistics platform connecting businesses with transport providers. Built as a college project to demonstrate modern web development practices.

## Features

### For Companies
- Post and manage loads
- Real-time shipment tracking
- Automated invoicing and payment management
- Access to verified transport providers
- Transaction history and analytics

### For Transport Providers
- Browse and accept available loads
- Fleet management with document verification
- Digital documentation and proof of delivery
- Earnings tracking and payment verification
- Real-time load status updates

### For Administrators
- User management and moderation
- Vehicle verification system
- Payment verification workflow
- Analytics and reporting dashboard
- Platform-wide monitoring

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB Atlas with Mongoose ODM
- JWT Authentication
- Cloudinary for file storage
- Nodemailer for email notifications
- Winston for logging
- PDFKit for invoice generation

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router DOM v6
- Axios for API calls
- Context API for state management

### Security
- Helmet for HTTP security headers
- Rate limiting
- MongoDB injection protection
- Input validation
- CORS configuration

## Installation

### Prerequisites
- Node.js v16 or higher
- MongoDB Atlas account
- Cloudinary account
- Gmail account for SMTP

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
- MongoDB connection string
- JWT secret key
- Cloudinary credentials
- Email SMTP configuration

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with backend API URL

5. Start the development server:
```bash
npm run dev
```

Client will run on `http://localhost:5173`

## Project Structure

```
Cargo-Connect/
├── server/
│   ├── config/           # Database and service configurations
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication, validation, etc.
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
└── client/
    ├── src/
    │   ├── api/         # API integration
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React Context providers
    │   ├── layouts/     # Layout components
    │   ├── pages/       # Page components
    │   └── App.jsx      # Main app component
    └── index.html
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Load Endpoints
- `POST /api/loads` - Create new load (Company)
- `GET /api/loads` - Get all loads
- `GET /api/loads/:id` - Get load by ID
- `POST /api/loads/:id/accept` - Accept load (Lorry Owner)
- `PUT /api/loads/:id/status` - Update load status
- `POST /api/loads/:id/payment` - Upload payment proof
- `POST /api/loads/:id/delivery-proof` - Upload delivery proof
- `GET /api/loads/:id/invoice` - Generate invoice

### Lorry Endpoints
- `POST /api/lorries` - Add new vehicle
- `GET /api/lorries` - Get all vehicles
- `GET /api/lorries/:id` - Get vehicle by ID
- `PUT /api/lorries/:id` - Update vehicle
- `DELETE /api/lorries/:id` - Delete vehicle

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/suspend` - Suspend user
- `PUT /api/admin/users/:id/activate` - Activate user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/lorries/:id/verify` - Verify vehicle
- `PUT /api/admin/loads/:id/verify-payment` - Verify payment
- `GET /api/admin/analytics` - Get platform analytics

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

**For complete deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

Quick overview:
- **Frontend:** Deploy to Vercel (includes SPA routing fix via `vercel.json`)
- **Backend:** Deploy to Render using Docker or Node.js
- **Database:** MongoDB Atlas (cloud-hosted)
- **Keep-Alive:** Use UptimeRobot to ping `/health` endpoint (prevents Render free tier sleep)

The deployment guide includes:
- Step-by-step Vercel and Render setup
- Environment variable configuration
- MongoDB Atlas whitelist setup
- Free tier optimization tips
- Troubleshooting common issues

## Security Best Practices

- Always use HTTPS in production
- Keep dependencies updated
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Sanitize user data
- Use secure cookies
- Enable CORS only for trusted domains
- Implement proper error handling
- Log security events

## Project Files

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide for Vercel + Render
- **[server/.env.example](server/.env.example)** - Backend environment variables template
- **[client/.env.example](client/.env.example)** - Frontend environment variables template
- **[server/Dockerfile](server/Dockerfile)** - Docker configuration for Render
- **[client/vercel.json](client/vercel.json)** - Vercel SPA routing configuration

## Contributing

This is a college project. Feel free to fork and modify for educational purposes.

## License

MIT License - Free to use for educational purposes.

---

**Built as a full-stack MERN project demonstrating modern web development practices.**
