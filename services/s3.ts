import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import RNFS from "react-native-fs";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

const REGION = process.env.EXPO_PUBLIC_AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.EXPO_PUBLIC_AWS_BUCKET_NAME || "";
const ACCESS_KEY_ID = process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY || "";

// Initialize S3 Client
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});

/**
 * Uploads an audio file to S3 and returns the public URL.
 * @param fileUri The local URI of the file to upload.
 * @returns The public URL of the uploaded file.
 */
export const uploadAudioToS3 = async (fileUri: string): Promise<string | null> => {
    if (!BUCKET_NAME || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
        console.error("S3 Config missing. Please check .env file.");
        return null;
    }

    try {
        const filename = `recording_${Date.now()}.mp4`; // Or .wav if you convert it
        const key = `audio/${filename}`;

        // Read file as base64
        const fileContent = await RNFS.readFile(fileUri, "base64");
        const buffer = Buffer.from(fileContent, "base64");

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: "audio/mp4", // Adjust if you change format
            // ACL: "public-read", // Optional: If bucket is public, this might be needed or configured via bucket policy
        });

        await s3Client.send(command);

        // Construct Public URL (Assuming standard S3 public access)
        // Format: https://BUCKET_NAME.s3.REGION.amazonaws.com/KEY
        const publicUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
        console.log("Upload success:", publicUrl);
        return publicUrl;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        return null;
    }
};
