import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are CodeSense AI, an advanced AI-powered code review assistant.
You analyze source code, explain logic line-by-line if needed, detect bugs, identify security vulnerabilities, evaluate code quality, suggest optimizations, and recommend best practices.

Use Retrieval-Augmented Generation (RAG) principles conceptually:
When a user asks for a review or provides code:
1. Act as if you have retrieved relevant documentation, coding standards, language references, and design patterns.
2. Provide an accurate, comprehensive code review.
3. Structure your response clearly using Markdown headings, bullet points, and code blocks for suggested refactoring.
4. If security vulnerabilities are found, highlight them clearly with severity.
5. Provide time and space complexity if requested or if relevant.
6. Provide class and function level explanations.
`;

app.post('/api/review', async (req, res) => {
  try {
    const { code, type, query } = req.body;

    let prompt = '';
    
    if (type === 'analysis') {
      prompt = `Please provide a comprehensive Code Analysis for the following code.
Include: Explain code logic, Generate summary, Complexity analysis (Time and Space), Function explanation, and Dependency analysis.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    } else if (type === 'review') {
      prompt = `Please provide an AI Code Review for the following code.
Include: Detect bugs, Find syntax issues, Detect logical mistakes, Suggest cleaner code, Improve readability, Refactoring suggestions, and Naming convention improvements.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    } else if (type === 'security') {
      prompt = `Please provide a Security Review for the following code.
Check for and highlight: SQL Injection, Command Injection, Path Traversal, Hardcoded Secrets, Weak Password Storage, Unsafe File Handling, XSS Detection, Insecure API Usage.\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
    } else if (type === 'custom') {
      prompt = `The user has the following code:\n\`\`\`\n${code}\n\`\`\`\n\nUser Question/Request: ${query}\n\nPlease answer their question based on the code provided.`;
    } else {
      prompt = `Analyze this code:\n\`\`\`\n${code}\n\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during analysis.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
