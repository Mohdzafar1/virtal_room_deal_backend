require("dotenv").config();
require("./db/conn.js");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRouter = require("./router/userRouter");
const Deal = require("./model/dealModel"); 
const dealRouter = require("./router/dealRouter.js");

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);

// Fix CORS issue
app.use(cors({
    origin: ["https://virtual-room-deal-frontend.vercel.app"], // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/deal", dealRouter);

// Fix CORS for Socket.io
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a specific deal room
    socket.on("joinDealRoom", ({ dealId }) => {
        socket.join(dealId);
        console.log(`User joined room: ${dealId}`);
    });

    // User leaves the deal room
    socket.on("leaveDealRoom", ({ dealId }) => {
        socket.leave(dealId);
        console.log(`User left room: ${dealId}`);
    });

    // Handling price negotiation (propose price)
    socket.on("proposePrice", async ({ dealId, newPrice, userId }) => {
        console.log(`Received proposePrice event:`, { dealId, newPrice, userId });

        try {
            const deal = await Deal.findById(dealId);
            if (!deal) {
                console.log("Deal not found:", dealId);
                socket.emit("error", { message: "Deal not found" });
                return;
            }

            // Update deal price
            deal.price = newPrice;
           

            await deal.save();

            console.log("Price updated successfully:", { dealId, newPrice });

            // Emit only to users in the same deal room
            io.to(dealId).emit("priceUpdated", { dealId, newPrice, userId });

        } catch (error) {
            console.error("Error proposing price:", error);
            socket.emit("error", { message: "Server error" });
        }
    });

    // Accepting a price update
    socket.on("acceptPrice", async ({ dealId, newPrice }) => {
        try {
            const deal = await Deal.findById(dealId);
            if (!deal) {
                socket.emit("error", { message: "Deal not found" });
                return;
            }
            console.log("sdas************",dealId,newPrice)
    
            deal.status ="In Progress";
            deal.price = newPrice;
            await deal.save();
    
            // Notify all users in the deal room about the accepted price
            io.to(dealId).emit("dealAccepted", { dealId, newPrice });
    
        } catch (error) {
            console.error("Error accepting price:", error);
            socket.emit("error", { message: "Server error" });
        }
    });
    

    // Rejecting a price update
    socket.on("rejectPrice", async ({ dealId }) => {
        try {
            const deal = await Deal.findById(dealId);
            if (!deal) {
                socket.emit("error", { message: "Deal not found" });
                return;
            }

            deal.status = "Cancelled";
            await deal.save();

            io.to(dealId).emit("dealRejected", { dealId });

        } catch (error) {
            console.error("Error rejecting price:", error);
            socket.emit("error", { message: "Server error" });
        }
    });
   
   



    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
