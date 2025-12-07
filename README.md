🏥 Google Health Clarity

Simplifying the healthcare journey by providing clear, personalized, and actionable medical cost estimates.

💡 Overview

Google Health Clarity is an open-source, advanced AI chatbot designed to tackle the confusing world of medical billing and price transparency. Instead of showing complex, unrefined billing codes (like CPT and HCPCS) and vague rates, this application focuses on calculating the true financial impact of medical procedures: the patient's estimated out-of-pocket cost. It is capable of estimating costs for any medical procedure and predicting expenses based on specific diagnoses.

This expands on projects like [**MyMedic.dev**](http://mymedic.dev) ([**MyMedic Github**](https://github.com/KevinRoozrokh/mymedic-drug-interaction-ai)) , the goal is to leverage modern technology to empower consumers to "shop" for healthcare services by providing a comparative view of prices and quality scores across providers, making the value-based decision straightforward.

✨ Key Features

This application goes beyond simple negotiated rates by focusing on personalization and usability, leveraging advanced AI for data processing:

1. Personalized Cost Estimation & Detailed Breakdown

The core of Health Clarity is providing the most accurate, personalized cost data possible. Users can upload an existing medical bill or just ask the AI directly.

Insurance Profile: Save or quickly input essential coverage details.

Out-of-Pocket Projection: Displays a detailed breakdown of the estimated costs, including the total cost, insurance coverage, and the exact amount the user is expected to pay after insurance adjustments. This provides an Advanced Explanation of Benefits (AEOB)-style estimate.

2. Comprehensive Service Bundling (AI-Enhanced) & Code Database

Pricing data is consolidated to reflect the true cost of an "Episode of Care." The AI chatbot leverages a comprehensive database of codes to ensure accuracy and context:

Code Database Integration: Features include a comprehensive database of medical ICD-10 diagnoses codes, CPT billing codes, and NDC drug codes.

External API Grounding: The system leverages the NIH NLM ICD10, HCPCS, and NDC APIs for real-time medical information validation and grounding.

Episode Search: Search for high-level procedures like "Routine Colonoscopy" or "ACL Surgery" and receive a single, bundled price that includes facility fees, physician fees, and anesthesia.

3. Value-Based Comparison & Local Search

Price is only half the story. The tool integrates quality metrics and location to help users compare overall value.

Local Provider Search: Quickly find providers near you that offer the service, complete with pricing and quality data.

Quality Scores: Display provider ratings, patient satisfaction scores, and complication rates alongside pricing data.

Visualization: Use clear charts and graphs to quickly compare prices and payment options (e.g., Cash Pay vs. In-Network Rate) across multiple providers in the user's area.

4. Usability and Action

Designed with the patient in mind, the interface prioritizes clarity and immediate action.

Plain Language Glossary: Integrated tooltips provide simple definitions for complex medical billing terms (e.g., "CPT Code," "Deductible," "Coinsurance").

Direct Scheduling: Provides quick access to a provider's scheduling portal or direct phone number to turn a price comparison into an appointment.

💻 Tech Stack

This project is built using a modern, scalable MERN-adjacent stack focused on real-time data and advanced natural language processing capabilities.

Frontend: React.js, TypeScript

Purpose: Intuitive and responsive user interface for complex data visualization.

Backend: Node.js, Express.js

Purpose: Robust API layer for handling pricing data and business logic.

Data/Persistence: Firebase, Firestore

Purpose: Real-time, scalable data storage and user authentication.

AI/ML: Google Gemini, RAG Pipelines

Purpose: Natural Language Processing (NLP) for complex medical data mapping, bill parsing, and personalized glossary generation.

External Data: NIH NLM ICD10/HCPCS/NDC APIs

Purpose: Grounding and validation of medical codes and drug information.

Architecture: AWS/GCP principles

Purpose: Cloud-native design for highly available and secure microservices.

🚀 Getting Started

These instructions will get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites

Node.js (LTS version recommended)

npm or yarn

A Firebase project for persistence (Firestore)

Installation

Clone the repository:

git clone [https://github.com/KevinRoozrokh/google-health-clarity.git](https://github.com/KevinRoozrokh/google-health-clarity.git)
cd google-health-clarity


Install dependencies:

npm install
# or
yarn install


Configure Firebase:
This application requires Firebase for authentication and data storage (Firestore).

Create a file named .env in the root directory.

Add your Firebase configuration details:

# .env
REACT_APP_FIREBASE_API_KEY="YOUR_API_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
REACT_APP_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
# ... other Firebase config variables


Run the application:

npm start
# or
yarn start


The app should now be running locally, usually accessible at http://localhost:3000.

🤝 Contributing

We welcome contributions! Given the project's focus on AI, data visualization, and complex backend architecture, we are particularly interested in contributors specializing in:

RAG/LLM Implementation: Enhancing the accuracy and speed of medical code mapping and document (bill) parsing.

Frontend Visualization: Improving the clarity and responsiveness of the comparison charts (using React.js and TypeScript).

Data Ingestion: Building robust pipelines for integrating new public and proprietary price transparency data and connecting to external health APIs.

To contribute:

Fork the repository.

Create your feature branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'feat: Add AmazingFeature').

Push to the branch (git push origin feature/AmazingFeature).

Open a Pull Request.

Please ensure your pull request adheres to the project's coding standards and includes relevant tests.

📄 License

This project is licensed under the 

$$MIT License$$

 - see the LICENSE.md file (if provided) for details.

 Coded by [**Kevin Roozrokh**](http://kevinroozrokh.com) 

A project built for clarity and transparency in healthcare, leveraging innovative AI and system architecture.

Find me on:
[![Medium](https://img.shields.io/badge/-Medium-white?style=flat-square&logo=Medium&logoColor=black)](https://medium.com/@kroozrokh)
