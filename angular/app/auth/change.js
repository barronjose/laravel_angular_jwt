(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('ChangepassCtrl', function($http, $state, $scope, Auth) {

            $scope.data = {
                password: '',
                passwordConfirmation: '',
                passwordToken: $state.params.token
            };

            $scope.submit = function submit() {
                if ($scope.data.password !== $scope.data.passwordConfirmation) {
                    return;
                }
                $scope.changePassword();
            };

            $scope.changePassword = function changePassword() {
                Auth.change($scope.data,
                    function onSuccess(response) {
                        $state.go('login');
                    },
                    function onError(err) {
                        console.log(err);
                    });
            };
        });
})();
