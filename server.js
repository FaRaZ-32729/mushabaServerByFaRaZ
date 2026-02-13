const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const centralRoutes = require("./src/routes/centralRoutes");
const dbConfig = require("./src/config/dbConfig");

dbConfig();
const app = express();
const PORT = process.env.PORT || 5054;
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());


//routes
app.use("/api", centralRoutes);

app.get("/", (req, res) => { res.send("Hellow FaRaZ to MUSHABA Server") })


app.listen(PORT, () => {
    console.log(`Mushaba Server is running on port : ${PORT}`);
});