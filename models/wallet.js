const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user_id",
        required:true
      },
    balance : {
        type: Number,
        default:100,
    },
})

module.exports = mongoose.model('Wallet', walletSchema);