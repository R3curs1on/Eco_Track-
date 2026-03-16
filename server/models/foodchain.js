import  mongoose from 'mongoose'

const foodChainSchema = new mongoose.Schema({
    species: { type: mongoose.Schema.Types.ObjectId, ref: 'Species', required: true },
    eats: { type: mongoose.Schema.Types.ObjectId, ref: 'Species' }, // null for plants
});

export default mongoose.model('FoodChain', foodChainSchema);
