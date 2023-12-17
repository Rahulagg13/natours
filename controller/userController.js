const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const factory = require('./handleFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  //1)Create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update ', 400));
  }
  //2) update the user document
  const { name, email, photo } = req.body;
  const user = await User.findById(req.user.id);
  if (name) user.name = name;
  if (email) user.email = email;
  if (photo) user.photo = photo;
  await user.save({ validateModifiedOnly: true });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    message: 'Useer has been deleted',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
exports.getUser = factory.getOne(User);
exports.getAllUser = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
//Do not update password with this
exports.updateUser = factory.updateOne(User);
