angular.module('starter.filters', [])
.filter('dateToISO', function() {
	return function(input) {
		var t = input.split(/[- :]/);
		var date = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));

        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
	};
});
