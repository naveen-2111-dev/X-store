import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    walletId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    data1: {
      type: String,
      default: "",
    },
    data2: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const DistriSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: "0000000000",
  },
  name: {
    type: String,
  },
  aadhaar: {
    type: String,
  },
});

const Distributor = mongoose.model("distributorData", DistriSchema);
const Wallet = mongoose.model("Wallet", WalletSchema);

export { Wallet, Distributor };
