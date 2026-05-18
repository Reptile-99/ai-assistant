const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const { aiProvider } = require('./dist/services/ai.provider');
const { geminiService } = require('./dist/services/gemini.service');
const { openAIService } = require('./dist/services/ai.service');

async function testFallback() {
  console.log('Gemini Available:', geminiService.isAvailable);
  console.log('OpenAI Available:', openAIService.isAvailable);

  // Force geminiService to throw a rate limit error so we can test the fallback
  const originalSummarize = geminiService.summarize.bind(geminiService);
  geminiService.summarize = async () => {
    throw new Error('Gemini rate limit reached — try again shortly');
  };

  try {
    console.log('Testing fallback...');
    const result = await aiProvider.summarize('This is a test document with enough length to be summarized. '.repeat(10), 'short', 'Test Title');
    console.log('Success!', result);
  } catch (err) {
    console.error('Fallback failed with error:', err);
  }
}

testFallback();
