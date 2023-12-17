const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
// require('dotenv').config({ path: './config.env' });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  //remove the password fromt the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});
exports.isLoggedOut = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and password exist
  if (!password || !email) {
    return next(new AppError('Please provide email and password', 404));
  }
  // 2) check if user exist && password is incorrect
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or Password', 401));
  }
  // console.log(user);
  // 3) if everything is ok send token to client

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1) Getting token and check of it's true
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }
  //2)Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token is no longer exist', 401)
    );
  }
  //4) check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(
        'User recentley changed the password! please log in again',
        401
      )
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  //1) Getting token and check of it's true
  if (req.cookies.jwt) {
    try {
      //2)Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3) Check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      //4) check if user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        next();
      }
      //GRANT ACCESS TO PROTECTED ROUTE
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) get user posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address', 404));
  }
  //2) generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) send it user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10 min)`,
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `Token sent to email`,
    });
  } catch (err) {
    // console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email ,try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2)if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Your token is Invalid or expires', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  // 3)update changedPasswordAt property for user
  // 4 log the user in, send jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get uset from the collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if posted current password is correctPassword
  // console.log(req.body);
  if (!(await user.correctPassword(req.body.currPassword, user.password))) {
    return next(new AppError('You Entered a wrong password', 401));
  }
  // 3) if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) log user in ,sendJWT
  createSendToken(user, 200, res);
});
