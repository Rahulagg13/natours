const express = require('express');

const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReviews)
  .delete(authController.restrictTo('user'),reviewController.deleteReview)
  .patch(authController.restrictTo('user'),reviewController.updateReview);

module.exports = router;
