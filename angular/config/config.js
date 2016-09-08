(function() {
    'use strict';

    angular
        .module('mediPuntos.config', [
            'ui.router',
            'satellizer',
            'ngResource',
            'angularValidator'
        ])
        .config(function($stateProvider, $authProvider, $httpProvider, $provide, $resourceProvider) {

            function redirectWhenLoggedOut($q, $injector) {
                return {
                    responseError: function(rejection) {
                        var $state = $injector.get('$state'),
                            rejectionReasons = ['token_not_provided', 'token_expired', 'token_absent', 'token_invalid'];

                        angular.forEach(rejectionReasons, function(value, key) {
                            if (rejection.data.error === value) {
                                localStorage.removeItem('user');
                                $state.go('login');
                            }
                        });
                        return $q.reject(rejection);
                    }
                };
            }

            $resourceProvider.defaults.stripTrailingSlashes = false;

            $provide.factory('redirectWhenLoggedOut', redirectWhenLoggedOut);

            $httpProvider.interceptors.push('redirectWhenLoggedOut');

            $authProvider.loginUrl = window.location.pathname + 'api/authenticate';

           })
           .run(function($rootScope, $state, $location, Auth) {
               $rootScope.$on('$stateChangeStart', function(event, toState) {
                    if (toState.data && toState.data.requiresLogin) {
                        var user = JSON.parse(localStorage.getItem('user')) || false;
                        if (!user) {
                            event.preventDefault();
                            $state.go('login');
                        }
                        if (user.user_type !== 0 && toState.data.adminOnly) {
                            event.preventDefault();
                            $state.go('userList');
                        }
                    }
               });
           });
})();
