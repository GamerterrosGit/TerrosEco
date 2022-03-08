const { model, Schema } = require("mongoose");

module.exports = model(
  "UserData",
  new Schema({
    UserID: { type: String, required: true },
    CreatedAt: { type: Date, default: null },
    Wallet: { type: Number, default: 0 },
    Bank: { type: Number, default: 0 },
    SpecialCoin: { type:Number, default: 0 },
    /*Job: { type: String },
    Inventory: { type: Array, default: [] },*/
    BankSpace: { type: Number, default: 1000 },
    DailyDate: { type: Date },
    WeeklyDate: { type: Date },
    DailyAmount: { type: Number, default: 25000 },
    WeeklyAmount: { type: Number, default: 150000 },
  })
);
