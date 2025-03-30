const Deal = require("../model/dealModel");
const User = require("../model/userModel");


// exports.createDeal = async (req, res) => {
//     try {
//         const { title, description, price, userId } = req.body;
//        console.log("njghj jggjhghghghjhj",title, description, price, userId )
      
//         const user = await User.findById(userId);

//         // if (!user || user.role !== "buyer") {
//         //     return res.status(403).json({ message: "Only buyers can create deals" });
//         // }

//         // Create a new deal
//         const newDeal = new Deal({
//             title,
//             description,
//             price,
//             status: "Pending",
//             user: userId
//         });

//         await newDeal.save();
//         res.status(201).json({ message: "Deal created successfully", deal: newDeal });

//     } catch (error) {
//         console.error("Error creating deal:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };



exports.createDeal = async (req, res, next) => {
    try {
        const { title, description, price, userId } = req.body;
        console.log("Creating Deal:", title, description, price, userId);
      
        const user = await User.findById(userId);

        const newDeal = new Deal({
            title,
            description,
            price,
            status: "Pending",
            user: userId
        });

        await newDeal.save();

        // Emit event to all connected clients
        req.app.get("io").emit("newDealNotification", { 
            message: `New Deal Created: ${title}`, 
            deal: newDeal 
        });

        res.status(201).json({ message: "Deal created successfully", deal: newDeal });

    } catch (error) {
        console.error("Error creating deal:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.updateDealStatus = async (req, res) => {
    try {
        const { dealId, status } = req.body;
        const userId = req.user.id;

        // Get user role
        const user = await User.findById(userId);
        if (!user || user.role !== "seller") {
            return res.status(403).json({ message: "Only sellers can update deal status" });
        }

        // Find the deal
        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        // Update status only if valid
        if (!["In Progress", "Completed", "Cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        deal.status = status;
        await deal.save();

        res.status(200).json({ message: `Deal marked as ${status}`, deal });

    } catch (error) {
        console.error("Error updating deal status:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getDealList=async(req,res)=>{
  try{
   const deal=await Deal.find()
   res.status(200).json({ message:"Deal List",deal});

  }catch(error){
    console.error("Error deal", error);
    res.status(500).json({ message: "Server error" });
  }
}

exports.getSingleDealList = async (req, res) => {
    try {
        const { id: dealId } = req.params; // ✅ Correctly extract dealId
        console.log("Fetching deal for ID:", dealId);

        const deal = await Deal.findById(dealId);
        if (!deal) {
            return res.status(404).json({ message: "Deal not found" });
        }

        res.status(200).json({ message: "Deal found", deal });

    } catch (error) {
        console.error("Error fetching deal:", error);
        res.status(500).json({ message: "Server error" });
    }
};

