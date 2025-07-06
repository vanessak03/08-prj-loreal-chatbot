/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");


// Set initial message
chatWindow.innerHTML = `<div class="msg ai">👋 Hello! How can I help you today?</div>`;

/* Handle form submit */

// Function to add a message to the chat window
function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Async function to get a response from OpenAI
async function getOpenAIResponse(userMessage) {
  // Show a loading message
  addMessage("Thinking...", "ai");

  // Prepare the API request
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const apiKey = window.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY"; // Replace with your key or use secrets.js

  const data = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are a helpful assistant for L'Oréal product advice." },
      { role: "user", content: userMessage }
    ],
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
    const aiText = result.choices && result.choices[0] && result.choices[0].message.content
      ? result.choices[0].message.content.trim()
      : "Sorry, I didn't understand that.";
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

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  addMessage(message, "user");
  userInput.value = "";

  // Get AI response
  await getOpenAIResponse(message);
});
