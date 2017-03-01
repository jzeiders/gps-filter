var vectorize = require('vectorize');

function gpsFilter() {}

gpsFilter.prototype.produceVectors = function(points) {
    return {
        positions: vectorize.toPositions(points), //Meters
        velocities: vectorize.toVelocities(points), //Meters / Second
        accelerations: vectorize.toAccelerations(points) //Meters / Second^2
    };
};
//Bounds Maginitude of Position Vector
gpsFilter.prototype.positionFilter = function(points, min, max) {
    var outputPoints = [];
    var positions = this.produceVectors(points).positions;
    var filtered = vectorFilter(min, max, positions);
    var j = 0;
    for (var i = 0; i < filtered.length; i++) { //Pushes points that werent removed by filter
        while (filtered[i] != positions[i + j]) {
            j++;
        }
        //Stores the two points that define the vector
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j]);
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1]);
    }
    return outputPoints;
};

//Bounds Magnitude of Velocity Vector
gpsFilter.prototype.velocityFilter = function(points, min, max) {
    var outputPoints = [];
    var velocities = this.produceVectors(points).velocities;
    var filtered = vectorFilter(min, max, velocities);
    var j = 0;
    for (var i = 0; i < filtered.length; i++) { //Pushes points that werent removed by filter
        while (filtered[i] != velocities[i + j]) {
            j++;
        }
        //Stores the two points that define the vector
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j]);
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1]);
    }
    return outputPoints;
};

//Bounds Acceleration of Acceleration Vector
gpsFilter.prototype.accelerationFilter = function(points, min, max) {
    var outputPoints = [];
    var accelerations = this.produceVectors(points).accelerations;
    var filtered = vectorFilter(min, max, accelerations);
    var j = 0;
    for (var i = 0; i < filtered.length; i++) { //Pushes points that werent removed by filter
        while (filtered[i] != accelerations[i + j]) {
            j++;
        }
        //Stores the three points that define the vector
        if (outputPoints.indexOf(points[i + j]) == -1)
            outputPoints.push(points[i + j]);
        if (outputPoints.indexOf(points[i + j + 1]) == -1)
            outputPoints.push(points[i + j + 1]);
        if (outputPoints.indexOf(points[i + j + 2]) == -1)
            outputPoints.push(points[i + j + 2]);
    }
    return outputPoints;
};

// Removes points where the angleBetween Vectors is too greater than than the sharpness
// Sharpness of 0 removes all points, 180 removes none;
gpsFilter.prototype.removeSpikes = function(points, sharpness, iterations) {
    var outputPoints = points;
    for (var k = 0; k < iterations; k++) {
        var diff = 0;
        var vels = this.produceVectors(outputPoints).velocities;
        for (var i = 0; i < vels.length - 1; i++) {
            if (this.angleBetween(vels[i], vels[i + 1]) > sharpness) {
                outputPoints.splice(i + 1 - diff, 1);
                diff += 1;
            }
        }
    }
    return outputPoints;
};

// Checks if a vectors is ~parallel to the sum of the vectors following it
// Threshold define ~parallel 0-Must be perfectly parallel 180-All lines are considered parallel
gpsFilter.prototype.smoothLine = function(points, threshold) {
    var initThreshold = threshold;
    var outputPoints = points;
    var positions = this.produceVectors(points).positions;
    var diff = 0;
    for (var i = 0; i < positions.length - 2; i++) {
        if (this.angleBetween(positions[i], positions[i + 1].add(positions[i + 2])) < threshold) {
            outputPoints.splice(i + 2 - diff, 1);
            diff += 1;
            threshold -= 5
        } else {
            threshold = initThreshold;
        }
    }
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

module.exports = new gpsFilter();
