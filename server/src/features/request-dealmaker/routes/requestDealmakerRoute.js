import Router from "express";
import { authentication } from "../../../middleware/authMiddleware.js";
import {
  sendRequestController,
  cancelRequestController,
} from "../controllers/requestDealmakerController.js";
import { acceptDealRequestController } from "../controllers/acceptDealRequestController.js";
import { getRequestsByDealController } from "../controllers/getRequestsByDealController.js";
import { getDealmakerRequestsController } from "../controllers/getDealmakerRequestsController.js";

const requestDealmakerRouter = Router();

requestDealmakerRouter.use(authentication);

requestDealmakerRouter.post("/accept/:requestId", acceptDealRequestController);
requestDealmakerRouter.get("/my-requests", getDealmakerRequestsController);
requestDealmakerRouter.post("/send-request", sendRequestController);
requestDealmakerRouter.delete("/cancel/:requestId", cancelRequestController);
requestDealmakerRouter.get("/:dealId", getRequestsByDealController);

export default requestDealmakerRouter;
