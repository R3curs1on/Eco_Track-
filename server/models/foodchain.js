import mongoose from 'mongoose';

const foodChainSchema = new mongoose.Schema(
    {
        predator: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        prey: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        }
    },
    { timestamps: true }
);

foodChainSchema.index({ predator: 1, prey: 1 }, { unique: true });

const FoodChain = mongoose.model('FoodChain', foodChainSchema, 'foodchain');

export default FoodChain;
