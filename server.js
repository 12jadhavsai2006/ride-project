// server.js
require('dotenv').config(); // ✅ Add this line at the top
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Serve frontend files
app.use(express.json());
app.use(express.static("public"));

// ✅ Connect to MongoDB using .env
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

// ✅ User model
const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String,
    role: String  
});

// ✅ Ride model
const Ride = mongoose.model("Ride", {
    pickup: String,
    drop: String,
    fare: Number,
    status: {
        type: String,
        default: "pending" // pending → accepted
    }
});

// ✅ Get all rides
app.get("/rides", async (req, res) => {
    const rides = await Ride.find();
    res.json(rides);
});

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Server is working 🚀");
});

// ✅ Register API
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.send("Registered Successfully");
});

// ✅ Login API
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

// ✅ Ride booking API
app.post("/ride", async (req, res) => {
    const { pickup, drop, fare } = req.body;
    const ride = new Ride({ pickup, drop, fare });
    await ride.save();
    console.log("Ride Saved:", ride);
    res.send("Ride Booked 🚗");
});

// ✅ Delete Ride
app.delete("/ride/:id", async (req, res) => {
    await Ride.findByIdAndDelete(req.params.id);
    res.send("Ride Deleted ❌");
});

// ✅ Accept Ride
app.put("/ride/:id", async (req, res) => {
    await Ride.findByIdAndUpdate(req.params.id, { status: "accepted" });
    res.send("Ride Accepted 🚗");
});

// ✅ Start server
const PORT = process.env.PORT || 3000; // use PORT from .env for Render
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});