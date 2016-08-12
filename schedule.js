var _ = require('lodash');
var moment = require('moment');

module.exports = Schedule;

function Schedule(showtimes, theatre) {
	this.showtimes = _.slice(showtimes);
	this.theatre = theatre;
	this.delays = this.calculateDelays();
	this.totalDelay = _.sum(this.delays);
}

Schedule.prototype.calculateDelays = function() {
	var delays = [];	
	this.showtimes.forEach(function(showtime, index, array) {
		if (index < array.length - 1) {
			var endTime = moment(showtime.dateTime).add(showtime.movie.runTime);
			var nextStartTime = array[index + 1].dateTime;
			delays.push(nextStartTime.diff(endTime));
		}
	});
	return delays;
};