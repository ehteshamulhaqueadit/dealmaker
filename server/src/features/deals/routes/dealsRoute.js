import Router from "express";

import { authentication } from "../../../middleware/authMiddleware.js";
import { createDealController } from "../controllers/createDealController.js";
import { deleteDealController } from "../controllers/deleteDealController.js";
import { getMyDealsController } from "../controllers/getMyDealsController.js";
import { getDealsController } from "../controllers/getDealsController.js";
import { getDealByIdController } from "../controllers/getDealByIdController.js";

import { joinDealAsDealerController } from "../controllers/joinDealAsDealerController.js";
import { leaveDealAsDealerController } from "../controllers/leaveDealAsDealerController.js";
import { getDealmakerDealsController } from "../controllers/getDealmakerDealsController.js";

const dealRouter = Router();

dealRouter.use(authentication);

dealRouter.get("/all", (req, res) => getDealsController(req, res)); // Fetch all deals
dealRouter.get("/all/:keyword", getDealsController); // Fetch deals by keyword
dealRouter.get("/my-deals", getMyDealsController);
dealRouter.get("/dealmaker-deals", getDealmakerDealsController); // Fetch deals for the dealmaker

dealRouter.post("/create-deal", createDealController);
dealRouter.delete("/delete-deal/:id", deleteDealController);

dealRouter.put("/join-deal-as-dealer/:id", joinDealAsDealerController);
dealRouter.put("/leave-deal-as-dealer/:id", leaveDealAsDealerController);

dealRouter.get("/:id", getDealByIdController); // Fetch a single deal by ID

export default dealRouter;
