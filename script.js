/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");


// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

/* Handle form submit */

// Function to add a message to the chat window

// Function to add a message to the chat window, with basic bullet formatting for AI responses
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;

  // If the sender is AI and the message contains multiple lines that look like bullets, format as a list
  if (sender === "ai" && /\n[-*•]/.test(text)) {
    // Split into lines
    const lines = text.split(/\n/);
    let html = "";
    let inList = false;
    lines.forEach(line => {
      if (/^\s*[-*•]/.test(line)) {
        if (!inList) {
          html += "<ul style='margin: 8px 0 0 18px; padding: 0;'>";
          inList = true;
        }
        html += `<li>${line.replace(/^\s*[-*•]\s*/, "")}</li>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<div>${line}</div>`;
      }
    });
    if (inList) html += "</ul>";
    msgDiv.innerHTML = html;
  } else {
    msgDiv.textContent = text;
  }
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Store the conversation history as an array of message objects
const conversationHistory = [
  {
    role: "system",
    content:
      "You are a helpful and knowledgeable assistant for L’Oréal. Only answer questions related to L’Oréal products, beauty routines, skincare, haircare, makeup, and product recommendations. Politely decline to answer any questions that are not relevant to L’Oréal’s offerings or beauty-related topics. Keep responses clear, concise, and aligned with L’Oréal’s brand voice: professional, inclusive, and beauty-focused. Your responses should be friendly as if you are a representative of the company."
  }
];

// Async function to get a response from OpenAI
async function getOpenAIResponse(userMessage) {
  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", content: userMessage });

  // Show a loading message
  addMessage("Thinking...", "ai");

  // Prepare the API request
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = window.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY"; // Replace with your key or use secrets.js

  const data = {
    model: "gpt-4o",
    messages: conversationHistory, // Send the full conversation history
    max_tokens: 200
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(data)
    });

    // Remove the loading message
    const loadingMsg = chatWindow.querySelector('.msg.ai:last-child');
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }

    if (!response.ok) {
      addMessage("Sorry, there was a problem connecting to the AI.", "ai");
      return;
    }

    const result = await response.json();
    const aiText =
      result.choices && result.choices[0] && result.choices[0].message.content
        ? result.choices[0].message.content.trim()
        : "Sorry, I didn't understand that.";

    // Add the AI's response to the conversation history
    conversationHistory.push({ role: "assistant", content: aiText });

    addMessage(aiText, "ai");
  } catch (error) {
    // Remove the loading message if error
    const loadingMsg = chatWindow.querySelector('.msg.ai:last-child');
    if (loadingMsg && loadingMsg.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMsg);
    }
    addMessage("Sorry, there was an error. Please try again.", "ai");
  }
}

// Show the latest user question above the chat window
function showLatestQuestion(question) {
  const latestQuestionDiv = document.getElementById("latestQuestion");
  latestQuestionDiv.textContent = question ? `You asked: ${question}` : "";
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  addMessage(message, "user");
  userInput.value = "";

  // Show the latest question above the chat window
  showLatestQuestion(message);

  // Get AI response
  await getOpenAIResponse(message);
});
