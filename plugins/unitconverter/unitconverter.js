(function() {
  var uc = {
    superagent: require("superagent"),
    units: [
      {
        "unitA": "mi",
        "unitB": "km",
        "factor": 1.60934
      },
      {
        "unitA": "in",
        "unitB": "cm",
        "factor": 2.54
      },
      {
        "unitA": "ft",
        "unitB": "m",
        "factor": 0.3048
      },
      {
        "unitA": "lbs",
        "unitB": "kg",
        "factor": 0.453592
      },
      {
        "unitA": "oz",
        "unitB": "g",
        "factor": 28.3495
      },
      {
        "unitA": "$",
        "unitB": "&yen;",
        "factor": (callback) => {
          uc.superagent.get("http://free.currencyconverterapi.com/api/v5/convert?q=USD_CNY&compact=y").end(function(err,pres){
            var factor  
            if (err) {
              console.error('currency failed.')
              factor = 6.409503
            } else {
              factor = JSON.parse(pres.text).USD_CNY.val
            }
            callback(factor)
          });
        }
      }
    ],

    generateConverter: (unit) => {
      var callfactor
      if (typeof unit.factor === "function") {
        callfactor = unit.factor
      } else {
        callfactor = (callback) => {callback(unit.factor)}
      }
      
      var unitDiv = document.createElement('div')
      unitDiv.className = 'unitdiv'
      
      var inputA = document.createElement('input')
      inputA.className = 'unitinput'
      inputA.type = 'number'
      inputA.addEventListener('keyup', (e) => {
        callfactor((f) => {inputB.value = uc.trunc(e.target.value * f)})
      })
      var labelA = document.createElement('label')
      labelA.className = 'unitlabel'
      labelA.innerHTML = unit.unitA

      var eq = document.createElement('span')
      eq.innerHTML = '='
      eq.className = 'eqlabel'

      var inputB = document.createElement('input')
      inputB.className = 'unitinput'
      inputB.type = 'number'
      inputB.addEventListener('keyup', (e) => {
        callfactor((f) => {inputA.value = uc.trunc(e.target.value / f)})
      })
      var labelB = document.createElement('label')
      labelB.className = 'unitlabel'
      labelB.innerHTML = unit.unitB

      unitDiv.appendChild(inputA)
      unitDiv.appendChild(labelA)      
      unitDiv.appendChild(eq)      
      unitDiv.appendChild(inputB)
      unitDiv.appendChild(labelB)

      var grid = document.getElementById('unitconverter')
      var floatclear = document.getElementById('floatclear')
      grid.insertBefore(unitDiv, floatclear)
    },

    init: () => {
      if (uc.units.length < 1) return false
      for (i = 0; i < uc.units.length; i++) {
        uc.generateConverter(uc.units[i])
      }
    },

    trunc: (num) => {
      var sign = Math.sign(num)
      var num = Math.abs(num)
      if (num == 0) {
        return 0
      } else if (num >= 1) {
        return sign * uc.keepDigits(num, 2)
      } else {
        var digit = parseInt( - Math.log10(num))
        return sign * uc.keepDigits(num, digit + 3)
      }

    },
    keepDigits: (num, digit) => {
      return parseInt(num * Math.pow(10, digit)) / Math.pow(10, digit)
    }
  }
  uc.init()
})()