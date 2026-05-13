// GASの「ウェブアプリとして公開」した時のURLを入力
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxBL_1yA0QxabzrLY4xHfXanUiJoYLRYoN0j8le8IVc75nEyn5y0w4ag-1iKblNvwBJVw/exec";

const video = document.getElementById('camera-preview');
const canvas = document.getElementById('capture-canvas');
const resultDiv = document.getElementById('commentary-result');

// 1. カメラの起動
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.error("カメラの起動に失敗しました: ", err);
    alert("カメラを許可してください");
  }
}

// 2. 画像の撮影と送信
async function captureAndSend() {
  // Canvasに現在の映像を書き込む
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 画像をBase64文字列（JPEG）に変換
  // data:image/jpeg;base64,xxxx... の形式
  const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

  resultDiv.innerText = "実況者が思考中...";

  const payload = {
    name: "福田", // 必要に応じて入力欄から取得
    goal: "GAS開発", 
    reason: "集中力チェック",
    currentImage: {
      mime_type: "image/jpeg",
      data: base64Image
    }
  };

  try {
    // GASへPOSTリクエストを送信
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.status === "success") {
      // Geminiの実況文を表示
      resultDiv.innerText = result.commentary;
    } else {
      resultDiv.innerText = "エラー: " + result.message;
    }
  } catch (error) {
    console.error("送信エラー:", error);
    resultDiv.innerText = "通信に失敗しました。";
  }
}

// 初期化
startCamera();