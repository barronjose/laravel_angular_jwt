(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('AdminlistCtrl', function($http, $scope, $rootScope, $state, User) {
            $scope.users = [];

            $scope.userTypes = ['Admin', 'Medico', 'Farmacéutico', 'Partera', 'Nutriólogo'];

            $scope.init = function init() {
                User.getAll({},
                    function onSuccess(response) {
                        $scope.users = response.data;
                    },
                    function onError(err) {
                        console.log(err);
                    });
            };

            $scope.getUserType = function getUserType(type) {
                return $scope.userTypes[type];
            };

            (function() {
                $scope.init();
            })();
        });
})();
