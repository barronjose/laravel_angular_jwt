(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('Auth', function($resource) {

            var _auth =  $resource('api/purchases/:id', { id: '@id' }, {
                login: {
                    method: 'POST',
                    url: 'api/authenticate'
                },
                getUser: {
                    method: 'GET',
                    url: 'api/authenticate/user'
                },
                signup: {
                    method: 'POST',
                    url: 'api/authenticate/register'
                },
                forgot: {
                    method: 'PUT',
                    url: 'api/authenticate/forgot'
                },
                change: {
                    method: 'PUT',
                    url: 'api/authenticate/change'
                }
            });

            _auth.setUser = function setUser(user) {
                localStorage.setItem('user', user);
            };

            _auth.getUser = function getUser(user) {
                return JSON.parse(localStorage.getItem('user')) || false;
            };

            _auth.clearUser = function clearUser() {
                localStorage.removeItem('user');
            };

            return _auth;
        });
})();
