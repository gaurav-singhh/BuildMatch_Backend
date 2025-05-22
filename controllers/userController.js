import User from "../models/User.js";

export const updateUserBasicInfo = async (req, res) => {
  try {
    const userId = req.user.userId; // Assumes auth middleware sets req.user
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      message: "User info updated successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user basic info error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
