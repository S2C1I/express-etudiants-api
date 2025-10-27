import mongoose from "mongoose";

const etudiantSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    matiere: { type: [String], default: [] },
    image: { type: String, default: "" }, // Legacy field - keep for backward compatibility
    photo: { type: String, default: "" }, // New field for Cloudinary URLs
  },
  { timestamps: true }
);

// Auto-increment id before saving
etudiantSchema.pre("save", async function (next) {
  if (!this.id) {
    const lastEtudiant = await mongoose
      .model("Etudiant")
      .findOne()
      .sort({ id: -1 });
    this.id = lastEtudiant ? lastEtudiant.id + 1 : 1;
  }
  next();
});

const Etudiant = mongoose.model("Etudiant", etudiantSchema);

export default Etudiant;
