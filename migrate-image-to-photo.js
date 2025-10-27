// Migration script to move data from 'image' field to 'photo' field
import { DBConnect } from "./Model/DBConnect.js";
import Etudiant from "./Model/Etudiant.js";

async function migrateImageToPhoto() {
  try {
    // Use production MongoDB Atlas URI
    process.env.MONGODB_URI =
      process.env.MONGODB_URI ||
      "mongodb+srv://DB_Atlas_Amine:ju1vfR8vGrvTDpsI@shared.b9ukfiz.mongodb.net/etudiants?retryWrites=true&w=majority&appName=Shared";

    // Connect to database
    await DBConnect();
    console.log("Connected to database");

    // Find all students with image field populated but photo field empty or missing
    const studentsWithImage = await Etudiant.find({
      image: { $ne: "" },
      $or: [{ photo: "" }, { photo: { $exists: false } }, { photo: null }],
    });

    console.log(`Found ${studentsWithImage.length} students to migrate`);

    if (studentsWithImage.length === 0) {
      console.log(
        "No migration needed. All students already have photo field or no images."
      );
      process.exit(0);
    }

    // Update each student
    let updated = 0;
    for (const student of studentsWithImage) {
      await Etudiant.updateOne(
        { _id: student._id },
        { $set: { photo: student.image } }
      );
      updated++;
      console.log(
        `Migrated: ${student.nom} ${student.prenom} - ${student.image}`
      );
    }

    console.log(`\nMigration complete! Updated ${updated} students.`);
    console.log(
      'The "image" field is kept for backward compatibility but "photo" is now the primary field.'
    );

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImageToPhoto();
