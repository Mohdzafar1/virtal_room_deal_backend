const mongoose = require("mongoose");


const MONGO_URI = process.env.URL; 


mongoose.connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => console.log("✅ CONNECTED TO DATABASE SUCCESSFULLY"))
.catch((error) => {
    console.error("❌ Database connection error:", error.message);
});
