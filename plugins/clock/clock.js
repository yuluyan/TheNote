var clockTimeout

var initializeClocks = () => {
  var clocks = [
    {"label": "Austin", "timezone": -6, "local": true},
    {"label": "China", "timezone": 8, "local": false},
    {"label": "Los Angeles", "timezone": -8, "local": false},
    {"label": "New York", "timezone": -5, "local": false}
  ]
  setupClocks(clocks)
  clearTimeout(clockTimeout)
  startClock()
}

var setupClocks = (clocks) => {
  if (clocks.length < 1) return false
  var localzone = clocks[0].timezone
  for (i = 0; i < clocks.length; i++) {
    if (clocks[i].local) {
      localzone = clocks[i].timezone
      break
    }
  }
  for (i = 0; i < clocks.length; i++) {
    generateClock(clocks[i], localzone)
  }
}

var generateClock = (clock, localzone) => {
  var grid = document.getElementById('clockgrid')
  var floatclear = document.getElementById('floatclear')
  var panel = document.createElement('div')
  panel.className = 'clockpanel'
  var label = document.createElement('div')
  label.className = 'clocklabel'
  label.innerHTML = clock.label
  var clocknum = document.createElement('div')
  clocknum.className = 'clock'
  clocknum.dataset.timezone = clock.timezone - localzone
  panel.appendChild(label)
  panel.appendChild(clocknum)
  grid.insertBefore(panel, floatclear)
}

var startClock = () => {
  var today = new Date()
  var h = today.getHours()
  var m = today.getMinutes()
  var s = today.getSeconds()
  renderClock(h, m, s)
  clockTimeout = setTimeout(startClock, 100)
}

var padZero = (i) => {
  if (i < 10) {
    i = "0" + i
  }
  return i
}

var convertTimezone = (h, timezone) => {
  var hh = h + timezone
  var ret = {
    h: hh,
    dayoffset: 0
  }
  if (hh >= 24) {
    ret.h = hh - 24
    ret.dayoffset = 1
  }
  if (hh < 0) {
    ret.h = hh + 24
    ret.dayoffset = -1
  }
  return ret
}

var renderClock = (h, m, s) => {
  var clocks = document.getElementsByClassName('clock')
  for (i = 0; i < clocks.length; i++) {
    var timezone = parseInt(clocks[i].getAttribute('data-timezone'))
    clocks[i].innerHTML = padZero(convertTimezone(h, timezone).h) + ":" + padZero(m) + ":" + padZero(s)
  }
}

initializeClocks()