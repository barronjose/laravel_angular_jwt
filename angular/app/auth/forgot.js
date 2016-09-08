(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('ForgotpassCtrl', function($scope, $state, Auth) {
            $scope.data = {
                email: ''
            };
            $scope.submit = function submit() {
                Auth.forgot($scope.data,
                    function onSuccess(response) {
                        $state.go('login');
                    },
                    function onError(err) {
                        console.log(err);
                    });
            };

        });
})();
