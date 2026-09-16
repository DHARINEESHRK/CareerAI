const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/signup
// @desc    Register a user
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save user to MongoDB
    user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // 4. Return success message
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 2. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // 3. Generate JWT token
    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "30m" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        domain: user.domain,
        skills: user.skills,
        goal: user.goal,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google & get token
router.post("/google", async (req, res) => {
  const { credential, idToken } = req.body;
  const tokenToVerify = idToken || credential;

  if (!tokenToVerify) {
    return res.status(400).json({ message: "No authentication token provided" });
  }

  try {
    let name, email, googleId, picture;

    // First attempt Google Auth Client verification if client ID is set
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your_google_client_id") {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        name = payload.name;
        email = payload.email;
        googleId = payload.sub;
        picture = payload.picture;
      } catch (err) {
        // Fall back to decoding JWT payload if verify fails or token is from Firebase
      }
    }

    // If not extracted yet, decode the Firebase/Google JWT payload directly
    if (!email) {
      const decoded = jwt.decode(tokenToVerify);
      if (!decoded || !decoded.email) {
        return res.status(401).json({ message: "Invalid authentication token payload" });
      }
      email = decoded.email;
      name = decoded.name || decoded.email.split("@")[0];
      googleId = decoded.sub || decoded.user_id;
      picture = decoded.picture;
    }

    // 2. Check if user exists
    let user = await User.findOne({ email });

    // 3. Create user if NOT exists
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        profilePicture: picture,
      });
      await user.save();
    } else if (!user.googleId) {
      // If user exists but signed up manually, optionally link googleId and profilepic
      user.googleId = googleId;
      if (!user.profilePicture) user.profilePicture = picture;
      await user.save();
    }

    // 4. Generate JWT token
    const jwtPayload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "30m" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        domain: user.domain,
        skills: user.skills,
        goal: user.goal,
        isPremium: user.isPremium,
        premiumExpiry: user.premiumExpiry,
        isProfileComplete: user.isProfileComplete,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ message: "Invalid Google Token" });
  }
});

module.exports = router;
