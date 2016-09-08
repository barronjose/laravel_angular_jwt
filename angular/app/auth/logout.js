(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('LogoutCtrl', function($auth, $state, $scope, Auth) {

            $auth.logout().then(function() {
                Auth.clearUser();
                $state.go('login');
            });
            
        });
})();
