Scam Detection Web Platform

Team Name: Hardway SQL

Hackathon: InnovHack – GDG Open Innovation


Project Overview:
The Scam Detection Web Platform is an AI-powered solution designed to help users identify phishing and scam websites before they interact with them. With online fraud becoming increasingly sophisticated, our platform provides fast, explainable, and reliable website credibility checks.
Users simply paste a website URL, and our system analyzes it in real time using Google Gemini, powered by carefully engineered scam-detection prompts.


Solution:
- Real-time analysis of pasted URLs
- AI-driven scam detection using Google Gemini
- Evaluation of multiple trust signals
- Clear and explainable trust score
- Highlights red flags and scam indicators so users understand why a site may be risky
Our goal is to empower users with transparency and confidence while browsing the web.


Future Enhancements & Scalability
Enhanced Security:
Implement Google Cloud restrictions to further secure infrastructure and prevent unauthorized access.

User Authentication:
Enable Google Authentication for secure sign-ins and personalized scan history.

Persistent Results:
Store scan histories and analysis results in Firestore, allowing users to revisit previous checks and identify patterns over time.

Smart Insights:
Integrate Google Analytics to monitor usage, track performance, and continuously improve detection accuracy.


Tech Stack
Frontend: HTML, CSS, JavaScript
AI Engine: Google Gemini
Backend: Firebase Cloud Functions
Security & Analytics (Planned): Google Cloud Restrictions, Google Auth, Google Analytics

Project Structure
├── index.html     # Main webpage
├── script.js      # Client-side logic & API calls
├── style.css      # Styling
├── logo.jpg       # Project logo


How It Works
- User pastes a website URL
- URL is securely processed via Firebase Cloud Functions
- Google Gemini analyzes the website using scam-detection prompts
- The system returns an explainable trust score with red flags
- Results can be stored for future reference (Firestore)


Use Case
- Avoid phishing and scam websites
- Verify unfamiliar links before clicking
- Improve online safety for everyday users


Conclusion
This project demonstrates how AI, cloud security, and explainable analysis can work together to create a safer web experience. Hardway SQL aims to make scam detection simple, transparent, and accessible to everyone
