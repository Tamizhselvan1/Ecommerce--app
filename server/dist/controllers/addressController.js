import Address from "../models/Address.js";
//Get user Addresses
//GET /api/addresses
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json({ success: true, data: addresses });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//Add new Address
//POST /api/addresses
export const addAddress = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const newAddress = await Address.create({ user: req.user._id, type, street, city, state, zipCode, country, isDefault: isDefault || false });
        res.status(201).json({ successs: true, data: newAddress });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//update Address
//PUT /api/addresses/:id
export const updateAddress = async (req, res) => {
    try {
        const { type, street, city, state, zipCode, country, isDefault } = req.body;
        let addressesItem = await Address.findById(req.params.id);
        if (!addressesItem) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        //Ensure user owns adddress
        if (addressesItem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const newAddress = await Address.findByIdAndUpdate(req.params.id, { type, street, city, state, zipCode, country, isDefault }, { new: true });
        res.status(201).json({ successs: true, data: addressesItem });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
//Delete Address
//DELETE /api/addresses/:id
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        //Ensure user owns adddress
        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }
        await address.deleteOne();
        res.status(201).json({ successs: true, message: "Address removed" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
