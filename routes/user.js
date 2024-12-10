const express = require("express");
const router = express.Router();
const User = require("../schema/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


router.post("/register", async (req, res) => {
    const { name, email, password, mobile } = req.body;
    const isEmailRegistered = await User.findOne({email});
    const isMobileResgistered = await User.findOne({mobile});

    if (isEmailRegistered) {
        return res.status(400).json("Email is already registered !!");
    } else if (isMobileResgistered) {
        return res.status(400).json("Mobile is already registered !!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile,
        });

        await user.save();

        res.status(200).json({ message: "User created" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in creating user" });
    }
})


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({message: "Email Id not registered !!"});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password !!" });
    }
    const payload = {
        id: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.status(200).json({ token });
})
module.exports = router;


