var superagent = require("superagent"),
    cheerio = require("cheerio")



var gymhourTimeout

var initializeGymhour = () => {
  var gymhourUrl = 'https://www.utrecsports.org/hours'  
  gymhourRountine(gymhourUrl)
  clearTimeout(gymhourTimeout)
}



var gymhourRountine = (url) => {
  var today = new Date()
  var week = today.getDay()
  var h = today.getHours()
  var m = today.getMinutes()
  var display = document.getElementById('gymhourwrap')
  superagent.get(url).end(function(err,pres){
    if (err) {
      display.innerHTML = "Gym hour failed."
    } else {
      var $ = cheerio.load(pres.text)
      var resultStr
      switch (week) {
        case 0: //sunday
          resultStr = $('#large-only td:contains(Gre)').next().next().next().next()
          break
        case 6: //friday
          resultStr = $('#large-only td:contains(Gre)').next().next().next()
          break
        case 5: //friday
          resultStr = $('#large-only td:contains(Gre)').next().next()
          break
        default:
          resultStr = $('#large-only td:contains(Gre)').next()
          break
      }
      var startDiv = document.getElementById('gymstart')
      var endDiv = document.getElementById('gymend')
      var explainDiv = document.getElementById('gymstatus')
      var hourArr = parseGymhour(String(resultStr.html()))
      if (hourArr) {
        startDiv.innerHTML = hourArr[0]
        endDiv.innerHTML = hourArr[1]
        explainDiv.innerHTML = (h >= hourArr[0] && h < hourArr[1]) ? 'open' : 'closed'
      } else {
        console.log(hourArr)
        //display.innerHTML = 'Failed'
      }
    }
    gymhourTimeout = setTimeout(() => {gymhourRountine(url)}, 5000)
  });
}

var parseGymhour = (hrtext) => {
  var hrarr = hrtext.split('-')
  if (hrarr.length === 2) {
    var start, end
    var startStr = hrarr[0], endStr = hrarr[1]
    startStr.trim()
    if (startStr === 'Noon') {
      start = 12
    } else {
      start = parseInt(startStr.slice(0, -1))
    }
    if (startStr.charAt(startStr.length - 1) === 'p') {
      start += 12
    }
    endStr.trim()
    if (endStr === 'Noon') {
      end = 12
    } else {
      end = parseInt(endStr.slice(0, -1))
    }
    if (endStr.charAt(endStr.length - 1) === 'p') {
      end += 12
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



initializeGymhour()