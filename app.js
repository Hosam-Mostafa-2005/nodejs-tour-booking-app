/* ======================
   IMPORTS
====================== */
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'mongo-sanitize';
import xss from 'xss';
import hpp from 'hpp';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

import userRouter from './routes/userRoutes.js';
import tourRouter from './routes/tourRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';

/* ======================
   CONFIG (ENV VARIABLES)
====================== */
dotenv.config();

/* ======================
   PATH SETUP (ES MODULE FIX)
====================== */
// بنعمل __dirname manually عشان ES Modules مفيهاش __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================
   APP INITIALIZATION
====================== */
const app = express();

/* ======================
   GLOBAL ERROR HANDLING (SYNC ERRORS)
====================== */
// بي catch أي error مش معمول له handle
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

/* ======================
   SECURITY MIDDLEWARES
====================== */

// 1) HTTP security headers
app.use(helmet());

// 2) Rate limiting (anti-spam / anti-brute-force)
const limiter = rateLimit({
  max: 100, // max requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP. Try again in an hour!',
});
app.use('/api', limiter);

/* ======================
   BODY PARSERS
====================== */

// parse JSON body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against noSQL query injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);

  if (req.query) {
    const sanitizedQuery = mongoSanitize(req.query);
    Object.assign(req.query, sanitizedQuery);
  }

  next();
});
//Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// parse form data (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// parse cookies
app.use(cookieParser());

/* ======================
   QUERY PARSER FIX
====================== */
// بيخلي req.query object عادي قابل للتعديل
app.set('query parser', 'extended');

/* ======================
   DEV MIDDLEWARE
====================== */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logging requests
}

/* ======================
   STATIC FILES
====================== */
app.use(express.static(path.join(__dirname, 'public')));

/* ======================
   DATABASE CONNECTION
====================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB connection successful!'))
  .catch((err) => {
    console.error('❌ DB connection error:', err.message);
    process.exit(1);
  });

/* ======================
   ROUTES
====================== */
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

/* ======================
   404 HANDLER (NOT FOUND)
====================== */
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
/* ======================
   GLOBAL ERROR HANDLER
====================== */
app.use(globalErrorHandler);

/* ======================
   SERVER START
====================== */
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

/* ======================
   UNHANDLED PROMISE REJECTIONS
====================== */
// errors من async operations (زي DB)
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection! Shutting down...');
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
