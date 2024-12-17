const express = require("express");
const zod = require("zod");
const User = require("../models/user");
const Wallet = require("../models/wallet");
const Transaction = require('../models/transaction');
const router = express.Router();
const userVerification = require("../middlewares/userVerification");
const mongoose = require('mongoose')

router.get('/balance', userVerification, async (req, res)=>{
    // const token = req.cookies.token;
    try{ 
        const user_id = req.user._id;
        const userWallet = await Wallet.findOne({user_id});
        
        res.status(200).json({
            balance: userWallet.balance,
            success: true
        })
    }catch(err){
        res.status(401).json({
            success:false,
            message:"Error while fetching balance"
        })
    }
    
})

router.post('/send', userVerification, async (req, res)=>{
    const {email, phoneNumber, amount, pin} = req.body;
    
    // const session = mongoose.startSession();
    
    const createTransaction = async (sender_id, senderName, recipient_id, recipientName, senderPhoneNumber, recieverPhoneNumber, amount, type, status)=>{
        await Transaction.create({
            sender_id,
            senderName,
            recipient_id,
            recipientName,
            senderPhoneNumber,
            recieverPhoneNumber,
            amount,
            transactionType:type,
            status:status,
        });
    }

    try{   
        //session.startTransaction();
        const reciever = await User.findOne({
            phoneNumber
        })
        const sender = await User.findOne({
            _id:req.user._id
        })
        
        if(!reciever){
            return res.status(401).json({ 
                success:false,
                message:'Invalid reciever'
            })
        }
        const sender_wallet = await Wallet.findOne({user_id: req.user._id}) //.session(session);
        const reciever_wallet = await Wallet.findOne({user_id: reciever._id}) //.session(session);

        if(!sender_wallet || !reciever_wallet) {
            return res.status(401).json({ 
                success:false,
                message:'Invalid Wallets'
            })
        }

        if(sender_wallet.balance < amount){
            return res.status(401).json({ 
                success:false,
                message:'Inefficeint balance'
            })
        }

        if(pin != sender.pin){
            return res.status(401).json({ 
                success:false,
                message:'Wrong pin'
            })
        }

        sender_wallet.balance -= parseInt(amount);
        reciever_wallet.balance += parseInt(amount);

        await sender_wallet.save()
        await reciever_wallet.save()
        
        createTransaction(req.user._id, req.user.name, reciever._id, reciever.name, req.user.phoneNumber, phoneNumber,  amount, 'SEND', 'COMPLETED');

        

        // Commit transaction
        //await session.commitTransaction();

        return res.status(200).json({
          success: true,
          message: 'Transfer successful'
        })

    }catch(err){
        const reciever = await User.findOne({
            $or:[{email}, {phoneNumber}]
        })

        createTransaction(req.user._id, reciever._id, amount, 'SEND', 'FAILED');

        //await session.abortTransaction();
        return res.status(401).json({
            success:false,
            message:"Transaction failed",
        })
    }
    finally{
        //session.endSession();
    }
})

router.get('/transaction', userVerification, async (req, res)=>{
    const user_id = req.user._id;
    const phoneNumber= req.user.phoneNumber;
    const transactionArray = await Transaction.find({$or:[{senderPhoneNumber:phoneNumber},{ recieverPhoneNumber:phoneNumber}]});
    res.status(200).json({
        transactionArray
    })
    
})

module.exports = router;