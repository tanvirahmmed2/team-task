import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Basic mongoose models setup inline for the script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Manager", "Staff"], required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const MONGODB_URI = process.env.MONGO_URI;

async function seedAdmin() {
  if (!MONGODB_URI) {
    console.error("FATAL: Please set MONGO_URI in your environment or .env.local file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas..");

    const adminEmail = "admin@teamtask.com";
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "Admin"
    });

    console.log(`Admin user created!`);
    console.log(`Email: ${adminEmail} | Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin", error);
    process.exit(1);
  }
}

seedAdmin();
