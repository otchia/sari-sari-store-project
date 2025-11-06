import Customer from "../models/customer-model.js";

export const googleLogin = async (req, res) => {
  try {
    const { name, email, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ email });

    // If not, create a new one
    if (!customer) {
      customer = new Customer({
        name,
        email,
        photoUrl,
      });
      await customer.save();
    }

    return res.status(200).json({
      message: "Customer login successful",
      customer,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
