const mongoose = require("mongoose");
const profile = require("./models/economy");
const TerrosEco = class {
  constructor(notify, URI, SpecialCoin) {
    this.notify = notify || false;
    if (!URI) return console.log("Invalid URI");
    this.URI = URI;
    this.SpecialCoin = SpecialCoin || false;
  }

  // Connect function which connects to database
  async connect() {
    if (this.notify) {
      mongoose
        .connect(this.URI, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        })
        .then(console.log("TerrosEco | Connected to the Database!"));
    } else {
      mongoose.connect(this.URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
    }
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

  async add({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (!data.Property)
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    data.Property = data.Property + Amount;
    data.save();
    return "DONE";
  }

  async remove({ UserID, Amount, Property }) {
    const data = await profile.findOne({ UserID });
    if (!data) return "UNREGISTERED_USER";
    if (data.Wallet == 0 || data.Wallet < Amount) return "USER_BROKE";
    if (!data.Property)
      throw new TypeError(
        "Invalid Property: the properties can only be Wallet, Bank, BankSpace or SpecialCoin"
      );
    data.Property = data.Property - Amount;
    data.save();
    return "DONE";
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

  async test(id) {
      return id;
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
};

module.exports = TerrosEco;
