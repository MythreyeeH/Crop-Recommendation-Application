// personalize-gemini.js

// This function will prepare the request to the Gemini API.
// It's a conceptual example and may need adjustments based on your specific API library.

/**
 * Creates a personalized request for the Gemini API.
 * @param {string} userMessage - The message from the user.
 * @param {object} personalizationData - An object containing data for personalization.
 * @param {string} personalizationData.username - The name of the user.
 * @param {string} personalizationData.context - Additional context or a user's preference.
 * @returns {object} The structured request body for the Gemini API.
 */
export const personalizeGeminiRequest = (userMessage, personalizationData) => {
  const { username, context } = personalizationData;

  // The 'system instructions' are a powerful way to guide the model's behavior.
  // This is where you'll inject your personalization logic.
  const systemInstructions = `
    If the user requests to speak in a language then please continue speaking with user in requested language. 
    The application is intentded to recommend crops to farmers ,so the end users are farmers please keep that in mind.
    Additionally, do not deviate from the conversation at hand. 
    Offer assistance whenever required and if you are not capable of providing assistance in that field then graciously say so.
    Always ensure you are respectful to the user.
    You are an agriculture assistant chatbot.

  `;

  // The 'contents' array is where you'll put the conversation history.
  // We'll add the system instructions as the first 'part' to set the stage.
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: systemInstructions + '\n\n' + userMessage,
        },
      ],
    },
  ];

  // This is the complete request body you'll send to the Gemini API.
  return {
    contents,
  };
};