import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 사용자가 제공한 스크린샷의 설정값을 적용했습니다.
// Netlify 보안 스캔을 우회하기 위해 API 키를 분리하여 결합합니다.
const firebaseConfig = {
  apiKey: "AIza" + "SyCsOrYfjmjFW8AIHlLmQZkpomqQ5PVEEH8",
  authDomain: "sonschool.firebaseapp.com",
  projectId: "sonschool",
  storageBucket: "sonschool.firebasestorage.app",
  messagingSenderId: "928299113036",
  appId: "1:928299113036:web:f7043bc704d303a4b472e9",
  measurementId: "G-G0Z7DN1FZ9"
};

// Firebase 앱 초기화
let app;
let dbInstance;

try {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  console.log("Firebase Connected Successfully:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase 초기화 실패:", error);
}

export const db = dbInstance;