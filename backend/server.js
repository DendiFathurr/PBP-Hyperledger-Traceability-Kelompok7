require('dotenv').config();
const express = require('express');
const cors = require('cors');
const containerRoutes = require('./routes/containerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'REST API Server Hyperledger Fabric berjalan dengan baik.',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api', containerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===========================================================`);
  console.log(`   REST API Server (Fabric SDK) running on port: ${PORT}`);
  console.log(`   Endpoint yang tersedia:`);
  console.log(`   - [POST] http://localhost:${PORT}/api/register-container`);
  console.log(`   - [PUT]  http://localhost:${PORT}/api/update-status`);
  console.log(`   - [GET]  http://localhost:${PORT}/api/history/:id`);
  console.log(`   - [GET]  http://localhost:${PORT}/api/health`);
  console.log(`===========================================================`);
});
