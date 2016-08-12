var _ = require('lodash');
var moment = require('moment');

module.exports = Schedule;

function Schedule(showtimes, theatre) {
	this.showtimes = _.slice(showtimes);
	this.theatre = theatre;
	this.delays = this.calculateDelays();
	this.totalDelay = _.sum(this.delays.values());
}

Schedule.prototype.calculateDelays = function() {
	var delays = new Map();
	
	this.showtimes.forEach(function(showtime, index, array) {
		if (index >= array.length - 1) {
			return;
		}
		var endTime = moment(showtime.dateTime).add(showtime.movie.runTime);
		var nextStartTime = array[index + 1].dateTime;
		delays.set(showtime, nextStartTime.diff(endTime));
	});

	return delays;
};