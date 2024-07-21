import { Router } from "express";
import {
  getMyProfile,
  googleCallback,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controllers.js";
import passport from "passport";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/googlelogin",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/myProfile").get(verifyJwt, getMyProfile);

export default router;
