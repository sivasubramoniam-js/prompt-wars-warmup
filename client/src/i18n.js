import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_title": "Sahay Disaster Advisor",
      "emergency_feed": "Emergency Feed",
      "situation_description": "Situation Description",
      "placeholder_text": "Type your emergency details, news headlines, or location...",
      "upload_photo": "Upload Photo",
      "record_audio": "Record Audio",
      "request_assessment": "Request Emergency Assessment",
      "analyzing": "Analyzing Situation...",
      "news_alerts": "News & Alerts",
      "urgency_level": "Urgency Level",
      "immediate_actions": "Immediate Actions",
      "evacuation_plan": "Evacuation Plan",
      "shareable_card": "Shareable Safety Card",
      "live_map": "Live Hazard Map",
      "fetching_news": "Fetching live disaster news...",
      "no_news": "No active news currently reported.",
      "recording": "Recording... Tap to Stop",
      "audio_attached": "Audio Attached! Tap to redo"
    }
  },
  hi: {
    translation: {
      "app_title": "सहाय आपदा सलाहकार",
      "emergency_feed": "आपातकालीन फीड",
      "situation_description": "स्थिति का विवरण",
      "placeholder_text": "अपने आपातकालीन विवरण, समाचार सुर्खियों या स्थान टाइप करें...",
      "upload_photo": "फोटो अपलोड करें",
      "record_audio": "ऑडियो रिकॉर्ड करें",
      "request_assessment": "मूल्यांकन का अनुरोध करें",
      "analyzing": "विश्लेषण किया जा रहा है...",
      "news_alerts": "समाचार और अलर्ट",
      "urgency_level": "तत्काल स्तर",
      "immediate_actions": "तत्काल कार्रवाई",
      "evacuation_plan": "निकासी योजना",
      "shareable_card": "सुरक्षा कार्ड",
      "live_map": "लाइव नक्शा",
      "fetching_news": "समाचार प्राप्त हो रहे हैं...",
      "no_news": "कोई समाचार नहीं।"
    }
  },
  bn: {
    translation: {
      "app_title": "সহায় দুর্যোগ উপদেষ্টা",
      "emergency_feed": "জরুরি ফিড",
      "situation_description": "পরিস্থিতির বর্ণনা",
      "request_assessment": "জরুরি মূল্যায়ন",
      "analyzing": "বিশ্লেষণ করা হচ্ছে...",
      "news_alerts": "সংবাদ ও সতর্কতা"
    }
  },
  te: {
    translation: {
      "app_title": "సహాయ విపత్తు సలహాదారు",
      "emergency_feed": "అత్యవసర ఫీడ్",
      "analyzing": "విశ్లేషిస్తోంది...",
      "news_alerts": "వార్తలు మరియు హెచ్చరికలు"
    }
  },
  ta: {
    translation: {
      "app_title": "சஹாய் பேரிடர் ஆலோசகர்",
      "emergency_feed": "அவசர உணவு",
      "analyzing": "பகுப்பாய்வு செய்கிறது...",
      "news_alerts": "செய்திகள் மற்றும் எச்சரிக்கைகள்"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
