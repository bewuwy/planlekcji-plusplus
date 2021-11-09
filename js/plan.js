// plan.js

// cookies functions
function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function toggleCookie(name, days) {
  if (getCookie(name) == null) {
    setCookie(name, 1, days);
  }
  else {
    setCookie(name, -getCookie(name), days);
  }
}

// web storage
function savePlan(plan, planTitle, planDate, planUrl) {
  storage = window.localStorage;

  storage.setItem("plan", plan);
  storage.setItem("planTitle", planTitle);
  storage.setItem("planDate", planDate);
  storage.setItem("planUrl", planUrl);
}

function loadSavedPlan() {
  storage = window.localStorage;

  plan = storage.getItem("plan");

  if (plan != null) {
    planTitle = storage.getItem("planTitle");
    planDate = storage.getItem("planDate");
    planUrl = storage.getItem("planUrl");

    document.getElementById("plan").innerHTML = plan;
    document.getElementById("planTitle").innerHTML = planTitle;
    document.getElementById("genDate").innerHTML = "created " + planDate;
    console.log("loaded plan from cache");

    fitPlan();
    fixOutsideLinks(planUrl);
    dailyMode();

    showPlan();
  }
}

function clearSavedPlan() {
  storage = window.localStorage;
  storage.clear();
}

// plan functions
function httpGet(theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "https://cors-bewu.herokuapp.com/" + theUrl, false );
  xmlHttp.send( null );
  return [xmlHttp.responseText, xmlHttp.getResponseHeader("x-final-url")];
}

function fixOutsideLinks(baseUrl) {
  var teacherList = document.getElementsByClassName("n");
  var classRoomList = document.getElementsByClassName("s");
  for (var i = 0; i < teacherList.length; i++) {
    teacherList[i].href = baseUrl + "/plany" + teacherList[i].pathname;
    teacherList[i].target = "_blank";
  }
  for (var i = 0; i < classRoomList.length; i++) {
    classRoomList[i].href = baseUrl + "/plany" + classRoomList[i].pathname;
    classRoomList[i].target = "_blank";
  }
}

function showPlan() {
  document.getElementById("planDiv").style.display = "block";
  document.getElementById("planLinks").style.display = "block";
}

function start(planUrl) {
  var classId = getCookie("classId");

  var baseUrl = httpGet(planUrl)[1];
  baseUrl = baseUrl.split("/").splice(2, 3);
  baseUrl.splice(0, 0, "http:/");

  if (classId == null || classId == "") {
    listUrl = baseUrl;
    listUrl.push("lista.html");
    listUrl = listUrl.join("/");
    console.log(listUrl);

    var classList = httpGet(listUrl)[0].split("href=\"plany/o");
    classList.splice(0, 1);

    var chooseClassDiv = document.getElementById("classList");
    chooseClassDiv.innerHTML = "";
    var a;
    for (var i = 0; i < classList.length; i++) {
      classList[i] = classList[i].split("</")[0].split("\" target=\"plan\">");
      classList[i][0] = "o" + classList[i][0];

      a = document.createElement("a");
      a.innerText = classList[i][1];
      a.id = classList[i][0]
      a.onclick = function() {
        setCookie("classId", this.id, 310);
        window.location.reload(true);
      };
      chooseClassDiv.appendChild(a);
      chooseClassDiv.appendChild(document.createElement("br"));
    }
    document.getElementById("chooseClass").style.display = "block";
  }
  else {
    var src = baseUrl.join("/") + "/plany/" + classId;
    console.log(src);
    var planRequest = httpGet(src)[0];
    plan = planRequest.split('tabela">')[1].split("</table>")[0];
    title = planRequest.split('tytulnapis">')[1].split("</span>")[0];
    genDate = planRequest.split('wygenerowano ')[1].split('<br>')[0];

    savePlan(plan, title, genDate, baseUrl.join("/"));
    document.getElementById("plan").innerHTML = plan;
    document.getElementById("planTitle").innerHTML = title;
    document.getElementById("genDate").innerHTML = "created " + genDate;

    fixOutsideLinks(baseUrl.join("/"));
    dailyMode();
    fitPlan();
  }
}

// fitting/style functions

// dark mode
function checkDarkMode() {
  var dark = getCookie("dark");

  if (dark == 1 || dark == null) {
    $('body').addClass("dark");
    setCookie("dark", 1, 365);
    $("#darkModeBtn").text("lightmode");
  }
  else {
    $('body').removeClass("dark");
    setCookie("dark", 0, 365);
    $("#darkModeBtn").text("darkmode");
  }
}

function toggleDarkMode() {
  var dark = getCookie("dark");

  if (dark == 0) {
    $('body').addClass("dark");
    setCookie("dark", 1, 365);
    $("#darkModeBtn").text("lightmode");
  }
  else {
    $('body').removeClass("dark");
    setCookie("dark", 0, 365);
    $("#darkModeBtn").text("darkmode");
  }
}

// daily view
function dailyMode() {
  daily = getCookie("daily");
  var dailyLink = document.getElementById("dailyLink");
  if (daily == 1) {
    var d = new Date()
    var day = d.getDay() - 1;
    var weekDays = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    if (day > 4 || day < 0) {
      day = 0;
    }
    day = weekDays[day];

    var rows = document.getElementById("plan").rows;
    for (var i = 0; i < rows[0].cells.length; i++) {
      if (i > 1 && rows[0].cells[i].innerHTML != day) {
        for (var j = 0; j < rows.length; j++) {
            rows[j].deleteCell(i);
        }
        rows = document.getElementById("plan").rows;
        console.log(i);
        i = 0;
      }
    }
    dailyLink.innerHTML = "week mode";
  }
  else {
    dailyLink.innerHTML = "daily mode";
  }
}

// autofit plan
function fitPlan() {
  var WidthDiv = $("#planDiv").width();
  var WidthTable = $("#plan").width();
  var HeightTable = $("#plan").height();

  if (WidthDiv > WidthTable) {
      var FontSizeTable = parseInt($("#plan").css("font-size"), 10);
      while (WidthDiv > WidthTable && HeightTable < $(window).height() && FontSizeTable < 20) {
          FontSizeTable++;
          $("#plan").css("font-size", FontSizeTable);
          WidthTable = $("#plan").width();
          HeightTable = $("#plan").height();
      }
  }
  else if (WidthDiv < WidthTable || HeightTable > $(window).height()) {
      var FontSizeTable = parseInt($("#plan").css("font-size"), 10);
      while ((WidthDiv < WidthTable || HeightTable > $(window).height()) && FontSizeTable > 5) {
          FontSizeTable--;
          $("#plan").css("font-size", FontSizeTable);
          WidthTable = $("#plan").width();
          HeightTable = $("#plan").height();
      }
  }

  var hoursList = document.getElementsByClassName("g");
  if (WidthDiv < 800) {
    for (var i = 0; i < hoursList.length; i++) {
      hoursList[i].innerHTML = hoursList[i].innerHTML.replace("-", "-<br>")
    }
  }
}
