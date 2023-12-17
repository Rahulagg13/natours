const express = require('express');
const tourController = require('../controller/tourController');
const auth = require('../controller/authController');

const reviewRouter = require('./reviewRoutes');
const router = express.Router();
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistance);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
// GET /tour/234fad4/reviews/855g1f4s5

// router
//   .route('/:tourId/reviews')
//   .post(
//     auth.protect,
//     auth.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
