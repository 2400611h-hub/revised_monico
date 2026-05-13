// ==========================================
// 設定エリア
// ==========================================
const LOG_SHEET_ID = '1rGI0HuAoIxAVFOzlTjY4sHqp954ugt3hs5mMDPgmsgM'; 
const ENABLE_LOGGING = true; 

function callGemini(promptText, base64Image = null) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY が設定されていません。");
  }

  // --- 1. 送信データの組み立て (partsの作成) ---
  let parts = [];

  // 写真があれば追加
  if (base64Image) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg", // 形式に合わせて変更
        data: base64Image
      }
    });
  }

  // プロンプトを追加
  parts.push({ text: promptText });

  // --- 2. 通信設定 ---
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + API_KEY;
  
  const payload = { 
    contents: [{ parts: parts }] 
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // --- 3. 実行 ---
  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error(`API Error (${response.getResponseCode()}): ${json.error ? json.error.message : 'Unknown Error'}`);
  }
  
  return json.candidates[0];
}

/**
 * 【テスト用】写真と指示を別々に送るテスト
 */
function testWorkWithPhoto() {
  const myPrompt = "この写真に写っている人の集中度を、プロの実況者っぽく解説して！";
  const myImage = "ここにBase64文字列が入るイメージ"; 
  
  // 関数を呼ぶときは、(プロンプト, 画像) の順番で渡すだけ
  const result = callGemini(myPrompt, myImage);
  console.log(result.content.parts[0].text);
}
