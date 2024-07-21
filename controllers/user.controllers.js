import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const googleCallback = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  const accessToken = user.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
  };
  res.cookie("accessToken", accessToken, options);

  const redirectUrl = `${
    process.env.FRONTEND_URL
  }/google/callback?token=${accessToken}&user=${encodeURIComponent(
    JSON.stringify(user)
  )}`;

  res.redirect(redirectUrl);
});

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (
    [firstName, lastName, email, password, confirmPassword].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarLocalFilePath = req.file;

  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar file path is required");
  }

  if (password.trim() !== confirmPassword.trim()) {
    throw new ApiError(400, "Password and Confirm Password must be same");
  }

  const isUserExist = await User.findOne({
    email: email,
  });

  if (isUserExist) {
    throw new ApiError(409, "User with email already exist!!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalFilePath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded on cloudinary");
  }

  const fullName = `${firstName} ${lastName}`;

  const user = await User.create({
    firstName,
    lastName,
    fullName,
    email,
    avatar: avatar.url,
    password,
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong");
  }

  const accessToken = createdUser.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, createdUser, "User is registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is mandatory");
  }

  if (!password) {
    throw new ApiError(400, "Password is mandatory");
  }

  const user = await User.findOne({
    email: email,
  });

  if (!user) {
    throw new ApiError(404, "User is not found. Please signup!!");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();
  const options = {
    httpOnly: true,
    secure: true,
  };

  const loggedInUser = await User.findOne(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        "User is logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .cookie("accessToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export { googleCallback, registerUser, loginUser, logoutUser, getMyProfile };
