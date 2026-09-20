const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const riskRoutes = require('./routes/riskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const committeeRoutes = require('./routes/committeeRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();
const server = http.createServer(app);

// CORS configuration
const clientUrl = process.env.CLIENT_URL;

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (clientUrl && origin === clientUrl) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in local development
    },
    credentials: true,
  })
);

// Express JSON middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (Registered BEFORE catch-all 404 middleware and API routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ChitLedger backend is running',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ChitLedger backend is running',
  });
});

// Initialize Socket.IO
initSocket(server);

// Connect to MongoDB Atlas (if MONGO_URI is set)
connectDB();

// API Routes Mounting
app.use('/api/members', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/committees', committeeRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Error Handling Middleware (Catch-all 404 & centralized error handler)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => {
  console.log(`[ChitLedger Server] Running on port ${PORT}`);
});
