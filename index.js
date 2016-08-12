var movieApi = require('./movieApi');
var movieApiKey = require('./apiKey');
var moment = require('moment');
var scheduleGenerator = require('./scheduleGenerator');

var queryParams = {
	api_key: movieApiKey,
	startDate: (new Date()).toISOString().slice(0,10),
	zip: 'M5R2W8'
};

movieApi.getMovies(queryParams, function(movies) {
	var desiredMovies = selectMovies(movies);
	var schedules = scheduleGenerator.generateSchedules(desiredMovies, chooseParameters());

	schedules.forEach(function(schedule, index) {
		console.log('Schedule ' + (index + 1) + ' at ' + schedule.theatre.name);
		schedule.showtimes.forEach(function(showtime, showtimeIndex, showtimeArray) {
			console.log('\t' + showtime.dateTime.toString() + ': ' + showtime.movie.title);
			if (showtimeIndex < showtimeArray.length - 1) {
				console.log('\tDelay of ' + schedule.delays[showtimeIndex] / 1000 / 60 + ' minutes ');
			}
		});
	});
});

function chooseParameters() {
	return {
		sortByDelay: true,
		skipPreviews: false,
		maxOverlap: moment.duration(0)
	}
}

function selectMovies(allMovies) {
	return [allMovies[3], allMovies[4]];
}
