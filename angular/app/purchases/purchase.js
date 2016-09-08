(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('PurchaseCtrl', function($scope, $http, Purchase) {

            $scope.data = {
                folio: '',
                ammount: 0,
                branch: '',
                photo: null
            };
            $scope.submit = function submit() {
                Purchase.create($scope.data,
                    function onSuccess(response) {
                        console.log(response);
                    },
                    function onError(error) {
                        console.log(error);
                    });
            };
        });
})();
