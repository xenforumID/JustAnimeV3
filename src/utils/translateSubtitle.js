import axios from "axios";

const GOOGLE_TRANSLATE_API = "/translate_a/single";

async function translateBatch(texts, targetLang = "id") {
    try {
        // Join texts with a delimiter to translate in one go (optimization)
        // Using a rare character as delimiter to split later
        const delimiter = " ||| ";
        const q = texts.join(delimiter);

        // Check length, if too long, we might need to split. 
        // Google gtx limit is roughly 5k chars. For safety, let's say 4000.
        if (q.length > 4000) {
            // Recursive split if too big
            const mid = Math.floor(texts.length / 2);
            const firstHalf = await translateBatch(texts.slice(0, mid), targetLang);
            const secondHalf = await translateBatch(texts.slice(mid), targetLang);
            return [...firstHalf, ...secondHalf];
        }

        const response = await axios.get(GOOGLE_TRANSLATE_API, {
            params: {
                client: "gtx",
                sl: "auto",
                tl: targetLang,
                dt: "t",
                q: q,
            },
        });

        // Response structure for gtx: [[["translated", "original", ...], ...], ...]
        if (response.data && response.data[0]) {
            const translatedText = response.data[0].map((item) => item[0]).join("");
            return translatedText.split(delimiter).map(t => t.trim());
        }
        return texts; // Fallback
    } catch (error) {
        console.error("Translation error:", error);
        return texts;
    }
}

export default async function translateVtt(vttUrl, targetLang = "id") {
    try {
        const proxy = import.meta.env.VITE_PROXY_URL || "";
        const response = await axios.get(proxy + vttUrl);
        const vttContent = response.data;

        // Simple VTT parser
        const lines = vttContent.split(/\r?\n/);
        const cues = [];
        let currentCue = { textLines: [], rawIndices: [] };

        // Identify text lines
        // Strategy: Pass through lines. If it's WEBVTT, NOTE, empty, number, or timestamp, skip/keep as is. 
        // Everything else is text to translate.

        const timeReg = /((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)(?: ?--> ?)((?:[0-9]{2}:)?(?:[0-9]{2}:)?[0-9]{2}(?:.[0-9]{3})?)/;

        const textIndices = [];
        const textLinesToTranslate = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            if (line.startsWith("WEBVTT")) continue;
            if (line.startsWith("NOTE")) continue;
            if (/^\d+$/.test(line)) continue; // Index
            if (timeReg.test(line)) continue; // Timestamp

            // If we are here, it's likely text
            textIndices.push(i);
            textLinesToTranslate.push(lines[i]);
        }

        if (textLinesToTranslate.length === 0) return vttUrl;

        // Translate in batches
        const BATCH_SIZE = 50; // Lines per batch to avoid huge URLs
        let translatedLines = [];

        for (let i = 0; i < textLinesToTranslate.length; i += BATCH_SIZE) {
            const batch = textLinesToTranslate.slice(i, i + BATCH_SIZE);
            const translatedBatch = await translateBatch(batch, targetLang);
            translatedLines = [...translatedLines, ...translatedBatch];
        }

        // Replace lines
        const newLines = [...lines];
        textIndices.forEach((lineIndex, idx) => {
            if (translatedLines[idx]) {
                newLines[lineIndex] = translatedLines[idx];
            }
        });

        // Create Blob
        const newVttContent = newLines.join("\n");
        const blob = new Blob([newVttContent], { type: "text/vtt" });
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Error translating VTT:", error);
        return vttUrl; // Return original if fail
    }
}
