// ==========================================
// 設定エリア
// ==========================================
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

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // プロンプトを作成（ユーザー名や目標を組み込むとより面白いです）
    const prompt = `${data.name}さんが「${data.goal}」を頑張っています。
この写真に写っている人の状況を、プロの実況者っぽく短く解説して！
理由：${data.reason || '定期巡回'}`;

    // --- 修正後の doPost の最後 ---
    const response = callGemini(prompt, data.currentImage.data);
    
    // candidates[0] そのものではなく、その中の「content」だけを返す
    // これで HTML側の data.parts[0].text が有効になります
    const result = response.content; 

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // エラーが起きた時に原因をブラウザに返す
    return ContentService.createTextOutput(JSON.stringify({ 
      error: err.message,
      parts: [{ text: "エラーが発生しました。詳細はGASのログを確認してください。" }] 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
