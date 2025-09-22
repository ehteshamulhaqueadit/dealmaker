import Deal from "../../deals/models/dealsModel.js";
import Bidding from "../../bidding/models/biddingModel.js";
import socketService from "../../../utils/socketService.js";

const selectBidController = async (req, res) => {
  const { dealId, bidId } = req.params;
  const { id: userId, username } = req.user;

  try {
    const deal = await Deal.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // If a dealmaker is already assigned, the deal is final and cannot be changed.
    if (deal.dealmaker) {
      return res
        .status(403)
        .json({ message: "This deal is finalized and cannot be changed." });
    }

    const bid = await Bidding.findByPk(bidId);
    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    if (bid.dealId !== deal.id) {
      return res
        .status(400)
        .json({ message: "Bid does not belong to this deal" });
    }

    // Check if the user is the creator or the joined dealer
    const isCreator = deal.dealer_creator === username;
    const isJoinedDealer = deal.dealer_joined === username;

    if (!isCreator && !isJoinedDealer) {
      return res.status(403).json({
        message: "You are not authorized to select a bid for this deal",
      });
    }

    if (isCreator) {
      // If the creator is selecting the same bid again, unselect it
      if (deal.selected_bid_by_creator === bidId) {
        deal.selected_bid_by_creator = null;
      } else {
        deal.selected_bid_by_creator = bidId;
      }
    }

    if (isJoinedDealer) {
      // If the joined dealer is selecting the same bid again, unselect it
      if (deal.selected_bid_by_dealer === bidId) {
        deal.selected_bid_by_dealer = null;
      } else {
        deal.selected_bid_by_dealer = bidId;
      }
    }

    // If a bid was unselected, the deal is no longer finalized
    deal.dealmaker = null;

    let bidSelectionUpdate = {
      dealId,
      bidId,
      selectedBy: username,
      isCreator,
      isJoinedDealer,
    };

    // Check if both have selected the same bid (and it's not null)
    if (
      deal.selected_bid_by_creator &&
      deal.selected_bid_by_creator === deal.selected_bid_by_dealer
    ) {
      const finalBid = await Bidding.findByPk(deal.selected_bid_by_creator);
      deal.dealmaker = finalBid.dealmaker;
      deal.budget = finalBid.price; // Update the deal's budget with the final bid price

      bidSelectionUpdate.dealFinalized = true;
      bidSelectionUpdate.finalDealmaker = finalBid.dealmaker;
      bidSelectionUpdate.finalPrice = finalBid.price;

      // Delete all bids for this deal
      await Bidding.destroy({
        where: {
          dealId: deal.id,
        },
      });
    }

    await deal.save();

    // Broadcast real-time update
    socketService.broadcastBidUpdate(dealId, bidSelectionUpdate, "selected");

    // If deal was finalized, also broadcast deal update
    if (bidSelectionUpdate.dealFinalized) {
      socketService.broadcastDealUpdate(dealId, deal, "finalized");
    }

    res
      .status(200)
      .json({ message: "Bid selection updated successfully", deal });
  } catch (error) {
    console.error("Error selecting bid:", error);
    res.status(500).json({ message: "Server error while selecting bid" });
  }
};

export { selectBidController };
