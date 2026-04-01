// server.js
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");

// 🔥 NEW (Socket.IO setup)
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend files
app.use(express.json());
app.use(express.static("public"));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

// Models
const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    role: String  
});

const Ride = mongoose.model("Ride", {
    pickup: String,
    drop: String,
    fare: Number,
    status: {
        type: String,
        default: "pending"
    }
});

// 🔥 Socket connection
io.on("connection", (socket) => {
    console.log("User connected ⚡");
});

// APIs
app.get("/rides", async (req, res) => {
    const rides = await Ride.find();
    res.json(rides);
});

app.get("/", (req, res) => {
    res.send("Server is working 🚀");
});

app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.send("Registered Successfully");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (!user) {
        return res.json({ status: "error" });
    }

    res.json({
        status: "success",
        role: user.role
    });
});

// 🔥 REAL-TIME RIDE CREATE
app.post("/ride", async (req, res) => {
    const { pickup, drop, fare } = req.body;
    const ride = new Ride({ pickup, drop, fare });
    await ride.save();

    console.log("Ride Saved:", ride);

    // 🔥 SEND TO ALL DRIVERS
    io.emit("newRide", ride);

    res.send("Ride Booked 🚗");
});

// Delete
app.delete("/ride/:id", async (req, res) => {
    await Ride.findByIdAndDelete(req.params.id);
    res.send("Ride Deleted ❌");
});

// 🔥 REAL-TIME ACCEPT
app.put("/ride/:id", async (req, res) => {
    const updatedRide = await Ride.findByIdAndUpdate(
        req.params.id,
        { status: "accepted" },
        { new: true }
    );

    // 🔥 UPDATE ALL CLIENTS
    io.emit("rideUpdated", updatedRide);

    res.send("Ride Accepted 🚗");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});