import { Platform } from "react-native";

const BASE_URL = "https://thefluent.me/api/swagger";
const API_KEY = "20251122033453-fQaj7AdeKhp-55433";

// TODO: Store these securely (e.g., in secure storage)
const USERNAME = "ianclemence";
const PASSWORD = "Cupid4881.";

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export interface ScoreResult {
    overall_points: number;
    word_result_data?: {
        word: string;
        points: number;
        speed: string;
    }[];
}

// Helper to create Basic Auth header
function createBasicAuthHeader(username: string, password: string): string {
    const credentials = `${username}:${password}`;
    const encoded = btoa(credentials);
    return `Basic ${encoded}`;
}

export const FluentMeService = {
    async getToken(): Promise<string | null> {
        // Return cached token if still valid (with 5 min buffer)
        if (cachedToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
            console.log("FluentMe: Using cached token");
            return cachedToken;
        }

        try {
            console.log("FluentMe: Requesting new token...");
            const response = await fetch(`${BASE_URL}/login`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "x-api-key": API_KEY,
                    Authorization: createBasicAuthHeader(USERNAME, PASSWORD),
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("FluentMe: Failed to login", errorText);
                return null;
            }

            const data = await response.json();
            console.log("FluentMe: Login successful, token received");

            if (data.token) {
                cachedToken = data.token;
                // Token valid for 1 hour per docs
                tokenExpiry = Date.now() + 60 * 60 * 1000;
                return data.token;
            }

            return null;
        } catch (error) {
            console.error("FluentMe: Error during login", error);
            return null;
        }
    },

    async createPost(
        title: string,
        content: string,
        languageId: number = 22
    ): Promise<string | null> {
        try {
            const token = await this.getToken();
            if (!token) {
                console.error("FluentMe: No valid token available");
                return null;
            }

            console.log("FluentMe: Creating post with:", {
                title,
                content: content.substring(0, 50),
                languageId: String(languageId),
            });

            const response = await fetch(`${BASE_URL}/post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
                body: JSON.stringify({
                    post_language_id: String(languageId),
                    post_title: title,
                    post_content: content,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("FluentMe: Failed to create post", errorText);
                return null;
            }

            const data = await response.json();
            console.log("FluentMe: Create post response:", data);

            if (data.post_id) {
                return data.post_id;
            }

            return null;
        } catch (error) {
            console.error("FluentMe: Error creating post", error);
            return null;
        }
    },

    async scoreRecording(
        postId: string,
        audioUri: string
    ): Promise<ScoreResult | null> {
        try {
            const token = await this.getToken();
            if (!token) {
                console.error("FluentMe: No valid token available");
                return null;
            }

            const formData = new FormData();

            const filename = audioUri.split("/").pop() || "recording.mp4";
            const type = "audio/mp4";

            formData.append("user_audio_file", {
                uri:
                    Platform.OS === "android"
                        ? audioUri
                        : audioUri.replace("file://", ""),
                name: filename,
                type: type,
            } as any);

            const response = await fetch(`${BASE_URL}/score/${postId}`, {
                method: "POST",
                headers: {
                    "x-access-token": token,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("FluentMe: Failed to score recording", errorText);
                return null;
            }

            const data = await response.json();
            console.log("FluentMe: Score response:", data);

            let overallPoints = 0;
            let wordResults = [];

            if (Array.isArray(data)) {
                const overallObj = data.find((item) => item.overall_result_data);
                if (
                    overallObj &&
                    overallObj.overall_result_data &&
                    overallObj.overall_result_data.length > 0
                ) {
                    overallPoints = overallObj.overall_result_data[0].overall_points;
                }

                const wordObj = data.find((item) => item.word_result_data);
                if (wordObj && wordObj.word_result_data) {
                    wordResults = wordObj.word_result_data;
                }
            }

            return {
                overall_points: overallPoints,
                word_result_data: wordResults,
            };
        } catch (error) {
            console.error("FluentMe: Error scoring recording", error);
            return null;
        }
    },
};
