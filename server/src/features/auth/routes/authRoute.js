import Router from "express";
import { registerController } from "../controllers/registerController.js";
import { confirmEmailController } from "../controllers/confrimEmailController.js";
import { getResetPasswordToken } from "../controllers/getResetPasswordTokenController.js";
import { resetPasswordWithToken } from "../controllers/resetPasswordWithTokenController.js";
import { login } from "../controllers/loginController.js";

const authRouter = Router();

authRouter.route("/register").post(registerController);
authRouter.route("/register/:confirmation_url").get(confirmEmailController);
authRouter.route("/reset_password").post(getResetPasswordToken);
authRouter
  .route("/reset_password/:username/:token")
  .get(resetPasswordWithToken);
authRouter.route("/login").post(login);

export default authRouter;
