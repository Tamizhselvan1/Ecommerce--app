import express from "express";
import { createOrder, getAllOrders, getOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authorized, protect } from "../middleware/auth.js";
const OrderRouter = express.Router();
//Get user orders
OrderRouter.get('/', protect, getOrders);
//Get single orders
OrderRouter.get('/:id', protect, getOrder);
//Create order from cart
OrderRouter.post('/', protect, createOrder);
//Update order status (Admin only)
OrderRouter.put('/:id/status', protect, authorized("admin"), updateOrderStatus);
//Update order status (Admin only)
OrderRouter.get('/admin/all', protect, authorized("admin"), getAllOrders);
export default OrderRouter;
