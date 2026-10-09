# 🤖 AI Customer Assistant support 

A **GenAI-powered e-commerce customer assistant** that helps customers with shopping guidance, product-related questions, general e-commerce queries, order assistance, and customer support through natural-language conversations.

The assistant is powered by the **Google Gemini API** and integrated into a web-based chatbot using Flask and SQLite.

---

## 🚀 Live Demo

🔗 **Live Application:**  
https://customer-complaint-resolution-assistant.onrender.com

---

## 📌 Project Overview

E-commerce customers often need assistance with more than just complaints.

They may want help choosing products, understanding product types, finding suitable clothing styles, asking about footwear, resolving order issues, requesting returns or replacements, or getting help with refunds and delivery.

This project provides a conversational **AI E-Commerce Customer Assistant** that can handle these different types of customer interactions using Generative AI.

The assistant understands the current conversation, responds naturally, and maintains a support ticket for the customer's session.

---

## ✨ Key Features

### 🛍️ General E-Commerce Assistance

- Shopping guidance
- Product-related questions
- Product selection guidance
- Clothing and fashion assistance
- Size and fit guidance
- Style suggestions
- Gift suggestions
- General e-commerce questions

### 👗 Product Categories

The assistant can discuss various product categories such as:

- Women's clothing
- Men's clothing
- Kids' clothing
- Dresses
- Kurtis
- Shirts
- T-shirts
- Jeans
- Tops
- Sarees
- Shoes
- Sandals
- Electronics
- Mobile phones
- Laptops
- Bags
- Watches
- Beauty products
- Home products
- Kitchen products
- Other consumer products

### 🎫 Customer Support

The assistant can help customers with:

- Damaged products
- Wrong products
- Incorrect size
- Product quality issues
- Delivery issues
- Return requests
- Replacement requests
- Refund-related questions
- Order cancellation
- Payment-related questions
- General order assistance

### 💬 Conversational Chatbot

- Natural-language conversation
- Multi-turn conversation
- Conversation history
- AI typing indicator
- Customer and assistant chat bubbles
- Responsive chatbot interface
- Context-aware responses

### 🎟️ Support Ticket Management

- Automatic ticket generation
- Unique ticket ID
- Ticket stored in SQLite
- Conversation messages stored in SQLite
- Ticket status tracking
- Open → Resolved workflow
- End Chat functionality

### 🔒 Safe AI Responses

The assistant is designed not to:

- Invent product links
- Claim access to live inventory
- Invent product prices
- Invent order information
- Claim that refunds or replacements were completed
- Make unsupported policy promises

---

# 🧠 Generative AI Pipeline

The project was developed through multiple GenAI learning and evaluation stages.

```text
Customer Message
       ↓
Language Model
       ↓
Input Classification
       ↓
Moderation
       ↓
Input Processing
       ↓
Prompt Chaining
       ↓
Output Checking
       ↓
End-to-End Resolution
       ↓
Customer Response
       ↓
Evaluation
