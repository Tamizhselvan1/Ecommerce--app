import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true },
    clerkId: { type: String, sparse: true, unique: true },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: 'user' },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
export default User;
