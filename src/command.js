const fs = require('fs')
const path = require('path')

const config = require('./config.js')
const colorScheme = require(config.path.upperRoot + config.path.file.colorScheme)
const dateParser = require('./dateparser.js')

var command = {
  block: {
    html: {
      argc: [0],
      desp: 'Insert HTML block into note.',
      usage: '#html &crarr; lines &crarr; #',
      exec: (err, res, block, args, linenumber) => {
        res.html = '<div data-linenumber=' + linenumber + '>'
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML(linenumber))
        res.html += '</div>'
      }
    },
    js: {
      argc: [0],
      desp: 'Insert Javascript block into note.',
      usage: '#js &crarr; lines &crarr; #',
      exec: (err, res, block, args, linenumber) => {
        if (err) res.html += err.toHTML(linenumber)
        res.js = block.join('\n')
      }
    },
    well: {
      argc: [0],
      desp: 'Create a well for holding texts.',
      usage: '#well &crarr; lines &crarr; #',
      exec: (err, res, block, args, linenumber) => {
        res.html += "<div class='well'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<p data-linenumber=' + (linenumber + i + 1) + '>' + block[i] + '</p>'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML(linenumber))
        res.html += "\n</div>"
      }
    },
    ol: {
      argc: [0],
      desp: 'Create an ordered list for texts.',
      usage: '#ol &crarr; lines &crarr; #',
      exec: (err, res, block, args, linenumber) => {
        res.html = "<ol class='orderedlist'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<li data-linenumber=' + (linenumber + i + 1) + '>' + block[i] + '</li>\n'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML(linenumber))
        res.html += "\n</ol>"
      }
    },
    ul: {
      argc: [0],
      desp: 'Create an unordered list for texts.',
      usage: '#ul &crarr; lines &crarr; #',
      exec: (err, res, block, args, linenumber) => {
        res.html = "<ul class='orderedlist'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<li data-linenumber=' + (linenumber + i + 1) + '>' + block[i] + '</li>\n'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML(linenumber))
        res.html += "\n</ul>"
      }
    },

    // no match
    default: {
      argc: [0],
      exec: (err, res, block, args, linenumber) => {
        var err2 = new ErrorInfo('command', 'Unknown command ' + args[0] + ' occured.')
        res.html += err2.toHTML(linenumber)
        if (err) res.html += ('\n' + err.toHTML(linenumber))
      }
    },
  },

  inline: {
    sep: {
      argc: [0, 1],
      desp: 'Insert a separator.',
      usage: '!sep [n]',
      exec: (res, args, rest, linenumber) => {
        switch (args.length) {
          case 0:
            res.html = "<div data-linenumber=" + linenumber + " class='contentsep'></div>"
            break
          case 1:
            var sepNum = parseInt(args[0])
            if (Number.isInteger(sepNum)) {
              if (sepNum < 0) {
                var err = new ErrorInfo('command', 'sep does not accept negative argument.')
                res.html = err.toHTML(linenumber)
              } else {
                res.html = ""
                for (var i = 0; i < sepNum; i++) {
                  res.html += "<div data-linenumber=" + linenumber + " class='contentsep'></div>\n"
                }
              }
            } else {
              var err = new ErrorInfo('command', 'sep does not accept non-integer argument.')
              res.html = err.toHTML(linenumber)
            }
        }
      }
    },
    htmlfile: {
      argc: [1],
      desp: 'Insert HTML from file.',
      usage: '!htmlfile path/to/html',
      exec: (res, args, rest, linenumber) => {
        var htmlfilePath = args[0]
        if (fs.existsSync(config.path.category.app + htmlfilePath)) {
          var htmlfileContent = fs.readFileSync(config.path.root + config.path.category.app + htmlfilePath)
          res.html = htmlfileContent
        } else {
          var err = new ErrorInfo('file', 'HTML ' + htmlfilePath + ' not found.')
          res.html = err.toHTML(linenumber)
        }
      }
    },
    jsfile: {
      argc: [1],
      desp: 'Insert Javascript from file.',
      usage: '!jsfile path/to/js',
      exec: (res, args, rest, linenumber) => {
        var jsfilePath = args[0]
        if (fs.existsSync(config.path.category.app + jsfilePath)) {
          res.jsfile = config.path.upperRoot + jsfilePath
        } else {
          var err = new ErrorInfo('file', 'JS ' + jsfilePath + ' not found.')
          res.html = err.toHTML(linenumber)
        }
      }
    },
    cssfile: {
      argc: [1],
      desp: 'Insert CSS from file.',
      usage: '!cssfile path/to/css',
      exec: (res, args, rest, linenumber) => {
        var cssfilePath = args[0]
        if (fs.existsSync(config.path.category.app + cssfilePath)) {
          res.cssfile = config.path.upperRoot + cssfilePath
        } else {
          var err = new ErrorInfo('file', 'CSS ' + cssfilePath + ' not found.')
          res.html = err.toHTML(linenumber)
        }
      }
    },
    plugin: {
      argc: [1],
      desp: 'Load plugin.',
      usage: '!plugin plugin-name',
      exec: (res, args, rest, linenumber) => {
        var pluginName = args[0]
        var pluginPath = config.path.category.plugin + pluginName + '/' + pluginName
        var pluginFilePath = {
          html: pluginPath + '.html',
          js: pluginPath + '.js',
          css: pluginPath + '.css'
        } 
        var isLoaded = false
        res.html = '<div data-linenumber=' + linenumber + '>'
        if (fs.existsSync(config.path.root + config.path.category.app + pluginFilePath.html)) {
          var htmlfileContent = fs.readFileSync(config.path.root + config.path.category.app + pluginFilePath.html)
          res.html += htmlfileContent
          isLoaded = true
        }
        if (fs.existsSync(config.path.root + config.path.category.app + pluginFilePath.js)) {
          res.jsfile = config.path.upperRoot + pluginFilePath.js
          isLoaded = true
        }
        if (fs.existsSync(config.path.root + config.path.category.app + pluginFilePath.css)) {
          res.cssfile = config.path.upperRoot + pluginFilePath.css
          isLoaded = true
        }
        if (!isLoaded) {
          var err = new ErrorInfo('plugin', pluginName + ' not found.')
          res.html += err.toHTML(linenumber)
        }
        res.html += '</div>'
      }
    },
    notecolor: {
      argc: [1],
      desp: 'Change color scheme of note. Supported color schemes: ' + colorScheme.join(', ') + '.',
      usage: '!notecolor color-scheme|color-index',
      exec: (res, args, rest, linenumber) => {
        var colorName = args[0]
        if (colorName) {
          if (Number.isInteger(parseInt(colorName))) {
            colorName = parseInt(colorName)
            if (colorName >= 0 && colorName < colorScheme.length) {
              res.cssfile = config.path.upperRoot + config.path.category.color + colorScheme[colorName] + '.css'
            } else {
              var err = new ErrorInfo('color', 'color No. available from 0 to ' + (colorScheme.length - 1) + '.')
              res.html = err.toHTML(linenumber)
            }
          } else {
            if (colorScheme.includes(colorName)) {
              res.cssfile = config.path.upperRoot + config.path.category.color + colorName + '.css'
            } else if (colorName === 'random') {
              var randomIndex = Math.floor(Math.random() * colorScheme.length)
              res.cssfile = config.path.upperRoot + config.path.category.color + colorScheme[randomIndex] + '.css'
            } else {
              var err = new ErrorInfo('color', colorName + ' not found.')
              res.html = err.toHTML(linenumber)
            }
          }
        }
      }
    },
    h1: {
      argc: 'any',
      desp: 'Insert h1 title.',
      usage: '!h1 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h1'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h2: {
      argc: 'any',
      desp: 'Insert h2 title.',
      usage: '!h2 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h2'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h3: {
      argc: 'any',
      desp: 'Insert h3 title.',
      usage: '!h3 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h3'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h4: {
      argc: 'any',
      desp: 'Insert h4 title.',
      usage: '!h4 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h4'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h5: {
      argc: 'any',
      desp: 'Insert h5 title.',
      usage: '!h5 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h5'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h6: {
      argc: 'any',
      desp: 'Insert h6 title.',
      usage: '!h6 title-string',
      exec: (res, args, rest, linenumber) => {
        var string = args.join(' ')
        var type = 'h6'
        res.html = "<" + type + " data-linenumber=" + linenumber + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    checkbox: {
      argc: 'any',
      desp: 'Insert check box.',
      usage: '!checkbox string',
      exec: (res, args, rest, linenumber) => {
        var id = uniqueID()
        res.html = '<div>'
        res.html += '<input type="checkbox" id="' + id + '" data-linenumber=' + linenumber + '>' 
        res.html += '<label data-linenumber=' + linenumber + ' style="cursor: pointer;" for="' + id + '">' + rest.replace(/\s/g, '&nbsp;') + '</label>'
        res.html += '</div>'
      }
    },
    date: {
      argc: 'any',
      desp: 'Create a date entry',
      usage: '!date -date- string',
      exec: (res, args, rest, linenumber) => {
        const dateSp = '/'
        const timeSp = ':'
        const spanSp = ' - '
        const commaSp = ' '

        var id = uniqueID()
        var dateString = /-(.+)-/.exec(rest)[1]
        var entryString = rest.slice(rest.lastIndexOf('-') + 1).trim().replace(/\s/g, '&nbsp;').replace(/\\n/g, '<br>')
        var date = dateParser().exec(dateString)
        res.html = ''
        if (date.err.code === 0) {
          if (!date.end.isSet) {
            // only start date
            res.html += '<div data-datevalue=' + date.start.value + ' class="dateentry" id="' + id + '">'
            res.html += '<span data-linenumber=' + linenumber + ' class="dateentrydate">'
            if (date.start.isDatePartSet) {
              // has date part
              if ((!date.start.isYearSet) && (!date.start.isDateSet)) {
                // only month
                res.html += date.start.year + dateSp + date.start.month
              } else {
                res.html += date.start.weekName + commaSp
                if (date.start.isYearSet) {
                  res.html += date.start.year + dateSp
                }
                res.html += date.start.month + dateSp + date.start.date
                if (date.start.isTimePartSet) {
                  // also has time part
                  res.html += commaSp + date.start.hour + timeSp + dateParser().numberToTwoDigitString(date.start.minute)
                  if (date.start.isSecondSet) {
                    res.html += timeSp + dateParser().numberToTwoDigitString(date.start.second)
                  }
                }
              }
            } else {
              if (date.start.isTimePartSet) {
                // only time
                res.html += date.start.hour + timeSp + dateParser().numberToTwoDigitString(date.start.minute)
                if (date.start.isSecondSet) {
                  res.html += timeSp + dateParser().numberToTwoDigitString(date.start.second)
                }
              } else {
                // neither
                console.error('Error')
              }
            }
            res.html += '</span>'
            res.html += '<span data-linenumber=' + linenumber + ' class="dateentryleft"></span>'
            res.html += '<div data-linenumber=' + linenumber + ' class="dateentryitem">' + entryString + '</div>'
            res.html += '</div>'
          } else {
            // both start and end
            res.html += '<div data-datevalue=' + date.start.value + ' data-startdatevalue=' + date.end.value + ' class="dateentry" id="' + id + '">'
            res.html += '<span data-linenumber=' + linenumber + ' class="dateentrydate">'

            var startDisplay = '', endDisplay = '', sameTime = false
            if (date.start.isDatePartSet) {
              // start has date part
              if ((!date.start.isYearSet) && (!date.start.isDateSet) && (!date.end.isYearSet) && (!date.end.isDateSet)) {
                // only month
                startDisplay += date.start.year + dateSp + date.start.month
                endDisplay += date.end.month
              } else {
                startDisplay += date.start.weekName + commaSp
                //endDisplay += date.end.weekName + commaSp
                if (date.start.isYearSet || date.end.isYearSet) {
                  // at least one year set, show explicitly
                  startDisplay += date.start.year + dateSp + date.start.month + dateSp + date.start.date
                  endDisplay += date.end.weekName + commaSp
                  endDisplay += date.end.year + dateSp + date.end.month + dateSp + date.end.date
                } else {
                  startDisplay += date.start.month
                  if (date.start.month !== date.end.month) {
                    startDisplay += dateSp + date.start.date
                    endDisplay += date.end.weekName + commaSp
                    endDisplay += date.end.month + dateSp + date.start.date
                  } else {
                    startDisplay += dateSp + date.start.date
                    if (date.start.date !== date.end.date) {
                      endDisplay += date.end.date
                    } else {
                      if (date.start.isTimePartSet) {
                        startDisplay += commaSp + date.start.hour + timeSp + dateParser().numberToTwoDigitString(date.start.minute)
                        if (date.start.hour !== date.end.hour || date.start.minute !== date.end.minute) {
                          endDisplay += date.end.hour + timeSp + dateParser().numberToTwoDigitString(date.end.minute)
                        } else {
                          if (date.start.isSecondSet) {
                            startDisplay += timeSp + dateParser().numberToTwoDigitString(date.start.second)
                            if (date.start.second !== date.end.second) {
                              endDisplay += date.end.hour + timeSp + dateParser().numberToTwoDigitString(date.end.minute) + timeSp + dateParser().numberToTwoDigitString(date.end.second)
                            } else {
                              sameTime = true
                            }
                          } else {
                            sameTime = true
                          }
                        }
                      } else {
                        sameTime = true
                      }
                    }
                  }
                }
              }
            } else {
              if (date.start.isTimePartSet) {
                // only time
                startDisplay += date.start.hour + timeSp + dateParser().numberToTwoDigitString(date.start.minute)
                if (date.start.hour !== date.end.hour || date.start.minute !== date.end.minute) {
                  endDisplay += date.end.hour + timeSp + dateParser().numberToTwoDigitString(date.end.minute)
                } else {
                  if (date.start.isSecondSet) {
                    startDisplay += timeSp + dateParser().numberToTwoDigitString(date.start.second)
                    if (date.start.second !== date.end.second) {
                      endDisplay += date.end.hour + timeSp + dateParser().numberToTwoDigitString(date.end.minute) + timeSp + dateParser().numberToTwoDigitString(date.end.second)
                    } else {
                      sameTime = true
                    }
                  } else {
                    sameTime = true
                  }
                }
              } else {
                // neither
                console.error('Error 2')
              }
            }
            if (!sameTime) {
              res.html += startDisplay + spanSp + endDisplay
            } else {
              res.html += startDisplay
            }
            res.html += '</span>'
            res.html += '<span data-linenumber=' + linenumber + ' class="dateentryleft"></span>'
            res.html += '<div data-linenumber=' + linenumber + ' class="dateentryitem">' + entryString + '</div>'
            res.html += '</div>'
          }
          
        } else {
          var err = new ErrorInfo('date', 'Code ' + date.err.code + ': ' + date.err.msg)
          res.html = err.toHTML(linenumber)
        }
        
        /*
        res.js = '(function () {\n'
        res.js += 'var updateDate = { timer: null,\n'
        res.js += 'update: () => {\n'
        res.js += 'var entry = document.getElementById("' + id + '")\n'
        res.js += 'console.log("xxx")\n'
        res.js += 'entry.firstChild.nextSibling.innerHTML = Math.floor((parseInt(entry.getAttribute("data-datevalue")) - Date.now()) / (1000 * 60 * 60 * 24)) + " days"\n'
        res.js += 'updateDate.timer = setTimeout(updateDate.update, 60000)\n'
        res.js += '}, init: () => { clearTimeout(updateDate.timer); updateDate.update() }}\n'
        res.js += 'updateDate.init() })();\n'
        */
      }
    },
    password: {
      argc: 'any',
      desp: 'Hide secret text.',
      usage: '!password string',
      exec: (res, args, rest, linenumber) => {
        res.html += '<p data-linenumber=' + linenumber + '>' + rest.replace(/./g, '*') + '</p>'
      }
    },

    // get command usage
    help: {
      argc: [1],
      desp: 'Get help of command.',
      usage: '!help command-name',
      exec: (res, args, rest, linenumber) => {
        var commandName = args[0]
        var blockc = Object.keys(command.block).filter((item) => { return item !== 'default' })
        var inlinec = Object.keys(command.inline).filter((item) => { return item !== 'default' })
        if (blockc.includes(commandName)) {
          res.html = '<p data-linenumber=' + linenumber + ' style="color:seagreen;">Command Help: <strong>' + commandName + '</strong></p>\n'
          res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">----Description: ' + command.block[commandName].desp + '</p>\n'
          res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">----Syntax: <em>' + command.block[commandName].usage + '</em></p>'
        } else if (inlinec.includes(commandName)) {
          res.html = '<p data-linenumber=' + linenumber + ' style="color:seagreen;">Command Help: <strong>' + commandName + '</strong></p>\n'
          res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">----Description: ' + command.inline[commandName].desp + '</p>\n'
          res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">----Syntax: <em>' + command.inline[commandName].usage + '</em></p>'
        } else {
          var err = new ErrorInfo('help', 'Request help for unknown command: ' + commandName + '.')
          res.html = err.toHTML(linenumber)
        }
      }
    },
    commandlist: {
      argc: [0],
      desp: 'List all available commands.',
      usage: '!commandlist',
      exec: (res, args, rest, linenumber) => {
        var blockc = Object.keys(command.block)
        blockc = blockc.filter((item) => { return item !== 'default' })
        res.html = '<p data-linenumber=' + linenumber + ' style="color:seagreen;">Block commands:</p>\n'
        res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">---- ' + blockc.join(', ') + '</p>\n'
        var inlinec = Object.keys(command.inline)
        inlinec = inlinec.filter((item) => { return item !== 'default' })
        res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">Inline commands:</p>\n'
        res.html += '<p data-linenumber=' + linenumber + ' style="color:seagreen;">---- ' + inlinec.join(', ') + '</p>'
      }
    },

    // handle unknown command
    default: {
      argc: [0],
      exec: (res, args, rest, linenumber) => {
        var err = new ErrorInfo('command', 'Unknown inline command ' + args[0] + ' occured.')
        res.html = err.toHTML(linenumber)
      }
    },

  }
}

function ErrorInfo (errType, errMessage) {
  this.errType = errType
  this.errMessage = errMessage
  this.toHTML = (linenumber) => {
    switch (errType) {
      default:
        return "<p data-linenumber=" + linenumber + " style='color:red;'> " + this.capitalizeWord(errType) + " Error: " + errMessage + "</p>" 
        break
    } 
  }
  this.capitalizeWord = (w) => {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }
}

let idList = []
var uniqueID = () => {
  var id = "";
  var chartable = "abcdefghijklmnopqrstuvwxyz0123456789";
  var idLength = 5
  do {
    for (var i = 0; i < idLength; i++)
    id += chartable.charAt(Math.floor(Math.random() * chartable.length));
  } while (idList.includes(id))
  idList.push(id)
  return id;
} 

module.exports = command