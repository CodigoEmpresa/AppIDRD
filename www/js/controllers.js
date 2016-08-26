angular.module('starter.controllers', [])
.controller('MenuCtrl', function($scope, $ionicSideMenuDelegate){
    $scope.$watch(function () {
        return $ionicSideMenuDelegate.getOpenRatio();
    }, function (newValue, oldValue) {
        if (newValue == 0) {
            $scope.hideLeft = true;
        } else {
            $scope.hideLeft = false;
        }
    });
})
.controller('InicioCtrl', function (api_ciclovia, $scope, $state, $rootScope, $ionicHistory, Usuario, STORAGE) {
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    (function (){
        Usuario.all().then(function (data) {
            if (data.length > 0)
            {
                api_ciclovia.obtenerIdUsuario(data[0].identificacion).then(function (idPersona) {
                    $state.go('ciclovia.noticias');
                    data[0].id_persona = parseInt(idPersona);

                    STORAGE.set('usuario', data[0]);
                });
                
            } else {
                $state.go('registro');
            }
        });
    })();
})
.controller('RegistroCtrl', function (api_ciclovia, $scope, $state, $ionicHistory, Usuario) {

    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.registrarse = function (isValid) {
        if(isValid)     
        {
            api_ciclovia.registro($scope.identificacion, $scope.nombre).then(function (resultado) {
                if (resultado)
                {
                    Usuario.add({ identificacion: $scope.identificacion, nombre: $scope.nombre });
                    $state.go('ciclovia.noticias');
                }
            });
        } else {
            alert('Por favor ingrese su nombre y número de identificación.');
        }
    }
})

.controller('NoticiasCtrl', function (api_ciclovia, $scope) {
    api_ciclovia.getNews().then(function (news) {
        $scope.news = news;
    });
})

.controller('ChatCtrl', function (api_ciclovia, $scope, STORAGE) {
    var usuario = STORAGE.get('usuario');

    $scope.recargar = function () {
        api_ciclovia.getMessages().then(function (messages) {
            $scope.messages = messages;
        });
    }

    $scope.personas_idrd = [6];

    $scope.enviarMensaje = function ()
    {
        if ($scope.message.trim() != '')
        {
            api_ciclovia.sendMessage($scope.message.trim(), usuario.id_persona).then(function (result) {
                $scope.recargar();
                $scope.message = '';
            });
        }
    }

    $scope.recargar();
})

.controller('CorredoresCtrl', function (api_ciclovia, $rootScope, $scope, $filter) {

    var BOGOTA = new plugin.google.maps.LatLng(4.666575, -74.125786);
    var map, vm = $scope, root = $rootScope,
    div = document.getElementById("mapa");
    map = plugin.google.maps.Map.getMap(div);
    map.setOptions({
        mapType: plugin.google.maps.MapTypeId.ROADMAP,
        controls: {
            compass: true,
            myLocationButton: true
        },
        gestures: {
            scroll: true,
            tilt: true,
            rotate: true,
            zoom: true
        }
    });
    $scope.corredor = "1";

    map.addEventListener(plugin.google.maps.event.MAP_READY, function()
    {
        map.setCenter(BOGOTA);
        map.animateCamera({
          'target': BOGOTA,
          'tilt': 60,
          'zoom': 11,
          'bearing': 140,
          'duration': 3000
        });

        api_ciclovia.obtenerCorredores().then(function(corredores)  
        { 
            $scope.corredores = corredores;
            angular.forEach(corredores, function(corredor, key) {
                var points = [];

                angular.forEach(corredor.geolocalizacion, function(punto, key) {
                    points.push(new plugin.google.maps.LatLng(punto.latitud, punto.longitud));
                });
                map.addPolyline({
                    'points': points,
                    'color' : "#02A7EB",
                    'width': 2,
                    'geodesic': true
                });
            });
        });
    });

    $scope.enfocar = function(corredor)
    {
        if(corredor.idCorredor > 0)
        {
            var points = [];
            map.animateCamera({
              'target': new plugin.google.maps.LatLng(corredor.latitud, corredor.longitud),
              'tilt': 60,
              'zoom': 12,
              'bearing': corredor.bearing,
              'duration': 3000
            });

            map.clear();
            angular.forEach(corredor.geolocalizacion, function(punto, key) {
                points.push(new plugin.google.maps.LatLng(punto.latitud, punto.longitud));
            });

            map.addPolyline({
                'points': points,
                'color' : "#02A7EB",
                'width': 2,
                'geodesic': true
            });
        } else {
            map.setCenter(BOGOTA);
            map.animateCamera({
              'target': BOGOTA,
              'tilt': 60,
              'zoom': 11,
              'bearing': 140,
              'duration': 3000
            });

            map.clear();
            angular.forEach($scope.corredores, function(corredor, key) {
                var points = [];

                angular.forEach(corredor.geolocalizacion, function(punto, key) {
                    points.push(new plugin.google.maps.LatLng(punto.latitud, punto.longitud));
                });

                map.addPolyline({
                    'points': points,
                    'color' : "#02A7EB",
                    'width': 2,
                    'geodesic': true
                });
            });
        }
    }
});

/*
 var map,
    vm = $scope,
    root = $rootScope,
    div = document.getElementById("mapa");

map = plugin.google.maps.Map.getMap(div);

map.setOptions({
    mapType: plugin.google.maps.MapTypeId.ROADMAP,
    controls: {
        compass: true,
        myLocationButton: true
    },
    gestures: {
        scroll: true,
        tilt: true,
        rotate: true,
        zoom: true
    }
});
*/