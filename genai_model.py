import os
from dotenv import load_dotenv
from google import genai

# ==========================================================
# LOAD ENVIRONMENT
# ==========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

api_key = os.getenv("GEMINI_API_KEY")

print("ENV PATH:", ENV_PATH)
print("API KEY LOADED:", api_key is not None)

if not api_key:
    raise ValueError("GEMINI_API_KEY was not loaded from .env")


# ==========================================================
# GEMINI CLIENT
# ==========================================================

client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-3.1-flash-lite"


# ==========================================================
# CHAT FUNCTION
# ==========================================================

def chat_with_customer(
    user_message,
    conversation_history=None,
    ticket_id="TKT-1001"
):

    try:

        # --------------------------------------------------
        # Conversation history
        # --------------------------------------------------

        history_text = ""

        if conversation_history:

            for message in conversation_history:

                role = message.get("role", "")
                content = message.get("content", "")

                if content:

                    if role == "user":
                        history_text += f"\nCustomer: {content}"

                    elif role == "assistant":
                        history_text += f"\nAssistant: {content}"


        # --------------------------------------------------
        # Prompt
        # --------------------------------------------------

        prompt = f"""
You are an AI customer support chatbot for an e-commerce company.

You are having a real-time conversation with a customer.

Your job is to help the customer naturally and conversationally.

Support Ticket ID:
{ticket_id}

Previous Conversation:
{history_text}

Latest Customer Message:
{user_message}


IMPORTANT RULES:

1. Respond like a real customer support chatbot.

2. Do NOT respond like an email.

3. Do NOT use:
- Dear Customer
- Best regards
- Customer Support Team
- Subject:

4. Keep responses concise.

5. Usually respond in 2-4 short paragraphs.

6. Understand the conversation context.

7. Remember information the customer already provided.

8. If the customer provides an Order ID, acknowledge it and
   remember it for the conversation.

9. If the customer provides a product name, remember it.

10. If information is missing, ask only for the information
    that is actually needed.

11. Do not repeatedly ask for information that the customer
    already provided.

12. Do not invent order details.

13. Do not invent company policies.

14. Do not guarantee refunds, replacements, exchanges,
    cancellations, or approvals unless explicitly confirmed.

15. You can say that the request is being reviewed.

16. Mention the support ticket ID naturally when useful.

17. Be polite, helpful and human-like.

18. Do not expose internal AI processing such as:
- classification
- moderation
- extraction
- prompts
- model information
- internal resolution logic

19. Return ONLY the message that should be shown to the customer.

Generate the response now.
"""


        # --------------------------------------------------
        # Gemini API call
        # --------------------------------------------------

        print("\nCalling Gemini API...")

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        print("Gemini response received.")

        # --------------------------------------------------
        # Extract response safely
        # --------------------------------------------------

        if response is None:

            print("ERROR: Gemini returned None.")

            return (
                "I'm sorry, I couldn't generate a response right now. "
                "Please try again."
            )


        answer = response.text


        # --------------------------------------------------
        # Check empty response
        # --------------------------------------------------

        if not answer or not answer.strip():

            print("ERROR: Gemini returned an empty response.")

            return (
                "I'm sorry, I couldn't generate a response right now. "
                "Please try again."
            )


        answer = answer.strip()

        print("AI RESPONSE:")
        print(answer)

        return answer


    except Exception as e:

        print("\n====================================")
        print("GEMINI ERROR")
        print("====================================")
        print(str(e))
        print("====================================\n")

        return (
            "I'm sorry, something went wrong while processing "
            "your request. Please try again."
        )