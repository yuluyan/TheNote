const fs = require('fs')
const path = require('path')

const config = require('./config.js')
const colorScheme = require(config.path.upperRoot + config.path.file.colorScheme)

var command = {
  block: {
    html: {
      argc: [0],
      desp: 'Insert HTML block into note.',
      usage: '#html &crarr; lines &crarr; #',
      exec: (err, res, block, args) => {
        res.html = block.join('\n')
        if (err) res.html += ('\n' + err.toHTML())
      }
    },
    js: {
      argc: [0],
      desp: 'Insert Javascript block into note.',
      usage: '#js &crarr; lines &crarr; #',
      exec: (err, res, block, args) => {
        if (err) res.html = err.toHTML()
        res.js = block.join('\n')
      }
    },
    well: {
      argc: [0],
      desp: 'Create a well for holding texts.',
      usage: '#well &crarr; lines &crarr; #',
      exec: (err, res, block, args) => {
        res.html = "<div class='well'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<p>' + block[i] + '</p>'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML())
        res.html += "\n</div>"
      }
    },
    ol: {
      argc: [0],
      desp: 'Create an ordered list for texts.',
      usage: '#ol &crarr; lines &crarr; #',
      exec: (err, res, block, args) => {
        res.html = "<ol class='orderedlist'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<li>' + block[i] + '</li>\n'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML())
        res.html += "\n</ol>"
      }
    },
    ul: {
      argc: [0],
      desp: 'Create an unordered list for texts.',
      usage: '#ul &crarr; lines &crarr; #',
      exec: (err, res, block, args) => {
        res.html = "<ul class='orderedlist'>\n"
        for (var i = 0; i < block.length; i++) {
          // only support text inside well
          block[i] = '<li>' + block[i] + '</li>\n'
        }
        res.html += block.join('\n')
        if (err) res.html += ('\n' + err.toHTML())
        res.html += "\n</ul>"
      }
    },

    // no match
    default: {
      argc: [0],
      exec: (err, res, block, args) => {
        var err2 = new ErrorInfo('command', 'Unknown command ' + args[0] + ' occured.')
        res.html = err2.toHTML()
        if (err) res.html += ('\n' + err.toHTML())
      }
    },
  },

  inline: {
    sep: {
      argc: [0, 1],
      desp: 'Insert a separator.',
      usage: '!sep [n]',
      exec: (res, args) => {
        switch (args.length) {
          case 0:
            res.html = "<div class='contentsep'></div>"
            break
          case 1:
            var sepNum = parseInt(args[0])
            if (Number.isInteger(sepNum)) {
              if (sepNum < 0) {
                var err = new ErrorInfo('command', 'sep does not accept negative argument.')
                res.html = err.toHTML()
              } else {
                res.html = ""
                for (var i = 0; i < sepNum; i++) {
                  res.html += "<div class='contentsep'></div>\n"
                }
              }
            } else {
              var err = new ErrorInfo('command', 'sep does not accept non-integer argument.')
              res.html = err.toHTML()
            }
        }
      }
    },
    htmlfile: {
      argc: [1],
      desp: 'Insert HTML from file.',
      usage: '!htmlfile path/to/html',
      exec: (res, args) => {
        var htmlfilePath = args[0]
        if (fs.existsSync(config.path.category.app + htmlfilePath)) {
          var htmlfileContent = fs.readFileSync(config.path.root + config.path.category.app + htmlfilePath)
          res.html = htmlfileContent
        } else {
          var err = new ErrorInfo('file', 'HTML ' + htmlfilePath + ' not found.')
          res.html = err.toHTML()
        }
      }
    },
    jsfile: {
      argc: [1],
      desp: 'Insert Javascript from file.',
      usage: '!jsfile path/to/js',
      exec: (res, args) => {
        var jsfilePath = args[0]
        if (fs.existsSync(config.path.category.app + jsfilePath)) {
          res.jsfile = config.path.upperRoot + jsfilePath
        } else {
          var err = new ErrorInfo('file', 'JS ' + jsfilePath + ' not found.')
          res.html = err.toHTML()
        }
      }
    },
    cssfile: {
      argc: [1],
      desp: 'Insert CSS from file.',
      usage: '!cssfile path/to/css',
      exec: (res, args) => {
        var cssfilePath = args[0]
        if (fs.existsSync(config.path.category.app + cssfilePath)) {
          res.cssfile = config.path.upperRoot + cssfilePath
        } else {
          var err = new ErrorInfo('file', 'CSS ' + cssfilePath + ' not found.')
          res.html = err.toHTML()
        }
      }
    },
    plugin: {
      argc: [1],
      desp: 'Load plugin.',
      usage: '!plugin plugin-name',
      exec: (res, args) => {
        var pluginName = args[0]
        var pluginPath = config.path.category.plugin + pluginName + '/' + pluginName
        var pluginFilePath = {
          html: pluginPath + '.html',
          js: pluginPath + '.js',
          css: pluginPath + '.css'
        } 
        var isLoaded = false
        if (fs.existsSync(config.path.root + config.path.category.app + pluginFilePath.html)) {
          var htmlfileContent = fs.readFileSync(config.path.root + config.path.category.app + pluginFilePath.html)
          res.html = htmlfileContent
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
          res.html = err.toHTML()
        }
      }
    },
    notecolor: {
      argc: [1],
      desp: 'Change color scheme of note. Supported color schemes: ' + colorScheme.join(', ') + '.',
      usage: '!notecolor color-scheme|color-index',
      exec: (res, args) => {
        var colorName = args[0]
        if (colorName) {
          if (Number.isInteger(parseInt(colorName))) {
            colorName = parseInt(colorName)
            if (colorName >= 0 && colorName < colorScheme.length) {
              res.cssfile = config.path.upperRoot + config.path.category.color + colorScheme[colorName] + '.css'
            } else {
              var err = new ErrorInfo('color', 'color No. available from 0 to ' + (colorScheme.length - 1) + '.')
              res.html = err.toHTML()
            }
          } else {
            if (colorScheme.includes(colorName)) {
              res.cssfile = config.path.upperRoot + config.path.category.color + colorName + '.css'
            } else if (colorName === 'random') {
              var randomIndex = Math.floor(Math.random() * colorScheme.length)
              res.cssfile = config.path.upperRoot + config.path.category.color + colorScheme[randomIndex] + '.css'
            } else {
              var err = new ErrorInfo('color', colorName + ' not found.')
              res.html = err.toHTML()
            }
          }
        }
      }
    },
    h1: {
      argc: 'any',
      desp: 'Insert h1 title.',
      usage: '!h1 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h1'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h2: {
      argc: 'any',
      desp: 'Insert h2 title.',
      usage: '!h2 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h2'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h3: {
      argc: 'any',
      desp: 'Insert h3 title.',
      usage: '!h3 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h3'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h4: {
      argc: 'any',
      desp: 'Insert h4 title.',
      usage: '!h4 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h4'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h5: {
      argc: 'any',
      desp: 'Insert h5 title.',
      usage: '!h5 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h5'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    h6: {
      argc: 'any',
      desp: 'Insert h6 title.',
      usage: '!h6 title-string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var type = 'h6'
        res.html = "<" + type + ">" + rest.replace(/\s/g, '&nbsp;') + "</" + type + ">"
      }
    },
    checkbox: {
      argc: 'any',
      desp: 'Insert check box.',
      usage: '!checkbox string',
      exec: (res, args, rest) => {
        var string = args.join(' ')
        var id = uniqueID()
        res.html = '<input type="checkbox" id="' + id + '">' + '<label style="cursor: pointer;" for="' + id + '">' + rest.replace(/\s/g, '&nbsp;') + '</label>'
      }
    },

    // get command usage
    help: {
      argc: [1],
      desp: 'Get help of command.',
      usage: '!help command-name',
      exec: (res, args) => {
        var commandName = args[0]
        var blockc = Object.keys(command.block).filter((item) => { return item !== 'default' })
        var inlinec = Object.keys(command.inline).filter((item) => { return item !== 'default' })
        if (blockc.includes(commandName)) {
          res.html = '<p style="color:seagreen;">Command Help: <strong>' + commandName + '</strong></p>\n'
          res.html += '<p style="color:seagreen;">----Description: ' + command.block[commandName].desp + '</p>\n'
          res.html += '<p style="color:seagreen;">----Syntax: <em>' + command.block[commandName].usage + '</em></p>'
        } else if (inlinec.includes(commandName)) {
          res.html = '<p style="color:seagreen;">Command Help: <strong>' + commandName + '</strong></p>\n'
          res.html += '<p style="color:seagreen;">----Description: ' + command.inline[commandName].desp + '</p>\n'
          res.html += '<p style="color:seagreen;">----Syntax: <em>' + command.inline[commandName].usage + '</em></p>'
        } else {
          var err = new ErrorInfo('help', 'Request help for unknown command: ' + commandName + '.')
          res.html = err.toHTML()
        }
      }
    },
    commandlist: {
      argc: [0],
      desp: 'List all available commands.',
      usage: '!commandlist',
      exec: (res, args) => {
        var blockc = Object.keys(command.block)
        blockc = blockc.filter((item) => { return item !== 'default' })
        res.html = '<p style="color:seagreen;">Block commands:</p>\n'
        res.html += '<p style="color:seagreen;">---- ' + blockc.join(', ') + '</p>\n'
        var inlinec = Object.keys(command.inline)
        inlinec = inlinec.filter((item) => { return item !== 'default' })
        res.html += '<p style="color:seagreen;">Inline commands:</p>\n'
        res.html += '<p style="color:seagreen;">---- ' + inlinec.join(', ') + '</p>'
      }
    },

    // handle unknown command
    default: {
      argc: [0],
      exec: (res, args) => {
        var err = new ErrorInfo('command', 'Unknown inline command ' + args[0] + ' occured.')
        res.html = err.toHTML()
      }
    },

  }
}

function ErrorInfo (errType, errMessage) {
  this.errType = errType
  this.errMessage = errMessage
  this.toHTML = () => {
    switch (errType) {
      default:
        return "<p style='color:red;'> " + this.capitalizeWord(errType) + " Error: " + errMessage + "</p>" 
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