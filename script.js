/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value;

  // Add user message to chat window
  chatWindow.innerHTML += `<div class="msg user">${userMessage}</div>`;

  // Prepare messages array
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful and knowledgeable assistant for L’Oréal. Only answer questions about L’Oréal products, skincare and haircare routines, beauty tips, and personalized product recommendations. If a question is not related to these topics, politely refuse to answer and ask the user to ask something about L’Oréal.",
    },
    { role: "user", content: userMessage },
  ];

  // Clear input right after submit
  userInput.value = "";

  // Send request to OpenAI API
  const response = await fetch("https://loreal-worker.steven87.workers.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
    }),
  });

  const data = await response.json();
  const aiMessage = data.choices[0].message.content;

  // Add AI message to chat window
  chatWindow.innerHTML += `<div class="msg ai">${aiMessage}</div>`;
});
