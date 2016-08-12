angular.module('starter.controllers', [])
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

.controller('MapaCtrl', function ($rootScope, $scope) {

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
});
