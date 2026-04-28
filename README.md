# LofiLand - Backend API

This is the **Backend API** for **LofiLand**, a cross-platform music streaming application.

The backend is built with **Node.js**, uses **MongoDB Atlas** as the database, and integrates **AWS S3** for storing user avatars and media files.

---

## Project Introduction

The **LofiLand Backend API** provides RESTful APIs for the client application built with **React Native + Expo**.

It supports user authentication, music management, playlist features, favorite songs, comments, and file storage for avatars and music-related assets.

---

## Development Team

- **Doan Lan Huong**
- **Phan Huu Loc**

---

## Main Features

### User Management

- **User Registration:** Allow new users to create an account.
- **User Login:** Authenticate users using email and password.
- **JWT Authentication:** Protect private routes with JSON Web Token.
- **Update Profile:** Allow users to update personal information.
- **Avatar Upload:** Upload and store user avatars using AWS S3.
- **Logout Support:** Support safe user sign-out from the client side.

### Music Management

- **Song Management:** Store and manage song information.
- **Music Metadata:** Save song title, artist, genre, duration, cover image, and audio file URL.
- **Music Playback Data:** Provide song data for the mobile application to play music smoothly.
- **Lyrics Support:** Store and return lyrics when available.

### Playlist & Library

- **Create Playlist:** Allow users to create personal playlists.
- **Update Playlist:** Edit playlist name, description, and song list.
- **Delete Playlist:** Remove playlists from the user library.
- **Favorite Songs:** Allow users to add or remove songs from their favorite list.

### Comment System

- **Add Comments:** Allow users to comment on songs or albums.
- **View Comments:** Retrieve comments related to a specific song or album.
- **Delete Comments:** Allow users to remove their own comments.

### File Storage

- **AWS S3 Integration:** Store avatars, song images, and music files.
- **Multer Upload:** Handle file uploads from API requests.
- **Multer-S3 Storage:** Upload files directly to AWS S3.

---

## Technologies Used

| Component | Technology |
| --------- | ---------- |
| **Language** | Node.js ES Modules |
| **Framework** | Express.js |
| **Database** | MongoDB Atlas |
| **ODM** | Mongoose |
| **File Storage** | AWS S3 |
| **Authentication** | JSON Web Token JWT |
| **Environment Variables** | dotenv |
| **File Upload** | Multer + Multer-S3 |

---

## Getting Started

### 1. Installation

Make sure you have **Node.js** and **npm** or **yarn** installed on your machine.

```bash
# Install dependencies
npm install

# or
yarn install
```

---

### 2. Environment Variables

Create a `.env` file in the root directory and configure the required environment variables.

```env
PORT=5000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret_key

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
```

> Do not upload the `.env` file to GitHub.  
> Make sure `.env` is included in your `.gitignore` file.

---

### 3. Start the Server

Run the following command to start the backend server:

```bash
npm start
```

For development mode, you can use:

```bash
npm run dev
```

The server will run at:

```bash
http://localhost:5000
```

---

## Suggested Project Structure

Below is a suggested structure for the LofiLand backend project:

```bash
LofiLand-Backend/
├── config/
│   ├── db.js
│   └── s3.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── songController.js
│   ├── playlistController.js
│   └── commentController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── uploadMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   ├── Song.js
│   ├── Playlist.js
│   └── Comment.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── songRoutes.js
│   ├── playlistRoutes.js
│   └── commentRoutes.js
├── utils/
│   ├── generateToken.js
│   └── responseHandler.js
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

> The structure can be adjusted depending on the actual development requirements of the project.

---

## Authentication

LofiLand uses **JWT Authentication** to protect private routes.

After logging in successfully, the server returns a token. The client should store this token and send it in the request header when accessing protected APIs.

```http
Authorization: Bearer your_jwt_token
```

---

## File Upload

The backend supports file upload using **Multer** and **Multer-S3**.

Uploaded files such as avatars, cover images, and audio files can be stored directly in **AWS S3**.

Supported upload types may include:

- User avatars
- Song cover images
- Audio files
- Playlist images

---

## Future Improvements

In future versions, the backend can be expanded with additional features such as:

- Admin dashboard APIs.
- Role-based access control.
- Music recommendation system.
- Listening history tracking.
- Search filtering by genre, artist, or mood.
- Real-time comments.
- Notification system.
- CloudFront integration for faster media delivery.
- API documentation using Swagger.

---

## Learning Resources

- [Node.js Documentation](https://nodejs.org/en/docs)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://www.mongodb.com/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3)

---

## Thank You for Your Interest in LofiLand

> Turn on your favorite track and relax with us.
