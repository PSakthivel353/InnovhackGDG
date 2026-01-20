const toggle = document.getElementById("themeToggle");
const body = document.body;
const button = document.getElementById("checkBtn");
const textarea = document.getElementById("contentInput");
const resultDiv = document.getElementById("resultDiv");

// YOUR WORKING Gemini API Key
const GEMINI_API_KEY = "Your Gemini API key";


function extractJSON(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in Gemini response");
  }

  return JSON.parse(match[0]);
}

function getDisplayConfidence(verdict, score) {
  if (verdict === "Safe" || verdict === "Likely Safe") {
    return 100 - score;
  }
  return score;
}

// Theme toggle functionality
toggle.addEventListener("change", () => {
  body.className = toggle.checked ? "dark" : "light";
  localStorage.setItem("theme", body.className);
});


// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.className = savedTheme;
  toggle.checked = savedTheme === "dark";
}


// Main scam detection functionality
button.addEventListener("click", async () => {
  const content = textarea.value.trim();
  if (!content) {
    alert("Please paste some content to analyze");
    return;
  }


  button.textContent = "Analyzing...";
  button.disabled = true;
  resultDiv.classList.add("hidden");


  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: ` You are an AI assistant that evaluates websites for scam risk and user safety.

Given:
- Website URL: {{URL}}
- Extracted page text (if any): {{PAGE_TEXT}}

Your tasks:

1. Analyze the website across these dimensions:
   a) Domain & URL Analysis
      - Domain age indicators (new-looking names, random strings, odd/suspicious TLDs, impersonation patterns)
      - URL structure (misleading subdomains, excessive/random parameters, brand spoofing)
      - HTTPS usage (note: HTTPS alone does NOT imply safety)

   b) Content & Language Analysis
      - Presence of urgency, pressure, or fear-based language
      - Requests for sensitive data (OTP, passwords, card details, banking info, ID images, private keys, seed phrases)
      - Grammar, spelling quality, and unnatural or machine-translated phrasing
      - Unrealistic offers, fake guarantees, prizes, or “too good to be true” claims

   c) Brand & Impersonation Checks
      - Claims to represent a known company, bank, government, or service
      - Mismatch between domain name and claimed brand or logo

   d) User Risk Factors
      - Requests for payments, deposits, or crypto transfers
      - Suspicious redirects, popups, or forced downloads
      - Login forms without clear context (e.g., fake banking/UPI/PayTM/Razorpay pages)

   e) Technical & Behavioral Red Flags
      - Obfuscated scripts, shortened/redirecting links
      - No verifiable contact info, fake or generic testimonials
      - Recently created or disposable-looking domain patterns

   f) Overall Trust & Transparency
      - Presence of clear contact details, company info, terms, privacy policy, and social links
      - Clear, coherent business purpose and ownership

2. If page text is empty or missing, rely on:
   - URL structure
   - Domain name patterns
   - Known scam heuristics
   - Reduce confidence and explicitly mention uncertainty.

3. Classification rules:
   Classify the website into exactly ONE category:
   - "Safe"
   - "Likely Safe"
   - "Suspicious"
   - "Likely Scam"
   - "Scam"

4. Scoring guidelines:
   - Provide a confidence_score from 1–100  
     (100 = extremely confident scam, 1 = extremely confident safe)
   - Map to these ranges:
     - 0–20 → Safe
     - 21–40 → Likely Safe
     - 41–60 → Suspicious
     - 61–80 → Likely Scam
     - 81–100 → Scam
   - If multiple strong red flags are present, confidence_score must be ≥70.
   - If information is limited (no content, very few signals), keep confidence moderate and clearly state uncertainty.

5. Critical constraints:
   - Do NOT claim real-world verification (e.g., domain registration date, company registry) unless explicitly provided in the input.
   - Do NOT say “this site is definitely safe”; prefer cautious language.
   - Avoid legal conclusions or definitive accusations.
   - Use a safety-first, conservative approach.

6. Output format:
   Respond in STRICT JSON only, with no extra text before or after, using this exact structure and field names:

   {
     "url": "{{URL}}",
     "final_verdict": "Safe | Likely Safe | Suspicious | Likely Scam | Scam",
     "confidence_score": 0,
     "risk_level": "Low | Medium | High | Critical",
     "summary": "Brief one-paragraph explanation of the decision",
     "reasons": [
       "Reason 1 explained clearly",
       "Reason 2 explained clearly"
     ],
     "red_flags": [
       {
         "flag": "Short title of issue",
         "description": "What was detected and why it matters"
       }
     ],
     "positive_signals": [
       "Legitimate indicator if any, or an empty array if none"
     ],
     "assumptions_or_uncertainties": [
       "Mention missing data or unclear signals if applicable"
     ],
     "user_recommendation": "Actionable advice for end users (e.g., avoid entering personal info, verify via official site, etc.)"
   }

If any required field cannot be confidently filled, make a reasonable, conservative assumption and clearly mention it in "assumptions_or_uncertainties".
 Text to analyze: "${content}"`
            }]
          }]
        })
      }
    );


    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }


    const data = await response.json();
const rawText = data.candidates[0].content.parts[0].text;

let parsedResult;
try {
  parsedResult = extractJSON(rawText);
} catch (err) {
  console.error("Parsing failed:", err, rawText);
  throw new Error("Invalid response from AI");
}

    const finalVerdict = parsedResult.final_verdict || "Unknown";
    const confidenceScore = parsedResult.confidence_score || 0;
    const riskLevel = parsedResult.risk_level || "Low";
    const summary = parsedResult.summary || "No clear summary provided.";
    const reasons = parsedResult.reasons || [];
    const redFlags = parsedResult.red_flags || [];
    const positiveSignals = parsedResult.positive_signals || [];

    resultDiv.classList.remove("hidden");

    // Simplify display for the user
    if (finalVerdict.toUpperCase() === "SCAM") {
      resultDiv.className = "result scam";
      resultDiv.innerHTML = `
        <h3>⚠️ Potential Scam Detected</h3>
        <p><strong>Confidence:</strong> ${getDisplayConfidence(finalVerdict, confidenceScore)}%</p>
        <p><strong>Risk Level:</strong> ${riskLevel}</p>
        <p><strong>Verdict:</strong> ${finalVerdict}</p>
        <p><strong>Summary:</strong> ${summary}</p>
        ${redFlags.length > 0 ? `<h4>Red Flags:</h4><ul>${redFlags.map(flag => `<li>${flag.flag}: ${flag.description}</li>`).join('')}</ul>` : ""}
      `;
    } else {
      resultDiv.className = "result safe";
      resultDiv.innerHTML = `
        <h3>✓ Appears Safe</h3>
        <p><strong>Confidence:</strong> ${getDisplayConfidence(finalVerdict, confidenceScore)}%</p>
        <p><strong>Risk Level:</strong> ${riskLevel}</p>
        <p><strong>Verdict:</strong> ${finalVerdict}</p>
        <p><strong>Summary:</strong> ${summary}</p>
        ${
        reasons.length
          ? `<h4>Why this looks safe</h4>
            <ul>${reasons.map(r => `<li>${r}</li>`).join("")}</ul>`
          : ""
        }
      `;
    }
  } catch (error) {
    console.error("Error:", error);
    resultDiv.classList.remove("hidden");
    resultDiv.className = "result scam";
    resultDiv.innerHTML = `
      <h3>❌ Error</h3>
      <p>Failed to analyze content. Error: ${error.message}</p>
      <p>Please try again or check your internet connection.</p>
    `;
  } finally {
    button.textContent = "Resubmit";
    button.disabled = false;
  }
});


// Allow Enter key to submit with Ctrl/Cmd
textarea.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    button.click();
  }

});
