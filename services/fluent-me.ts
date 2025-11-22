
const BASE_URL = "https://thefluent.me/api/swagger";
const API_KEY = "20251122033453-fQaj7AdeKhp-55433";

const USERNAME = "ianclemence";
const PASSWORD = "Cupid4881.";

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

function createBasicAuthHeader(username: string, password: string): string {
    return `Basic ${btoa(`${username}:${password}`)}`;
}

export const FluentMeService = {
    async getToken(): Promise<string | null> {
        if (cachedToken && Date.now() < tokenExpiry - 300000) {
            return cachedToken;
        }

        try {
            const response = await fetch(`${BASE_URL}/login`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "x-api-key": API_KEY,
                    Authorization: createBasicAuthHeader(USERNAME, PASSWORD),
                },
            });

            if (!response.ok) return null;

            const data = await response.json();
            if (data.token) {
                cachedToken = data.token;
                tokenExpiry = Date.now() + 3600000;
                return data.token;
            }
            return null;
        } catch (error) {
            console.error("FluentMe: Login error", error);
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
            if (!token) return null;

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

            if (!response.ok) return null;

            const data = await response.json();
            return data.post_id || null;
        } catch (error) {
            console.error("FluentMe: Create post error", error);
            return null;
        }
    },

    async scoreRecording(
        postId: string,
        audioUri: string
    ): Promise<ScoreResult | null> {
        try {
            const token = await this.getToken();
            if (!token) return null;

            const formData = new FormData();

            // Extract filename
            const filename = audioUri.split("/").pop() || "recording.mp4";

            // Create file object - KEEP file:// prefix as per React Native guide!
            const file = {
                uri: audioUri, // Keep file:// prefix
                type: "audio/mp4",
                name: filename,
            };

            console.log("FluentMe: Uploading audio file:", file);

            formData.append("user_audio_file", file as any);

            const response = await fetch(`${BASE_URL}/score/${postId}`, {
                method: "POST",
                headers: {
                    "x-access-token": token,
                },
                body: formData,
            });


            const data = await response.json();
            console.log("FluentMe: Score success:", JSON.stringify(data, null, 2));

            let overallPoints = 0;
            let wordResults = [];

            if (Array.isArray(data)) {
                const overallObj = data.find((item) => item.overall_result_data);
                if (overallObj?.overall_result_data?.[0]) {
                    overallPoints = overallObj.overall_result_data[0].overall_points;
                }

                const wordObj = data.find((item) => item.word_result_data);
                if (wordObj?.word_result_data) {
                    wordResults = wordObj.word_result_data;
                }
            }

            return {
                overall_points: overallPoints,
                word_result_data: wordResults,
            };
        } catch (error) {
            console.error("FluentMe: Score error", error);
            return null;
        }
    },
};
