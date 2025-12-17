# AgriMind 
### AI-Powered Crop Recommendation & Disease Diagnosis System

**AgriMind** is an intelligent agricultural decision-support system designed to bridge the gap between advanced data science and practical farming. By leveraging **Machine Learning (XGBoost)** for tabular data and **Deep Learning (CNN)** for computer vision, the platform provides data-driven insights into crop selection and pathology management.

---

## Research & Problem Statement
Traditional agricultural tools often fail to account for the digital divide. This project focused on three core research pillars:
* **The Technology Gap:** Integrating disparate AI models (XGBoost + CNN) into a unified, mobile-first interface.
* **Accessibility Research:** Implementing voice-activated commands and multilingual audio support to assist users with varying literacy levels.
* **Predictive Precision:** Utilizing gradient boosting to provide highly accurate crop suggestions based on complex soil chemistry.



---

## Key Features

### Precision Agronomy (XGBoost)
The system utilizes an optimized **XGBoost** model to analyze soil metrics (N, P, K, pH) and environmental factors (Temperature, Humidity, Rainfall) to provide:
* **Crop Recommendations:** Identifying high-yield crops specific to the plot's chemistry.
* **Resource Optimization:** Tailored fertilizer and irrigation strategies to reduce waste and improve sustainability.

### Computer Vision for Pathology (CNN)
A **Convolutional Neural Network (CNN)** enables real-time disease diagnosis from image data:
* **Instant Diagnosis:** Classifies crop diseases from user-uploaded photos with high confidence.
* **Actionable Treatment:** Automatically fetches treatment and prevention strategies for identified diseases.



### Inclusive Design & Accessibility
* **Voice-Activated Chatbot:** Navigate the platform and query the AI using simple voice commands.
* **Multilingual Audio:** Real-time text-to-speech support for recommendations, catering to non-literate and regional language users.
* **Responsive Dashboard:** A mobile-first UI designed for performance in low-bandwidth rural environments.

---

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Machine Learning** | XGBoost (Tabular Predictive Modeling) |
| **Deep Learning** | CNN (Image Classification/Computer Vision) |
| **Frontend** | React, JavaScript, HTML5, CSS3 |
| **Backend** | Python (API-based Model Serving) |
| **Accessibility** | Web Speech API (Voice/Audio Support) |

---

## Methodology
1. **Data Engineering:** Conducted rigorous data cleaning and feature engineering on agricultural datasets.
2. **Model Training:** Comparative analysis of ensemble methods, selecting XGBoost for its superior performance on non-linear soil data.
3. **User-Centric Design:** Iterative UI enhancements based on "real-world" field testing scenarios to ensure practical usability for farmers.

---

## Future Roadmap
1. **IoT Integration:** Connecting real-time soil sensors for live data ingestion.
2. **Market Analytics:** Predicting crop market prices to assist farmers in financial planning.
3. **Offline Mode:** Enabling Edge-AI capabilities for regions with limited internet connectivity.
