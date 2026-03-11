let isSending = false; // 送信停止フラグ

// 50桁のランダム文字列を生成
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function addLog(msg) {
    const log = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    log.innerText += `\n[${time}] ${msg}`;
    log.scrollTop = log.scrollHeight;
}

// ユーザーIDの自動取得
document.getElementById('fetchIdsBtn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const channelId = document.getElementById('channel_id').value.trim();

    if (!token || !channelId) return alert("トークンとチャンネルIDが必要です");

    addLog("ユーザーIDを取得中...");
    try {
        const res = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=50`, {
            headers: { 'Authorization': token }
        });
        const messages = await res.json();
        const ids = [...new Set(messages.map(m => m.author.id))];
        document.getElementById('user_ids').value = ids.join('\n');
        addLog(`${ids.length} 名のIDを取得しました。`);
    } catch (err) { addLog(`取得失敗: ${err.message}`); }
});

// 送信メイン処理
document.getElementById('sendBtn').addEventListener('click', async () => {
    const sendBtn = document.getElementById('sendBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    const config = {
        token: document.getElementById('token').value.trim(),
        channelId: document.getElementById('channel_id').value.trim(),
        count: parseInt(document.getElementById('count').value),
        interval: parseFloat(document.getElementById('interval').value) * 1000,
        message: document.getElementById('message').value,
        userIds: document.getElementById('user_ids').value.split(/\r?\n/).filter(id => id.trim() !== "")
    };

    if (!config.token || !config.channelId) return alert("設定が不十分です");

    isSending = true;
    sendBtn.style.display = "none";
    stopBtn.style.display = "block";
    addLog(">>> 送信プロセス開始");

    for (let i = 0; i < config.count; i++) {
        if (!isSending) {
            addLog("!!! 送信が強制停止されました");
            break;
        }

        let mention = config.userIds.length > 0 ? `<@${config.userIds[Math.floor(Math.random() * config.userIds.length)]}> ` : "";
        const randomStr = "\n[ID: " + generateRandomString(50) + "]";
        const fullMessage = mention + config.message + randomStr;

        try {
            const res = await fetch(`https://discord.com/api/v9/channels/${config.channelId}/messages`, {
                method: 'POST',
                headers: { 'Authorization': config.token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: fullMessage })
            });
            if (res.ok) addLog(`[${i + 1}/${config.count}] 送信成功`);
            else if (res.status === 429) { addLog("速度制限(429)を検知。停止します。"); break; }
        } catch (err) { addLog(`エラー: ${err.message}`); }

        if (i < config.count - 1) await new Promise(r => setTimeout(r, config.interval));
    }

    isSending = false;
    sendBtn.style.display = "block";
    stopBtn.style.display = "none";
    addLog(">>> プロセス終了");
});

// 送信停止ボタン
document.getElementById('stopBtn').addEventListener('click', () => {
    isSending = false;
});

// サーバー退出ボタン
document.getElementById('leaveBtn').addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const channelId = document.getElementById('channel_id').value.trim();

    if (!token || !channelId) return alert("トークンとチャンネルIDが必要です");
    if (!confirm("本当にこのサーバーから退出しますか？")) return;

    try {
        // 1. チャンネル情報からサーバー(Guild) IDを取得
        const chanRes = await fetch(`https://discord.com/api/v9/channels/${channelId}`, {
            headers: { 'Authorization': token }
        });
        const chanData = await chanRes.json();
        const guildId = chanData.guild_id;

        if (!guildId) throw new Error("サーバーIDの取得に失敗しました。DMなどの可能性があります。");

        // 2. サーバーから退出
        const leaveRes = await fetch(`https://discord.com/api/v9/users/@me/guilds/${guildId}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });

        if (leaveRes.ok) addLog(`成功: サーバー(${guildId})から退出しました。`);
        else addLog(`失敗: 退出できませんでした (Status: ${leaveRes.status})`);
    } catch (err) {
        addLog(`エラー: ${err.message}`);
    }
});
// script.js の該当部分を以下のように置き換えまたは追加・修正

// メンションIDを取得する関数（上限50に制限）
function getMentionIds() {
    const textarea = document.getElementById('user_ids');
    const lines = textarea.value
        .split(/\r?\n/)
        .map(id => id.trim())
        .filter(id => id.length > 0 && /^\d{17,20}$/.test(id));  // Discord IDっぽい形式のみ

    if (lines.length > 50) {
        logMessage(`ランダムメンション設定エラー`, 'warn');
        return lines.slice(0, 50);
    }
    return lines;
}


    

    const mentionIds = getMentionIds();
    let mentionText = '';

    if (mentionIds.length > 0) {
        mentionText = mentionIds.map(id => `<@${id}>`).join(' ') + ' ';
        logMessage(`メンション対象: ${mentionIds.length}人 を付与します`);
    }

    const baseMessage = document.getElementById('message').value.trim();
    if (!baseMessage && mentionIds.length === 0) {
        logMessage('メッセージ内容かメンションのどちらかを入力してください', 'error');
        return;
    }

    const fullMessage = mentionText + baseMessage;

    // ... (以降は元の送信ロジック)

    // 各送信時に使う content を fullMessage に変更
    body: JSON.stringify({ content: fullMessage })

    // 例: fetch の body 部分を上記のように置き換え
