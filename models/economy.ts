const { model, Schema } = require("mongoose");

module.exports = model(
  "UserData",
  new Schema({
    UserID: { type: String, required: true },
    CreatedAt: { type: Date, default: null },
    Wallet: { type: Number, default: 0 },
    SpecialCoin: { type:Number, default: 0 },
    Bank: { type: Number, default: 0 },
    BankSpace: { type: Number, default: 1000 },
    Job: { type: String, default:'Unemployed' },
    Salary: { type: Number, default: 0 },
    WorkCooldown :{ type: Number },
    Cooldown: { 
      start : { type: Date, default: null },
      cooldown : { type: Number },
      id: { type: String },
    },
    Inventory: { type: Array, default: [] },
    LastWorked: { type: String, },
    LastDaily: { type: Date },
    LastWeekly: { type: Date },
    LastMonthly: { type: Date },
    LastYearly: { type: Date },
  })
);
