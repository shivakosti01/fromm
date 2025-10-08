// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const { Resend } = require("resend");

const app = express();

// --- Setup view engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Middleware ---
app.use(bodyParser.urlencoded({ extended: true }));

// --- Connect to MongoDB Atlas ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Mongoose Model ---
const Order = mongoose.model("Order", {
  name: String,
  email: String,
  product: String,
  quantity: Number
});

// --- Initialize Resend ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- Render the form ---
app.get("/", (req, res) => {
  res.render("order");
});

// --- Handle form submission ---
app.post("/submit-order", async (req, res) => {
  try {
    // Save order data to MongoDB
    const newOrder = new Order(req.body);
    await newOrder.save();

    // Send confirmation email via Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // keep this for testing
      to: "shivakoshti121@gmail.com",     // ← replace with your own email for testing
      subject: "✅ New Order Received",
      html: `
        <h2>New Order Details</h2>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Product:</strong> ${req.body.product}</p>
        <p><strong>Quantity:</strong> ${req.body.quantity}</p>
        <p>✅ Saved in MongoDB and email sent successfully!</p>
      `
    });

    res.send("✅ Order saved and email sent successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).send("Something went wrong while saving order or sending email.");
  }
});

// --- Start the server ---
app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
});
