# PAI

## Welcome to your personal ai.

Live: https://pai-psi.vercel.app/

The live chatbot link might not always give results because of expired Open AI credit. Kindly view the demo video to preview the application

## Information

PAI, built with Next.js, Convex and AI SDK is a simple chatbot utilizing LLM and RAG to get information about the user created notes. It uses OPEN AI Vector embedding model to create vector embeddings ConvexDB to store them.

The LLM model used is GPT-4.1-nano. By utilizing RAG, the model is capable of answering questions and providing updates to the user created notes. Whenever user edits a new note, new embeddings are automatically created and user can ask the assistant about the latest information.

## Frontend Instructions

1. Run npm install
2. Run npx convex dev and in another terminal npm run dev.
3. remember to put proper env variables in the convex dashboard (OPENAI_API_KEY, SITE_URL) and in your .env file (NEXT_PUBLIC_CONVEX_URL)
4. Enjoy !!!

## Application Features

1. Create unlimited notes

2. Update your notes with the latest information or delete them

3. Ask anything about your notes to the assistant. The chatbot will also include the link to the relevant note to its answer.

## Demo

https://github.com/user-attachments/assets/3be42286-f54f-4133-847d-50f2244737c8

## Sample Screenshots

| <img src="https://github.com/user-attachments/assets/4b8a7f6f-1702-4755-ba0a-7acc172c2e33" width=100% height=100%> |
| :----------------------------------------------------------------------------------------------------------------: |
|                                                   _NOTE SCREEN_                                                    |
