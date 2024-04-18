let currentYear;
let currentMonth;

function generateCalendar(year, month) {
    const date = new Date(year, month - 1, 1);
    const table = document.createElement('table');
    const header = document.createElement('thead');
    const body = document.createElement('tbody');
    const daysOfWeek = ['<span class="sunday-text">日</span>', '月', '火', '水', '木', '金', '<span class="saturday-text">土</span>'];
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = date.getDay();

    const headerRow = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        const span = document.createElement('span');
        span.innerHTML = day;
        th.appendChild(span);
        headerRow.appendChild(th);
    });
    header.appendChild(headerRow);
    table.appendChild(header);

    let currentRow = document.createElement('tr');
    let dayCount = 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
        const td = document.createElement('td');
        const prevMonthDays = new Date(year, month - 1, 0).getDate();
        const prevMonthDay = prevMonthDays - (firstDayOfWeek - i - 1);
        td.textContent = prevMonthDay;
        td.classList.add('other-month');
        currentRow.appendChild(td);
        dayCount++;
    }

    const week5Cells = new Array(7);
    for (let day = 1; day <= daysInMonth; day++) {
        const td = document.createElement('td');
        td.textContent = day;
        td.classList.add('calendar-day');
        const currentDate = new Date(year, month - 1, day);
        const dayOfWeek = currentDate.getDay();
        if (currentDate.toDateString() === new Date().toDateString()) {
            td.classList.add('today');
        }

        const dateKey = currentDate.getFullYear() + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentDate.getDate()).slice(-2);
        td.setAttribute('data-date', dateKey);
                
        const weekNumber = Math.ceil((firstDayOfWeek + day) / 7);
        if (weekNumber === 5) {
            week5Cells[dayOfWeek] = td;
        } else if (weekNumber === 6) {
            if (week5Cells[dayOfWeek]) {
                const previousDate = new Date(currentDate);
                previousDate.setDate(currentDate.getDate());
                week5Cells[dayOfWeek].textContent += ` / ${previousDate.getDate()}`;
            }
        }
                
        if (currentDate.getDay() === 0) {
            td.classList.add('sunday');
        } else if (currentDate.getDay() === 6) {
            td.classList.add('saturday');
        }

        const schedule = localStorage.getItem(dateKey);
        if (schedule) {
            const scheduleIndicator = document.createElement('span');
            scheduleIndicator.textContent = "⚠️";
            scheduleIndicator.style.display = "block";
            scheduleIndicator.style.cursor = "pointer";
            scheduleIndicator.addEventListener('click', function() {
                event.stopPropagation();
                alert(`日付 ${dateKey} の予定は次のとおりです：\n${schedule}`);
            });
            td.appendChild(scheduleIndicator);
        }

        td.addEventListener('click', function() {
            const date = this.getAttribute('data-date');
            let schedule = localStorage.getItem(date);
            schedule = prompt(`日付 ${date} の予定を入力してください。`, schedule || '');
            if (schedule !== null) {
                localStorage.setItem(date, schedule);
                alert(`日付 ${date} の予定は次のとおりです：\n${schedule}`);
                updateCalendar();
            }
        });

        currentRow.appendChild(td);
        dayCount++;
                
        if (dayCount % 7 === 0) {
            body.appendChild(currentRow);
            if (day !== daysInMonth) {
                currentRow = document.createElement('tr');
            }
        }
    }

    const remainingCells = 7 - ((firstDayOfWeek + daysInMonth) % 7);
    if (remainingCells < 7 && remainingCells > 0) {
        for (let i = 1; i <= remainingCells; i++) {
            const td = document.createElement('td');
            td.textContent = i;
            td.classList.add('other-month');
            currentRow.appendChild(td);
        }
        body.appendChild(currentRow);
    }
    body.appendChild(currentRow);
    table.appendChild(body);
    displayHolidays();
    return table;
}

function updateCalendar() {
    const calendarDiv = document.getElementById('calendar');
    const title = document.getElementById('calendar-title');
    title.textContent = `${currentYear}年${currentMonth}月`;
    calendarDiv.innerHTML = '';
    calendarDiv.appendChild(generateCalendar(currentYear, currentMonth));
    displayHolidays();
    hideSixthWeek();
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    updateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    }
    updateCalendar();
}

fetch('https://holidays-jp.github.io/api/v1/date.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        allHolidaysData = data;
        updateCalendar();
    })
    .catch(error => console.error('APIからデータを取得できませんでした：', error));

let allHolidaysData = {};
function displayHolidays() {
    const calendarCells = document.querySelectorAll('.calendar-day');
    console.log(calendarCells);
    calendarCells.forEach(cell => {
        const dateKey = cell.getAttribute('data-date');
        const holidayName = allHolidaysData[dateKey];
        if (holidayName) {
            cell.classList.add('holiday');
        }
    });
}

function hideSixthWeek() {
    const calendarBody = document.querySelector('#calendar tbody');
    const calendarRows = calendarBody.querySelectorAll('tr');
    if (calendarRows.length >= 6) {
        const sixthWeekRow = calendarRows[5];
        sixthWeekRow.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    updateCalendar();
});
