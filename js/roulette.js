// 1. Firebase CDN 모듈 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ★ 여기에 본인의 Firebase 콘솔에서 복사한 firebaseConfig 값을 붙여넣으세요 ★
const firebaseConfig = {
  apiKey: "AIzaSyA7C0F-TcGI-B99FedQdLYzCcWgt6GFWWY",
  authDomain: "momentum-9a75c.firebaseapp.com",
  projectId: "momentum-9a75c",
  storageBucket: "momentum-9a75c.firebasestorage.app",
  messagingSenderId: "62401239584",
  appId: "1:62401239584:web:cc17ad9eba6bacd9d4ba45",
  measurementId: "G-LDKQNNYK6Y"
};


// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const winnersRef = collection(db, "coffeeWinners");

// 기존 DOM 요소
const canvas = document.getElementById("rouletteCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultText = document.getElementById("resultText");
const memberForm = document.getElementById("memberForm");
const memberInput = document.getElementById("memberInput");
const memberList = document.getElementById("memberList");
const winnerHistoryList = document.getElementById("winnerHistoryList");

let members = JSON.parse(localStorage.getItem("coffeeMembers")) || [
  "친구1",
  "친구2",
  "친구3",
  "친구4",
];

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"
];

let currentRotation = 0;
let isSpinning = false;

// 2. 룰렛 원판 그리기
function drawRoulette() {
  const numMembers = members.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (numMembers === 0) {
    ctx.fillStyle = "#576574";
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("참가자를 추가해주세요!", 150, 155);
    return;
  }

  const arcSize = (Math.PI * 2) / numMembers;

  members.forEach((member, i) => {
    const startAngle = i * arcSize;
    const endAngle = startAngle + arcSize;

    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 150, startAngle, endAngle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(startAngle + arcSize / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#1e272e";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(member, 130, 6);
    ctx.restore();
  });
}

// 3. 참가자 업데이트
function updateMembers() {
  localStorage.setItem("coffeeMembers", JSON.stringify(members));
  memberList.innerHTML = "";

  members.forEach((member, index) => {
    const li = document.createElement("li");
    li.textContent = `${member} ✕`;
    li.addEventListener("click", () => {
      if (isSpinning) return;
      members.splice(index, 1);
      updateMembers();
    });
    memberList.appendChild(li);
  });

  drawRoulette();
}

memberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (isSpinning) return;

  const name = memberInput.value.trim();
  if (name) {
    members.push(name);
    memberInput.value = "";
    updateMembers();
  }
});

// 4. 룰렛 회전 및 당첨자 Firebase DB에 저장
spinBtn.addEventListener("click", () => {
  if (isSpinning || members.length < 2) {
    if (members.length < 2) alert("최소 2명 이상 추가해주세요!");
    return;
  }

  isSpinning = true;
  spinBtn.disabled = true;
  resultText.textContent = "두구두구두구...";

  const randomExtraDeg = Math.floor(Math.random() * 360);
  const totalSpinDeg = 1800 + randomExtraDeg;
  currentRotation += totalSpinDeg;

  canvas.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(async () => {
    isSpinning = false;
    spinBtn.disabled = false;

    const actualDeg = currentRotation % 360;
    const pointerAngle = (270 - actualDeg + 360) % 360;
    const sliceAngle = 360 / members.length;
    const winnerIndex = Math.floor(pointerAngle / sliceAngle);
    const winnerName = members[winnerIndex];

    resultText.textContent = `🎉 당첨: ${winnerName}님이 커피 쏘기!`;

    // Firestore DB에 당첨 기록 추가
    try {
      await addDoc(winnersRef, {
        name: winnerName,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("기록 저장 실패:", error);
    }
  }, 4000);
});

// 5. 실시간으로 Firestore에서 당첨 기록 불러와 누적 횟수 계산 및 출력
const q = query(winnersRef, orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  const counts = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const name = data.name;
    counts[name] = (counts[name] || 0) + 1;
  });

  winnerHistoryList.innerHTML = "";

  // 횟수가 많은 순서대로 정렬
  const sortedWinners = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (sortedWinners.length === 0) {
    winnerHistoryList.innerHTML = "<li>아직 당첨 기록이 없습니다!</li>";
    return;
  }

  sortedWinners.forEach(([name, count], idx) => {
    const li = document.createElement("li");
    const medal = idx === 0 ? "👑 " : "";
    li.innerHTML = `<span>${medal}${name}</span> <strong>${count}회</strong>`;
    winnerHistoryList.appendChild(li);
  });
});

// 초기 실행
updateMembers();