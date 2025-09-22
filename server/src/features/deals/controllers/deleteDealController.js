import dealModel from "../models/dealsModel.js";
import biddingModel from "../../bidding/models/biddingModel.js";
import { RequestDealmaker } from "../../request-dealmaker/models/requestDealmakerModel.js";
import Dispute from "../../disputes/models/disputeModel.js";
import Escrow from "../../wallet/models/escrowModel.js";
import { db_connection } from "../../../../config/db_connection.js";

export const deleteDealController = async (req, res) => {
  const { id } = req.params;
  const t = await db_connection.transaction();

  try {
    const deal = await dealModel.findByPk(id, { transaction: t });

    if (!deal) {
      await t.rollback();
      return res.status(404).json({ message: "Deal not found" });
    }

    if (deal.dealer_creator !== req.user.username) {
      await t.rollback();
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if deal has escrow payments (makes it undeleteable)
    if (deal.dealmaker) {
      const escrow = await Escrow.findOne({
        where: { dealId: id },
        transaction: t,
      });
      if (escrow && (escrow.creatorPaid || escrow.counterpartPaid)) {
        await t.rollback();
        return res.status(400).json({
          message:
            "Cannot delete deal - escrow payment has been made. Deal is now protected.",
        });
      }
    }

    // Delete related RequestDealmaker entries
    await RequestDealmaker.destroy({ where: { dealId: id }, transaction: t });

    // Delete related Bidding entries
    await biddingModel.destroy({ where: { dealId: id }, transaction: t });

    // Delete related Disputes
    await Dispute.destroy({ where: { dealId: id }, transaction: t });

    // Delete the deal itself
    await deal.destroy({ transaction: t });

    await t.commit();
    res
      .status(200)
      .json({ message: "Deal and all associated data deleted successfully" });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ error: "Failed to delete deal" });
  }
};
