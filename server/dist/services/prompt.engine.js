"use strict";
/**
 * Prompt Engineering System
 * Centralized hub for all AI prompt templates used in the study assistant.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUMMARY_TYPE_DEFINITIONS = void 0;
exports.isValidSummaryType = isValidSummaryType;
exports.buildSummaryPrompt = buildSummaryPrompt;
exports.buildMergePrompt = buildMergePrompt;
/** Metadata for all available summary types — used by the frontend dropdown */
exports.SUMMARY_TYPE_DEFINITIONS = [
    {
        id: 'short',
        label: 'Short Summary',
        description: 'A concise 3–5 sentence overview of the main points.',
        icon: '⚡',
    },
    {
        id: 'detailed',
        label: 'Detailed Summary',
        description: 'A comprehensive, multi-paragraph summary with full analysis.',
        icon: '📖',
    },
    {
        id: 'bullet',
        label: 'Bullet Points',
        description: 'All key facts and insights presented as scannable bullet points.',
        icon: '📋',
    },
    {
        id: 'key_concepts',
        label: 'Key Concepts',
        description: 'Core concepts, terms, and ideas extracted and explained.',
        icon: '💡',
    },
];
/** Validate that a given string is a valid SummaryType */
function isValidSummaryType(type) {
    return ['short', 'detailed', 'bullet', 'key_concepts'].includes(type);
}
/** The base system persona used across all summary prompts */
const BASE_SYSTEM_PERSONA = `You are an expert academic study assistant. Your role is to help students understand complex documents by generating clear, accurate, and educationally valuable summaries. Always be precise, use plain language where possible, and maintain the factual integrity of the source material.`;
/**
 * Build a summary prompt for a specific summary type.
 * Returns an array of messages in OpenAI chat format.
 */
function buildSummaryPrompt(type, text, documentTitle = 'the document') {
    switch (type) {
        case 'short':
            return buildShortSummaryPrompt(text, documentTitle);
        case 'detailed':
            return buildDetailedSummaryPrompt(text, documentTitle);
        case 'bullet':
            return buildBulletPointsPrompt(text, documentTitle);
        case 'key_concepts':
            return buildKeyConceptsPrompt(text, documentTitle);
    }
}
/**
 * Build a merge prompt for multi-chunk summarization.
 * Used to synthesize individual chunk summaries into one final summary.
 */
function buildMergePrompt(type, chunkSummaries, documentTitle = 'the document') {
    const combinedSummaries = chunkSummaries
        .map((s, i) => `--- Section ${i + 1} ---\n${s}`)
        .join('\n\n');
    const typeInstructions = {
        short: 'Create a single, cohesive 3–5 sentence executive summary that captures the most important points from all sections.',
        detailed: 'Synthesize all section summaries into one comprehensive, well-structured summary with clear paragraphs and transitions.',
        bullet: 'Consolidate all bullet points, removing duplicates and organizing them logically under relevant sub-headings.',
        key_concepts: 'Merge all key concepts, removing duplicates and organizing them by theme or importance. Present each concept with its definition.',
    };
    return [
        {
            role: 'system',
            content: `${BASE_SYSTEM_PERSONA}\n\nYou are now synthesizing partial summaries of "${documentTitle}" into a final, unified result.`,
        },
        {
            role: 'user',
            content: `The following are summaries of different sections of "${documentTitle}". ${typeInstructions[type]}\n\n${combinedSummaries}`,
        },
    ];
}
// ─── Individual Prompt Builders ──────────────────────────────────────────────
function buildShortSummaryPrompt(text, title) {
    return [
        {
            role: 'system',
            content: `${BASE_SYSTEM_PERSONA}

Generate SHORT summaries: 3–5 sentences maximum. Focus only on the single most important idea, the supporting argument, and the key takeaway. No headers, no bullet points — just clean, flowing prose.`,
        },
        {
            role: 'user',
            content: `Please write a short summary of the following content from "${title}":\n\n${text}`,
        },
    ];
}
function buildDetailedSummaryPrompt(text, title) {
    return [
        {
            role: 'system',
            content: `${BASE_SYSTEM_PERSONA}

Generate DETAILED summaries with the following structure:
1. **Overview** — What is this document about? (1–2 sentences)
2. **Main Content** — Detailed coverage of all major topics, arguments, and findings. Use multiple paragraphs with clear transitions.
3. **Key Arguments & Evidence** — The strongest arguments or evidence presented.
4. **Conclusions & Implications** — What conclusions are drawn? What are the real-world implications?

Use markdown formatting for headers. Be thorough but avoid unnecessary repetition.`,
        },
        {
            role: 'user',
            content: `Please write a detailed, structured summary of the following content from "${title}":\n\n${text}`,
        },
    ];
}
function buildBulletPointsPrompt(text, title) {
    return [
        {
            role: 'system',
            content: `${BASE_SYSTEM_PERSONA}

Generate BULLET POINT summaries following this format:
- Use "**Key Theme:**" sub-headings to organize points into logical groups
- Each bullet point should be one complete, self-contained fact or insight
- Use sub-bullets (indented -) for supporting details
- Start each bullet with an action verb or key noun phrase when possible
- Aim for 10–20 total bullet points depending on document complexity
- Use markdown formatting throughout`,
        },
        {
            role: 'user',
            content: `Please extract and organize all key points from the following content of "${title}" into a structured bullet point summary:\n\n${text}`,
        },
    ];
}
function buildKeyConceptsPrompt(text, title) {
    return [
        {
            role: 'system',
            content: `${BASE_SYSTEM_PERSONA}

Extract KEY CONCEPTS following this exact format for each concept:

### [Concept Name]
**Definition:** Clear, concise definition in 1–2 sentences.
**Context:** How this concept is used or discussed in the document.
**Importance:** Why this concept matters to understanding the material.

Rules:
- Identify 5–12 key concepts depending on document complexity
- Prioritize terms that are central to understanding the document
- Include both domain-specific technical terms and important conceptual ideas
- Do not invent information — only extract what is present in the text
- Use markdown formatting`,
        },
        {
            role: 'user',
            content: `Please identify and explain the key concepts from the following content of "${title}":\n\n${text}`,
        },
    ];
}
