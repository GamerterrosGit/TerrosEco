const { model, Schema } = require("mongoose");

module.exports = model(
  "BotData",
  new Schema({
    BotID: { type: String, required: true },
    Shop: { type: Array, default:[] }
  })
);
