// Common modal functions
function openModal() { document.getElementById('accessModal').style.display = 'flex'; }
function closeModal() { document.getElementById('accessModal').style.display = 'none'; }
function openAiModal() { document.getElementById('aiModal').style.display = 'flex'; }
function closeAiModal() { document.getElementById('aiModal').style.display = 'none'; }
function openParkingModal() { document.getElementById('parkingModal').style.display = 'flex'; }
function closeParkingModal() { document.getElementById('parkingModal').style.display = 'none'; }

window.onclick = function(event) {
    if (event.target == document.getElementById('accessModal')) closeModal();
    if (event.target == document.getElementById('aiModal')) closeAiModal();
    if (event.target == document.getElementById('parkingModal')) closeParkingModal();
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

        const openTime = 9 * 60;
        const closeTime = 20 * 60;
        const minutesToOpen = openTime - totalMinutes;
        const minutesToClose = closeTime - totalMinutes;

        if (totalMinutes >= openTime - 30 && totalMinutes < openTime) {
            setStatus('#F4B400', `まもなく開店 (${minutesToOpen}分前)`, `まもなく開店 (${minutesToOpen}分前)`);
        } else if (totalMinutes >= openTime && totalMinutes < closeTime - 30) {
            setStatus('#4CAF50', '只今営業中', '只今営業中');
        } else if (totalMinutes >= closeTime - 30 && totalMinutes < closeTime) {
            setStatus('#FF9800', `まもなく閉店 (${minutesToClose}分前)`, `まもなく閉店 (${minutesToClose}分前)`);
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