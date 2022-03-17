const { model, Schema } = require("mongoose");

module.exports = model(
  "UserData",
  new Schema({
    UserID: { type: String, required: true },
    CreatedAt: { type: Date, default: null },
    Wallet: { type: Number, default: 0 },
    Bank: { type: Number, default: 0 },
    SpecialCoin: { type:Number, default: 0 },
    Job: { type: String, default:'Unemployed' },
    Salary: { type: Number, default: 0 },
    // Inventory: { type: Array, default: [] },
    BankSpace: { type: Number, default: 1000 },
    LastDaily: { type: Date },
    LastWeekly: { type: Date },
    LastMonthly: { type: Date },
    LastYearly: { type: Date },
  })
);
