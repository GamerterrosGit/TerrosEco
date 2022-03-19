const mongoose = require("mongoose");
const profile = require("./models/economy");
const botprofile = require("./models/botdata");
const ms = require("ms");
const EventEmitter = require("events");
class TerrosEco extends EventEmitter {
  constructor(client, { URI, SpecialCoin }) {
    if (!URI) return console.log("Invalid URI");
    this.URI = URI;
    this.client = client;
    this.SpecialCoin = SpecialCoin || false;
  }

  // Connect function which connects to database
  async connect() {
    new botprofile({
      BotID: this.client.user.id,
    });
    mongoose
      .connect(this.URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      })
      .then(() => this.emit("ready"));
  }

  // Register function which registers the user
  async register({ UserID, DefaultWallet, DefaultBank, DefaultBankSpace }) {
    const data = await profile.findOne({ UserID });
    if (data) return "REGISTERED";
    if (!this.SpecialCoin) {
      new UserSchema({
        UserID,
        CreatedAt: Date.now(),
        Wallet: DefaultWallet,
        Bank: DefaultBank,
        BankSpace: DefaultBankSpace,
      }).save();
      return "DONE";
    } else if (this.SpecialCoin) {
      new UserSchema({
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
    if (!data) return "UNREGISTERED";
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
    if (data.Bank == 0 || data.Bank < Amount) return "USER_BROKE";

    data.Bank = data.Bank - Amount;
    data.Wallet = data.Wallet + Amount;
    data.save();
    return "DONE";
  }

  async deposit({ UserID, Amount }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Wallet == 0 || data.Wallet < Amount) return "USER_BROKE";
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
      return "VICTIM_IS_BROKE";
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
      return "PAYER_IS_BROKE";
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
        time: ms(timeout - (Data.now() - data.LastWeekly)),
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
        time: ms(timeout - (Data.now() - data.LastWeekly)),
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
        time: ms(timeout - (Data.now() - data.LastMonthly)),
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
        time: ms(timeout - (Data.now() - data.LastYearly)),
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

  async assignJob({ UserID, Job, Salary, Cooldown, MinWorkPerDay }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    data.Job = Job || data.Job;
    data.Salary = Salary || data.Salary;
    data.WorkCooldown = Cooldown;
    data.MinWorks = MinWorkPerDay;
    data.save();
    this.emit("gotjob", UserID);
    return "DONE";
  }

  async work({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Job === "Unemployed") return "NO_JOB";
    if (data.WorkCooldown - (Date.now() - data.LastWorked) > 0)
      return {
        result: "TIMEOUT",
        time: ms(timeout - (Data.now() - data.LastWorked)),
      };
    data.Wallet += data.Salary;
    data.TimesWorked += 1;
    data.LastWorked = Date.now();
    data.save();
    return { result: "DONE" };
  }

  async resignJob({ UserID }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Job === "Unemployed") return "NO_JOB";
    data.Job = Unemployed;
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
    };
    data.Shop.push(item);
    data.save();
    return "DONE";
  }

  async removeItem({ ItemID }) {
    const data = await botprofile.findOne({ BotID: this.client.user.id });
    if (data.Shop.length == 0) return "EMPTY_SHOP";
    let items = data.Shop.filter((item) => item.id !== ItemID);
    data.Shop = items;
    data.save();
    return "DONE";
  }

  async buy({ UserID, ItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    item = botdata.Shop.filter((item) => item.id == ItemID)
    if(!item) return "INVALID_ITEM";
    if(data.Wallet < item.buy) return "NOT_ENOUGH_CASH";
    item.count += 1
    data.Wallet -= item.buy;
    data.Inventory.push(item);
    data.save();
    return "DONE"
  }

  async sell({ UserID, ItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    item = data.Inventory.filter((item) => item.id == ItemID)
    if(!item) return "INVALID_ITEM"
    data.Wallet += item.sell;
    items = data.Inventory.filter((item) => item.id != ItemID)
    if(item.count > 1) {
      data.Inventory.filter((item) => item.id == ItemID).count -= 1
      data.save();
    } else {
      data.Intentory = items
      data.save();
    }
    data.save();
    return "DONE"
  }

  async trade({ traderID, traderItemID, recieverID, recieverItemID }) {
    const botdata = await botprofile.findOne({ BotID: this.client.user.id });
    const traderdata = await profile.findOne({ traderID });
    const recieverdata = await profile.findOne({ recieverID });
    if (!traderdata) return "UNREGISTERED_TRADER";
    if (!recieverdata) return "UNREGISTERED_RECIEVER";
    traderitem = traderdata.Inventory.filter((item) => item.id == traderItemID)
    recieveritem = recieverdata.Inventory.filter((item) => item.id == recieverItemID)
    if(!traderitem) return "INVALID_TRADER_ITEM";
    if(!recieveritem) return "INVALID_RECIEVER_ITEM";
    traderitems = traderdata.Inventory.filter((item) => item.id != traderItemID)
    recieveritems = recieverdata.Inventory.filter((item) => item.id != recieverItemID)
    if(recieveritem.count > 1) {
      recieverdata.Inventory.filter((item) => item.id == ItemID).count -= 1
      recieverdata.save();
    } else {
      recieverdata.Intentory = recieveritems
      recieverdata.save();
    }
    if(traderitem.count > 1) {
      traderdata.Inventory.filter((item) => item.id == ItemID).count -= 1
      traderdata.save();
    } else {
      traderdata.Intentory = traderitems
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

  async progressBar({ value, maxValue, size }) {
    let barArray = [];
    let bar = {
      fillStart: "https://cdn.discordapp.com/emojis/937428162797797418.gif",
      fillBar: "https://cdn.discordapp.com/emojis/937428161950519366.gif",
      fillEnd: "https://cdn.discordapp.com/emojis/937428160889376828.gif",
      emptyStart: "https://cdn.discordapp.com/emojis/937428162369970196.webp",
      emptyBar: "https://cdn.discordapp.com/emojis/937428160109224006.webp",
      emptyEnd: "https://cdn.discordapp.com/emojis/937428160188928081.webp",
    };

    let fill = Math.round(size * (value / maxValue > 1 ? 1 : value / maxValue));
    let empty = size - fill > 0 ? size - fill : 0;

    for (let i = 1; i <= fill; i++) barArray.push(bar.fillBar);
    for (let i = 1; i <= empty; i++) barArray.push(bar.emptyBar);

    barArray[0] = barArray[0] == bar.fillBar ? bar.fillStart : bar.emptyStart;
    barArray[barArray.length - 1] =
      barArray[barArray.length - 1] == bar.fillBar ? bar.fillEnd : bar.emptyEnd;

    return barArray.join(``);
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

  // async test(id) {
  //   return id;
  // }

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

TerrosEco.on("gotjob", (UserID) => {
  while (data.Job != "Unemployed") {
    setTimeout(() => {
      const data = await profile.findOne({ UserID });
      if (data.TimesWorked >= data.MinWorks) {
        data.Salary = 0;
        data.Job = "Unemployed";
        data.save();
        return "RESIGNED";
      }
    }, 86400000);
  }
});

module.exports = TerrosEco;
