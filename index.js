const util = require('util');

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
	// console.log(util.inspect(schedules, 2));
	console.log(JSON.stringify(schedules, null, 2));
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
