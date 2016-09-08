(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('User', function($resource) {

            var _users =  $resource('api/users/:id', { id: '@id' }, {
                getAll: {
                    method: 'GET',
                    url: 'api/users'
                },
                get: {
                    method: 'GET'
                }
            });

            _users.something = function somethind() {
                return '';
            };

            return _users;
        });
})();
