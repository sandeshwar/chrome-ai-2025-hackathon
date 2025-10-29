/**
 * Image Analysis Service
 * Handles image processing and AI-powered image analysis using Chrome's built-in AI APIs
 */

/**
 * Check if image analysis is available
 * @returns {Promise<'readily'|'after-download'|'no'>}
 */
export async function canAnalyzeImage() {
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
 * Create a session for image analysis
 * @returns {Promise<LanguageModelSession>}
 */
export async function createImageAnalysisSession() {
  try {
    const session = await LanguageModel.create();
    return session;
  } catch (e) {
    throw new Error('Failed to create image analysis session');
  }
}

/**
 * Convert image file to base64 string
 * @param {File} file - The image file
 * @returns {Promise<string>} - Base64 encoded image
 */
export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB'
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, GIF, and WebP images are supported'
    };
  }

  return { valid: true };
}

/**
 * Analyze image with AI using Chrome's multimodal Prompt API
 * @param {File} imageFile - The image file to analyze
 * @param {string} userQuery - User's question about the image
 * @param {(phase:'generation_start')=>void} [onProgress]
 * @returns {Promise<string>} - AI analysis result
 */
export async function analyzeImage(imageFile, userQuery = '', onProgress) {
  const validation = validateImageFile(imageFile);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check if Prompt API is available
  if (!('LanguageModel' in self)) {
    throw new Error('AI language model not available');
  }

  const availability = await LanguageModel.availability();
  if (availability === 'no') {
    throw new Error('AI language model not available on this device');
  }

  let session;
  try {
    onProgress?.('generation_start');
    
    // Create session with multimodal capabilities
    session = await LanguageModel.create({
      expectedInputs: [
        { type: "text", languages: ["en"] },
        { type: "image" }
      ],
      expectedOutputs: [
        { type: "text", languages: ["en"] }
      ]
    });
    
    // Build the multimodal prompt
    const queryText = userQuery || 'Describe what you see in this image in detail.';
    
    // Create multimodal content array with text and image
    const multimodalContent = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            value: `You are an AI vision assistant. Please analyze the uploaded image and respond to the user's query.

${queryText}

Provide a comprehensive analysis including:
1. Main objects and elements visible
2. Colors, composition, and visual details
3. Setting or context if identifiable
4. Any text or writing in the image
5. Notable features or points of interest

Format your response using markdown for better readability:
- Use **bold** for emphasis
- Use headers (# ## ###) for organization
- Use bullet points (*) for lists
- Use \`code\` for technical terms`
          },
          { 
            type: 'image', 
            value: imageFile 
          }
        ]
      }
    ];
    
    // Send the multimodal prompt to the AI
    const result = await session.prompt(multimodalContent);
    return result || 'Unable to analyze the image. Please try again.';
    
  } catch (e) {
    throw new Error(`Failed to analyze image: ${e.message || 'Unknown error'}`);
  } finally {
    if (session) {
      try { session.destroy(); } catch {}
    }
  }
}

/**
 * Get suggested image analysis questions
 * @returns {string[]}
 */
export function getImageAnalysisSuggestions() {
  return [
    'What can you tell me about this image?',
    'Describe the main elements in this photo',
    'What is the mood or atmosphere of this image?',
    'Are there any interesting details or patterns?',
    'Can you identify the location or setting?',
    'What text or words are visible in this image?',
    'Describe the colors and composition',
    'What might be the story behind this image?'
  ];
}

/**
 * Generate image metadata
 * @param {File} file - The image file
 * @returns {Promise<{name:string, size:string, type:string, dimensions?:{width:number, height:number}}>}
 */
export async function getImageMetadata(file) {
  const metadata = {
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type
  };

  // Try to get image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    if (dimensions) {
      metadata.dimensions = dimensions;
    }
  } catch (e) {
    // Dimensions not available, continue without them
  }

  return metadata;
}

/**
 * Get image dimensions
 * @param {File} file - The image file
 * @returns {Promise<{width:number, height:number}|null>}
 */
function getImageDimensions(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  });
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
