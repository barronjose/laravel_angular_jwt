(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('NavBarCtrl', function($scope, Auth) {
            $scope.isLogged = Auth.getUser();
        });
})();
