const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicatefieldsDB = (err) => {
  const value = err.keyValue.name;

  const message = `Duplicate Field value ${value} please change another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

//no error pass in cuz its just that message unlike others with ``
const handleJWTError = () =>
  new AppError('Invalid Token, please log in again', 401);

//no error pass in cuz its just that message unlike others with ``
const handleJWTExpired = () =>
  new AppError('token timeout please login again', 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  //B) RENDERED WEBSITE
  console.log('own error!!!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProduction = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // A) programming or other unknows error: dont leak to client
    //1) Log Error
    console.error('EERROORROOR', err);

    //2) send General message
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong'
    });
  }

  //B) RENDERED WEBSITE
  //A) operational, trusted error: send mesage to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
    //B) programming or other unknows error: dont leak to client
  }
  //1) Log Error
  console.error('EERROORROOR', err);

  //2) send General message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  //we do-nt know status code of different error so we let app determine or use 500 as default
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //  for opertational errors
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicatefieldsDB(error, res);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    //no error pass in cuz its just that message unlike others with ``
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProduction(error, req, res);
  }
};
