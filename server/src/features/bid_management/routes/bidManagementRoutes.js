import { Router } from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import { selectBidController } from "../controllers/selectBidController.js";

const bidManagementRouter = Router();

bidManagementRouter.use(authentication);

bidManagementRouter.put("/select-bid/:dealId/:bidId", selectBidController);

export default bidManagementRouter;
