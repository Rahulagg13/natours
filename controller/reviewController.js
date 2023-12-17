const catchAsync = require('../utils/catchAsync');
const Review = require('../model/reviewModal');
const factory = require('./handleFactory');
const getAllReviews = factory.getAll(Review);

const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
const createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  // console.log(newReview);
  res.status(201).json({
    status: 'success',
    message: 'Created Review',
    data: {
      review: newReview,
    },
  });
});

const getReviews = factory.getOne(Review, { path: 'tour' });
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);
module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReviews,
};
