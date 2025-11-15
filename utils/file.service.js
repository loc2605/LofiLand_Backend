// utils/uploadFile.js
import dotenv from "dotenv";
import { awsConfig } from "../config/aws.js";

dotenv.config();

const randomString = (num) => Math.random().toString(36).substring(2, num + 2);

const FILE_TYPE_MATCH = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "image/webp",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];

export const uploadFile = async (file) => {
  if (!file) throw new Error("No file provided");

  const filePath = `${randomString(4)}-${Date.now()}-${file.originalname}`;

  if (!FILE_TYPE_MATCH.includes(file.mimetype)) {
    throw new Error(`${file.originalname} has invalid file type`);
  }

  const uploadParams = {
    Bucket: process.env.BUCKET_NAME,
    Key: filePath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await awsConfig.s3.upload(uploadParams).promise();
    console.log(`File uploaded successfully: ${data.Location}`);
    return data.Location; // Trả về URL
  } catch (error) {
    console.error("Error uploading file to AWS S3:", error);
    throw new Error("Upload file to AWS S3 failed");
  }
};
