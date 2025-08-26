import Router from "express";

import { authentication } from "../../../middleware/authMiddleware.js";

// import { dealerProfileController } from "../controllers/dealerProfileController.js";
// import { dealmakerProfileController } from "../controllers/dealmakerProfileController.js";

const profilesRouter = Router();

profilesRouter.use(authentication);

// profilesRouter.get("/dealer", dealerProfileController);
// profilesRouter.get("/dealmaker", dealmakerProfileController);

export default profilesRouter;
