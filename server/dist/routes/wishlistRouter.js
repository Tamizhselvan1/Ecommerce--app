import express from "express";
import { protect } from "../middleware/auth.js";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
const router = express.Router();
router.use(protect);
router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
export default router;
