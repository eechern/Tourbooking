const path = require('path');
const express = require('express');
const morgan = require('morgan'); //this is dev dependnecy so not important later on
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

//start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1)GLOBAL MiddleWear

//serves static files
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Header
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  //env is special only need to be called once anywhere then can process can be used
  app.use(morgan('dev'));
}

//LImit request from same API
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests try again in an hour'
});
app.use('/api', limiter);

//Body parsrm reading data from body to req.body
app.use(express.json({ limit: '10kb' })); // is this important (converts incmomeing json data into readable JavaScript Objects)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against NOSQL query injetion//////
app.use(mongoSanitize());

//Data Sanitization against XSS//////
app.use(xss());

//Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//Test Middleware
app.use((req, res, next) => {
  console.log('hello from the middlewear');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//3) routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); //mounting new router to a new route
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//this middleware hendle url that are not defined (operational error {basically user error})
app.all('*', (req, res, next) => {
  // const err = new Error(`Cant find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404)); //if we pass something into next() express will know its error and skip all middleware go stright to global error handling
});

app.use(globalErrorHandler);

// 4) Server
module.exports = app;
