require("dotenv").config();
const express = require("express");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api"); // Correctly import Shopify API
const { shopifyApp } = require("@shopify/shopify-app-express"); // Import express app if required for middleware (optional)

// Initialize express
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize the Shopify API context
const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES ? process.env.SCOPES.split(",") : [], // Split scopes if provided as a string
    hostName: process.env.HOST.replace(/https?:\/\//, ""), // Remove protocol from HOST
    apiVersion: LATEST_API_VERSION, // Use the latest API version
    isEmbeddedApp: false,
});

// Authentication route
app.get("/auth", async (req, res) => {
    const authRoute = await shopify.auth.begin({
        shop: req.query.shop,
        callbackPath: "/auth/callback",
        isOnline: false,
    });
    res.redirect(authRoute);
});

// Callback route for authentication
app.get("/auth/callback", async (req, res) => {
    try {
        const session = await shopify.auth.validateCallback(
            req,
            res,
            req.query,
        ); // Validate callback with query params
        res.send("App installed successfully!");
    } catch (error) {
        console.error("Error during authentication callback:", error);
        res.status(500).send("Error authenticating with Shopify");
    }
});

// Basic route
app.get("/", (req, res) => {
    res.send("Partial Payment App is running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`App is running on http://localhost:${PORT}`);
});
