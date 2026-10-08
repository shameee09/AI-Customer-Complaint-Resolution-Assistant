// ==========================================================
// CHAT VARIABLES
// ==========================================================

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const typing = document.getElementById("typing");

// Store conversation
let conversationHistory = [];


// ==========================================================
// ADD MESSAGE TO CHAT
// ==========================================================

function addMessage(message, sender) {

    const messageDiv = document.createElement("div");

    if (sender === "user") {

        messageDiv.className = "message user-message";

        messageDiv.innerHTML = `
            <div class="avatar">
                👤
            </div>

            <div class="message-content">

                <div class="message-name">
                    You
                </div>

                <div class="bubble">
                    ${escapeHTML(message)}
                </div>

            </div>
        `;

    } else {

        messageDiv.className = "message bot-message";

        messageDiv.innerHTML = `
            <div class="avatar">
                🤖
            </div>

            <div class="message-content">

                <div class="message-name">
                    Assistant
                </div>

                <div class="bubble">
                    ${formatAIResponse(message)}
                </div>

            </div>
        `;
    }

    chatBox.appendChild(messageDiv);

    scrollToBottom();
}


// ==========================================================
// SHOW TYPING
// ==========================================================

function showTyping() {

    typing.style.display = "flex";

    scrollToBottom();
}


// ==========================================================
// HIDE TYPING
// ==========================================================

function hideTyping() {

    typing.style.display = "none";
}


// ==========================================================
// SCROLL CHAT
// ==========================================================

function scrollToBottom() {

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ==========================================================
// SEND MESSAGE
// ==========================================================

async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // Disable button
    sendButton.disabled = true;

    // Add customer message
    addMessage(message, "user");

    // Clear input
    messageInput.value = "";

    // Show typing
    showTyping();


    try {

        console.log("Sending message:", message);

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                message: message,

                conversation_history:
                    conversationHistory

            })

        });


        console.log(
            "HTTP status:",
            response.status
        );


        const data = await response.json();


        console.log(
            "Server response:",
            data
        );


        // Hide typing
        hideTyping();


        // --------------------------------------------------
        // ERROR FROM SERVER
        // --------------------------------------------------

        if (!response.ok || !data.success) {

            addMessage(
                data.error ||
                "Sorry, something went wrong. Please try again.",
                "bot"
            );

            return;
        }


        // --------------------------------------------------
        // GET AI RESPONSE
        // --------------------------------------------------

        const aiResponse = data.response;


        if (!aiResponse || !aiResponse.trim()) {

            addMessage(
                "Sorry, I received an empty response. Please try again.",
                "bot"
            );

            return;
        }


        // --------------------------------------------------
        // ADD AI MESSAGE
        // --------------------------------------------------

        addMessage(
            aiResponse,
            "bot"
        );


        // --------------------------------------------------
        // SAVE CONVERSATION
        // --------------------------------------------------

        conversationHistory.push({

            role: "user",

            content: message

        });


        conversationHistory.push({

            role: "assistant",

            content: aiResponse

        });


        console.log(
            "Conversation history:",
            conversationHistory
        );

    }


    catch (error) {

        console.error(
            "Chat error:",
            error
        );

        hideTyping();

        addMessage(
            "Sorry, something went wrong. Please try again.",
            "bot"
        );

    }


    finally {

        sendButton.disabled = false;

        messageInput.focus();

    }
}


// ==========================================================
// ENTER KEY
// ==========================================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


// ==========================================================
// FORMAT AI RESPONSE
// ==========================================================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }

    return escapeHTML(text)
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
}


// ==========================================================
// SECURITY
// ==========================================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================================================
// INITIAL STATE
// ==========================================================

typing.style.display = "none";

messageInput.focus();