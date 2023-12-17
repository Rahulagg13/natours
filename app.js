//Express
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const userController = require('./controller/userController');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Global middleware -->modify the incoming data;
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(helmet());

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from same Api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request fronm this IP , please try again in an hour',
});

app.use('/api', limiter);
//body parser ,reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//data sanitization against Nosql query injection
app.use(mongoSanitize());
// data sanitization against xss
app.use(xss());

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
  })
);

//testing middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   // console.log(req.headers);
//   next();
// });

//middleware function
// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

//when a data come from server
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// //when we want to post some data in server
// app.post('/', (req, res) => {
//   res.send('You can Post to this endpoint...');
// });

//
// API --> Application Programming Interface it help to communicate between client and server
//REST --> Representational states transfer is basically a way of building web APIs for ourselves or for others to consume

//route handler

//Mounting
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
  // const err = new Error(`can't find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
});

app.use(globalErrorHandler);
module.exports = app;
