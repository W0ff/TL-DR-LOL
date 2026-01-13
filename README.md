<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy the TL;DR LoL app

This applcation is intended for informational and illustrative purposes and does not constitute legal advice. 

This is a prototype hacked together on a weekend with Google AI studio, it is not a production-grade application. At its core the TL;DR relies on probilistic generative AI to perform analysis, which by definition means that it will contain inaccuracies and irregularities. It is not a substitute for human judgment or the advice of qualified legal counsel. Use at your own discretion.

If you want try out the application contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1M-tBK-S4Yolw99Z-rN4JKR-kIL9pNASC

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
