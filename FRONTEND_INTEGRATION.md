# Frontend Integration Guide - Photo Upload

## 📋 Summary of Backend Changes

Your backend now fully supports **file upload to Cloudinary** with these updates:

### ✅ What's Ready

- **Photo field** added to Etudiant model (keeping legacy `image` field for compatibility)
- **File upload endpoints** configured with multer middleware
- **Cloudinary integration** for persistent cloud storage
- **Static file serving** at `/uploads` (though Cloudinary is primary)
- **Real-time Socket.IO events** include photo URLs

---

## 🔧 Backend Configuration Status

### Database Schema

```javascript
{
  id: Number,
  nom: String,
  prenom: String,
  email: String,
  matiere: [String],
  image: String,  // Legacy field - kept for backward compatibility
  photo: String,  // NEW - Primary field for Cloudinary URLs
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

- **POST** `/etudiants` - Create student (supports file upload)
- **PUT** `/etudiants/:id` - Update student (supports file upload)
- **GET** `/etudiants` - List students (includes `photo` field)
- **GET** `/etudiants/:id` - Get single student (includes `photo` field)

### File Upload Specs

- **Field name**: `file` (FormData key)
- **Accepted formats**: JPG, JPEG, PNG, GIF, WebP
- **Max file size**: 5MB
- **Storage**: Cloudinary cloud (persistent)
- **Response**: Photo URL in `photo` field

---

## 🚀 Frontend Implementation

### 1. **Send File with FormData**

When creating or updating a student with a photo:

```typescript
// Angular example
addStudentWithPhoto(studentData: any, photoFile: File) {
  const formData = new FormData();

  // Add text fields
  formData.append('nom', studentData.nom);
  formData.append('prenom', studentData.prenom);
  formData.append('email', studentData.email);
  formData.append('matiere', JSON.stringify(studentData.matiere)); // Array as JSON

  // Add file (key MUST be 'file')
  if (photoFile) {
    formData.append('file', photoFile);
  }

  return this.http.post('https://express-etudiants-api.onrender.com/etudiants', formData);
}

updateStudentWithPhoto(id: number, studentData: any, photoFile?: File) {
  const formData = new FormData();

  formData.append('nom', studentData.nom);
  formData.append('prenom', studentData.prenom);
  formData.append('email', studentData.email);
  formData.append('matiere', JSON.stringify(studentData.matiere));

  // Only add file if user selected a new one
  if (photoFile) {
    formData.append('file', photoFile);
  }

  return this.http.put(`https://express-etudiants-api.onrender.com/etudiants/${id}`, formData);
}
```

### 2. **Display Photos**

The backend returns Cloudinary URLs in the `photo` field:

```html
<!-- Angular template -->
<img
  [src]="student.photo || 'assets/default-avatar.png'"
  [alt]="student.prenom + ' ' + student.nom"
  class="student-avatar"
/>
```

```typescript
// Response example from GET /etudiants
{
  "total": 10,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean@example.com",
      "matiere": ["Math", "Physics"],
      "photo": "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/students/abcd1234.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. **Socket.IO Real-Time Updates**

Listen for events that include photo URLs:

```typescript
// Angular Socket.IO service
this.socket.on("etudiantAdded", (student) => {
  console.log("New student added:", student);
  // student.photo contains Cloudinary URL
  this.students.push(student);
});

this.socket.on("etudiantUpdated", (student) => {
  console.log("Student updated:", student);
  // student.photo may have new URL if photo was changed
  const index = this.students.findIndex((s) => s.id === student.id);
  if (index !== -1) {
    this.students[index] = student;
  }
});

this.socket.on("notification", (notification) => {
  console.log("Notification:", notification);
  // notification.photo contains URL
  this.showToast(notification.message);
});
```

### 4. **File Input Component**

HTML template for file selection:

```html
<form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="nom" placeholder="Nom" required />
  <input type="text" formControlName="prenom" placeholder="Prénom" required />
  <input type="email" formControlName="email" placeholder="Email" required />

  <!-- File input -->
  <div class="photo-upload">
    <label for="photo">Photo de profil</label>
    <input
      type="file"
      id="photo"
      accept="image/*"
      (change)="onFileSelected($event)"
    />

    <!-- Preview -->
    <img
      *ngIf="photoPreview"
      [src]="photoPreview"
      alt="Preview"
      class="photo-preview"
    />
  </div>

  <button type="submit">Enregistrer</button>
</form>
```

TypeScript component:

```typescript
export class StudentFormComponent {
  studentForm: FormGroup;
  selectedFile: File | null = null;
  photoPreview: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Max size: 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      this.selectedFile = file;

      // Show preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.studentForm.valid) {
      const studentData = this.studentForm.value;

      if (this.selectedFile) {
        this.studentService.addStudentWithPhoto(studentData, this.selectedFile)
          .subscribe({
            next: (response) => {
              console.log('Student created:', response);
              this.router.navigate(['/students']);
            },
            error: (error) => {
              console.error('Error creating student:', error);
              alert('Failed to create student');
            }
          });
      } else {
        // Create without photo
        this.studentService.addStudent(studentData).subscribe(...);
      }
    }
  }
}
```

---

## ⚠️ Important Notes

### **Cloudinary Configuration Required**

For photos to persist, Cloudinary credentials must be configured in the backend environment:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Without these credentials:**

- Backend will accept file uploads
- Files are processed in memory
- `photo` field will be `null` in responses
- No errors thrown (graceful degradation)

**Status**: ⚠️ Credentials need to be added to Render by backend admin

### **Migration Script**

If you have existing students with data in the old `image` field, run this migration:

```bash
node migrate-image-to-photo.js
```

This copies all `image` values to the new `photo` field. The `image` field is kept for backward compatibility.

---

## 🎯 Testing Checklist

### Before Cloudinary Setup

- [ ] Create student without photo → Works ✅
- [ ] Create student with photo → `photo` field is `null` ⚠️
- [ ] Update student without photo → Works ✅
- [ ] Update student with photo → `photo` field is `null` ⚠️
- [ ] Get students → Returns data with `photo: null` ✅
- [ ] Socket.IO events → Fire correctly ✅

### After Cloudinary Setup

- [ ] Create student with photo → `photo` has Cloudinary URL ✅
- [ ] Update student with photo → `photo` updates with new URL ✅
- [ ] Display photo in frontend → Image loads from Cloudinary ✅
- [ ] Socket.IO events → Include photo URLs ✅

---

## 🔗 API Reference

**Base URL**: `https://express-etudiants-api.onrender.com`

### Create Student with Photo

```bash
POST /etudiants
Content-Type: multipart/form-data

FormData:
  nom: "Dupont"
  prenom: "Jean"
  email: "jean@example.com"
  matiere: ["Math", "Physics"]  # JSON string
  file: <binary image data>     # Optional

Response:
{
  "id": 1,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "matiere": ["Math", "Physics"],
  "photo": "https://res.cloudinary.com/.../students/abc123.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Update Student with Photo

```bash
PUT /etudiants/:id
Content-Type: multipart/form-data

FormData:
  nom: "Dupont"
  prenom: "Jean"
  email: "jean.dupont@example.com"
  matiere: ["Math", "Physics", "Chemistry"]
  file: <binary image data>  # Optional - only if changing photo

Response: (same as create)
```

### Get Students

```bash
GET /etudiants?page=1&limit=10&search=jean

Response:
{
  "total": 10,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "photo": "https://res.cloudinary.com/.../abc123.jpg",
      ...
    }
  ]
}
```

---

## 📞 Support

- **Backend Repository**: https://github.com/S2C1I/express-etudiants-api.git
- **Live API**: https://express-etudiants-api.onrender.com
- **Health Check**: https://express-etudiants-api.onrender.com/health

For issues with photo uploads, check:

1. Cloudinary credentials configured in backend
2. File size < 5MB
3. File type is image (jpg, png, gif, webp)
4. FormData key is exactly `file`
5. Network tab shows `Content-Type: multipart/form-data`
