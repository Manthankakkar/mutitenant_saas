
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createSuperAdmin() {
  await mongoose.connect("mongodb+srv://manthankakkar:EQur8yHhEjShyf1Q@mongo.onj4ftl.mongodb.net/multitenant_saas?retryWrites=true&w=majority&appName=mongo");

  const passwordHash = await bcrypt.hash("Manthan@123", 10);

  const superAdmin = new User({
    name: "Mark Wood",
    email: "markwood@gmail.com",
    password: passwordHash,
    role: "superadmin",
  });

  await superAdmin.save();
  console.log("Super Admin created!");
  process.exit();
}

createSuperAdmin();
