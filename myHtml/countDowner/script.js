// script.js

//获取页面元素
const progressBar = document.querySelector('.progress-bar');
const currentTimeMarker = document.querySelector('.current-time-marker');
const eventMarker = document.querySelector('.event-marker');
const currentTimeDisplay = document.getElementById('currentTimeDisplay');
const eventsTitle = document.querySelector('.events-title');

//设置开始时间和结束时间
let startTime = new Date();
let endTime = new Date(startTime);
let duration = 0;
startTime.setHours(15, 0, 0); // 设置开始时间为上午0点
endTime.setHours(23, 0, 0); // 设置结束时间为下午23点

//设置事件列表
let events = [
    {name: "事件1", startTime: startTime, endTime: endTime},
    // 添加更多事件...
];

//保存事件列表
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

//加载事件列表
function loadEvents() {
    const storedEvents = JSON.parse(localStorage.getItem('events'));
    if (storedEvents) {
        events = storedEvents;
        refreshEventTime();
        // 事件被存储到本地存储中会被自动转换为字符串，所以我们需要将其转换为Date对象
        events.forEach(i => {
            i.startTime = new Date(i.startTime);
            i.endTime = new Date(i.endTime);
        });
        //debug
        console.log("loadEvents " + events.length);
    }
}

//删除事件
function deleteEvent(event) {
    const index = events.indexOf(event);
    if (index > -1) {
        events.splice(index, 1);
    }
    refreshEventTime();
    saveEvents();
}

//清空事件
function clearEvents() {
    events = [];
    refreshEventTime();
    saveEvents();
}

//监听 clearEvents 按钮，点击时调用 clearEvents 函数
document.getElementById('clearEvents').addEventListener('click', clearEvents);

// 初始化进度条宽度
progressBar.style.width = '100%';

// 更新当前时间和事件标记
function updateTime() {
    const now = new Date();
    //log
    //console.log(now.toLocaleTimeString() + "and " + startTime.toLocaleTimeString() + "to " + endTime.toLocaleTimeString() + " " + duration);
    if (now >= startTime && now <= endTime) {
        const progress = 100 - (now - startTime) / (endTime - startTime) * 100;
        currentTimeMarker.style.width = `${progress}%`;
        currentTimeDisplay.textContent = now.toLocaleTimeString();

        // 更新事件标记
        updateEventTime();
    } else {
        currentTimeDisplay.textContent = "Time out of range.\n" ;
        //debug
        //console.log(now.toLocaleTimeString() + "is not in " + startTime.toLocaleTimeString() + "to " + endTime.toLocaleTimeString() + " " + duration);
    }
}

// 更新事件标记
function updateEventTime() {
    const now = new Date();
    //debug
    //console.log("updateEventTime");

    //将所有的eventMarker遍历
    document.querySelectorAll('.event-marker').forEach(i => {
        // 如果本来就是超出范围的事件，则不需要更改颜色和状态
        if (i.classList.contains('out-of-range')) return;

        // 只在需要更改的时候更改颜色和状态

        // 如果事件的开始时间在当前时间范围内，则将其设置为活动事件，并将其颜色设置为绿色
        if (i.startTime <= now && i.endTime >= now && i.style.backgroundColor != 'green') {
            i.classList.add('active');
            //设置为半透明的绿色
            i.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
        }
        // 如果事件的结束时间早于当前时间，则将其设置为已结束事件，并将其颜色设置为灰色
        if (i.endTime < now && i.style.backgroundColor != '#dc6da3') {
            i.classList.add('ended');
            i.style.backgroundColor = '#dc6da3';    
        }
    });
}


// 刷新事件标记，删除所有事件标记并重新添加
function refreshEventTime() {
    // 清除所有的事件标记
    if (document.getElementsByClassName('event-marker') != null)
    {
        const eventMarkers = document.getElementsByClassName('event-marker');
        while (eventMarkers.length > 0) {
            eventMarkers[0].parentNode.removeChild(eventMarkers[0]);
        }
    }

    // 为每个事件添加一个事件标记,并设置它的位置
    events.forEach(i => {
        //debug
        console.log("🔵" + i.name + " " + i.startTime.toString() + " " + i.endTime.toString());

        const eventMarker = document.createElement('div');
        eventMarker.className = 'event-marker';

        //添加title属性，但是不显示
        eventMarker.title = i.name;
        //添加 startTime 和 endTime 属性，用于编辑事件
        eventMarker.startTime = i.startTime;
        eventMarker.endTime = i.endTime;

        //如果事件的开始事件超出了显示时间范围，则将其在进度条的外部显示
        //如果 事件的结束时间早于进度条显示的startTime，则将其在进度条的左侧外部显示
        if (i.endTime < startTime) {
            //debug
            console.log("🔴" + i.name + ".endTime < startTime  " + i.endTime + " " + startTime);
            eventMarker.style.left = '-10px';
            eventMarker.style.width = `15px`;

            //状态设置为 out of range
            eventMarker.classList.add('out-of-range');
        }
        //如果 事件的开始时间晚于进度条显示的endTime，则将其在进度条的右侧外部显示
        else if (i.startTime > endTime) {
            //debug
            console.log("🔴"+i.name + ".startTime > endTime  " + i.startTime + " " + endTime);
            eventMarker.style.right = '-10px';
            eventMarker.style.width = `15px`;
            eventMarker.classList.add('out-of-range');
        }
        else{
            //debug
            console.log("🟢"+i.name + ".startTime < endTime  " + i.startTime + " " + endTime);
            eventMarker.style.left = `${(i.startTime - startTime) / duration * 100}%`;
            eventMarker.style.width = `${(i.endTime - i.startTime) / duration * 100}%`;
        }


        //将事件标记添加到进度条中
        progressBar.appendChild(eventMarker);
        updateEventTime();
    });
    
    
    //清空eventsTitle的子对象
    eventsTitle.innerHTML = '';

    //为每个事件添加一个标题（实际上是按钮）
    document.querySelectorAll('.event-marker').forEach(i => {
        //在外部添加一个标题，和ecentmarker对齐
        const title = document.createElement('button');
        title.className = 'eventTitle';
        title.textContent = i.title;
        //i为eventsTitle的子对象，但是与其对齐
        eventsTitle.appendChild(title);
        //将文字与eventmarker对齐
        title.style.left = `${i.getBoundingClientRect().left}px`;
    });
}

//监听 setTimerRange 按钮，点击时调用 setTimerRange 函数
document.getElementById('setTimerRange').addEventListener('click', setTimerRange);
    
function setTimerRange() {
    //debug
    
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    
    const startTimeStr = startTimeInput.value;
    const endTimeStr = endTimeInput.value;

    console.log("setTimerRange" + startTimeStr + " " + endTimeStr);
    // 将输入的时间字符串转换为Date对象

    startTime.setHours(...startTimeStr.split(':').map(Number), 0);
    endTime.setHours(...endTimeStr.split(':').map(Number), 0);

    if (endTime <= startTime) {
        alert("End time must be after start time.");
        return;
    }

    // 重置时间和进度条
    duration = endTime - startTime;
    progressBar.style.width = '100%';
    currentTimeMarker.style.width = '0%';
    eventMarker.style.width = '0%';
    eventMarker.style.left = '0%';

    refreshEventTime();
}

//监听 addEvent 按钮，点击时调用 addEvent 函数
document.getElementById('addEvent').addEventListener('click', addEvent);

function addEvent() {
    const eventNameInput = document.getElementById('eventNameInput');
    const eventStartTimeInput = document.getElementById('eventStartTimeInput');
    const eventEndTimeInput = document.getElementById('eventEndTimeInput');

    const eventName = eventNameInput.value;
    const eventStartTimeStr = eventStartTimeInput.value;
    const eventEndTimeStr = eventEndTimeInput.value;

    //debug
    console.log("addEvent" + eventName + " " + eventStartTimeStr + " " + eventEndTimeStr);
    // 将输入的时间字符串转换为Date对象
    const eventStartTime = new Date(startTime);
    const eventEndTime = new Date(startTime);
    eventStartTime.setHours(...eventStartTimeStr.split(':').map(Number), 0);
    eventEndTime.setHours(...eventEndTimeStr.split(':').map(Number), 0);

    if (eventEndTime <= eventStartTime) {
        alert("Event end time must be after start time.");
        return;
    }

    // 将新事件添加到事件列表中
    events.push({name: eventName, startTime: eventStartTime, endTime: eventEndTime});

    // 重置事件输入框
    eventNameInput.value = '';
    eventStartTimeInput.value = '';
    eventEndTimeInput.value = '';

    // 更新事件标记
    refreshEventTime();
    // 保存事件列表
    saveEvents();
}


function editEvent() {
    //debug
    console.log("editEvent");
    // 将新事件添加到事件列表中
    //events.push({name: eventName, startTime: eventStartTime, endTime: eventEndTime});

    // 重置事件输入框
    //eventNameInput.value = '';
    //eventStartTimeInput.value = '';
    //eventEndTimeInput.value = '';

    // 更新事件标记
    refreshEventTime();
    // 保存事件列表
    saveEvents();
}

loadEvents();
setTimerRange();


setInterval(updateTime, 1000); // 每秒更新一次


