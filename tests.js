var chai = require("chai");
var expect = chai.expect;
var gpsFilter = require('./filter');
var vectorize = require('vectorize');
var Victor = require('victor')
var points = [{
    lat: 0.000000,
    lng: 0.0000,
    time: '2016-07-11T17:48:42.489Z',
    tag: "A"
}, {
    lat: 0.00000001,
    lng: 0.01,
    time: '2016-07-11T18:20:42.489Z',
    tag: "B"
}, {
    lat: 0.01,
    lng: 0.0100001,
    time: '2016-07-11T18:21:02.489Z',
    tag: "C"
}, {
    lat: 0.000001,
    lng: 0.011,
    time: '2016-07-11T18:21:22.489Z',
    tag: "D"
}, {
    lat: 0.002,
    lng: 0.002,
    time: '2016-07-11T18:21:42.489Z',
    tag: "E"
}, {
    lat: 0.0021,
    lng: 0.0021,
    time: '2016-07-11T18:22:02.489Z',
    tag: "F"
}];

var spikePoints = [{
    lat: 0.000000,
    lng: 0.0000,
    time: '2016-07-11T17:48:42.489Z',
    tag: "A"
}, {
    lat: 0.00000001,
    lng: 0.01,
    time: '2016-07-11T18:20:42.489Z',
    tag: "B"
}, {
    lat: 0.01,
    lng: 0.0100001,
    time: '2016-07-11T18:21:02.489Z',
    tag: "C"
}, {
    lat: 0.000001,
    lng: 0.011,
    time: '2016-07-11T18:21:22.489Z',
    tag: "D"
}, {
    lat: 0.002,
    lng: 0.02,
    time: '2016-07-11T18:21:42.489Z',
    tag: "E"
}, {
    lat: 0.0021,
    lng: 0.021,
    time: '2016-07-11T18:22:02.489Z',
    tag: "F"
}];
describe('Produce Vectors', function() {
    var vectors = gpsFilter.produceVectors(points)
    it("should produce three sets", function() {
        var count = 0;
        for (var i in vectors) {
            count++
        }
        expect(count).to.be.equal(3);
    });
    it("should all be vectors", function() {
        for (var i in vectors) {
            if (!vectors.hasOwnProperty(i)) continue;
            var vectorSet = vectors[i]
            for (var j = 0; j < vectorSet.length; j++) {
                expect(Math.abs(vectorSet[j].x)).to.be.above(0);
                expect(Math.abs(vectorSet[j].y)).to.be.above(0);
            }
        }
    })
})
describe("Position Filter", function() {
    var filterPoints = gpsFilter.positionFilter(points, 10, 100);
    var filterVectors = vectorize.toPositions(filterPoints);
    it("should remove correct points", function() {
        for (var i = 1; i < filterVectors.length - 1; i++) {
            expect(filterVectors[i].magnitude()).to.be.above(5)
            expect(filterVectors[i].magnitude()).to.be.below(30);
        }
    })
})
describe("Velocity Filter", function() {
    it("Test Case #1", function() {
        var filterPoints = gpsFilter.velocityFilter(points, 0, 9)
        expect(filterPoints.length).to.be.equal(4);
        expect(filterPoints[0].tag).to.be.equal('A');
        expect(filterPoints[3].tag).to.be.equal('F');
    })
    it("Test Case #1", function() {
        var filterPoints = gpsFilter.velocityFilter(points, 9, 105)
        expect(filterPoints.length).to.be.equal(4);
        expect(filterPoints[0].tag).to.be.equal('B');
        expect(filterPoints[3].tag).to.be.equal('E');
    })
})
describe("Acceleration Filter", function() {
    it("Test Case #1", function() {
        var filterPoints = gpsFilter.accelerationFilter(points, 6, 9)
        expect(filterPoints.length).to.be.equal(4);
        expect(filterPoints[0].tag).to.be.equal('C');
        expect(filterPoints[3].tag).to.be.equal('F');
    })
    it("Test Case #2", function() {
        var filterPoints = gpsFilter.accelerationFilter(points, 0, 6)
        expect(filterPoints.length).to.be.equal(4);
        expect(filterPoints[0].tag).to.be.equal('A');
        expect(filterPoints[3].tag).to.be.equal('D');
    })
})
describe("Remove Spikes", function() {
    var spikeFree = gpsFilter.removeSpikes(spikePoints, 150)
    it("should remove correct points", function() {
        var tags = spikeFree.map(function(v) {
            return v.tag
        })
        expect(tags.length).to.be.equal(6)
        expect(tags.indexOf('c')).to.be.equal(-1);
    })
})
describe("Angle Between", function() {
    it("Test Case #1", function() {
        var angle = gpsFilter.angleBetween(new Victor(0, 1), new Victor(1, 0))
        expect(angle).to.be.within(89, 90);
    })
    it("Test Case #2", function() {
        var angle = gpsFilter.angleBetween(new Victor(1, 1), new Victor(1, 0))
        expect(angle).to.be.within(44, 46);
    })
    it("Test Case #3", function() {
        var angle = gpsFilter.angleBetween(new Victor(-1, 0), new Victor(1, 0))
        expect(angle).to.be.within(179, 181);
    })
    it("Test Case #3", function() {
        var angle = gpsFilter.angleBetween(new Victor(0, 1), new Victor(0, 1))
        expect(angle).to.be.within(0, 0);
    })
})
