import Admin from "../models/adminmodel.js";

// REGISTER ADMIN
export const registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      storeName,
      username,
      email,
      phone,
      password,
      confirmPassword,
      storeAddress,
    } = req.body;

    // Basic validation
    if (!fullName || !storeName || !username || !password || !confirmPassword || !storeAddress) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check for duplicate username
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Save new admin (without confirmPassword)
    const newAdmin = new Admin({
      fullName,
      storeName,
      username,
      email,
      phone,
      password,
      storeAddress,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Error registering admin", error });
  }
};

// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        storeName: admin.storeName,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        storeAddress: admin.storeAddress,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
};
