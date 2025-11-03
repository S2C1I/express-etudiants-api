import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

// Auto-increment id before saving
userSchema.pre("save", async function (next) {
  if (!this.id) {
    const lastUser = await mongoose.model("User").findOne().sort({ id: -1 });
    this.id = lastUser ? lastUser.id + 1 : 1;
  }
  next();
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
