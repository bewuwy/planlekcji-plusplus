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

// plan functions

function httpGet(theUrl)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "https://cors.bridged.cc/" + theUrl, false );
  xmlHttp.send( null );
  return [xmlHttp.responseText, xmlHttp.getResponseHeader("x-final-url")];
}

function start() {
  var classId = getCookie("classId");

  var baseUrl = httpGet("http://www.batory.edu.pl/plan/index.php")[1];
  baseUrl = baseUrl.split("/").splice(2, 3);
  baseUrl.splice(0, 0, "http:/");

  if (classId == null || classId == "") {
    listUrl = baseUrl;
    listUrl.push("lista.html");
    listUrl = listUrl.join("/");

    var classList = httpGet(listUrl)[0].split("href=\"plany/o");
    classList.splice(0, 1);

    var chooseClassDiv = document.getElementById("chooseClass");
    var a;
    for (var i = 0; i < classList.length; i++) {
      classList[i] = classList[i].split("</")[0].split("\" target=\"plan\">");
      classList[i][0] = "o" + classList[i][0];

      a = document.createElement("a");
      a.innerText = classList[i][1];
      a.id = classList[i][0]
      a.onclick = function() {
        setCookie("classId", this.id, 310);
        chooseClassDiv.style.display = "none";
        start();
      };
      chooseClassDiv.appendChild(a);
      chooseClassDiv.appendChild(document.createElement("br"));
    }
    chooseClassDiv.style.display = "block";
  }
  else {
    var src = baseUrl.join("/") + "/plany/" + classId;
    console.log(src);

    document.getElementById("frame").src = src;
    document.getElementById("frame").style.display = "block";
    document.getElementById("wrap").style.pointerEvents = "all";
    document.getElementById("resetClass").style.display = "block";
  }
}
