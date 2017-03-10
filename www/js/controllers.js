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

.controller('MediaCtrl', function($scope, $timeout, $cordovaNativeAudio, $ionicPlatform) {

    $scope.play = function() 
    {
        $scope.status = true;
        $cordovaNativeAudio.preloadComplex('cancion', ($ionicPlatform.is('android') ? '' : '') + 'media/ciclovia.mp3', 1, 1)
            .then(function (msg) {
                $cordovaNativeAudio.play('cancion');
            }, function (error) {
                console.error(error);
            });
    }

    $scope.stop = function() 
    {
        $scope.status = false;
        $cordovaNativeAudio.stop('cancion');
        $cordovaNativeAudio.unload('cancion');
    }
})

.controller('InicioCtrl', function (api_ciclovia, $scope, $state, $ionicHistory, Usuario, STORAGE, Utils) {
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.type = '', $scope.isOnline = false;
    $scope.login = function()
    {
        Utils.isOnline().then(function(online)
        {
            $scope.isOnline = online;

            if ($scope.isOnline)
            {
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
            }
        });
    };

    $scope.login();
})

.controller('RegistroCtrl', function (api_ciclovia, $scope, $state, $ionicHistory, Usuario, STORAGE) {
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
                    setTimeout(function()
                    {
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
                        
                        $state.go('ciclovia.noticias');

                    }, 500);
                }
            });
        } else {
            alert('Por favor ingrese su nombre y número de identificación.');
        }
    }
})

.controller('NoticiasCtrl', function (api_ciclovia, $scope, $ionicLoading, Utils) {
    
    $scope.load = function()
    {
        Utils.isOnline().then(function(online)
        {
            $scope.isOnline = online;

            if ($scope.isOnline)
            {
                $ionicLoading.show();
                api_ciclovia.getNews().then(function (news) {
                    angular.forEach(news, function(n, key) {
                        Utils.isImage(n.imgNoticia).then(function(res){
                            if (!res)
                            {
                                n.imgNoticia = 'NO';
                            }
                        });
                    });

                    $scope.news = news;
                    $ionicLoading.hide();
                });

                $scope.imageExists = function(src)
                {
                    var result = Utils.isImage(src).then(function(result) {
                        $scope.result = result;
                    });
                }
            }
        });
    }

    $scope.load();
})

.controller('EventosCtrl', function(api_ciclovia, $scope, $ionicLoading, Utils) {
    $scope.load = function()
    {
        Utils.isOnline().then(function(online)
        {
            $scope.isOnline = online;
            $scope.totalEventos = 0;

            if ($scope.isOnline)
            {
                $ionicLoading.show();

                api_ciclovia.getEvents().then(function (events) {

                    angular.forEach(events, function(n, j)
                    {
                        angular.forEach(n, function(event, k)
                        {
                            Utils.isImage(event.imgEvento).then(function(res)
                            {
                                if (!res)
                                {
                                    n.imgEvento = 'NO';
                                }
                            });

                            $scope.totalEventos++;
                        });
                    });

                    $scope.events = events;
                    $ionicLoading.hide();
                });
            }
        });
    }

    $scope.load();
})

.controller('ChatCtrl', function (api_ciclovia, $scope, $ionicLoading, STORAGE, Utils) {
    $scope.load = function()
    {
        Utils.isOnline().then(function(online)
        {
            $scope.isOnline = online;

            if ($scope.isOnline)
            {
                $ionicLoading.show();
                var usuario = STORAGE.get('usuario');

                $scope.recargar = function () {
                    api_ciclovia.getMessages().then(function (messages) {
                        $scope.messages = messages;
                        $ionicLoading.hide();
                    });
                }

                $scope.personas_idrd = [0, 6, 2044];

                $scope.enviarMensaje = function ()
                {
                    if ($scope.message.trim() != '')
                    {
                        api_ciclovia.sendMessage($scope.message.trim(), usuario.id_persona).then(function (result) {
                            $ionicLoading.show();
                            $scope.recargar();
                            $scope.message = '';
                        });
                    }
                }

                $scope.recargar();
            }
        });
    }

    $scope.load();
})

.controller('CorredoresCtrl', function (api_ciclovia, $rootScope, $scope, $filter, $timeout, Utils) {
    $scope.corredor;
    $scope.corredor_actual = 0;
    $scope.alimentos = true;
    $scope.ciclotaller = true;
    $scope.accesorios = true;

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
            $scope.corredores = $filter('filter')(corredores, function(value, index, array){
                return value.idCorredor > 0;
            }, true);
        });
    });

    $scope.repaint = function()
    {
        var points = [];
        var markers = [];
        var corredor = $scope.corredor;

        if(corredor.idCorredor != $scope.corredor_actual)
        {
            map.animateCamera({
              'target': new plugin.google.maps.LatLng(corredor.latitud, corredor.longitud),
              'tilt': 60,
              'zoom': 12,
              'bearing': corredor.bearing,
              'duration': 3000
            });
        }

        angular.forEach(corredor.geolocalizacion, function(punto, key) {
            points.push(new plugin.google.maps.LatLng(punto.latitud, punto.longitud));
        });

        angular.forEach(corredor.puntos, function(punto, key) {
            var icon = "";

            switch(punto.idPunto)
            {
                case 1:
                    icon = "ic-comidas.png";
                break;
                case 2:
                    icon = "ic-taller.png";
                break;
                case 3:
                    icon = "ic-accesorios.png";
                break;
            }

            if(
                (punto.idPunto == 1 && $scope.alimentos) || 
                (punto.idPunto == 2 && $scope.ciclotaller) || 
                (punto.idPunto == 3 && $scope.accesorios)
            )
            {
                var marker = {
                    'position':  new plugin.google.maps.LatLng(punto.latitud, punto.longitud),
                    'icon': {
                        'url': 'www/img/'+icon,
                        'size': {
                            width: 34,
                            height: 44
                        }
                    },
                    'title': punto.nombreCP,
                    'snippet': punto.descripcionCP,
                    'markerClick': function(marker) {
                        marker.showInfoWindow();
                    },
                    'infoClick': function(marker) {
                    }
                }
                markers.push(marker);
            }
        });
    
        map.clear();

        map.addPolyline({
            'points': points,
            'color' : "#02A7EB",
            'width': 2,
            'geodesic': true
        });

        angular.forEach(markers, function(marker, key) {
            map.addMarker(marker);
        });

        $scope.corredor_actual = corredor.idCorredor;
    }

    $scope.enfocar = function(corredor)
    {
        $scope.corredor = corredor;
        $scope.repaint();
    }

    $scope.touch = function(marker)
    {
        switch(marker)
        {
            case 'alimentos':
                $scope.alimentos = !$scope.alimentos;
            break;
            case 'ciclotaller':
                $scope.ciclotaller = !$scope.ciclotaller;
            break;
            case 'accesorios':
                $scope.accesorios = !$scope.accesorios;
            break;
        }
        $scope.repaint();
    }
})

.controller('RecomendacionesCtrl', function(api_ciclovia, $scope, $ionicLoading, Utils) {
    $scope.load = function()
    {
        Utils.isOnline().then(function(online)
        {
            $scope.isOnline = online;

            if ($scope.isOnline)
            {
                $ionicLoading.show();

                api_ciclovia.getRecommendations().then(function (items) {
                    $scope.items = items;
                    $ionicLoading.hide();
                });

                $scope.items = [];
            }
        });
    }

    $scope.load();
});
