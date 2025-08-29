import Router from "express";
import { registerController } from "../controllers/registerController.js";
import { confirmEmailController } from "../controllers/confrimEmailController.js";
import { getResetPasswordToken } from "../controllers/getResetPasswordTokenController.js";
import { resetPasswordWithToken } from "../controllers/resetPasswordWithTokenController.js";
import { loginController } from "../controllers/loginController.js";
import { authentication } from "../../../middleware/authMiddleware.js";
import { getPublicInfoController } from "../controllers/getPublicInfoController.js";
import { getOnePublicInfoController } from "../controllers/getOnePublicInfoController.js";

const authRouter = Router();

authRouter.route("/register").post(registerController);
authRouter.route("/register/:confirmation_url").get(confirmEmailController);
authRouter.route("/reset_password").post(getResetPasswordToken);
authRouter
  .route("/reset_password/:username/:token")
  .post(resetPasswordWithToken);
authRouter.route("/login").post(loginController);

// All routes below this will require authentication
authRouter.use(authentication);

authRouter.route("/public-info").get(getPublicInfoController);
authRouter.route("/public-info/user/:username").get(getOnePublicInfoController);

export default authRouter;
