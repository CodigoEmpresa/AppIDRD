angular.module('starter.directives', [])
.directive('googleMap', function () {
    return {
        restrict: 'A',
        scope: {
            mapReady: '&onMapReady'
        },
        link: function (scope, element) {
            function triggerMapReady(map) {
                scope.mapReady({ map: map });
            }

            var mapParams = {
                'mapType': plugin.google.maps.MapTypeId.ROADMAP,
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true
                },
                'gestures': {
                    'scroll': true,
                    'tilt': true,
                    'rotate': true,
                    'zoom': true
                }
            };

            var map = plugin.google.maps.Map.getMap(element[0], mapParams);
            map.on(plugin.google.maps.event.MAP_READY, triggerMapReady);
        }
    };
});