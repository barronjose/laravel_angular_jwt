(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('SignupCtrl', function($scope, Auth, $state) {

            function isValidPassword (password) {
                return (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\$\@\!\%\*\?\&\,\.\-\_\+\#\~\|\°\{\}\(\)\/]{8,}$/).test(password);
            }

            $scope.error = '';

            $scope.data = {
                userType: 1
            };

            $scope.userTypes = [
                {
                    id: 1,
                    label: 'Medico'
                },
                {
                    id: 2,
                    label: 'Farmacéutico'
                },
                {
                    id: 3,
                    label: 'Partera'
                },
                {
                    id: 4,
                    label: 'Nutriólogo'
                }
            ];

            $scope.signup = function submit() {
                if ($scope.data.password !== $scope.data.passwordConf) {
                    $scope.error = 'Las contraseñas deben coincidir';
                    return;
                }
                if (!isValidPassword($scope.data.password)) {
                    $scope.error = 'Contraseña no cumple los requerimientos';
                    return;
                }
                $scope.register();
            };

            $scope.register = function register() {
                Auth.signup($scope.data,
                    function onSucces(response) {
                        $scope.error = '';
                        $state.go('login');
                    },
                    function onError(err) {
                        $scope.error = 'Lo sentimos ese correo ya ha sido registrado.';
                    });
            };

        });
})();
