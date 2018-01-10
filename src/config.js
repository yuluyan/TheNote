const path = require('path')
var build = true
var config
if (!build) {
  config = {
    path: {
      root: './',
      upperRoot: '../',
      file: {
        catalog: 'saves/catalog.json',
        icon: 'resources/ico.ico',
        tutorial: 'resources/tutorial.note',
        colorScheme: 'resources/colorScheme/colorScheme.js',
      },
      category: {
        app: '',
        notes: 'saves/notes/',
        plugin: 'plugins/',
        color: 'resources/colorScheme/',
      }
    },
  }
} else {
  config = {
    path: {
      root: './',
      upperRoot: '../',
      file: {
        catalog: 'saves/catalog.json',
        icon: 'resources/app/resources/ico.ico',
        tutorial: 'resources/tutorial.note',
        colorScheme: 'resources/colorScheme/colorScheme.js',
      },
      category: {
        app: 'resources/app/',
        notes: 'saves/notes/',
        plugin: 'plugins/',
        color: 'resources/colorScheme/',
      }
    },
  }
}


module.exports = config