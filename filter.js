var vectorize = require('vectorize')

function gpsFilter() {}

gpsFilter.prototype.produceVectors = function(points) {
    return {
        positions: vectorize.toPositions(points), //Meters
        velocities: vectorize.toVelocities(points), //Meters / Second
        accelerations: vectorize.toAccelerations(points) //Meters / Second^2
    };
};

gpsFilter.prototype.positionFilter = function(points, min, max) {
    var outputPoints = [];
    var positions = this.produceVectors(points).positions;
    var filtered = vectorFilter(min, max, positions);
    var j = 0;
    for (var i = 0; i < filtered.length; i++) {
        while (filtered[i] != positions[i + j]) {
            j++;
        }
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j])
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1])
    }
    return outputPoints;
};

gpsFilter.prototype.velocityFilter = function(points, min, max) {
    var outputPoints = [];
    var velocities = this.produceVectors(points).velocities;
    var filtered = vectorFilter(min, max, velocities);
    var first = -1,
        last = -1;
    var j = 0;
    for (var i = 0; i < filtered.length; i++) {
        while (filtered[i] != velocities[i + j]) {
            j++;
        }
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j])
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1])
    }
    return outputPoints;
};

gpsFilter.prototype.accelerationFilter = function(points, min, max) {
    var outputPoints = [];
    var accelerations = this.produceVectors(points).accelerations;
    var filtered = vectorFilter(min, max, accelerations);
    var j = 0;
    for (var i = 0; i < filtered.length; i++) {
        while (filtered[i] != accelerations[i + j]) {
            j++;
        }
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j]);
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1]);
        if (outputPoints.indexOf(points[i + j + 2]) == -1)
            outputPoints.push(points[i + j + 2]);
    }
    return outputPoints;
};

gpsFilter.prototype.removeSpikes = function(points, sharpness, iterations) {
    var outputPoints = points;
    for (var k = 0; k < iterations; k++) {
        var diff = 0 ;
        var vels = this.produceVectors(outputPoints).velocities;
        for (var i = 0; i < vels.length - 1; i++) {
            if (this.angleBetween(vels[i], vels[i + 1]) > sharpness){
                outputPoints.splice(i + 1 - diff, 1);
                diff+=1;
              }
        }
    }
    return outputPoints;
};
gpsFilter.prototype.smoothLine = function(points, threshold){
  var outputPoints = points;
  var positions = this.produceVectors(points).positions;
  var diff =0;
  for(var i = 0; i < positions.length-2; i++){
    if(this.angleBetween(positions[i], positions[i+1].add(positions[i+2]))< threshold){
      outputPoints.splice(i+2 - diff,1);
      diff+=1;
    }
  }
  console.log(diff)
  return outputPoints;
};
gpsFilter.prototype.angleBetween = function(vec1, vec2) {
    return (Math.acos(vec1.dot(vec2) / (vec1.magnitude() * vec2.magnitude())) * 180) / Math.PI;
};

var vectorFilter = function(min, max, vectors) {
    return vectors.filter(function(v) {
        return v.magnitude() > min && v.magnitude() < max;
    });
};

module.exports = exports = new gpsFilter();
