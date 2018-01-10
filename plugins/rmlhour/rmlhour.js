var superagent = require("superagent"),
    cheerio = require("cheerio")



var rmlhourTimeout

var initializermlhour = () => {
  var rmlhourUrl = 'https://legacy.lib.utexas.edu/about/hours/'  
  rmlhourRountine(rmlhourUrl)
  clearTimeout(rmlhourTimeout)
}

var rmlhourRountine = (url) => {
  var today = new Date()
  var week = today.getDay()
  var h = today.getHours()
  var m = today.getMinutes()
  var display = document.getElementById('rmlhourwrap')
  superagent.get(url).end(function(err,pres){
    if (err) {
      display.innerHTML = "rml hour failed."
    } else {
      var $ = cheerio.load(pres.text)
      var resultStr = $('.libcalTable td:contains(Physics Mathematics Astronomy Library)')
      for (var i = 0; i < week + 1; i++) {
        resultStr = resultStr.next()
      }
      resultStr = String(resultStr.html())
      var starthourDiv = document.getElementById('rmlstart')
      var endhourDiv = document.getElementById('rmlend')
      var startminDiv = document.getElementById('rmlstartmin')
      var endminDiv = document.getElementById('rmlendmin')
      var explainDiv = document.getElementById('rmlstatus')
      if (resultStr === 'closed <br>') {
        starthourDiv.innerHTML = 0
        endhourDiv.innerHTML = 0
        explainDiv.innerHTML = 'closed'
      } else {
        var timeArr = parsermlhour(resultStr)
        if (timeArr) {
          starthourDiv.innerHTML = timeArr[0].h
          endhourDiv.innerHTML = timeArr[1].h
          startminDiv.innerHTML = padZero(timeArr[0].m)
          endminDiv.innerHTML = padZero(timeArr[1].m)
          var status = (
            (h > timeArr[0].h || (h === timeArr[0].h && m >= timeArr[0].m))
            &&
            (h < timeArr[1].h || (h === timeArr[1].h && m < timeArr[1].m))
          )
          explainDiv.innerHTML = status ? 'open' : 'closed'
        } else {
          //console.log(hourArr)
          //display.innerHTML = 'Failed'
        }
      }
    }
    rmlhourTimeout = setTimeout(() => {rmlhourRountine(url)}, 5000)
  });
}

var parsermlhour = (timeText) => {
  var timearr = timeText.split('-')
  //console.log(hrarr)
  if (timearr.length === 2) {
    var start = {
      h: 0,
      m: 0
    }, end = {
      h: 0,
      m: 0
    }
    var startStr = timearr[0], endStr = timearr[1]

    startStr.trim()
    if (!startStr.includes(':')) {
      start.h = parseInt(startStr.slice(0, -2))
    } else {
      start.h = parseInt(startStr.slice(0, -5))
      start.m = parseInt(startStr.slice(-4, -2))
    }
    if (startStr !== '12pm' && startStr.charAt(startStr.length - 2) === 'p') {
      start.h += 12
    } 

    endStr.trim()
    if (endStr.charAt(endStr.length - 3) === 'b') {
      endStr = endStr.slice(0, -5)
    }
    if (!endStr.includes(':')) {
      end.h = parseInt(endStr.slice(0, -2))
    } else {
      end.h = parseInt(endStr.slice(0, -5))
      end.m = parseInt(endStr.slice(-4, -2))
    }
    if (endStr !== '12pm' && endStr.charAt(endStr.length - 2) === 'p') {
      end.h += 12
    }

    return [start, end]
  } else {
    return undefined
  }
}

var padZero = (i) => {
  if (i < 10)
    i = "0" + i
  return i
}

initializermlhour()