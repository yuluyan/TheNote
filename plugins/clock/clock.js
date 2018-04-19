(function() {
  var clock = {
    clocks: [
      {"label": "Austin", "timezone": -6, "local": true},
      {"label": "China", "timezone": 7, "local": false},
      {"label": "Los Angeles", "timezone": -8, "local": false},
      {"label": "New York", "timezone": -5, "local": false}
    ],
    updateInterval: 100,
    timer: null,
    clearTimer: () => {
      clearTimeout(clock.timer)
    },
    generateClock: (clock, localzone) => {
      var grid = document.getElementById('clockgrid')
      var floatclear = document.getElementById('floatclear')
      var panel = document.createElement('div')
      panel.className = 'clockpanel'
      var label = document.createElement('div')
      label.className = 'clocklabel'
      label.innerHTML = clock.label + ' <span></span>'
      var clocknum = document.createElement('div')
      clocknum.className = 'clock'
      clocknum.dataset.timezone = clock.timezone - localzone
      panel.appendChild(label)
      panel.appendChild(clocknum)
      grid.insertBefore(panel, floatclear)
    },
    setupClocks: (clocks) => {
      if (clocks.length < 1) return false
      var localzone = clocks[0].timezone
      for (i = 0; i < clocks.length; i++) {
        if (clocks[i].local) {
          localzone = clocks[i].timezone
          break
        }
      }
      for (i = 0; i < clocks.length; i++) {
        clock.generateClock(clocks[i], localzone)
      }
    },
    padZero: (i) => {
      if (i < 10) i = "0" + i
      return i
    },
    convertTimezone: (h, timezone) => {
      var hh = h + timezone
      var ret = {
        h: hh,
        dayoffset: 0
      }
      if (hh >= 24) {
        ret.h = hh - 24
        ret.dayoffset = '+1'
      }
      if (hh < 0) {
        ret.h = hh + 24
        ret.dayoffset = '-1'
      }
      return ret
    },
    renderClock: (h, m, s) => {
      var clocks = document.getElementsByClassName('clock')
      for (i = 0; i < clocks.length; i++) {
        var timezone = parseInt(clocks[i].getAttribute('data-timezone'))
        clocks[i].innerHTML = clock.padZero(clock.convertTimezone(h, timezone).h) + ":" + clock.padZero(m) + ":" + clock.padZero(s)
        if (clock.convertTimezone(h, timezone).dayoffset !== 0) {
          clocks[i].previousSibling.children[0].innerHTML = '(' + clock.convertTimezone(h, timezone).dayoffset + ')'
        } else {
          //clocks[i].previousSibling.children[0].innerHTML = ''
        }
      }
    },
    startClock: () => {
      var today = new Date()
      var h = today.getHours()
      var m = today.getMinutes()
      var s = today.getSeconds()
      clock.renderClock(h, m, s)
      clock.timer = setTimeout(clock.startClock, clock.updateInterval)
    },
    init: () => {
      clock.setupClocks(clock.clocks)
      clearTimeout(clock.timer)
      clock.startClock()
    }
  }
  clock.init()
})()