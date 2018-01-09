var superagent = require("superagent"),
    cheerio = require("cheerio")


var display = document.getElementById('hourspider')

var gymhourTimeout

var initializeGymhour = () => {
  var gymhourUrl = 'https://www.utrecsports.org/hours'  
  gymhourRountine(gymhourUrl)
  clearTimeout(gymhourRountine)
}



var gymhourRountine = (url) => {
  var today = new Date()
  var week = today.getDay()
  var h = today.getHours()
  var m = today.getMinutes()
  superagent.get(url).end(function(err,pres){
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
    var hourArr = parseGymhour(String(resultStr.html()))
    if (hourArr) {
      display.innerHTML = hourArr[0] + '--' + hourArr[1]
    } else {
      display.innerHTML = 'Failed'
    }


    gymhourTimeout = setTimeout(gymhourRountine, 1000)
  });
}

var parseGymhour = (hrtext) => {
  console.log(hrtext)
  var hrarr = hrtext.split('-')
  if (hrarr.length === 2) {
    var start, end
    var startStr = hrarr[0], endStr = hrarr[1]
    startStr.trim()
    if (startStr === 'Noon') {
      start = 12
    } else {
      start = parseInt(start.slice(0, -1))
    }
    if (startStr.charAt(startStr.length) === 'p') {
      start += 12
    }
    endStr.trim()
    if (endStr === 'Noon') {
      end = 12
    } else {
      end = parseInt(end.slice(0, -1))
    }
    if (endStr.charAt(endStr.length) === 'p') {
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