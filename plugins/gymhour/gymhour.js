(function() {
  var gymhour = {
    superagent: require("superagent"),
    cheerio: require("cheerio"),
    url: 'https://www.utrecsports.org/hours',
    timer: null,
    updateInterval: 5000,
    routine: () => {
      var today = new Date()
      var week = today.getDay()
      var h = today.getHours()
      var m = today.getMinutes()
      var display = document.getElementById('gymhourwrap')
      gymhour.superagent.get(gymhour.url).end(function(err, res){
        if (err) {
          //display.innerHTML = "Gym hour failed."
          console.error('gym hour failed.')
        } else {
          var $ = gymhour.cheerio.load(res.text)
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
          var hourArr = gymhour.parseGymhour(String(resultStr.html()))
          if (hourArr) {
            startDiv.innerHTML = hourArr[0]
            endDiv.innerHTML = hourArr[1]
            explainDiv.innerHTML = (h >= hourArr[0] && h < hourArr[1]) ? 'open' : 'closed'
          } else {
            //console.log(hourArr)
            //display.innerHTML = 'Failed'
          }
        }
        gymhour.timer = setTimeout(gymhour.routine, gymhour.updateInterval)
      });
    },
    parseGymhour: (hrtext) => {
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
        if (endStr.charAt(endStr.length - 1) === 'a' && end === 1) {
          end += 24
        }
        return [start, end]
      } else {
        return undefined
      }
    },
    init: () => {
      clearTimeout(gymhour.timer)
      gymhour.routine()
    }
  }
  gymhour.init()
})()