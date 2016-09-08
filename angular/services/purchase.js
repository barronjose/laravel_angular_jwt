(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('Purchase', function($resource) {

            var _purchase =  $resource('api/purchases/:id', { id: '@id' }, {
                create: {
                    method: 'POST',
                    url: 'api/purchases/'
                },
                getByUser: {
                    method: 'GET'
                }
            });

            _purchase.something = function somethind() {
                return '';
            };

            return _purchase;
        });
})();
