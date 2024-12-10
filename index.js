const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const userRoute = require("./routes/user");
const jobRoute = require("./routes/job");
const cors = require("cors");
const connectDB = require('./db/db');
dotenv.config();
app.use(cors());
const PORT = process.env.PORT || 6000;
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "try.html"));
});


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/user", userRoute);
app.use("/api/job", jobRoute);



connectDB().then(() => {
    app.listen(PORT, (err) => {
        if (err) {
            console.log(err);
        }
        console.log(`Server is running successfully on port: ${PORT}`);
    });
}).catch((err) => {
    console.error(err);
});

