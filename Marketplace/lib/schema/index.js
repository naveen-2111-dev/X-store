import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  walletId: {
    type: String,
    required: true,
    unique: true,
  },
  slugs: {
    type: [String],
    default: [],
  },
});

const walletSchema = mongoose.model("Wallet", WalletSchema);

export default walletSchema;
