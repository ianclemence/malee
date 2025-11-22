
const BASE_URL = "https://thefluent.me/api/swagger";
const API_KEY = process.env.EXPO_PUBLIC_FLUENT_ME_API_KEY || "";

const USERNAME = process.env.EXPO_PUBLIC_FLUENT_ME_USERNAME || "";
const PASSWORD = process.env.EXPO_PUBLIC_FLUENT_ME_PASSWORD || "";

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

            console.log("FluentMe: Scoring with audio URL:", audioUri);

            const response = await fetch(`${BASE_URL}/score/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
                body: JSON.stringify({
                    audio_provided: audioUri
                }),
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
    async runDiagnostics(): Promise<string> {
        const logs: string[] = [];
        const log = (msg: string) => {
            console.log(`[Diagnostics] ${msg}`);
            logs.push(msg);
        };

        try {
            log("Starting API Diagnostics...");

            // 1. Test Auth
            log("1. Testing Authentication...");
            const token = await this.getToken();
            if (!token) {
                log("❌ Authentication Failed");
                return logs.join("\n");
            }
            log("✅ Authentication Success");

            // 2. Test Get Languages
            log("2. Testing Get Languages...");
            const langResponse = await fetch(`${BASE_URL}/language`, {
                headers: { "x-access-token": token },
            });
            console.log("Language Response Status:", langResponse.status);
            if (langResponse.ok) {
                const langs = await langResponse.json();
                console.log("Languages:", JSON.stringify(langs, null, 2));
                log(`✅ Get Languages Success (Found ${langs.supported_languages?.length || 0} languages)`);
            } else {
                const errorText = await langResponse.text();
                console.log("Language Error:", errorText);
                log(`❌ Get Languages Failed: ${langResponse.status}`);
            }

            // 3. Test Create Post
            log("3. Testing Create Post...");
            const testTitle = `Test Post ${Date.now()}`;
            const testContent = "The AI generates a sound file based on the text you provided.";
            const postId = await this.createPost(testTitle, testContent);

            if (!postId) {
                log("❌ Create Post Failed");
                return logs.join("\n");
            }
            log(`✅ Create Post Success (ID: ${postId})`);

            // 4. Test Translate
            log("4. Testing Translate Post...");
            const translateResponse = await fetch(`${BASE_URL}/translate/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
                body: JSON.stringify({
                    target_language_id: "30" // German
                }),
            });
            console.log("Translate Response Status:", translateResponse.status);
            const translateData = await translateResponse.json();
            console.log("Translate Response:", JSON.stringify(translateData, null, 2));

            if (translateResponse.ok) {
                log(`✅ Translate Success (Language: ${translateData.post_language_name})`);
            } else {
                log(`❌ Translate Failed: ${translateResponse.status} - ${translateData.message || 'Unknown error'}`);
            }

            // 5. Test Score with Official Sample
            log("5. Testing Scoring with Official Sample WAV...");
            // Use the official Fluent Me sample file
            const sampleAudioUrl = "https://storage.googleapis.com/thefluentme.appspot.com/audio/test/sample_user_recording_1.wav";

            const scoreResponse = await fetch(`${BASE_URL}/score/${postId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
                body: JSON.stringify({
                    audio_provided: sampleAudioUrl
                }),
            });

            console.log("Score Response Status:", scoreResponse.status);
            const scoreData = await scoreResponse.json();
            console.log("Score Response:", JSON.stringify(scoreData, null, 2));

            if (scoreResponse.ok) {
                // Check if it's a valid score response (has overall_result_data)
                if (Array.isArray(scoreData) && scoreData.find(item => item.overall_result_data)) {
                    const overallObj = scoreData.find((item) => item.overall_result_data);
                    const overallPoints = overallObj?.overall_result_data?.[0]?.overall_points || 0;
                    log(`✅ Scoring Success! Points: ${overallPoints}`);
                } else {
                    log(`❌ Scoring Failed: Invalid response format`);
                }
            } else {
                // It's an error response
                const errorMessage = scoreData.message || 'Unknown error';
                log(`❌ Scoring Failed: ${scoreResponse.status} - ${errorMessage}`);
            }

            log("Diagnostics Complete.");
            return logs.join("\n");

        } catch (error) {
            log(`❌ Diagnostics Error: ${error}`);
            console.error("Diagnostics Error:", error);
            return logs.join("\n");
        }
    },
};
