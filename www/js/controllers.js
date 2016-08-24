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

.controller('CorredoresCtrl', function (api_ciclovia, $rootScope, $scope, $timeout, $ionicModal, $filter, uiGmapGoogleMapApi) {

    uiGmapGoogleMapApi.then(function(maps) 
    {
        $scope.map = {
            center: { latitude: 4.720584, longitude: -74.074974 }, 
            zoom: 12,
            control: {},
            options: {
                 streetViewControl: false,
                 zoomControl: false,
                 mapTypeControl: false,
            }
        };
        $scope.polylines = [];
        $scope.markers = [];
    });

    $ionicModal.fromTemplateUrl('templates/mapa.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalRutas = modal;
    });

    $ionicModal.fromTemplateUrl('templates/bicicorredor.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalBicicorredor = modal;
    });

    api_ciclovia.obtenerCorredores().then(function(corredores) 
    {
        $scope.corredores = corredores;
    });

    $scope.openMapaRutas = function() 
    {
        $scope.modalRutas.show();
    };

    $scope.hideMapaRutas = function() 
    {
        $scope.modalRutas.hide();
    };

    $scope.openMapaBicicorredor = function(bicicorredor)
    {   
        $scope.modalBicicorredor.show();
        $scope.polylines = [];
        $scope.markers = [];
       
        var corredor = $filter('filter')($scope.corredores, function(o){
            return o.idCorredor == bicicorredor;
        })[0];

        var linea = {
            id: 1,
            path: [],
            stroke: {
                color: '#02A7EB',
                weight: 2
            }
        };

        angular.forEach(corredor.geolocalizacion, function(value, key){
            linea.path.push({
                latitude: value.latitud,
                longitude: value.longitud
            });
        });

        angular.forEach(corredor.puntos, function(value, key){
            $scope.markers.push(value);
        });

        $scope.corredor = corredor.nombreCorredor;
        $scope.map.center.latitude = corredor.latitud;
        $scope.map.center.longitude =  corredor.longitud;
        $scope.polylines.push(linea);
        $scope.showMap = false;
        $timeout(function() {
            $scope.showMap = true;
        }, 0);
    };

    $scope.hideMapaBicicorredor = function(bicicorredor)
    {
        $scope.modalBicicorredor.hide();
    };
});