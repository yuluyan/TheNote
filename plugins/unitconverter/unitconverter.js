(function() {
  var uc = {
    units: [
      {
        "unitA": {
          "name": "mile",
          "abbr": "mi",
          "plural": "miles"
        },
        "unitB": {
          "name": "kilometer",
          "abbr": "km",
          "plural": "kilometers"
        },
        "factor": 1.60934
      },
      {
        "unitA": {
          "name": "inch",
          "abbr": "in",
          "plural": "inches"
        },
        "unitB": {
          "name": "centimeter",
          "abbr": "cm",
          "plural": "centimeters"
        },
        "factor": 2.54
      },
      {
        "unitA": {
          "name": "foot",
          "abbr": "ft",
          "plural": "feet"
        },
        "unitB": {
          "name": "meter",
          "abbr": "m",
          "plural": "meters"
        },
        "factor": 0.3048
      },
      {
        "unitA": {
          "name": "pound",
          "abbr": "lbs",
          "plural": "pounds"
        },
        "unitB": {
          "name": "kilogram",
          "abbr": "kg",
          "plural": "kilograms"
        },
        "factor": 0.453592
      },
      {
        "unitA": {
          "name": "ounce",
          "abbr": "oz",
          "plural": "ounces"
        },
        "unitB": {
          "name": "gram",
          "abbr": "g",
          "plural": "grams"
        },
        "factor": 28.3495
      }
    ],

    generateConverter: (unit) => {
      var unitDiv = document.createElement('div')
      unitDiv.className = 'unitdiv'
      
      var inputA = document.createElement('input')
      inputA.className = 'unitinput'
      inputA.type = 'number'
      inputA.addEventListener('keyup', (e) => {
        inputB.value = e.target.value * unit.factor
      })
      var labelA = document.createElement('label')
      labelA.className = 'unitlabel'
      labelA.innerHTML = unit.unitA.abbr

      var eq = document.createElement('span')
      eq.innerHTML = '='
      eq.className = 'eqlabel'

      var inputB = document.createElement('input')
      inputB.className = 'unitinput'
      inputB.type = 'number'
      inputB.addEventListener('keyup', (e) => {
        inputA.value = e.target.value / unit.factor
      })
      var labelB = document.createElement('label')
      labelB.className = 'unitlabel'
      labelB.innerHTML = unit.unitB.abbr

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
  }
  uc.init()
})()