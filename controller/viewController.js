const Tour = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/userModel');
exports.getOverview = catchAsync(async (req, res, next) => {
  //  1 get tour data from collection
  const tours = await Tour.find();
  //  2 build template
  //  3 render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  //   console.log(tour);
  //  2 build template
  //  3 render that template using tour data from 1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.loginForm = catchAsync(async (req, res, next) => {
  //  2 build template
  //  3 render that template using tour data from 1
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js 'unsafe-inline' 'unsafe-eval';"
    )
    .render('login', {
      title: `Log into your account`,
    });
});

exports.getMe = (req, res) => {
  res.status(200).render('account', {
    title: `Your account settings`,
  });
};
