import { Platform } from "react-native";

const API_BASE = "https://thefluent.me/api/swagger";
// Using the test API key from the documentation examples.
// In a real app, this should be in an environment variable.
const API_KEY = "20251122033453-fQaj7AdeKhp-55433";

export interface ScoreResult {
    overall_points: number;
    word_result_data?: {
        word: string;
        points: number;
        speed: string;
    }[];
}

export const FluentMeService = {
    async createPost(title: string, content: string, languageId: number = 22): Promise<string | null> {
        try {
            const response = await fetch(`${API_BASE}/post`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": API_KEY,
                },
                body: JSON.stringify({
                    post_title: title,
                    post_content: content,
                    post_language_id: languageId, // 22 is English (US)
                }),
            });

            if (!response.ok) {
                console.error("FluentMe: Failed to create post", await response.text());
                return null;
            }

            const data = await response.json();
            // The API returns a list of posts or the created post. 
            // Based on docs, we need the post_id.
            // Assuming the response structure matches the "postResponseAddPost" example or similar.
            // Let's try to parse it safely.
            if (Array.isArray(data) && data.length > 0) {
                return data[0].post_id;
            } else if (data.post_id) {
                return data.post_id;
            }

            return null;
        } catch (error) {
            console.error("FluentMe: Error creating post", error);
            return null;
        }
    },

    async scoreRecording(postId: string, audioUri: string): Promise<ScoreResult | null> {
        try {
            const formData = new FormData();

            // Append the audio file. 
            // React Native's FormData requires a specific object structure for files.
            const filename = audioUri.split('/').pop() || 'recording.m4a';
            const type = 'audio/m4a'; // Adjust based on actual recording format

            formData.append('user_audio_file', {
                uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
                name: filename,
                type: type,
            } as any);

            const response = await fetch(`${API_BASE}/score/${postId}`, {
                method: "POST",
                headers: {
                    "api-key": API_KEY,
                    // Content-Type is set automatically by FormData
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("FluentMe: Failed to score recording", await response.text());
                return null;
            }

            const data = await response.json();

            // Parse the response based on "scoreResponse" schema
            // It returns a list, we usually want the "overall_result_data" and "word_result_data"

            // Example structure from docs:
            // [ { provided_data: ... }, { overall_result_data: [...] }, { word_result_data: [...] } ]

            let overallPoints = 0;
            let wordResults = [];

            if (Array.isArray(data)) {
                const overallObj = data.find((item) => item.overall_result_data);
                if (overallObj && overallObj.overall_result_data && overallObj.overall_result_data.length > 0) {
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
    }
};
