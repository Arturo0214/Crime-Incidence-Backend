# Crime Incidence Map - Backend

This is the backend service for the Crime Incidence Map application, built with Node.js, Express, and MongoDB. It provides a secure HTTPS API for managing incidents, attendance records, special instructions, citizen requests, agreements, and user authentication.

## Features

- Secure HTTPS API with SSL/TLS encryption
- MongoDB database integration
- JWT-based authentication
- CORS enabled for frontend communication
- Comprehensive error handling
- Input validation and sanitization
- Geocoding integration for address lookup

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenSSL (for SSL certificate generation)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend-Incidence
```

2. Install dependencies:
```bash
npm install
```

3. Generate SSL certificates:
```bash
chmod +x ssl/generate-cert.sh
./ssl/generate-cert.sh
```

4. Create a `.env` file in the root directory with the following variables:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Project Structure

```
Backend-Incidence/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── ssl/           # SSL certificates
├── utils/         # Utility functions
├── server.js      # Main application file
└── package.json   # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login

### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create a new incident
- `PUT /api/incidents/:id` - Update an incident
- `DELETE /api/incidents/:id` - Delete an incident
- `GET /api/incidents/statistics` - Get incident statistics
- `GET /api/incidents/map` - Get map data

### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record

### Special Instructions
- `GET /api/special-instructions` - Get all instructions
- `POST /api/special-instructions` - Create new instruction
- `PATCH /api/special-instructions/:id/status` - Update instruction status
- `DELETE /api/special-instructions/:id` - Delete instruction

### Citizen Requests
- `GET /api/citizen-requests` - Get all requests
- `POST /api/citizen-requests` - Create new request
- `PUT /api/citizen-requests/:id` - Update request
- `DELETE /api/citizen-requests/:id` - Delete request

### Agreements
- `GET /api/agreements` - Get all agreements
- `POST /api/agreements` - Create new agreement
- `PUT /api/agreements/:id` - Update agreement
- `DELETE /api/agreements/:id` - Delete agreement
- `POST /api/agreements/:id/comments` - Add comment to agreement

## Security

- All routes (except login and register) require JWT authentication
- HTTPS enabled with self-signed certificates for development
- CORS configured to allow only specific origins
- Helmet middleware for additional security headers
- Input validation and sanitization

## Development

Start the development server:
```bash
npm start
```

The server will run on `https://localhost:8000`

## Production Deployment

For production deployment:
1. Replace self-signed certificates with proper SSL certificates
2. Update CORS configuration with production domains
3. Set appropriate environment variables
4. Use a process manager like PM2
5. Configure proper MongoDB connection string

## Error Handling

The API uses a centralized error handling middleware that:
- Logs errors for debugging
- Returns appropriate HTTP status codes
- Provides meaningful error messages
- Handles both operational and programming errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 