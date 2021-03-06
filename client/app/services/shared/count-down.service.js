'use strict';

(function () {
    angular
        .module('dailyMummApp')
        .service('CountDownService', CountDownService);

    CountDownService.$inject = ['$rootScope', '$interval'];

    function CountDownService($rootScope, $interval) {
        var service = {};
        var timeinterval;

        service.initializeClock = initializeClock;
        service.stopTimer = stopTimer;
        service.getTimeRemaining = getTimeRemaining;

        function getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());
            var seconds = Math.floor((t / 1000) % 60);
            var minutes = Math.floor((t / 1000 / 60) % 60);
            var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
            var days = Math.floor(t / (1000 * 60 * 60 * 24));
            return {
                'total': t,
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds
            };
        }

        function initializeClock(id, endtime, timeoutPeriod) {
            var clock = document.getElementById(id);
            timeinterval = $interval(function () {
                var t = getTimeRemaining(endtime);
                var minutes = t.minutes < 10 ? '0' + t.minutes : t.minutes;
                var seconds = t.seconds < 10 ? '0' + t.seconds : t.seconds;
                clock.innerHTML = '00:' + minutes + ':' + seconds;
                
                if (t.total <= 0) {
                    $interval.cancel(timeinterval);
                    $rootScope.$broadcast('timeout');
                }
            }, 1000, timeoutPeriod / 1000);
        }

        function stopTimer(id) {
            var clock = document.getElementById(id);
            clock.innerHTML = "00:00:00";
            $interval.cancel(timeinterval);
        }

        return service;
    }
})();