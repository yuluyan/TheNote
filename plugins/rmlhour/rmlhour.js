(function() {
  var rlmhour = {
    superagent: require("superagent"),
    cheerio: require("cheerio"),
    url: 'https://legacy.lib.utexas.edu/about/hours/',
    timer: null,
    updateInterval: 5000,
    routine: () => {
      var today = new Date()
      var week = today.getDay()
      var h = today.getHours()
      var m = today.getMinutes()
      var display = document.getElementById('rlmhourwrap')
      rlmhour.superagent.get(rlmhour.url).end(function(err,pres){
        if (err) {
          //display.innerHTML = "rlm hour failed."
          console.error('rlm hour failed.')
        } else {
          var $ = rlmhour.cheerio.load(pres.text)
          var resultStr = $('.libcalTable td:contains(Physics Mathematics Astronomy Library)')
          resultStr = resultStr.closest('tr').next().children().first()
          console.log(resultStr.html())
          for (var i = 0; i < week + 1; i++) {
            resultStr = resultStr.next()
          }
          resultStr = String(resultStr.html())
          var starthourDiv = document.getElementById('rlmstart')
          var endhourDiv = document.getElementById('rlmend')
          var startminDiv = document.getElementById('rlmstartmin')
          var endminDiv = document.getElementById('rlmendmin')
          var explainDiv = document.getElementById('rlmstatus')
          if (resultStr === 'closed <br>') {
            starthourDiv.innerHTML = 0
            endhourDiv.innerHTML = 0
            explainDiv.innerHTML = 'closed'
          } else {
            var timeArr = rlmhour.parserlmhour(resultStr)
            if (timeArr) {
              starthourDiv.innerHTML = timeArr[0].h
              endhourDiv.innerHTML = timeArr[1].h
              startminDiv.innerHTML = rlmhour.padZero(timeArr[0].m)
              endminDiv.innerHTML = rlmhour.padZero(timeArr[1].m)
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
        rlmhour.timer = setTimeout(rlmhour.rountine, rlmhour.updateInterval)
      });
    },
    parserlmhour: (timeText) => {
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
    },
    padZero: (i) => {
      if (i < 10)
        i = "0" + i
      return i
    },
    init: () => {
      clearTimeout(rlmhour.timer)
      rlmhour.routine()
    }
  }
  rlmhour.init()
})()