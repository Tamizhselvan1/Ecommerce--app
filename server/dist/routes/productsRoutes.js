import express from 'express';
import { createProduct, deleteProduct, getProducts, getSingleProduct, updateProduct } from '../controllers/productController.js';
import upload from '../middleware/upload.js';
import { authorized, protect } from '../middleware/auth.js';
const ProductRouter = express.Router();
//Get all products
ProductRouter.get('/', getProducts);
//Get single products
ProductRouter.get('/:id', getSingleProduct);
//Create product (Admin only)
ProductRouter.post('/', upload.array("images", 5), protect, authorized('admin'), createProduct);
//Update product(Admin only)
ProductRouter.put('/:id', upload.array("images", 5), protect, authorized('admin'), updateProduct);
//delete product (Admin only)
ProductRouter.delete('/:id', protect, authorized('admin'), deleteProduct);
export default ProductRouter;
