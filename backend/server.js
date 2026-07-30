require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARES (Security, Logging, Parsing)
// ==========================================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ==========================================
// 2. AI PROVIDER ABSTRACTIONS
// ==========================================

class AIProvider {
    /**
     * @param {Array<{role: string, content: string}>} messages 
     * @param {string} systemPrompt 
     */
    async generate(messages, systemPrompt, model) {
        throw new Error("Method not implemented.");
    }
}

// --- Gemini Provider ---
class GeminiProvider extends AIProvider {
    constructor() {
        super();
        if (process.env.GEMINI_API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }
    }

    async generate(messages, systemPrompt, model) {
        if (!this.ai) throw new Error("GEMINI_API_KEY is not configured in .env file.");

        // Map roles to Gemini's expected format ('user' and 'model')
        const history = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        try {
const geminiModel =
    model && model.startsWith("gemini")
        ? model
        : "gemini-flash-latest";


const response = await this.ai.models.generateContent({
    model: geminiModel,
    contents: history,
    config: {
        systemInstruction: systemPrompt
    }
});
            return response.text;
        } catch (error) {
            console.error("[Gemini API Error]:", error);
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }
}

// --- OpenAI Provider ---
class OpenAIProvider extends AIProvider {
    constructor() {
        super();

        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                baseURL: "https://openrouter.ai/api/v1"
            });
        }
    }

    async generate(messages, systemPrompt, model) {
        if (!this.openai) throw new Error("OPENAI_API_KEY is not configured in .env file.");

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];

  const selectedModel =
    model && model.includes("/")
        ? model
        : "openai/gpt-4o-mini";

        try {
            const response = await this.openai.chat.completions.create({
                model: selectedModel,
                messages: apiMessages,
                extraHeaders: {
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "AI Chat Project"
                }
            });



if (!response.choices || response.choices.length === 0) {
    throw new Error(JSON.stringify(response));
}

return response.choices[0].message.content;
        } catch (error) {
            console.error(
    "[OpenAI API Error]:",
    error.response?.data || error.message
);
            throw new Error(`OpenAI API Error: ${error.message}`);
        }
    }
}

// --- Pollinations Provider ---
class PollinationsProvider extends AIProvider {
    async generate(messages, systemPrompt, model) {
        // Pollinations supports OpenAI format payload natively via text.pollinations.ai
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        ];

        try {
            
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
   headers: {
    'Content-Type': 'application/json',
    ...(process.env.POLLINATIONS_API_KEY && { 
        'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}` 
    })
},
               body: JSON.stringify({
    messages: apiMessages,
    model: model || 'openai'
})
            });

         if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
        `Pollinations ${response.status}: ${errorText}`
    );
}

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("[Pollinations API Error]:", error);
            throw new Error(`Pollinations API Error: ${error.message}`);
        }
    }
}
// ==========================================
// 3. FACTORY / RESOLVER
// ==========================================

class AIProviderFactory {
    static getProvider(providerName) {

        switch (providerName?.toLowerCase()) {

            case 'gemini':
                return new GeminiProvider();

            case 'openai':
                return new OpenAIProvider();

            case 'pollinations':
                return new PollinationsProvider();

            // Default provider
            default:
                return new GeminiProvider();
        }
    }
}


// ==========================================
// 4. ROUTES (REST API)
// ==========================================

/**
 * POST /api/chat/ask
 *
 * Body:
 * {
 *   provider: "gemini" | "openai" | "pollinations",
 *   model: "gemini-flash-latest",
 *   systemPrompt: "You are helpful assistant",
 *   messages: [
 *      {
 *        role:"user",
 *        content:"Hello"
 *      }
 *   ]
 * }
 */


app.post('/api/chat/ask', async (req, res, next) => {

    try {

        const {
            provider,
            model,
            systemPrompt,
            messages,
            context,
            constraints,
            outputFormat,
            temperature,
            maxTokens
        } = req.body;


        if (!messages || !Array.isArray(messages)) {

            return res.status(400).json({
                error: "Invalid or missing messages array"
            });

        }


        let responseText;


try {

    const aiProvider =
        AIProviderFactory.getProvider(provider);

    responseText = await aiProvider.generate(
        messages,
        systemPrompt || "You are a helpful assistant.",
        model,
        temperature,
        maxTokens
    );


} catch (error) {

    console.log("Primary provider failed, trying OpenAI...");


    try {

        const openaiProvider =
            new OpenAIProvider();

        responseText =
            await openaiProvider.generate(
                messages,
                systemPrompt || "You are a helpful assistant.",
                model,
                temperature,
                maxTokens
            );


    } catch (openaiError) {

        console.log("OpenAI failed, switching to Gemini...");


        const geminiProvider =
            new GeminiProvider();

        responseText =
            await geminiProvider.generate(
                messages,
                systemPrompt || "You are a helpful assistant.",
                "gemini-flash-latest",
                temperature,
                maxTokens
            );
    }
}



        res.json({
            content: responseText
        });



    } catch (error) {

        next(error);

    }

});

// ==========================================
// 5. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error("[Global Error Caught]:", err.message);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message
    });
});

// ==========================================
// 6. SERVER STARTUP
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    console.log(`✅ Unified AI API ready at POST /api/chat/ask`);
});
