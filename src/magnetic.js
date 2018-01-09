const assert = require('assert')

var magnetic = {
  trajectoryLength: 30, // should > 1
  attractionDistance: 10,
  calc: (psArray, traj, size) => {
    var psBoundary = {
      Vertical:[0],
      Horizon:[0],
    }
    
    for(var i = 0; i < psArray.length; i++) {
      ps = psArray[i]
      psBoundary.Vertical.push(ps.pos[0])
      psBoundary.Vertical.push(ps.pos[0] + ps.size[0])
      psBoundary.Horizon.push(ps.pos[1])
      psBoundary.Horizon.push(ps.pos[1] + ps.size[1])
    }
    for(var bound in psBoundary) {
      psBoundary[bound] = psBoundary[bound].sort(function(obj1, obj2) {
        return obj1 - obj2
      })
    }

    traj = unique(traj)
    var len = traj.length
    var resPos = traj[len - 1]

    dir = get_dir(traj[len - 1], traj[0])

    curLeft = traj[len - 1][0]
    curTop = traj[len - 1][1]
    curRight = curLeft + size[0]
    curBottom = curTop + size[1]

    if(abs(dir[0]) > abs(dir[1])) {
      // adjust to y-axis
      aLeft = nearest(psBoundary.Vertical, curLeft)
      aRight = nearest(psBoundary.Vertical, curRight)
      if(abs(aLeft - curLeft) > abs(aRight - curRight)) {
        if(abs(aRight - curRight) <= magnetic.getAttractionDistance)
          resPos[0] = aRight - size[0]
      } else {
        if(abs(aLeft - curLeft) <= magnetic.getAttractionDistance)
          resPos[0] = aLeft      
      }
    } else {
      // adjust to x-axis
      aTop = nearest(psBoundary.Horizon, curTop)
      aBottom = nearest(psBoundary.Horizon, curBottom)
      if(abs(aTop - curTop) > abs(aBottom - curBottom)) {
        if(abs(aBottom - curBottom) <= magnetic.getAttractionDistance)
          resPos[1] = aBottom - size[1]
      } else {
        if(abs(aTop - curTop) <= magnetic.getAttractionDistance)
          resPos[1] = aTop
      }
    }

    return resPos
  },
  get getTrajectoryLength () {
    return this.trajectoryLength
  },
  get getAttractionDistance () {
    return this.attractionDistance
  },
}

function get_dir(now_pos, pre_pos) {
  return [now_pos[0] - pre_pos[0], now_pos[1] - pre_pos[1]]
}

function cmp(obj1, obj2) {
  return obj1[0] == obj2[0] && obj1[1] == obj2[1]
}

// The same as unique() in C++.
function unique(array) { 
  var tmp = 0
  for(var i = 1; i < array.length; i++) {
    if(!cmp(array[i], array[tmp])) array[++tmp] = array[i]
  }
  return array.slice(0, tmp + 1)
}

// Get the first element equal or larger than val in array.
// if there's no such element, return the last element.
function nearest(array, val) {
  var inx = 0
  var miDist = -1
  for(var i = 0; i < array.length; i++) {
    if(miDist == -1 || miDist > abs(val - array[i])) {
      inx = i
      miDist = abs(val - array[i])
    }
  }
  return array[inx]
}

var abs = (x) => { return Math.abs(x) }

module.exports = magnetic