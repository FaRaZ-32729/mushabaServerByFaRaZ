const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const centralRoutes = require("./src/routes/centralRoutes");
const dbConfig = require("./src/config/dbConfig");

dbConfig();
const app = express();
const PORT = process.env.PORT || 5054;

//default middleware
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'], // Allowed headers
    credentials: true, // Allow cookies/auth headers if needed
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use("/uploads", express.static("uploads"));


//routes
app.use("/api", centralRoutes);
app.get("/", (req, res) => { res.send("Hellow FaRaZ to MUSHABA Server") })

//server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mushaba Server is running on port : ${PORT}`);
});