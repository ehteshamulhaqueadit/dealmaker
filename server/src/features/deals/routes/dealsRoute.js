import Router from "express";

import { authentication } from "../../../middleware/authMiddleware.js";
import { createDealController } from "../controllers/createDealController.js";
import { deleteDealController } from "../controllers/deleteDealController.js";
import { getMyDealsController } from "../controllers/getMyDealsController.js";
import { getDealsController } from "../controllers/getDealsController.js";

import { joinDealAsDealerController } from "../controllers/joinDealAsDealerController.js";

const dealRouter = Router();

dealRouter.use(authentication);

dealRouter.get("/all/:keyword", getDealsController);
dealRouter.get("/my-deals", getMyDealsController);

dealRouter.post("/create-deal", createDealController);
dealRouter.delete("/delete-deal/:id", deleteDealController);

dealRouter.post("/join-deal-as-dealer", joinDealAsDealerController);

export default dealRouter;
