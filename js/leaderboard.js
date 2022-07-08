let topic_select = document.getElementById("topic-select");
let sort_select = document.getElementById("sort-select");
let leaderboard = document.getElementById("leaderboard");
let pagination = document.querySelector(".pagination");
let sort_record = {
    1: 'username',
    2: 'totalQuest',
    3: 'ratio',
    4: 'point',
    5: 'timestamp'
}
let sort_general = {
    1: 'username',
    2: 'numberOfAttempts',
    3: 'ratio',
    4: 'point'
}
let count_entries = new Vue({
    el: '#count-entries',
    data: {
        start: 0,
        showing: 0,
        total: 0,
    }
})
let page_size = 9;
let main_div = document.querySelector('.main-div')
let nav_bar = document.querySelector('.navbar');

document.addEventListener("DOMContentLoaded", function() {
    setBackgroundHeight();
    initializeRecord();
})


topic_select.onchange = function() {
    fetchRecords(this.options[this.selectedIndex].value);
}

sort_select.onchange = function() {
    if (currentMode == 0) {
        fetchRecords(topic_select.options[topic_select.selectedIndex].value);
    } else {
        fetchGeneral();
    }
}

pagination.addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target.hasAttribute("data-page") === true) {
        let start = e.target.dataset.page * page_size
        let end = start + page_size - 1;
        if (currentMode == 0) {
            fetchRecordsWithRange(topic_select.options[topic_select.selectedIndex].value, start, end);
        } else {
            fetchGeneralWithRange(start, end);
        }
    }
})

//Helper function for displaying number with padding 0
//Ref: https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function setBackgroundHeight() {
    height = window.innerHeight - nav_bar.offsetHeight + 25;
    main_div.style.setProperty("height", `${height}px`, "important");
    main_div.style.setProperty("margin-top", `${nav_bar.offsetHeight - 25}px`, "important");
    main_div.style.setProperty("padding-top", `40px`, "important");
}

function resetBackgroundHeight() {
    main_div.style.setProperty("height", "auto", "important");
    if (main_div.offsetHeight + nav_bar.offsetHeight - 25 >= window.innerHeight) {
        main_div.style.setProperty("height", "auto", "important");
    } else {
        setBackgroundHeight();
    }
}

function fetchTopic() {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://quizzyweb-3e807-default-rtdb.firebaseio.com/topics.json`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            let result = JSON.parse(this.responseText);
            let htmlResult = "";
            for (let i = 0; i < result.length - 1; i++)
            {
                htmlResult += `<option value=${i + 1}>${result[i + 1].name}</option>`
            }
            topic_select.innerHTML = htmlResult;
            fetchRecords(1);
        }
    }
    xhr.send();
}

function fetchRecords(topicId) {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://glimz-40650-default-rtdb.asia-southeast1.firebasedatabase.app/records.json?orderBy="topic_id"&startAt="${topicId}"&endAt="${topicId}"`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            let result = JSON.parse(this.responseText);
            let entries = Object.entries(result);
            records = [];
            for (let i = 0; i < entries.length; i++) {
                let tmpObj = JSON.parse(JSON.stringify(entries[i][1]));
                Object.assign(tmpObj, {timestamp: parseInt(entries[i][0])})
                records.push(tmpObj)
            }
            sort_element = sort_record[sort_select.options[sort_select.selectedIndex].value]
            records.sort((a,b) => (a[sort_element] < b[sort_element]) ? 1 : ((b[sort_element] < a[sort_element]) ? -1 : 0))
            printResultRecords(records, 0, page_size - 1);
            updatePagination(records.length, 1);
        }
    }
    xhr.send();
}

function fetchRecordsWithRange(topicId, start, end) {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://glimz-40650-default-rtdb.asia-southeast1.firebasedatabase.app/records.json?orderBy="topic_id"&startAt="${topicId}"&endAt="${topicId}"`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            let result = JSON.parse(this.responseText);
            let entries = Object.entries(result);
            records = [];
            for (let i = 0; i < entries.length; i++) {
                let tmpObj = JSON.parse(JSON.stringify(entries[i][1]));
                Object.assign(tmpObj, {timestamp: parseInt(entries[i][0])})
                records.push(tmpObj)
            }
            sort_element = sort_record[sort_select.options[sort_select.selectedIndex].value]
            records.sort((a,b) => (a[sort_element] < b[sort_element]) ? 1 : ((b[sort_element] < a[sort_element]) ? -1 : 0))
            printResultRecords(records, start, end);
            updatePagination(records.length, Math.floor(start / page_size) + 1);
        }
    }
    xhr.send();
}

function updatePagination(length, current) {
    let min = 1;
    let max = 0;
    if (currentMode == 0) {
        max = Math.ceil(records.length / page_size);
    } else {
        max = Math.ceil(players.length / page_size);
    }
    html = "";
    for (let i = min; i <= max; i++) {
        if (i == current) {
            html += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
        } else {
            html += `<li class="page-item"><a class="page-link" href="#" data-page="${i - 1}">${i}</a></li>`
        }
    }
    pagination.innerHTML = html;
    resetBackgroundHeight();
}

function printResultRecords(records, start, end) {
    let rows = leaderboard.querySelectorAll("tbody tr");
    rows.forEach((row) => {
        row.remove();
    })
    let max_end = Math.min(end, records.length - 1);
    for (let i = start; i <= max_end; i++) {
        let newrow = leaderboard.querySelector("tbody").insertRow();
        let d = new Date(records[i]['timestamp'])
        let html = `
            <td>${records[i]['username']}</td>
            <td>${records[i]['totalQuest']}</td>
            <td>${(records[i]['ratio'] * 100).toFixed(0)}% (${records[i]['correctQuest']} câu)</td>
            <td>${records[i]['point']}</td>
            <td>${d.getDate().pad(2)}/${(d.getMonth()+ 1).pad(2)}/${d.getFullYear()} 
            ${d.getHours().pad(2)}:${d.getMinutes().pad(2)}:${d.getSeconds().pad(2)}</td>
        `
        newrow.innerHTML = html;
    }
    if (records.length == 0) {
        count_entries.start = 0;
        count_entries.showing = 0;
    } else {
        count_entries.start = start + 1;
        count_entries.showing = max_end + 1;
    }
    count_entries.total = records.length;
}

//Organizing two types of leaderboard
let currentMode = 0; //Record by default
let btn_record = document.getElementById("btn-record")
let btn_general = document.getElementById("btn-general");

btn_record.addEventListener("click", function() {
    currentMode = 0;
    btn_general.disabled = false;
    btn_record.disabled = true;
    initializeRecord();
})

btn_general.addEventListener("click", function() {
    currentMode = 1;
    btn_general.disabled = true;
    btn_record.disabled = false;
    initializeGeneral();
})

function initializeRecord() {
    html_sort_select = `
        <option value="1">Username</option>
        <option value="2">Number of questions</option>
        <option value="3">Correct ratio (%)</option>
        <option value="4">Point</option>
        <option value="5">Time</option>
    `;
    leaderboard_header_html = `
        <th>Username</th>
        <th>Number of questions</th>
        <th>Correct ratio (%)</th>
        <th>Point</th>
        <th>Time</th>
    `
    sort_select.innerHTML = html_sort_select;
    leaderboard.querySelector("thead tr").innerHTML = leaderboard_header_html;
    document.getElementById("topic-group").style.setProperty("opacity", "1", "important");
    fetchTopic();
}  

function initializeGeneral() {
    html_sort_select = `
        <option value="1">Username</option>
        <option value="2">Number of games</option>
        <option value="3">Average correct ratio (%)</option>
        <option value="4">Total points</option>
    `;
    leaderboard_header_html = `
        <th>Username</th>
        <th>Number of games</th>
        <th>Average correct ratio (%)</th>
        <th>Total points</th>
    `
    sort_select.innerHTML = html_sort_select;
    leaderboard.querySelector("thead tr").innerHTML = leaderboard_header_html;
    document.getElementById("topic-group").style.setProperty("opacity", "0", "important");
    fetchGeneral();
}

function findObjectInArray(array, username) {
    for (let i = 0; i < array.length; i++) {
        if (array[i]["username"] == username) {
            return i;
        }
    }
    return -1;
}

function fetchGeneral() {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://glimz-40650-default-rtdb.asia-southeast1.firebasedatabase.app/records.json?`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            let result = JSON.parse(this.responseText);
            let entries = Object.entries(result);
            players = [];
            for (let i = 0; i < entries.length; i++) {
                let tmpObj = JSON.parse(JSON.stringify(entries[i][1]));
                Object.assign(tmpObj, {timestamp: parseInt(entries[i][0])})
                let find_index = findObjectInArray(players, entries[i][1]["username"]);
                if (find_index == -1) {
                    let newObj = {};
                    Object.assign(newObj, {
                        username: entries[i][1]["username"],
                        numberOfAttempts: 1,
                        ratio: entries[i][1]["ratio"],
                        point: entries[i][1]["point"]
                    });
                    players.push(newObj);
                } else {
                    Object.assign(players[find_index], {
                        numberOfAttempts: players[find_index]["numberOfAttempts"] + 1,
                        ratio: (players[find_index]["ratio"] * players[find_index]["numberOfAttempts"] + entries[i][1]["ratio"]) / (players[find_index]["numberOfAttempts"] + 1),
                        point: players[find_index]["point"] + entries[i][1]["point"]
                    })
                }
            }
            sort_element = sort_general[sort_select.options[sort_select.selectedIndex].value]
            players.sort((a,b) => (a[sort_element] < b[sort_element]) ? 1 : ((b[sort_element] < a[sort_element]) ? -1 : 0))
            printResultGeneral(players, 0, page_size - 1);
            updatePagination(players.length, 1);
        }
    }
    xhr.send();
}

function fetchGeneralWithRange(start, end) {
    let xhr = new XMLHttpRequest();
    xhr.open(
        "GET",
        `https://glimz-40650-default-rtdb.asia-southeast1.firebasedatabase.app/records.json?`,
        true
    );
    xhr.onreadystatechange = function() {
        if (this.status === 200 && this.readyState === 4) {
            let result = JSON.parse(this.responseText);
            let entries = Object.entries(result);
            players = [];
            for (let i = 0; i < entries.length; i++) {
                let tmpObj = JSON.parse(JSON.stringify(entries[i][1]));
                Object.assign(tmpObj, {timestamp: parseInt(entries[i][0])})
                let find_index = findObjectInArray(players, entries[i][1]["username"]);
                if (find_index == -1) {
                    let newObj = {};
                    Object.assign(newObj, {
                        username: entries[i][1]["username"],
                        numberOfAttempts: 1,
                        ratio: entries[i][1]["ratio"],
                        point: entries[i][1]["point"]
                    });
                    players.push(newObj);
                } else {
                    Object.assign(players[find_index], {
                        numberOfAttempts: players[find_index]["numberOfAttempts"] + 1,
                        ratio: (players[find_index]["ratio"] * players[find_index]["numberOfAttempts"] + entries[i][1]["ratio"]) / (players[find_index]["numberOfAttempts"] + 1),
                        point: players[find_index]["point"] + entries[i][1]["point"]
                    })
                }
            }
            sort_element = sort_general[sort_select.options[sort_select.selectedIndex].value]
            players.sort((a,b) => (a[sort_element] < b[sort_element]) ? 1 : ((b[sort_element] < a[sort_element]) ? -1 : 0))
            printResultGeneral(players, start, end);
            updatePagination(players.length, Math.floor(start / page_size) + 1);
        }
    }
    xhr.send();
}

function printResultGeneral(players, start, end) {
    let rows = leaderboard.querySelectorAll("tbody tr");
    rows.forEach((row) => {
        row.remove();
    })
    let max_end = Math.min(end, players.length - 1);
    for (let i = start; i <= max_end; i++) {
        let newrow = leaderboard.querySelector("tbody").insertRow();
        let html = `
            <td>${players[i]['username']}</td>
            <td>${players[i]['numberOfAttempts']}</td>
            <td>${(players[i]['ratio'] * 100).toFixed(0)}%</td>
            <td>${players[i]['point']}</td></td>
        `
        newrow.innerHTML = html;
    }
    if (players.length == 0) {
        count_entries.start = 0;
        count_entries.showing = 0;
    } else {
        count_entries.start = start + 1;
        count_entries.showing = max_end + 1;
    }
    count_entries.total = players.length;
}
