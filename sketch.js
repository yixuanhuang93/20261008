// ==========================================
// 全域變數設定區
// ==========================================
let questions = [
  {
    prompt: "哪一個指令可以設定畫布的背景顏色？",
    options: ["A. color()", "B. background()", "C. fillColor()", "D. stroke()"],
    correct: 1 // 正確答案是索引 1 (即選項 B)
  },
  {
    prompt: "哪一個指令用來設定圖形內部的填滿顏色？",
    options: ["A. fill()", "B. background()", "C. color()", "D. rect()"],
    correct: 0 // 正確答案是索引 0 (即選項 A)
  },
  {
    prompt: "哪一個指令用來在畫布上繪製矩形？",
    options: ["A. circle()", "B. ellipse()", "C. rect()", "D. line()"],
    correct: 2 // 正確答案是索引 2 (即選項 C)
  },
  {
    prompt: "哪一個指令用來建立 p5.js 的畫布大小？",
    options: ["A. size()", "B. windowSize()", "C. createCanvas()", "D. canvasSize()"],
    correct: 2 // 正確答案是索引 2 (即選項 C)
  },
  {
    prompt: "哪一個指令用來設定圖形邊框（線條）的顏色？",
    options: ["A. border()", "B. stroke()", "C. line()", "D. color()"],
    correct: 1 // 正確答案是索引 1 (即選項 B)
  }
];

let currentQuestion = 0; // 記錄目前是第幾題（從 0 開始計算）
let score = 0;           // 記錄累積答對的題數
let isAnswered = false;  // 記錄當前題目是否已經被作答過，防止重複點擊

let questionP;           // 存放題目文字的 DOM 元素
let optionButtons = [];  // 存放四個選項按鈕的陣列
let nextBtn;             // 「下一題」按鈕的 DOM 元素
let restartBtn;          // 「重新開始」按鈕的 DOM 元素
let resultP;             // 顯示最後結算成績的 DOM 元素
let titleP;              // 標題文字 DOM 元素

// ==========================================
// 預先載入函數：動態注入 RWD 響應式 CSS 樣式與動畫
// ==========================================
function preload() {
  let cssStyles = `
    /* 設定網頁邊距為 0 並隱藏外部卷軸，使用 Flexbox 讓內容永遠置中 */
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Microsoft JhengHei', Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f2f5;
    }
    
    /* 測驗外框容器：支援 RWD 響應式與手機橫向高度保護 */
    #quiz-box {
      background: rgba(255, 255, 255, 0.98);
      padding: 25px 35px;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      width: 90%;
      max-width: 650px;
      max-height: 90vh; /* 限制最大高度，防止手機橫向時超出畫面 */
      overflow-y: auto;  /* 內容過多時可滾動，適應直向與橫向極端尺寸 */
      text-align: center;
      box-sizing: border-box;
      z-index: 10;
    }
    
    /* 題目文字樣式：利用 clamp() 讓字體在電腦與手機間自動平滑縮放 */
    .question-text {
      font-size: clamp(1rem, 2.5vw, 1.4rem);
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 20px;
      line-height: 1.4;
    }
    
    /* 選項按鈕的響應式基礎樣式 */
    .option-btn {
      display: block;
      width: 100%;
      padding: 12px 15px;
      margin: 10px 0;
      font-size: clamp(0.9rem, 2vw, 1.1rem);
      background-color: #ffffff;
      border: 2px solid #bdc3c7;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      transition: background-color 0.2s;
    }
    
    /* 滑鼠懸停在未禁用的選項時改變背景色 */
    .option-btn:hover:not(:disabled) {
      background-color: #ecf0f1;
      border-color: #7f8c8d;
    }
    
    /* 控制按鈕（下一題、重新開始）樣式 */
    .control-btn {
      margin-top: 20px;
      padding: 10px 25px;
      font-size: clamp(0.9rem, 2vw, 1rem);
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: none; /* 預設隱藏 */
    }
    .control-btn:hover {
      background-color: #2980b9;
    }

    /* 定義正確答案的上下跳動動畫 */
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .bounce-anim {
      animation: bounce 0.4s ease infinite;
      background-color: #fdffb6 !important; /* 正確答案指定背景顏色 */
      border-color: #f1c40f !important;
    }

    /* 定義錯誤選項的左右移動（搖晃）動畫 */
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    .shake-anim {
      animation: shake 0.3s ease infinite;
      background-color: #ff4d6d !important; /* 答錯選項指定背景顏色 */
      color: white !important;
      border-color: #c0392b !important;
    }

    /* 針對極小螢幕的手機進行額外內距微調 */
    @media (max-width: 480px) {
      #quiz-box {
        padding: 15px 20px;
        width: 95%;
      }
    }
  `;
  
  // 建立 style 元素並將 CSS 樣式寫入，最後附加到網頁 head 中
  let styleElement = document.createElement('style');
  styleElement.innerHTML = cssStyles;
  document.head.appendChild(styleElement);
}

// ==========================================
// 初始化設定函數
// ==========================================
function setup() {
  // 建立填滿瀏覽器視窗的全螢幕畫布
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);       // 固定在畫布左上角
  canvas.style('z-index', '-1'); // 讓畫布保持在底層

  // 建立主測驗外框的 DOM 容器
  let quizBox = createDiv();
  quizBox.id('quiz-box');

  // 建立測驗系統的標題
  titleP = createP("p5.js 簡易指令練習測驗");
  titleP.parent(quizBox);
  titleP.style('font-size', 'clamp(0.9rem, 2vw, 1.1rem)');
  titleP.style('color', '#7f8c8d');

  // 建立用來顯示題目的段落
  questionP = createP("");
  questionP.parent(quizBox);
  questionP.addClass('question-text');

  // 使用迴圈動態建立 4 個選擇題選項按鈕
  for (let i = 0; i < 4; i++) {
    let btn = createButton("");
    btn.parent(quizBox);
    btn.addClass('option-btn');
    // 當按鈕被點擊時，呼叫 handleAnswer 函數並傳入該選項的索引編號
    btn.mousePressed(() => handleAnswer(i));
    optionButtons.push(btn); // 將按鈕存入陣列中管理
  }

  // 建立「下一題」按鈕
  nextBtn = createButton("下一題");
  nextBtn.parent(quizBox);
  nextBtn.addClass('control-btn');
  nextBtn.mousePressed(loadNextQuestion); // 點擊時載入下一題

  // 建立「重新開始」按鈕
  restartBtn = createButton("重新開始");
  restartBtn.parent(quizBox);
  restartBtn.addClass('control-btn');
  restartBtn.mousePressed(restartQuiz); // 點擊時重設測驗

  // 建立結算成績顯示的段落
  resultP = createP("");
  resultP.parent(quizBox);
  resultP.style('font-size', 'clamp(1.1rem, 2.5vw, 1.3rem)');
  resultP.style('color', '#e74c3c');
  resultP.hide(); // 初始時先隱藏結算畫面

  // 載入第一道題目與選項內容
  updateQuestionUI();
}

// ==========================================
// 繪圖函數：每秒執行 60 次，用來繪製全螢幕背景
// ==========================================
function draw() {
  background(240, 242, 245); // 繪製柔和的淺灰色全螢幕背景
}

// ==========================================
// 視窗大小改變或手機旋轉時自動觸發：保持全螢幕尺寸
// ==========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ==========================================
// 更新目前題目與選項介面的函數
// ==========================================
function updateQuestionUI() {
  isAnswered = false;          // 重設作答狀態為未作答
  nextBtn.style('display', 'none'); // 隱藏下一題按鈕

  // 取得目前題目資料
  let q = questions[currentQuestion];
  
  // 更新題目文字與目前題數進度
  questionP.html(`第 ${currentQuestion + 1} 題 / 共 ${questions.length} 題<br><br>${q.prompt}`);
  questionP.show(); // 確保題目文字顯示

  // 迴圈更新四個選項按鈕的文字與樣式狀態
  for (let i = 0; i < 4; i++) {
    optionButtons[i].html(q.options[i]); // 設定選項文字
    optionButtons[i].show();            // 顯示選項按鈕
    optionButtons[i].removeAttribute('disabled'); // 解除按鈕禁用狀態
    optionButtons[i].removeClass('bounce-anim');   // 移除跳動動畫類別
    optionButtons[i].removeClass('shake-anim');    // 移除搖晃動畫類別
    optionButtons[i].style('background-color', '#ffffff'); // 恢復預設背景色
    optionButtons[i].style('color', '#000000');            // 恢復預設字體顏色
  }
}

// ==========================================
// 處理使用者點選選項的邏輯函數
// ==========================================
function handleAnswer(selectedIndex) {
  if (isAnswered) return; // 如果已經作答過，直接離開避免重複計算
  isAnswered = true;      // 標記為已作答

  let q = questions[currentQuestion];
  let correctIndex = q.correct; // 取得正確答案的索引

  // 停用所有選項按鈕，防止使用者再次點擊
  for (let i = 0; i < 4; i++) {
    optionButtons[i].attribute('disabled', '');
  }

  // 判斷使用者點選的是否為正確答案
  if (selectedIndex === correctIndex) {
    score++; // 答對了，分數加 1
    // 正確答案選項加上 #fdffb6 背景顏色與上下跳動動畫
    optionButtons[correctIndex].addClass('bounce-anim');
  } else {
    // 答錯了：
    // 1. 正確答案選項加上 #fdffb6 背景顏色與上下跳動動畫
    optionButtons[correctIndex].addClass('bounce-anim');
    // 2. 使用者點選的錯誤選項採用 #ff4d6d 背景顏色與左右移動（搖晃）動畫
    optionButtons[selectedIndex].addClass('shake-anim');
  }

  // 檢查是否還有下一題，如果不是最後一題顯示「下一題」，否則顯示「查看結果」
  if (currentQuestion < questions.length - 1) {
    nextBtn.html("下一題");
  } else {
    nextBtn.html("查看測驗結果");
  }
  nextBtn.style('display', 'inline-block'); // 顯示控制按鈕
}

// ==========================================
// 載入下一題或顯示結算畫面的函數
// ==========================================
function loadNextQuestion() {
  currentQuestion++; // 題數加 1

  // 判斷是否還有題目未完成
  if (currentQuestion < questions.length) {
    updateQuestionUI(); // 載入下一題介面
  } else {
    showResultScreen(); // 已經完成所有題目，顯示結算畫面
  }
}

// ==========================================
// 顯示最終結算結果的函數
// ==========================================
function showResultScreen() {
  // 隱藏題目文字與四個選項按鈕
  questionP.hide();
  for (let i = 0; i < 4; i++) {
    optionButtons[i].hide();
  }
  nextBtn.style('display', 'none'); // 隱藏下一題按鈕

  // 設定並顯示結算文字（顯示答對的題數）
  titleP.html("測驗結束！");
  resultP.html(`你總共答對了 <b>${score}</b> 題（滿分 ${questions.length} 題）`);
  resultP.show();

  // 顯示「重新開始」按鈕
  restartBtn.style('display', 'inline-block');
}

// ==========================================
// 重新開始測驗的初始化函數
// ==========================================
function restartQuiz() {
  currentQuestion = 0;   // 將題目索引重設回第一題
  score = 0;             // 將分數歸零
  resultP.hide();        // 隱藏結算成績文字
  restartBtn.style('display', 'none'); // 隱藏重新開始按鈕
  titleP.html("p5.js 簡易指令練習測驗"); // 恢復標題文字
  updateQuestionUI();    // 重新載入第一道題目介面
}