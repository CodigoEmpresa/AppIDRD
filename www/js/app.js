// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var db;

angular.module('starter', ['ionic', 'ion-gallery', 'starter.controllers', 'starter.services', 'starter.filters', 'ngCordova', 'ngStorage'])

.run(function ($ionicPlatform, $cordovaSQLite, $rootScope) {
    $ionicPlatform.ready(function() {
        var reset_database = false;
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (cordova.platformId === 'ios' && window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        if (window.cordova) {
            db = $cordovaSQLite.openDB({ name: "idrd.db", location: 'default' });
        } else {
            db = window.openDatabase("idrd.db", '1', 'IDRD ', 5 * 1024 * 1024);
        }

        if(reset_database)
        {
            $cordovaSQLite.execute(db, 'DROP TABLE usuarios');
        }

        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, identificacion TEXT, nombre TEXT)');
    });
})

.config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $httpProvider, ionGalleryConfigProvider) {
    $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
        var key, result = [];

        if (typeof data === "string")
            return data;

        for (key in data) {
            if (data.hasOwnProperty(key))
                result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
        return result.join("&");
    });

    ionGalleryConfigProvider.setGalleryConfig({
        action_label: 'Close',
        template_gallery: 'gallery.html',
        template_slider: 'slider.html',
        toggle: false,
        row_size: 3,
        fixed_row_size: true
    });

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $stateProvider
    .state('inicio', {
        url: '/inicio',
        templateUrl: 'templates/splash.html',
        controller: 'InicioCtrl'
    })
    .state('registro', {
        url: '/registro',
        templateUrl: 'templates/registro.html',
        controller: 'RegistroCtrl'
    })
    .state('ciclovia', {
        url: '/ciclovia',
        abstract: true,
        templateUrl: 'templates/ciclovia/menu.html'
    })
    .state('ciclovia.noticias', {
        url: '/noticias',
        views: {
            'menuContent': {
                templateUrl: 'templates/ciclovia/noticias.html',
                controller: 'NoticiasCtrl'
            }
        }
    })
    .state('ciclovia.eventos', {
        url: '/eventos',
        views: {
            'menuContent': {
                templateUrl: 'templates/ciclovia/eventos.html',
                controller: 'EventosCtrl'
            }
        }
    })
    .state('ciclovia.chat', {
        url: '/chat',
        views: {
            'menuContent': {
                templateUrl: 'templates/ciclovia/chat.html',
                controller: 'ChatCtrl'
            }
        }
    })
    .state('ciclovia.corredores', {
        url: '/corredores',
        views: {
            'menuContent': {
                templateUrl: 'templates/ciclovia/corredores.html',
                controller: 'CorredoresCtrl'
            }
        }
    })
    .state('ciclovia.recomendaciones', {
        url: '/recomendaciones',
        views: {
            'menuContent': {
                templateUrl: 'templates/ciclovia/recomendaciones.html',
                controller: 'RecomendacionesCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('inicio');
});
