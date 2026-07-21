import { Request, Response } from "express";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Products.js";

// Get user wishlist
// GET /api/wishlist
export const getWishlist = async (req: Request, res: Response) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, products: [] });
        } else {
            // Filter out null products (deleted products)
            const originalLength = wishlist.products.length;
            wishlist.products = wishlist.products.filter(product => product != null);
            if (wishlist.products.length !== originalLength) {
                await wishlist.save();
            }
        }

        res.json({ success: true, data: wishlist });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle item in wishlist
// POST /api/wishlist/toggle
export const toggleWishlist = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, products: [] });
        }

        const productIndex = wishlist.products.indexOf(productId);

        if (productIndex > -1) {
            // Remove from wishlist
            wishlist.products.splice(productIndex, 1);
        } else {
            // Add to wishlist
            wishlist.products.push(productId);
        }

        await wishlist.save();
        await wishlist.populate("products");

        res.json({ success: true, data: wishlist });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
