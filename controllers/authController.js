import User from "../models/User.js";
import ContractorProfile from "../models/ContractorProfile.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    if (!["customer", "contractor"].includes(role)) {
      return res.status(400).json({ message: "Invalid user role" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    });
    await user.save();

    // If contractor, create empty ContractorProfile
    if (role === "contractor") {
      const contractorProfile = new ContractorProfile({ userId: user._id });
      await contractorProfile.save();
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });

  res.status(200).json({ message: "Logout successful" });
};
