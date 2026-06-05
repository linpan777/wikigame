let startTitle = "";
let targetTitle = "";
let currentTitle = "";
let stepCount = 0;
let seconds = 0;
let timerId = null;
let pathHistory = [];

// 暫時假資料：之後等後端給 wiki links API 再換掉
const fakeLinks = {
    "台灣": ["台北市", "中華民國", "日本", "中國", "太平洋"],
    "台北市": ["台灣", "新北市", "捷運", "中華民國"],
    "中華民國": ["台灣", "中國", "台北市", "歷史"],
    "日本": ["台灣", "東京", "亞洲"],
    "中國": ["台灣", "北京", "亞洲"],
    "太平洋": ["台灣", "海洋", "日本"],
    "東京": ["日本", "亞洲", "東京灣"],
    "亞洲": ["日本", "中國", "東南亞"],
    "新北市": ["台灣", "台北市"],
    "北京": ["中國", "長城"],
    "長城": ["中國", "北京"],
    "海洋": ["太平洋", "大西洋"],
    "歷史": ["台灣", "中華民國"],
    "東南亞": ["亞洲", "東南亞國協"],
    "東南亞國協": ["東南亞", "泰國"],
    "泰國": ["東南亞", "曼谷"],
    "曼谷": ["泰國", "東南亞"],
    "大西洋": ["海洋", "北美洲"],
    "北美洲": ["大西洋", "美國"],
    "美國": ["北美洲", "紐約"],
    "紐約": ["美國", "曼哈頓"],
    "東京灣": ["東京", "日本"],
    "捷運": ["台北市", "台灣"],
    "曼哈頓": ["紐約", "美國"]
};

// 事件監聽
const startBtn = document.getElementById("startBtn");
if (startBtn) {
    startBtn.addEventListener("click", startGame);
}

// 如果在 inGame.html，綁定 restartBtn
if (document.getElementById("restartBtn")) {
    document.getElementById("restartBtn").addEventListener("click", () => {
        window.location.href = "index.html";
    });
}

// ========== 遊戲邏輯 ==========
async function startGame() {
    // 淡出動畫
    const mainScreen = document.getElementById("mainScreen");
    if (mainScreen) {
        mainScreen.style.transition = "opacity 0.6s ease";
        mainScreen.style.opacity = "0";
    }

    try {
        // 從後端獲取隨機題目
        const response = await fetch('/find_path');
        const data = await response.json();

        if (response.ok && data.start_title && data.target_title) {
            startTitle = data.start_title;
            targetTitle = data.target_title;
            const solutionPath = data.path; // 最短路徑
            
            // 將題目資訊存到 sessionStorage
            sessionStorage.setItem("startTitle", startTitle);
            sessionStorage.setItem("targetTitle", targetTitle);
            sessionStorage.setItem("solutionPath", JSON.stringify(solutionPath));
            sessionStorage.setItem("gameStartTime", new Date().getTime());

            // 延遲後跳轉到遊戲頁面
            setTimeout(() => {
                window.location.href = "inGame.html";
            }, 600);
        } else {
            alert("無法產生題目，請重試");
            mainScreen.style.opacity = "1";
        }
    } catch (err) {
        console.error("連線錯誤:", err);
        alert("無法連接後端，請檢查 Flask 伺服器是否啟動");
        mainScreen.style.opacity = "1";
    }
}

function resetGame() {
    stepCount = 0;
    seconds = 0;
    pathHistory = [];

    clearInterval(timerId);
    timerId = null;
}

function startTimer() {
    timerId = setInterval(() => {
        seconds++;
        document.getElementById("timer").innerText = seconds;
        updateProgress();
    }, 1000);
}

function renderLinks(title) {
    const linkList = document.getElementById("linkList");
    linkList.innerHTML = "";

    const links = fakeLinks[title] || ["台灣", "台北市", "中華民國", "日本", "中國"];

    links.forEach(link => {
        const li = document.createElement("li");
        li.innerText = link;
        li.addEventListener("click", () => {
            goToPage(link);
        });
        linkList.appendChild(li);
    });
}

function renderPath() {
    const pathList = document.getElementById("pathList");
    pathList.innerHTML = "";

    pathHistory.forEach((page, index) => {
        const li = document.createElement("li");
        li.innerText = `▸ ${page}`;
        if (page === currentTitle) {
            li.classList.add("current");
        }
        pathList.appendChild(li);
    });
}

function goToPage(title) {
    currentTitle = title;
    stepCount++;
    pathHistory.push(title);

    document.getElementById("currentTitle").innerText = currentTitle;
    document.getElementById("stepCount").innerText = stepCount;
    
    renderPath();
    updateProgress();

    if (currentTitle === targetTitle) {
        finishGame();
        return;
    }

    renderLinks(currentTitle);
}

function updateProgress() {
    // 簡單的進度計算：根據步數（最多 20 步為 100%）
    const progress = Math.min((stepCount / 20) * 100, 100);
    document.querySelector(".progress-fill").style.width = progress + "%";
    document.querySelector(".progress-percent").innerText = Math.round(progress) + "%";
}

function finishGame() {
    clearInterval(timerId);

    document.getElementById("finalSteps").innerText = stepCount;
    document.getElementById("finalTime").innerText = seconds;

    // 淡出效果後返回主頁
    const gameScreen = document.getElementById("gameScreen");
    if (gameScreen) {
        gameScreen.style.transition = "opacity 0.6s ease";
        gameScreen.style.opacity = "0";
        
        setTimeout(() => {
            window.location.href = "index.html";
        }, 600);
    }
}
