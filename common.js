// 汎用モーダル開閉関数
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Live Server 환경이 아닐 경우, fetch가 실패하여 modal이 존재하지 않을 수 있습니다.
        console.error(`Modal with id "${modalId}" not found. Are you using a web server like Live Server?`);
        alert('팝업을 여는 데 실패했습니다. Live Server와 같은 웹 서버 환경에서 실행하고 있는지 확인해주세요.');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}
 
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
};

// Business status update logic
async function updateBusinessStatus() {
    const statusBtn = document.getElementById('business-status');
    const textEl = document.getElementById('business-status-text'); // For about.html

    if (!statusBtn) return;

    try {
        const now = new Date();
        const jstOffset = 9 * 60 * 60 * 1000;
        const jstTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + jstOffset);

        const day = jstTime.getDay();
        const totalMinutes = jstTime.getHours() * 60 + jstTime.getMinutes();
        const todayStr = `${jstTime.getFullYear()}-${String(jstTime.getMonth() + 1).padStart(2, '0')}-${String(jstTime.getDate()).padStart(2, '0')}`;

        let isHoliday = false;
        try {
            let holidays = sessionStorage.getItem('holidays_jp');
            if (!holidays) {
                const response = await fetch('https://holidays-jp.github.io/api/v1/date.json');
                holidays = await response.text();
                sessionStorage.setItem('holidays_jp', holidays);
            }
            if (JSON.parse(holidays)[todayStr]) isHoliday = true;
        } catch (e) {
            console.error("Error fetching holiday data:", e);
        }

        const setStatus = (color, btnText, inlineText) => {
            statusBtn.style.backgroundColor = color;
            statusBtn.textContent = btnText;
            if (textEl) { // Only update if the text element exists
                textEl.innerHTML = `<span style="color: ${color};">${inlineText}</span>`;
            }
        };

        if (day === 3 && !isHoliday) {
            setStatus('#757575', '本日は定休日', '本日は定休日');
            return;
        }

        const openTime1 = 9 * 60;
        const closeTime1 = 14 * 60 + 30; // 14:30
        const openTime2 = 17 * 60 + 30; // 17:30
        const closeTime2 = 20 * 60; // 20:00
        
        const minutesToOpen1 = openTime1 - totalMinutes;
        const minutesToClose1 = closeTime1 - totalMinutes;
        const minutesToOpen2 = openTime2 - totalMinutes;
        const minutesToClose2 = closeTime2 - totalMinutes;

        if (totalMinutes >= openTime1 - 30 && totalMinutes < openTime1) {
            setStatus('#F4B400', `まもなく開店 (${minutesToOpen1}分前)`, `まもなく開店 (${minutesToOpen1}分前)`);
        } else if (totalMinutes >= openTime1 && totalMinutes < closeTime1 - 30) {
            setStatus('#4CAF50', '只今営業中', '只今営業中');
        } else if (totalMinutes >= closeTime1 - 30 && totalMinutes < closeTime1) {
            setStatus('#FF9800', `まもなく休憩 (${minutesToClose1}分前)`, `まもなく休憩 (${minutesToClose1}分前)`);
        } else if (totalMinutes >= closeTime1 && totalMinutes < openTime2 - 30) {
            setStatus('#757575', '休憩中 (17:30再開)', '休憩中 (17:30再開)');
        } else if (totalMinutes >= openTime2 - 30 && totalMinutes < openTime2) {
            setStatus('#F4B400', `まもなく営業再開 (${minutesToOpen2}分前)`, `まもなく営業再開 (${minutesToOpen2}分前)`);
        } else if (totalMinutes >= openTime2 && totalMinutes < closeTime2 - 30) {
            setStatus('#4CAF50', '只今営業中', '只今営業中');
        } else if (totalMinutes >= closeTime2 - 30 && totalMinutes < closeTime2) {
            setStatus('#FF9800', `まもなく閉店 (${minutesToClose2}分前)`, `まもなく閉店 (${minutesToClose2}分前)`);
        } else {
            setStatus('#757575', '只今準備中', '只今準備中');
        }
    } catch (e) {
        console.error("Error updating business status:", e);
        if (statusBtn) { statusBtn.textContent = '状態確認不可'; }
        if (textEl) { textEl.textContent = '状態確認不可'; }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateBusinessStatus();
    setInterval(updateBusinessStatus, 60000);
});