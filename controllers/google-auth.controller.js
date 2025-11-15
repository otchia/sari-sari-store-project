// controllers/google-auth.controller.js
import Customer from "../models/customer-model.js";

// --------------------
// POST /api/customer/google-login
// --------------------
export const googleLogin = async (req, res) => {
  try {
    const { name, email, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      console.log(`googleLogin: User not found: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Return only safe fields
    return res.status(200).json({
      message: "Customer login successful",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        photoUrl: customer.photoUrl || "",
      },
    });
  } catch (err) {
    console.error("googleLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------
// POST /api/customer/google-register
// --------------------
export const googleRegister = async (req, res) => {
  try {
    const { name, email, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let customer = await Customer.findOne({ email });

    if (customer) {
      console.log(`googleRegister: User already exists: ${email}`);
      return res.status(200).json({
        message: "Customer already exists",
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          photoUrl: customer.photoUrl || "",
        },
      });
    }

    // Create Google-only account
    customer = new Customer({
      name,
      email,
      photoUrl: photoUrl || "",
      // password intentionally omitted
    });

    await customer.save();

    return res.status(201).json({
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        photoUrl: customer.photoUrl || "",
      },
    });
  } catch (err) {
    console.error("googleRegister error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
