var movieApi = require('./movieApi');
var scheduleGenerator = require('./scheduleGenerator');

module.exports = {
	getMovies: movieApi.getMovies,
	generateSchedules: scheduleGenerator.generateSchedules
};
