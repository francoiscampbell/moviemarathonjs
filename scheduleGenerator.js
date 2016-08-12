var _ = require('lodash');
var moment = require('moment');
var Schedule = require('./schedule');

var defaultOptions = {
	sortByDelay: true,
	skipPreviews: false,
	previewLength: moment.duration(15, 'minutes'),
	earliestTime: moment(0),
	latestTime: null,
	maxIndividualDelay: null,
	maxTotalDelay: null,
	maxOverlap: moment.duration(0)
};

module.exports = {
	generateSchedules: function(movies, userOptions) {
		var options = _.defaults(userOptions, defaultOptions);

		var allTheatres = reorganizeMoviesIntoModel(movies)
		var possibleTheatres = calculatePossibleTheatres(allTheatres, movies);
		var possibleSchedules = [];
		var currentPermutation = [];

		possibleTheatres.forEach(function(theatre) {
			generateScheduleRecursive(theatre, movies, options.earliestTime, possibleSchedules, currentPermutation, options);
		});

		if (options.sortByDelay) {
			possibleSchedules = _.sortBy(possibleSchedules, function(schedule) { return schedule.totalDelay; });
		}
		return possibleSchedules;
	}
};

function generateScheduleRecursive(theatre, movies, startTime, possibleSchedules, currentPermutation, options) {
	if (!movies.length && currentPermutation.length) {
		var currentSchedule = new Schedule(currentPermutation, theatre);
		if (validateSchedule(currentSchedule, options)) {
			possibleSchedules.push(currentSchedule);
		}
		return;
	}
	movies.forEach(function(movie) {
		var showtime = null
		var nextAvailableStartTime = startTime
		while ((showtime = findNextShowtimeForMovie(theatre, movie, nextAvailableStartTime, options))) {
			currentPermutation.push(showtime);
			var remainingMovies = _.filter(movies, function(m) { return m.tmsId !== movie.tmsId });
			nextAvailableStartTime = moment(showtime.dateTime).add(options.skipPreviews ? options.previewsLength : 0).add(movie.runTime);
			generateScheduleRecursive(theatre, remainingMovies, nextAvailableStartTime, possibleSchedules, currentPermutation, options);
			currentPermutation.pop();
		}
	});
}

function reorganizeMoviesIntoModel(movies) {
	var allTheatres = [];

	movies.forEach(function(movie) {
		movie.showtimes.forEach(function(showtime) {
            showtime.movie = movie; //set the movie to be a child of the showtime

            var theatre = _.find(allTheatres, function(theatre) { return theatre.id === showtime.theatre.id; });
            if (!theatre) {
            	theatre = showtime.theatre;
            	allTheatres.push(theatre);	
            }
            theatre.showtimes = theatre.showtimes || [];
            theatre.showtimes.push(showtime); //add the showtime to the showtimes for this theatre

            delete showtime.theatre;
        });
		delete movie.showtimes;
	});

	allTheatres.forEach(function(theatre) {
		_.sortBy(theatre.showtimes);
	});

	return allTheatres;
}

function calculatePossibleTheatres(allTheatres, movies) {
	return _.filter(allTheatres, function(theatre) {
		var moviesAtThisTheatre = _.map(theatre.showtimes, function(showtime) {
			return showtime.movie
		});

		return movies.length === _.intersection(moviesAtThisTheatre, movies).length;
	});
}

function validateSchedule(schedule, options) {
	var totalDelayValid = !options.maxTotalDelay || schedule.totalDelay.asMilliseconds() < options.maxTotalDelay.asMilliseconds();
	var individualDelayValid = (!options.maxIndividualDelay || !schedule.delays.length || _.max(schedule.delays.values()).asMilliseconds() < options.maxIndividualDelay.asMilliseconds());
	return totalDelayValid && individualDelayValid; 
}

function findNextShowtimeForMovie(theatre, movie, nextAvailableStartTime, options) {
	return _.find(theatre.showtimes, function(showtime) {
		return showtime.movie.tmsId === movie.tmsId && validateShowtime(showtime, nextAvailableStartTime, options);
	});
}

function validateShowtime(showtime, nextAvailableStartTime, options) {
	var startTimeValid = showtime.dateTime.isSameOrAfter(moment(nextAvailableStartTime).subtract(options.maxOverlap));
	var endTimeValid = options.latestTime ? moment(showtime.dateTime).add(showtime.runTime).isSameOrBefore(options.latestTime) : true;

	return startTimeValid && endTimeValid;
}