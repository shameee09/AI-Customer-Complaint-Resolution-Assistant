// ==========================================================
// CHAT VARIABLES
// ==========================================================

const chatBox = document.getElementById("chat-box");

const messageInput =
    document.getElementById("message-input");

const sendButton =
    document.getElementById("send-button");

const typing =
    document.getElementById("typing");

const endChatButton =
    document.getElementById("end-chat-button");

const statusText =
    document.getElementById("status-text");


// Store conversation
let conversationHistory = [];


// Track whether chat is closed
let chatEnded = false;


// ==========================================================
// ADD MESSAGE TO CHAT
// ==========================================================

function addMessage(message, sender) {

    const messageDiv =
        document.createElement("div");


    if (sender === "user") {

        messageDiv.className =
            "message user-message";


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

    }

    else {

        messageDiv.className =
            "message bot-message";


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

    chatBox.scrollTop =
        chatBox.scrollHeight;
}


// ==========================================================
// SEND MESSAGE
// ==========================================================

async function sendMessage() {


    // Do not send after chat is closed
    if (chatEnded) {

        return;
    }


    const message =
        messageInput.value.trim();


    if (!message) {

        return;
    }


    // Disable send button
    sendButton.disabled = true;


    // Add customer message
    addMessage(
        message,
        "user"
    );


    // Clear input
    messageInput.value = "";


    // Show typing
    showTyping();


    try {

        console.log(
            "Sending message:",
            message
        );


        const response =
            await fetch(
                "/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: message,

                        conversation_history:
                            conversationHistory

                    })

                }
            );


        console.log(
            "HTTP status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Server response:",
            data
        );


        // Hide typing
        hideTyping();


        // --------------------------------------------------
        // ERROR FROM SERVER
        // --------------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

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

        const aiResponse =
            data.response;


        if (
            !aiResponse ||
            !aiResponse.trim()
        ) {

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

        // Re-enable send button
        if (!chatEnded) {

            sendButton.disabled = false;

            messageInput.focus();

        }

    }
}


// ==========================================================
// END CHAT
// ==========================================================

async function endChat() {


    // Prevent multiple clicks
    if (chatEnded) {

        return;
    }


    // Confirm before closing
    const confirmed =
        confirm(
            "Are you sure you want to end this chat?"
        );


    if (!confirmed) {

        return;
    }


    // Disable End Chat button
    endChatButton.disabled = true;


    // Disable message input
    sendButton.disabled = true;

    messageInput.disabled = true;


    // Change placeholder
    messageInput.placeholder =
        "Chat has been closed";


    // Hide typing
    hideTyping();


    try {

        console.log(
            "Ending chat..."
        );


        const response =
            await fetch(
                "/api/end-chat",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "End chat response:",
            data
        );


        // --------------------------------------------------
        // ERROR
        // --------------------------------------------------

        if (
            !response.ok ||
            !data.success
        ) {

            alert(

                data.error ||
                "Unable to end the chat."

            );


            // Re-enable chat
            endChatButton.disabled =
                false;

            sendButton.disabled =
                false;

            messageInput.disabled =
                false;

            messageInput.placeholder =
                "Type your message...";

            return;
        }


        // --------------------------------------------------
        // CHAT SUCCESSFULLY ENDED
        // --------------------------------------------------

        chatEnded = true;


        // Update status
        if (statusText) {

            statusText.textContent =
                "Resolved";

        }


        // Change End Chat button
        endChatButton.textContent =
            "Chat Closed ✓";


        // --------------------------------------------------
        // Show final system message
        // --------------------------------------------------

        addMessage(

            `Chat closed ✓

Ticket: ${data.ticket_id}

Status: Resolved

Thank you for contacting Customer Support! 👋`,

            "bot"

        );


        // Keep input disabled
        messageInput.disabled =
            true;

        sendButton.disabled =
            true;


        // Remove focus
        messageInput.blur();


        console.log(
            "Chat closed successfully:",
            data.ticket_id
        );

    }


    catch (error) {

        console.error(
            "End chat error:",
            error
        );


        alert(
            "Unable to end the chat. Please try again."
        );


        // Re-enable chat
        endChatButton.disabled =
            false;

        sendButton.disabled =
            false;

        messageInput.disabled =
            false;

        messageInput.placeholder =
            "Type your message...";

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

        .replace(
            /\n\n/g,
            "<br><br>"
        )

        .replace(
            /\n/g,
            "<br>"
        );

}


// ==========================================================
// SECURITY
// ==========================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ==========================================================
// INITIAL STATE
// ==========================================================

typing.style.display =
    "none";


messageInput.focus();
