const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, unique: true },
  price:{ type: String, required: true },
  negotiationPrice:{ type: String, required: false },
  status: { type: String, required: false,enum:["Pending","In Progress","Completed","Cancelled"] },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
},{ timestamps: true });

const Deal = mongoose.model("Deal", dealSchema);

module.exports = Deal;
