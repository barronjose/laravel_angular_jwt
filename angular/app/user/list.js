(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('UserlistCtrl', function($http, $scope, $rootScope, $state, Purchase, Auth) {
            $scope.purchases = [];
            $scope.user = Auth.getUser();

            $scope.init = function init() {
                $scope.getPurchases();
            };

            $scope.getPurchases = function getPurchases() {
                var params = {
                    id: $scope.user.id
                };
                Purchase.getByUser(params ,
                    function onSuccess(response) {
                        $scope.purchases = response.data;
                    },
                    function onError(err) {
                        console.log(err);
                    });
            };

            (function() {
                $scope.init();
            })();
        });
})();
