import Customer from "../models/customer-model.js";

// Register new customer
export const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & password required" });

  try {
    // Check if email is already registered
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ message: "Email already registered" });

    // Save customer with plain password
    const newCustomer = new Customer({ name, email, password });
    await newCustomer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login customer
export const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email & password required" });

  try {
    const customer = await Customer.findOne({ email });

    if (!customer || !customer.password)
      return res.status(400).json({ message: "Invalid credentials" });

    // Compare plain-text password
    if (customer.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
