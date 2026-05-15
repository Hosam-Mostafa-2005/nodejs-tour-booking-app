import AppError from '../utils/appError.js';

// 1️⃣ handle cast error (MongoDB invalid ID)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidateErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError(`Invalid Token Please login again`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please login again.', 401);
};

// 2️⃣ development errors
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// 3️⃣ production errors
const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error!!', err);

    res.status(500).json({
      status: 'error',
      message: 'something went wrong',
    });
  }
};

// 4️⃣ global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 🛠️ DEVELOPMENT
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);

    // 🚀 PRODUCTION
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    error.message = err.message;

    // 👇 هنا بقى المهم
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code == 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (
      err.name === 'ValidationError' ||
      err._message === 'Validation failed'
    ) {
      error = handleValidateErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProduction(error, res);
  }
};

export default globalErrorHandler;
