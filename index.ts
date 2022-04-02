const mongoose = require("mongoose");
const profile = require('./models/economy.ts');
const botprofile = require("./models/botdata.ts");
const ms = require("ms");
const EventEmitter = require("events");
class TerrosEco extends EventEmitter {
  constructor(client, URI, { SpecialCoin }) {
    super()
    this.URI = URI;
    if (!this.URI) console.log("Invalid URI");
    this.client = client;
    this.SpecialCoin = SpecialCoin || false;
  }
  // Connect function which connects to database
  connect() {
    new botprofile({
      BotID: this.client?.user?.id,
    }).save();
    mongoose
      .connect(this.URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
      .then(() => super.emit("ready"));
  }

  // Register function which registers the user
  async register({ UserID, DefaultWallet, DefaultBank, DefaultBankSpace }) {
    const data = await profile.findOne({ UserID });
    if (data) return "ALREADY_REGISTERED";
    if (!this.SpecialCoin) {
      new profile({
        UserID,
        CreatedAt: Date.now(),
        Wallet: DefaultWallet,
        Bank: DefaultBank,
        BankSpace: DefaultBankSpace,
      }).save();
      return "DONE";
    } else if (this.SpecialCoin) {
      new profile({
        UserID,
        CreatedAt: Date.now(),
        Wallet: DefaultWallet,
        Bank: DefaultBank,
        BankSpace: DefaultBankSpace,
        SpecialCoin: 0,
      }).save();
      return "DONE";
    }
  }

  async delete({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    data.delete();
    return "DONE";
  }

  async add({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (
      Property != "Wallet" ||
      Property != "Bank" ||
      Property != "SpecialCoin" ||
      Property != "BankSpace"
    )
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    switch (Property) {
      case "Wallet":
        {
          data.Wallet = data.Wallet + Amount;
          data.save();
          return "DONE";
        }
        break;

      case "Bank":
        {
          data.Bank = data.Bank + Amount;
          data.save();
          return "DONE";
        }
        break;

      case "BankSpace":
        {
          data.BankSpace = data.BankSpace + Amount;
          data.save();
          return "DONE";
        }
        break;

      case "SpecialCoin":
        {
          data.SpecialCoin = data.SpecialCoin + Amount;
          data.save();
          return "DONE";
        }
        break;
    }
  }

  async remove({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (
      Property != "Wallet" ||
      Property != "Bank" ||
      Property != "SpecialCoin" ||
      Property != "BankSpace"
    )
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    switch (Property) {
      case "Wallet":
        {
          data.Wallet = data.Wallet - Amount;
          data.save();
          return "DONE";
        }
        break;

      case "Bank":
        {
          data.Bank = data.Bank - Amount;
          data.save();
          return "DONE";
        }
        break;

      case "BankSpace":
        {
          data.BankSpace = data.BankSpace - Amount;
          data.save();
          return "DONE";
        }
        break;

      case "SpecialCoin":
        {
          data.SpecialCoin = data.SpecialCoin - Amount;
          data.save();
          return "DONE";
        }
        break;
    }
  }

  async withdraw({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Bank == 0 || data.Bank < Amount) return "NOT_ENOUGH_MONEY";
    data.Bank = data.Bank - Amount;
    data.Wallet = data.Wallet + Amount;
    data.save();
    return "DONE";
  }

  async deposit({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Wallet == 0 || data.Wallet < Amount) return "NOT_ENOUGH_MONEY";
    if (data.Wallet + Amount > data.BankSpace) return "NOT_ENOUGH_SPACE";
    data.Bank = data.Wallet + Amount;
    data.Wallet = data.Wallet - Amount;
    data.save();
    return "DONE";
  }

  async rob({ robberid, victimid, Amount }) {
    const robberdata = await profile.findOne({ UserID: robberid });
    const victimdata = await profile.findOne({ UserID: victimid });
    if (!robberdata) return "UNREGISTERED_ROBBER";
    if (!victimdata) return "UNREGISTERED_VICTIM";
    if (victimdata.Wallet == 0 || victimdata.Wallet < Amount)
      return "VICTIM_IS_POOR";
    robberdata.Wallet = robberdata.Wallet + Amount;
    victimdata.Wallet = victimdata.Wallet - Amount;
    robberdata.save();
    victimdata.save();
    return "DONE";
  }

  async pay({ payerid, recieverid, Amount }) {
    const robberdata = await profile.findOne({ UserID: recieverid });
    const victimdata = await profile.findOne({ UserID: payerid });
    if (!victimdata) return "UNREGISTERED_PAYER";
    if (!robberdata) return "UNREGISTERED_RECIEVER";
    if (victimdata.Wallet == 0 || victimdata.Wallet < Amount)
      return "PAYER_IS_POOR";
    robberdata.Wallet = robberdata.Wallet + Amount;
    victimdata.Wallet = victimdata.Wallet - Amount;

    robberdata.save();
    victimdata.save();
    return "DONE";
  }

  async daily({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    let timeout = 86400000;
    let reward = Amount;
    if (timeout - (Date.now() - data.LastWeekly) > 0)
      return {
        result: "TIMEOUT",
        time: ms(timeout - (Date.now() - data.LastWeekly)),
      };
    data.Wallet += reward;
    data.LastWeekly = Date.now();
    data.save();
    return { result: "DONE" };
  }

  async weekly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    let timeout = 604800000;
    let reward = Amount;
    if (timeout - (Date.now() - data.LastWeekly) > 0)
      return {
        result: "TIMEOUT",
        time: ms(timeout - (Date.now() - data.LastWeekly)),
      };
    data.Wallet += reward;
    data.LastWeekly = Date.now();
    data.save();
    return { result: "DONE" };
  }

  async monthly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    let timeout = 2629800000;
    let reward = Amount;
    if (timeout - (Date.now() - data.LastMonthly) > 0)
      return {
        result: "TIMEOUT",
        time: ms(timeout - (Date.now() - data.LastMonthly)),
      };
    data.Wallet += reward;
    data.LastMonthly = Date.now();
    data.save();
    return { result: "DONE" };
  }

  async yearly({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    let timeout = 31556952000;
    let reward = Amount;
    if (timeout - (Date.now() - data.LastYearly) > 0)
      return {
        result: "TIMEOUT",
        time: ms(timeout - (Date.now() - data.LastYearly)),
      };
    data.Wallet += reward;
    data.LastYearly = Date.now();
    data.save();
    return { result: "DONE" };
  }
  /* Job System */

  async job({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return { job: data.Job, salary: data.Salary };
  }

  async assignJob({ UserID, Job, Salary, Cooldown }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    data.Job = Job || data.Job;
    data.Salary = Salary || data.Salary;
    data.WorkCooldown = Cooldown;
    data.save();
    return "DONE";
  }

  async work({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Job === "Unemployed") return "NO_JOB";
    if (data.WorkCooldown - (Date.now() - data.LastWorked) > 0)
      return {
        result: "TIMEOUT",
        time: ms(data.WorkCooldown - (Date.now() - data.LastWorked)),
      };
    data.Wallet += Amount || data.Salary;
    data.LastWorked = Date.now();
    data.save();
    return { result: "DONE" };
  }

  async resignJob({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Job === "Unemployed") return "NO_JOB";
    data.Job = "Unemployed";
    data.Salary = data.Salary;
    data.save();
    return "DONE";
  }

  /**/

  /* Shop System */

  async addItem({
    ItemID,
    ItemName,
    ItemDescription,
    ItemBuyPrice,
    ItemSellPrice,
  }) {
    const data = await botprofile.findOne({ BotID: this.client.user.id });
    if (
      data.Shop.find((x) => x.id === ItemID || x.name === ItemName) != undefined
    )
      return "SIMILAR_ITEM_FOUND";
    let item = new Object();
    item = {
      name: ItemName,
      description: ItemDescription,
      buy: ItemBuyPrice,
      sell: ItemSellPrice,
      id: ItemID,
      count: 1
    };
    data.Shop.push(item);
    data.save();
    return "DONE";
  }

  async removeItem({ ItemID }) {
    const data = await botprofile.findOne({ BotID: this.client.user.id });
    if (data.Shop.length == 0) return "EMPTY_SHOP";
    let item = data.Shop.filter((item) => item.id == ItemID);
    if(!item) return "INVALID_ITEM";
    let items = data.Shop.filter((item) => item.id !== ItemID);
    data.Shop = items;
    data.save();
    return "DONE";
  }

  async buy({ UserID, ItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    const item = botdata.Shop.filter((item) => item.id == ItemID)
    const hasitem = data.Inventory.filter((item) => item.id == ItemID)
    if(!item) return "INVALID_ITEM";
    if(data.Wallet < item.buy) return "NOT_ENOUGH_CASH";
    if(!hasitem) {
      data.Wallet -= item.buy;
      data.Inventory.push(item);
      data.save();
      return "DONE"
    }
    data.Wallet -= item.buy;
    hasitem.count += 1;
    data.save();
    return "DONE"
  }

  async sell({ UserID, ItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    const item = data.Inventory.filter((item) => item.id == ItemID)
    if(!item) return "INVALID_ITEM"
    const items = data.Inventory.filter((item) => item.id != ItemID)
    if(item.count > 1) {
      data.Wallet += item.sell;
      item.count -= 1
      data.save();
    }
    data.Intentory = items;
    data.Wallet += item.sell;
    data.save();
    return "DONE"
  }

  async trade({ traderID, traderItemID, recieverID, recieverItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const traderdata = await profile.findOne({ traderID });
    const recieverdata = await profile.findOne({ recieverID });
    if (!traderdata) return "UNREGISTERED_TRADER";
    if (!recieverdata) return "UNREGISTERED_RECIEVER";
    const traderitem = traderdata.Inventory.filter((item) => item.id == traderItemID)
    const recieveritem = recieverdata.Inventory.filter((item) => item.id == recieverItemID)
    if(!traderitem) return "INVALID_TRADER_ITEM";
    if(!recieveritem) return "INVALID_RECIEVER_ITEM";
    const traderitems = traderdata.Inventory.filter((item) => item.id != traderItemID)
    const recieveritems = recieverdata.Inventory.filter((item) => item.id != recieverItemID)
    if(recieveritem.count > 1) {
      recieveritem.count -= 1;
      recieverdata.save();
    } else {
      recieverdata.Inventory = recieveritems
      recieverdata.save();
    }
    if(traderitem.count > 1) {
      traderitem.count -= 1
      traderdata.save();
    } else {
      traderdata.Inventory = traderitems
      traderdata.save();
    }
    traderdata.Inventory.push(recieveritem)
    recieverdata.Inventory.push(traderitem)
    traderdata.save();
    recieverdata.save();
    return "DONE";
  }

  async getItem({ ItemID }) {
    const data = await botprofile.findOne({ BotID: this.client.user.id });
    return data.Shop.filter((item) => item.id == ItemID) ? data.Shop.filter((item) => item.id == ItemID) : "INVALID_ITEM";
  }

  async getShop() {
    const data = await botprofile.findOne({ BotID: this.client.user.id });
    return !data.Shop || data.Shop.length == 0 ? "EMPTY_SHOP" : data.Shop;
  }

  async getInventory({ UserID }) {
    const data = await profile.findOne({ UserID });
    return !data.Inventory || data.Inventory.length == 0 ? "EMPTY_INVENTORY" : data.Inventory;
  }

  /**/

  async profile({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return {
      wallet: data.Wallet,
      bank: data.Bank,
      bankSpace: data.BankSpace,
      id: data.UserID,
      created: data.CreatedAt,
      specialCoin: data.SpecialCoin,
      job: data.Job,
      salary: data.Salary,
      lastDaily: data.LastDaily,
      lastWeekly: data.LastWeekly,
      lastMonthly: data.LastMonthly,
      lastYearly: data.LastYearly,
    };
  }

  async wallet({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.Wallet;
  }

  async bank({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.Bank;
  }

  async bankSpace({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.BankSpace;
  }

  async specialCoin({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    return data.SpecialCoin;
  }
}

class Utility {
   progressBar({ value, maxValue }){
    if(!value || !maxValue) throw new TypeError("INVALID_VALUES");
    let barArray = [];
    let bar = {
      fillStart: "https://cdn.discordapp.com/emojis/937428162797797418.gif",
      fillBar: "https://cdn.discordapp.com/emojis/937428161950519366.gif",
      fillEnd: "https://cdn.discordapp.com/emojis/937428160889376828.gif",
      emptyStart: "https://cdn.discordapp.com/emojis/937428162369970196.webp",
      emptyBar: "https://cdn.discordapp.com/emojis/937428160109224006.webp",
      emptyEnd: "https://cdn.discordapp.com/emojis/937428160188928081.webp",
    };
    let fill = Math.floor(value / maxValue * 100);
    let empty = 100 - fill;
    let fillBar = Math.floor(fill / 100 * (bar.fillBar.length - bar.fillStart.length - bar.fillEnd.length));
    let emptyBar = Math.floor(empty / 100 * (bar.emptyBar.length - bar.emptyStart.length - bar.emptyEnd.length));
    barArray.push(bar.fillStart);
    for (let i = 0; i < fillBar; i++) {
      barArray.push(bar.fillBar);
    }
    barArray.push(bar.fillEnd);
    for (let i = 0; i < emptyBar; i++) {
      barArray.push(bar.emptyBar);
    }
    barArray.push(bar.emptyEnd);
    return barArray.join("");
  }

  cooldownSet({ UserID, cooldown, ID }) {
    if(!UserID || !cooldown) throw new TypeError("INVALID_VALUES");
    const data = profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if(data.Cooldown.id === ID) return "COOLDOWN_ALREADY_SET";
    data.Cooldown = {
      id: ID,
      cooldown: ms(cooldown),
      start: Date.now(),
    };
    data.save();
  }

  cooldownCheck({ UserID, ID }) {
    if(!UserID || !ID) throw new TypeError("INVALID_VALUES");
    const data = profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if(data.Cooldown.id !== ID) return "COOLDOWN_NOT_SET";
    if(Date.now() - data.Cooldown.start < data.Cooldown.cooldown) return "STILL_ON_COOLDOWN";
    return "NOT_ON_COOLDOWN";
  }

  randomNumber({ min, max })  {
    if(!min || !max) throw new TypeError("INVALID_VALUES");
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  profit({ costPrice, sellPrice })  {
    if(!costPrice || !sellPrice) throw new TypeError("INVALID_VALUES");
    return sellPrice - costPrice;
  }

  loss({ costPrice, sellPrice })  {
    if(!costPrice || !sellPrice) throw new TypeError("INVALID_VALUES");
    return costPrice - sellPrice;
  }

   average({ array }) {
    if(!array || array.length == 0) throw new TypeError("INVALID_ARRAY");
    return array.reduce((a, b) => a + b, 0) / array.length;
  }

   secondsToMs({ seconds })  {
    if(!seconds) throw new TypeError("INVALID_VALUE");
    return seconds * 1000;
  }

   minutesToMs({ minutes })  {
    if(!minutes) throw new TypeError("INVALID_VALUE");
    return minutes * 60000;
  }

   hoursToMs({ hours })  {
    if(!hours) throw new TypeError("INVALID_VALUE");
    return hours * 3600000;
  }

   daysToMs({ days })  {
    if(!days) throw new TypeError("INVALID_VALUE");
    return days * 86400000;
  }

   weeksToMs({ weeks })  {
    if(!weeks) throw new TypeError("INVALID_VALUE");
    return weeks * 604800000;
  }

   monthsToMs({ months })  {
    if(!months) throw new TypeError("INVALID_VALUE");
    return months * 2592000000;
  }

   yearsToMs({ years })  {
    if(!years) throw new TypeError("INVALID_VALUE");
    return years * 31536000000;
  }

   msToSeconds({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 1000;
  }

   msToMinutes({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 60000;
  }

   msToHours({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 3600000;
  }

   msToDays({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 86400000;
  }

   msToWeeks({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 604800000;
  }

   msToMonths({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 2592000000;
  }

   msToYears({ ms })  {
    if(!ms) throw new TypeError("INVALID_VALUE");
    return ms / 31536000000;
  }

}

module.exports = { TerrosEco, Utility };