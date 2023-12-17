const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateField = (err) => {
  const message = `This ${err.keyValue.name} already Exist`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid Token Please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has been expired Please login again', 401);

const dev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong !!!',
      msg: err.message,
    });
  }
};

const prod = (err, req, res) => {
  //Operational error send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational === true) {
      return res.status(err.statusCode).json({
        status: err.status,

        message: err.message,
      });
      // programming error or other error: don*t leak error details
    } else {
      //1. log error
      console.error('Error');
      //2. send generate message
      return res.status(500).json({
        status: 'error',
        message: 'something went wrong!!!',
      });
    }
  } else {
    if (err.isOperational === true) {
      return res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong !!!',
        msg: err.message,
      });
      // programming error or other error: don*t leak error details
    } else {
      //1. log error
      console.error('Error');
      //2. send generate message
      return res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong !!!',
        msg: 'Please try again later !',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    dev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateField(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    prod(error, req, res);
  }
};

// 3  error by mongoose
// invalid id
//duplicate name
// validation error
