import mongoose from "mongoose";
import "dotenv/config";
import Product from "../models/Products.js";
// Read the dummy data from the client folder
import { dummyProducts } from "../../client/assets/assets.js";
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to database.");
        // Clear existing products
        await Product.deleteMany({});
        console.log("Cleared existing products.");
        // Clean up data for insertion (remove _id, createdAt, etc. to let Mongoose handle them, or keep them)
        const productsToInsert = dummyProducts.map((p) => {
            const { _id, createdAt, updatedAt, ...rest } = p;
            return rest;
        });
        // Insert new products
        await Product.insertMany(productsToInsert);
        console.log("Successfully seeded products from dummy data!");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};
seedDatabase();
