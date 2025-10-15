import { extractPageText } from '../utils/textUtils.js';

/**
 * Chat service using Chrome's LanguageModel API for conversational AI
 */

/**
 * Check if chat is available
 * @returns {Promise<'readily'|'after-download'|'no'>}
 */
export async function canChat() {
  try {
    if (!('LanguageModel' in self)) {
      return 'no';
    }
    const status = await LanguageModel.availability();
    return status;
  } catch (e) {
    return 'no';
  }
}

/**
 * Create a chat session
 * @returns {Promise<LanguageModelSession>}
 */
export async function createChatSession() {
  try {
    const session = await LanguageModel.create();
    return session;
  } catch (e) {
    throw new Error('Failed to create chat session');
  }
}

/**
 * Send a message to the AI and get a response
 * @param {Document} documentRef
 * @param {string} message
 * @param {Array<{role:string, content:string}>} [history]
 * @param {(phase:'generation_start')=>void} [onProgress]
 * @returns {Promise<string>}
 */
export async function sendChatMessage(documentRef, message, history = [], onProgress) {
  const content = extractPageText(documentRef);
  
  const session = await createChatSession();
  
  try {
    onProgress?.('generation_start');
    
    // Build conversation context
    let conversationContext = '';
    if (history.length > 0) {
      conversationContext = 'Previous conversation:\n';
      history.forEach(msg => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }
    
    // Build the prompt with page context
    const promptText = `${conversationContext}You are a helpful AI assistant. The user is currently viewing a web page with the following content:

Page Content: ${content ? content.slice(0, 3000) : 'No content available'}

User's Question: ${message}

Please provide a helpful, conversational response based on the page content and the user's question. Use markdown formatting for better readability:
- Use **bold** for emphasis
- Use *italic* for subtle emphasis
- Use headers (# ## ###) for organization
- Use bullet points (*) for lists
- Use \`code\` for technical terms
- Use blockquotes (> ) for quotes

Be natural and friendly while formatting your response for clarity.`;

    const result = await session.prompt(promptText);
    return result || '';
  } finally {
    session.destroy();
  }
}

/**
 * Send a message with streaming response
 * @param {Document} documentRef
 * @param {string} message
 * @param {Array<{role:string, content:string}>} [history]
 * @param {(phase:'generation_start')=>void} [onProgress]
 * @param {(chunk:string)=>void} [onChunk]
 * @param {AbortSignal} [signal]
 * @returns {Promise<string>}
 */
export async function sendChatMessageStreaming(documentRef, message, history = [], onProgress, onChunk, signal) {
  const content = extractPageText(documentRef);
  
  const session = await createChatSession();
  
  try {
    onProgress?.('generation_start');
    
    // Build conversation context
    let conversationContext = '';
    if (history.length > 0) {
      conversationContext = 'Previous conversation:\n';
      history.forEach(msg => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }
    
    // Build the prompt with page context
    const promptText = `${conversationContext}You are a helpful AI assistant. The user is currently viewing a web page with the following content:

Page Content: ${content ? content.slice(0, 3000) : 'No content available'}

User's Question: ${message}

Please provide a helpful, conversational response based on the page content and the user's question. Use markdown formatting for better readability:
- Use **bold** for emphasis
- Use *italic* for subtle emphasis
- Use headers (# ## ###) for organization
- Use bullet points (*) for lists
- Use \`code\` for technical terms
- Use blockquotes (> ) for quotes

Be natural and friendly while formatting your response for clarity.`;

    let fullResponse = '';
    const stream = session.promptStreaming(promptText, { signal });
    
    for await (const chunk of stream) {
      fullResponse += chunk;
      onChunk?.(chunk);
    }
    
    return fullResponse;
  } finally {
    session.destroy();
  }
}

/**
 * Get suggested questions based on page content
 * @param {Document} documentRef
 * @param {(phase:'generation_start')=>void} [onProgress]
 * @returns {Promise<string[]>}
 */
export async function getSuggestedQuestions(documentRef, onProgress) {
  const content = extractPageText(documentRef);
  if (!content) {
    return ['What is this page about?', 'Can you explain the main points?', 'What should I take away from this?'];
  }

  const session = await createChatSession();
  
  try {
    onProgress?.('generation_start');
    
    const promptText = `Based on the following page content, suggest 4-5 relevant questions the user might want to ask about this content. Make them specific and helpful. Return as a JSON array of strings.

Content: ${content.slice(0, 2000)}

Example format: ["What is the main topic?", "How does this work?", "What are the key benefits?"]`;

    const result = await session.prompt(promptText);
    
    // Try to parse JSON response
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return Array.isArray(questions) ? questions : ['What is this page about?', 'Can you explain the main points?'];
      }
    } catch (e) {
      // Fallback to default questions
    }
    
    return ['What is this page about?', 'Can you explain the main points?', 'What should I take away from this?'];
  } finally {
    session.destroy();
  }
}
