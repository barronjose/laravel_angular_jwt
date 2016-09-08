(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('LoginCtrl', function($auth, $state, $http, $scope, Auth) {

            $scope.data = {
                email: '',
                password: ''
            };

            $scope.error = false;

            $scope.login = function login() {
                var credentials = {
                        email: $scope.data.email,
                        password: $scope.data.password
                    },
                    authPath = window.location.pathname + 'api/authenticate/user';

                $auth.login(credentials).then(function(data) {
                    return $http.get(authPath);
                })
                .then(function onSuccess(response) {
                    if (response.error) {
                        onError(response.error);
                        return;
                    }
                    var user = JSON.stringify(response.data.user);
                    Auth.setUser(user);
                    if (response.data.user.user_type === 0) {
                        $state.go('adminList');
                        return;
                    }
                    $state.go('userList');
                },function onError(err) {
                    $scope.error = true;
                });
            };

            function onError(err) {
               $scope.loginError = true;
               $scope.loginErrorText = err;
            }
        });
})();
