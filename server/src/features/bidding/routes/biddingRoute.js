import { Router } from "express";
import { createBid } from "../controllers/createBidController.js";
import { getBid } from "../controllers/getBidController.js";
import { updateBid } from "../controllers/updateBidController.js";
import { deleteBid } from "../controllers/deleteBidController.js";
import { getAllBids } from "../controllers/getAllBidsController.js";

import { authentication } from "../../../middleware/authMiddleware.js";

const biddingRouter = Router();

biddingRouter.use(authentication);

biddingRouter.post("/create", createBid);
biddingRouter.get("/:id", getBid);
biddingRouter.put("/:id", updateBid);
biddingRouter.delete("/:id", deleteBid);

biddingRouter.get("/all", getAllBids);

export default biddingRouter;
