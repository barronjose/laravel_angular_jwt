(function(){
    "use strict";

    var app = angular.module('mediPuntos',
            [
            'mediPuntos.controllers',
            'mediPuntos.filters',
            'mediPuntos.services',
            'mediPuntos.directives',
            'mediPuntos.routes',
            'mediPuntos.config'
            ]
        );

    angular.module('mediPuntos.routes', []);
    angular.module('mediPuntos.controllers', []);
    angular.module('mediPuntos.filters', []);
    angular.module('mediPuntos.services', []);
    angular.module('mediPuntos.directives', []);
    angular.module('mediPuntos.config', []);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.config', [
            'ui.router',
            'satellizer',
            'ngResource',
            'angularValidator'
        ])
        .config(["$stateProvider", "$authProvider", "$httpProvider", "$provide", "$resourceProvider", function($stateProvider, $authProvider, $httpProvider, $provide, $resourceProvider) {

            redirectWhenLoggedOut.$inject = ["$q", "$injector"];
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

           }])
           .run(["$rootScope", "$state", "$location", "Auth", function($rootScope, $state, $location, Auth) {
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
           }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.routes', ['ui.router'])
        .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

            var getView = function( viewName ){
                return 'views/app/' + viewName + '.html';
            };

            $urlRouterProvider.otherwise('/login');

            $stateProvider
               .state('login', {
                   url: '/login',
                   controller: 'LoginCtrl',
                   templateUrl: getView('login')
               })
               .state('logout', {
                   url: '/logout',
                   controller: 'LogoutCtrl'
               })
               .state('signup', {
                   url: '/signup',
                   controller: 'SignupCtrl',
                   templateUrl: getView('signup')
               })
               .state('forgot', {
                   url: '/forgotPassword',
                   controller: 'ForgotpassCtrl',
                   templateUrl: getView('forgotPassword')
               })
               .state('changePassword', {
                   url: '/changePassword/:token',
                   controller: 'ChangepassCtrl',
                   templateUrl: getView('changePassword')
               })
               .state('adminList', {
                   url: '/admin/list',
                   templateUrl: getView('adminList'),
                   controller: 'AdminlistCtrl',
                   data: {
                       requiresLogin: true,
                       adminOnly: true
                   }
               })
               .state('userList', {
                   url: '/user/list',
                   templateUrl: getView('userList'),
                   controller: 'UserlistCtrl',
                   data: {
                       requiresLogin: true
                   }
               })
               .state('addPurchase', {
                   url: '/user/purchase',
                   templateUrl: getView('purchase'),
                   controller: 'PurchaseCtrl',
                   data: {
                       requiresLogin: true
                   }
               });
           }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('Auth', ["$resource", function($resource) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('Purchase', ["$resource", function($resource) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.services')
        .factory('User', ["$resource", function($resource) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('AdminlistCtrl', ["$http", "$scope", "$rootScope", "$state", "User", function($http, $scope, $rootScope, $state, User) {
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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('ChangepassCtrl', ["$http", "$state", "$scope", "Auth", function($http, $state, $scope, Auth) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('ForgotpassCtrl', ["$scope", "$state", "Auth", function($scope, $state, Auth) {
            $scope.data = {
                email: ''
            };
            $scope.submit = function submit() {
                Auth.forgot($scope.data,
                    function onSuccess(response) {
                        $state.go('login');
                    },
                    function onError(err) {
                        console.log(err);
                    });
            };

        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('LoginCtrl', ["$auth", "$state", "$http", "$scope", "Auth", function($auth, $state, $http, $scope, Auth) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('LogoutCtrl', ["$auth", "$state", "$scope", "Auth", function($auth, $state, $scope, Auth) {

            $auth.logout().then(function() {
                Auth.clearUser();
                $state.go('login');
            });
            
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('SignupCtrl', ["$scope", "Auth", "$state", function($scope, Auth, $state) {

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

        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('PurchaseCtrl', ["$scope", "$http", "Purchase", function($scope, $http, Purchase) {

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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('UserlistCtrl', ["$http", "$scope", "$rootScope", "$state", "Purchase", "Auth", function($http, $scope, $rootScope, $state, Purchase, Auth) {
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
        }]);
})();

(function() {
    'use strict';

    angular
        .module('mediPuntos.controllers')
        .controller('NavBarCtrl', ["$scope", "Auth", function($scope, Auth) {
            $scope.isLogged = Auth.getUser();
        }]);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJjb25maWcvY29uZmlnLmpzIiwiY29uZmlnL3JvdXRlci5qcyIsInNlcnZpY2VzL2F1dGguanMiLCJzZXJ2aWNlcy9wdXJjaGFzZS5qcyIsInNlcnZpY2VzL3VzZXIuanMiLCJhcHAvYWRtaW4vbGlzdC5qcyIsImFwcC9hdXRoL2NoYW5nZS5qcyIsImFwcC9hdXRoL2ZvcmdvdC5qcyIsImFwcC9hdXRoL2xvZ2luLmpzIiwiYXBwL2F1dGgvbG9nb3V0LmpzIiwiYXBwL2F1dGgvc2lnbnVwLmpzIiwiYXBwL3B1cmNoYXNlcy9wdXJjaGFzZS5qcyIsImFwcC91c2VyL2xpc3QuanMiLCJtb2R1bGVzL2hlYWRlci9uYXZiYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsQ0FBQSxVQUFBO0lBQ0E7O0lBRUEsSUFBQSxNQUFBLFFBQUEsT0FBQTtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBOzs7O0lBSUEsUUFBQSxPQUFBLHFCQUFBO0lBQ0EsUUFBQSxPQUFBLDBCQUFBO0lBQ0EsUUFBQSxPQUFBLHNCQUFBO0lBQ0EsUUFBQSxPQUFBLHVCQUFBO0lBQ0EsUUFBQSxPQUFBLHlCQUFBO0lBQ0EsUUFBQSxPQUFBLHFCQUFBOzs7QUNuQkEsQ0FBQSxXQUFBO0lBQ0E7O0lBRUE7U0FDQSxPQUFBLHFCQUFBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7O1NBRUEsNkZBQUEsU0FBQSxnQkFBQSxlQUFBLGVBQUEsVUFBQSxtQkFBQTs7O1lBRUEsU0FBQSxzQkFBQSxJQUFBLFdBQUE7Z0JBQ0EsT0FBQTtvQkFDQSxlQUFBLFNBQUEsV0FBQTt3QkFDQSxJQUFBLFNBQUEsVUFBQSxJQUFBOzRCQUNBLG1CQUFBLENBQUEsc0JBQUEsaUJBQUEsZ0JBQUE7O3dCQUVBLFFBQUEsUUFBQSxrQkFBQSxTQUFBLE9BQUEsS0FBQTs0QkFDQSxJQUFBLFVBQUEsS0FBQSxVQUFBLE9BQUE7Z0NBQ0EsYUFBQSxXQUFBO2dDQUNBLE9BQUEsR0FBQTs7O3dCQUdBLE9BQUEsR0FBQSxPQUFBOzs7OztZQUtBLGtCQUFBLFNBQUEsdUJBQUE7O1lBRUEsU0FBQSxRQUFBLHlCQUFBOztZQUVBLGNBQUEsYUFBQSxLQUFBOztZQUVBLGNBQUEsV0FBQSxPQUFBLFNBQUEsV0FBQTs7O1lBR0Esa0RBQUEsU0FBQSxZQUFBLFFBQUEsV0FBQSxNQUFBO2VBQ0EsV0FBQSxJQUFBLHFCQUFBLFNBQUEsT0FBQSxTQUFBO29CQUNBLElBQUEsUUFBQSxRQUFBLFFBQUEsS0FBQSxlQUFBO3dCQUNBLElBQUEsT0FBQSxLQUFBLE1BQUEsYUFBQSxRQUFBLFlBQUE7d0JBQ0EsSUFBQSxDQUFBLE1BQUE7NEJBQ0EsTUFBQTs0QkFDQSxPQUFBLEdBQUE7O3dCQUVBLElBQUEsS0FBQSxjQUFBLEtBQUEsUUFBQSxLQUFBLFdBQUE7NEJBQ0EsTUFBQTs0QkFDQSxPQUFBLEdBQUE7Ozs7Ozs7QUNoREEsQ0FBQSxXQUFBO0lBQ0E7O0lBRUE7U0FDQSxPQUFBLHFCQUFBLENBQUE7U0FDQSxnREFBQSxTQUFBLGdCQUFBLG9CQUFBOztZQUVBLElBQUEsVUFBQSxVQUFBLFVBQUE7Z0JBQ0EsT0FBQSxlQUFBLFdBQUE7OztZQUdBLG1CQUFBLFVBQUE7O1lBRUE7Z0JBQ0EsTUFBQSxTQUFBO21CQUNBLEtBQUE7bUJBQ0EsWUFBQTttQkFDQSxhQUFBLFFBQUE7O2dCQUVBLE1BQUEsVUFBQTttQkFDQSxLQUFBO21CQUNBLFlBQUE7O2dCQUVBLE1BQUEsVUFBQTttQkFDQSxLQUFBO21CQUNBLFlBQUE7bUJBQ0EsYUFBQSxRQUFBOztnQkFFQSxNQUFBLFVBQUE7bUJBQ0EsS0FBQTttQkFDQSxZQUFBO21CQUNBLGFBQUEsUUFBQTs7Z0JBRUEsTUFBQSxrQkFBQTttQkFDQSxLQUFBO21CQUNBLFlBQUE7bUJBQ0EsYUFBQSxRQUFBOztnQkFFQSxNQUFBLGFBQUE7bUJBQ0EsS0FBQTttQkFDQSxhQUFBLFFBQUE7bUJBQ0EsWUFBQTttQkFDQSxNQUFBO3VCQUNBLGVBQUE7dUJBQ0EsV0FBQTs7O2dCQUdBLE1BQUEsWUFBQTttQkFDQSxLQUFBO21CQUNBLGFBQUEsUUFBQTttQkFDQSxZQUFBO21CQUNBLE1BQUE7dUJBQ0EsZUFBQTs7O2dCQUdBLE1BQUEsZUFBQTttQkFDQSxLQUFBO21CQUNBLGFBQUEsUUFBQTttQkFDQSxZQUFBO21CQUNBLE1BQUE7dUJBQ0EsZUFBQTs7Ozs7O0FDNURBLENBQUEsV0FBQTtJQUNBOztJQUVBO1NBQ0EsT0FBQTtTQUNBLFFBQUEsc0JBQUEsU0FBQSxXQUFBOztZQUVBLElBQUEsU0FBQSxVQUFBLHFCQUFBLEVBQUEsSUFBQSxTQUFBO2dCQUNBLE9BQUE7b0JBQ0EsUUFBQTtvQkFDQSxLQUFBOztnQkFFQSxTQUFBO29CQUNBLFFBQUE7b0JBQ0EsS0FBQTs7Z0JBRUEsUUFBQTtvQkFDQSxRQUFBO29CQUNBLEtBQUE7O2dCQUVBLFFBQUE7b0JBQ0EsUUFBQTtvQkFDQSxLQUFBOztnQkFFQSxRQUFBO29CQUNBLFFBQUE7b0JBQ0EsS0FBQTs7OztZQUlBLE1BQUEsVUFBQSxTQUFBLFFBQUEsTUFBQTtnQkFDQSxhQUFBLFFBQUEsUUFBQTs7O1lBR0EsTUFBQSxVQUFBLFNBQUEsUUFBQSxNQUFBO2dCQUNBLE9BQUEsS0FBQSxNQUFBLGFBQUEsUUFBQSxZQUFBOzs7WUFHQSxNQUFBLFlBQUEsU0FBQSxZQUFBO2dCQUNBLGFBQUEsV0FBQTs7O1lBR0EsT0FBQTs7OztBQzFDQSxDQUFBLFdBQUE7SUFDQTs7SUFFQTtTQUNBLE9BQUE7U0FDQSxRQUFBLDBCQUFBLFNBQUEsV0FBQTs7WUFFQSxJQUFBLGFBQUEsVUFBQSxxQkFBQSxFQUFBLElBQUEsU0FBQTtnQkFDQSxRQUFBO29CQUNBLFFBQUE7b0JBQ0EsS0FBQTs7Z0JBRUEsV0FBQTtvQkFDQSxRQUFBOzs7O1lBSUEsVUFBQSxZQUFBLFNBQUEsWUFBQTtnQkFDQSxPQUFBOzs7WUFHQSxPQUFBOzs7O0FDckJBLENBQUEsV0FBQTtJQUNBOztJQUVBO1NBQ0EsT0FBQTtTQUNBLFFBQUEsc0JBQUEsU0FBQSxXQUFBOztZQUVBLElBQUEsVUFBQSxVQUFB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QSxDQUFBLFdBQUE7SUFDQTs7SUFFQTtTQUNBLE9BQUE7U0FDQSxXQUFBLDJDQUFBLFNBQUEsUUFBQSxNQUFBLFFBQUE7O1lBRUEsU0FBQSxpQkFBQSxVQUFBO2dCQUNBLE9BQUEsQ0FBQSw0RkFBQSxLQUFBOzs7WUFHQSxPQUFBLFFBQUE7O1lBRUEsT0FBQSxPQUFBO2dCQUNBLFVBQUE7OztZQUdBLE9BQUEsWUFBQTtnQkFDQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7O2dCQUVBO29CQUNBLElBQUE7b0JBQ0EsT0FBQTs7Z0JBRUE7b0JBQ0EsSUFBQTtvQkFDQSxPQUFBOztnQkFFQTtvQkFDQSxJQUFBO29CQUNBLE9BQUE7Ozs7WUFJQSxPQUFBLFNBQUEsU0FBQSxTQUFBO2dCQUNBLElBQUEsT0FBQSxLQUFBLGFBQUEsT0FBQSxLQUFBLGNBQUE7b0JBQ0EsT0FBQSxRQUFBO29CQUNBOztnQkFFQSxJQUFBLENBQUEsZ0JBQUEsT0FBQSxLQUFBLFdBQUE7b0JBQ0EsT0FBQSxRQUFBO29CQUNBOztnQkFFQSxPQUFBOzs7WUFHQSxPQUFBLFdBQUEsU0FBQSxXQUFBO2dCQUNBLEtBQUEsT0FBQSxPQUFBO29CQUNBLFNBQUEsU0FBQSxVQUFBO3dCQUNBLE9BQUEsUUFBQTt3QkFDQSxPQUFBLEdBQUE7O29CQUVBLFNBQUEsUUFBQSxLQUFBO3dCQUNBLE9BQUEsUUFBQTs7Ozs7OztBQ3ZEQSxDQUFBLFdBQUE7SUFDQTs7SUFFQTtTQUNBLE9BQUE7U0FDQSxXQUFBLGdEQUFBLFNBQUEsUUFBQSxPQUFBLFVBQUE7O1lBRUEsT0FBQSxPQUFBO2dCQUNBLE9BQUE7Z0JBQ0EsU0FBQTtnQkFDQSxRQUFBO2dCQUNBLE9BQUE7O1lBRUEsT0FBQSxTQUFBLFNBQUEsU0FBQTtnQkFDQSxTQUFBLE9BQUEsT0FBQTtvQkFDQSxTQUFBLFVBQUEsVUFBQTt3QkFDQSxRQUFBLElBQUE7O29CQUVBLFNBQUEsUUFBQSxPQUFBO3dCQUNBLFFBQUEsSUFBQTs7Ozs7O0FDbkJBLENBQUEsV0FBQTtJQUNBOztJQUVBO1NBQ0EsT0FBQTtTQUNBLFdBQUEsZ0ZBQUEsU0FBQSxPQUFBLFFBQUEsWUFBQSxRQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsWUFBQTtZQUNBLE9BQUEsT0FBQSxLQUFBOztZQUVBLE9BQUEsT0FBQSxTQUFBLE9BQUE7Z0JBQ0EsT0FBQTs7O1lBR0EsT0FBQSxlQUFBLFNBQUEsZUFBQTtnQkFDQSxJQUFBLFNBQUE7b0JBQ0EsSUFBQSxPQUFBLEtBQUE7O2dCQUVBLFNBQUEsVUFBQTtvQkFDQSxTQUFBLFVBQUEsVUFBQTt3QkFDQSxPQUFBLFlBQUEsU0FBQTs7b0JBRUEsU0FBQSxRQUFBLEtBQUE7d0JBQ0EsUUFBQSxJQUFBOzs7O1lBSUEsQ0FBQSxXQUFBO2dCQUNBLE9BQUE7Ozs7O0FDM0JBLENBQUEsV0FBQTtJQUNBOztJQUVBO1NBQ0EsT0FBQTtTQUNBLFdBQUEsaUNBQUEsU0FBQSxRQUFBLE1BQUE7WUFDQSxPQUFBLFdBQUEsS0FBQTs7O0FBR0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ21lZGlQdW50b3MnLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgJ21lZGlQdW50b3MuY29udHJvbGxlcnMnLFxuICAgICAgICAgICAgJ21lZGlQdW50b3MuZmlsdGVycycsXG4gICAgICAgICAgICAnbWVkaVB1bnRvcy5zZXJ2aWNlcycsXG4gICAgICAgICAgICAnbWVkaVB1bnRvcy5kaXJlY3RpdmVzJyxcbiAgICAgICAgICAgICdtZWRpUHVudG9zLnJvdXRlcycsXG4gICAgICAgICAgICAnbWVkaVB1bnRvcy5jb25maWcnXG4gICAgICAgICAgICBdXG4gICAgICAgICk7XG5cbiAgICBhbmd1bGFyLm1vZHVsZSgnbWVkaVB1bnRvcy5yb3V0ZXMnLCBbXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ21lZGlQdW50b3MuY29udHJvbGxlcnMnLCBbXSk7XG4gICAgYW5ndWxhci5tb2R1bGUoJ21lZGlQdW50b3MuZmlsdGVycycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnbWVkaVB1bnRvcy5zZXJ2aWNlcycsIFtdKTtcbiAgICBhbmd1bGFyLm1vZHVsZSgnbWVkaVB1bnRvcy5kaXJlY3RpdmVzJywgW10pO1xuICAgIGFuZ3VsYXIubW9kdWxlKCdtZWRpUHVudG9zLmNvbmZpZycsIFtdKTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdtZWRpUHVudG9zLmNvbmZpZycsIFtcbiAgICAgICAgICAgICd1aS5yb3V0ZXInLFxuICAgICAgICAgICAgJ3NhdGVsbGl6ZXInLFxuICAgICAgICAgICAgJ25nUmVzb3VyY2UnLFxuICAgICAgICAgICAgJ2FuZ3VsYXJWYWxpZGF0b3InXG4gICAgICAgIF0pXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICRhdXRoUHJvdmlkZXIsICRodHRwUHJvdmlkZXIsICRwcm92aWRlLCAkcmVzb3VyY2VQcm92aWRlcikge1xuXG4gICAgICAgICAgICBmdW5jdGlvbiByZWRpcmVjdFdoZW5Mb2dnZWRPdXQoJHEsICRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyICRzdGF0ZSA9ICRpbmplY3Rvci5nZXQoJyRzdGF0ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGlvblJlYXNvbnMgPSBbJ3Rva2VuX25vdF9wcm92aWRlZCcsICd0b2tlbl9leHBpcmVkJywgJ3Rva2VuX2Fic2VudCcsICd0b2tlbl9pbnZhbGlkJ107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZWplY3Rpb25SZWFzb25zLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlamVjdGlvbi5kYXRhLmVycm9yID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkcmVzb3VyY2VQcm92aWRlci5kZWZhdWx0cy5zdHJpcFRyYWlsaW5nU2xhc2hlcyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAkcHJvdmlkZS5mYWN0b3J5KCdyZWRpcmVjdFdoZW5Mb2dnZWRPdXQnLCByZWRpcmVjdFdoZW5Mb2dnZWRPdXQpO1xuXG4gICAgICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdyZWRpcmVjdFdoZW5Mb2dnZWRPdXQnKTtcblxuICAgICAgICAgICAgJGF1dGhQcm92aWRlci5sb2dpblVybCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICdhcGkvYXV0aGVudGljYXRlJztcblxuICAgICAgICAgICB9KVxuICAgICAgICAgICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJGxvY2F0aW9uLCBBdXRoKSB7XG4gICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodG9TdGF0ZS5kYXRhICYmIHRvU3RhdGUuZGF0YS5yZXF1aXJlc0xvZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXNlciA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXInKSkgfHwgZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1c2VyLnVzZXJfdHlwZSAhPT0gMCAmJiB0b1N0YXRlLmRhdGEuYWRtaW5Pbmx5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3VzZXJMaXN0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdtZWRpUHVudG9zLnJvdXRlcycsIFsndWkucm91dGVyJ10pXG4gICAgICAgIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICAgICAgICAgICB2YXIgZ2V0VmlldyA9IGZ1bmN0aW9uKCB2aWV3TmFtZSApe1xuICAgICAgICAgICAgICAgIHJldHVybiAndmlld3MvYXBwLycgKyB2aWV3TmFtZSArICcuaHRtbCc7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbG9naW4nKTtcblxuICAgICAgICAgICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgICAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJyxcbiAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogZ2V0VmlldygnbG9naW4nKVxuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgIC5zdGF0ZSgnbG9nb3V0Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9sb2dvdXQnLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dvdXRDdHJsJ1xuICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgIC5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9zaWdudXAnLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTaWdudXBDdHJsJyxcbiAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogZ2V0Vmlldygnc2lnbnVwJylcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAuc3RhdGUoJ2ZvcmdvdCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvZm9yZ290UGFzc3dvcmQnLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdGb3Jnb3RwYXNzQ3RybCcsXG4gICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGdldFZpZXcoJ2ZvcmdvdFBhc3N3b3JkJylcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAuc3RhdGUoJ2NoYW5nZVBhc3N3b3JkJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy9jaGFuZ2VQYXNzd29yZC86dG9rZW4nLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDaGFuZ2VwYXNzQ3RybCcsXG4gICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGdldFZpZXcoJ2NoYW5nZVBhc3N3b3JkJylcbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAuc3RhdGUoJ2FkbWluTGlzdCcsIHtcbiAgICAgICAgICAgICAgICAgICB1cmw6ICcvYWRtaW4vbGlzdCcsXG4gICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IGdldFZpZXcoJ2FkbWluTGlzdCcpLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbmxpc3RDdHJsJyxcbiAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVzTG9naW46IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgIGFkbWluT25seTogdHJ1ZVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAuc3RhdGUoJ3VzZXJMaXN0Jywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy91c2VyL2xpc3QnLFxuICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBnZXRWaWV3KCd1c2VyTGlzdCcpLFxuICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VybGlzdEN0cmwnLFxuICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZXNMb2dpbjogdHJ1ZVxuICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAuc3RhdGUoJ2FkZFB1cmNoYXNlJywge1xuICAgICAgICAgICAgICAgICAgIHVybDogJy91c2VyL3B1cmNoYXNlJyxcbiAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogZ2V0VmlldygncHVyY2hhc2UnKSxcbiAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUHVyY2hhc2VDdHJsJyxcbiAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVzTG9naW46IHRydWVcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbWVkaVB1bnRvcy5zZXJ2aWNlcycpXG4gICAgICAgIC5mYWN0b3J5KCdBdXRoJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG5cbiAgICAgICAgICAgIHZhciBfYXV0aCA9ICAkcmVzb3VyY2UoJ2FwaS9wdXJjaGFzZXMvOmlkJywgeyBpZDogJ0BpZCcgfSwge1xuICAgICAgICAgICAgICAgIGxvZ2luOiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdhcGkvYXV0aGVudGljYXRlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2V0VXNlcjoge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdhcGkvYXV0aGVudGljYXRlL3VzZXInXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaWdudXA6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIHVybDogJ2FwaS9hdXRoZW50aWNhdGUvcmVnaXN0ZXInXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmb3Jnb3Q6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnYXBpL2F1dGhlbnRpY2F0ZS9mb3Jnb3QnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjaGFuZ2U6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnYXBpL2F1dGhlbnRpY2F0ZS9jaGFuZ2UnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF9hdXRoLnNldFVzZXIgPSBmdW5jdGlvbiBzZXRVc2VyKHVzZXIpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcicsIHVzZXIpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgX2F1dGguZ2V0VXNlciA9IGZ1bmN0aW9uIGdldFVzZXIodXNlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyJykpIHx8IGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgX2F1dGguY2xlYXJVc2VyID0gZnVuY3Rpb24gY2xlYXJVc2VyKCkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX2F1dGg7XG4gICAgICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ21lZGlQdW50b3Muc2VydmljZXMnKVxuICAgICAgICAuZmFjdG9yeSgnUHVyY2hhc2UnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcblxuICAgICAgICAgICAgdmFyIF9wdXJjaGFzZSA9ICAkcmVzb3VyY2UoJ2FwaS9wdXJjaGFzZXMvOmlkJywgeyBpZDogJ0BpZCcgfSwge1xuICAgICAgICAgICAgICAgIGNyZWF0ZToge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnYXBpL3B1cmNoYXNlcy8nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXRCeVVzZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfcHVyY2hhc2Uuc29tZXRoaW5nID0gZnVuY3Rpb24gc29tZXRoaW5kKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBfcHVyY2hhc2U7XG4gICAgICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ21lZGlQdW50b3Muc2VydmljZXMnKVxuICAgICAgICAuZmFjdG9yeSgnVXNlcicsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuXG4gICAgICAgICAgICB2YXIgX3VzZXJzID0gICRyZXNvdXJjZSgnYXBpL3VzZXJzLzppZCcsIHsgaWQ6ICdAaWQnIH0sIHtcbiAgICAgICAgICAgICAgICBnZXRBbGw6IHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnYXBpL3VzZXJzJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgX3VzZXJzLnNvbWV0aGluZyA9IGZ1bmN0aW9uIHNvbWV0aGluZCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gX3VzZXJzO1xuICAgICAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdtZWRpUHVudG9zLmNvbnRyb2xsZXJzJylcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0FkbWlubGlzdEN0cmwnLCBmdW5jdGlvbigkaHR0cCwgJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsIFVzZXIpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VycyA9IFtdO1xuXG4gICAgICAgICAgICAkc2NvcGUudXNlclR5cGVzID0gWydBZG1pbicsICdNZWRpY28nLCAnRmFybWFjw6l1dGljbycsICdQYXJ0ZXJhJywgJ051dHJpw7Nsb2dvJ107XG5cbiAgICAgICAgICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgICAgICAgICBVc2VyLmdldEFsbCh7fSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUudXNlcnMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkc2NvcGUuZ2V0VXNlclR5cGUgPSBmdW5jdGlvbiBnZXRVc2VyVHlwZSh0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS51c2VyVHlwZXNbdHlwZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmluaXQoKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ21lZGlQdW50b3MuY29udHJvbGxlcnMnKVxuICAgICAgICAuY29udHJvbGxlcignQ2hhbmdlcGFzc0N0cmwnLCBmdW5jdGlvbigkaHR0cCwgJHN0YXRlLCAkc2NvcGUsIEF1dGgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkQ29uZmlybWF0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICBwYXNzd29yZFRva2VuOiAkc3RhdGUucGFyYW1zLnRva2VuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuZGF0YS5wYXNzd29yZCAhPT0gJHNjb3BlLmRhdGEucGFzc3dvcmRDb25maXJtYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuY2hhbmdlUGFzc3dvcmQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICRzY29wZS5jaGFuZ2VQYXNzd29yZCA9IGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkKCkge1xuICAgICAgICAgICAgICAgIEF1dGguY2hhbmdlKCRzY29wZS5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbWVkaVB1bnRvcy5jb250cm9sbGVycycpXG4gICAgICAgIC5jb250cm9sbGVyKCdGb3Jnb3RwYXNzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBBdXRoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogJydcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAgICAgICAgIEF1dGguZm9yZ290KCRzY29wZS5kYXRhLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdtZWRpUHVudG9zLmNvbnRyb2xsZXJzJylcbiAgICAgICAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRhdXRoLCAkc3RhdGUsICRodHRwLCAkc2NvcGUsIEF1dGgpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICAgICAgZW1haWw6ICcnLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAnJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gZmFsc2U7XG5cbiAgICAgICAgICAgICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgICAgICAgICAgIHZhciBjcmVkZW50aWFscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiAkc2NvcGUuZGF0YS5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAkc2NvcGUuZGF0YS5wYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBhdXRoUGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArICdhcGkvYXV0aGVudGljYXRlL3VzZXInO1xuXG4gICAgICAgICAgICAgICAgJGF1dGgubG9naW4oY3JlZGVudGlhbHMpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGF1dGhQYXRoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIG9uU3VjY2VzcyhyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciB1c2VyID0gSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UuZGF0YS51c2VyKTtcbiAgICAgICAgICAgICAgICAgICAgQXV0aC5zZXRVc2VyKHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS51c2VyLnVzZXJfdHlwZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbkxpc3QnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3VzZXJMaXN0Jyk7XG4gICAgICAgICAgICAgICAgfSxmdW5jdGlvbiBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICRzY29wZS5sb2dpbkVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICRzY29wZS5sb2dpbkVycm9yVGV4dCA9IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbWVkaVB1bnRvcy5jb250cm9sbGVycycpXG4gICAgICAgIC5jb250cm9sbGVyKCdMb2dvdXRDdHJsJywgZnVuY3Rpb24oJGF1dGgsICRzdGF0ZSwgJHNjb3BlLCBBdXRoKSB7XG5cbiAgICAgICAgICAgICRhdXRoLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aC5jbGVhclVzZXIoKTtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgYW5ndWxhclxuICAgICAgICAubW9kdWxlKCdtZWRpUHVudG9zLmNvbnRyb2xsZXJzJylcbiAgICAgICAgLmNvbnRyb2xsZXIoJ1NpZ251cEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGgsICRzdGF0ZSkge1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBpc1ZhbGlkUGFzc3dvcmQgKHBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgvXig/PS4qW2Etel0pKD89LipbQS1aXSkoPz0uKlxcZClbQS1aYS16XFxkXFwkXFxAXFwhXFwlXFwqXFw/XFwmXFwsXFwuXFwtXFxfXFwrXFwjXFx+XFx8XFzCsFxce1xcfVxcKFxcKVxcL117OCx9JC8pLnRlc3QocGFzc3dvcmQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnJztcblxuICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSB7XG4gICAgICAgICAgICAgICAgdXNlclR5cGU6IDFcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICRzY29wZS51c2VyVHlwZXMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogMSxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdNZWRpY28nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAyLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Zhcm1hY8OpdXRpY28nXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAzLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BhcnRlcmEnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiA0LFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ051dHJpw7Nsb2dvJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kYXRhLnBhc3N3b3JkICE9PSAkc2NvcGUuZGF0YS5wYXNzd29yZENvbmYpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0xhcyBjb250cmFzZcOxYXMgZGViZW4gY29pbmNpZGlyJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRQYXNzd29yZCgkc2NvcGUuZGF0YS5wYXNzd29yZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0NvbnRyYXNlw7FhIG5vIGN1bXBsZSBsb3MgcmVxdWVyaW1pZW50b3MnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRzY29wZS5yZWdpc3RlcigpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHNjb3BlLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIoKSB7XG4gICAgICAgICAgICAgICAgQXV0aC5zaWdudXAoJHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdMbyBzZW50aW1vcyBlc2UgY29ycmVvIHlhIGhhIHNpZG8gcmVnaXN0cmFkby4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbWVkaVB1bnRvcy5jb250cm9sbGVycycpXG4gICAgICAgIC5jb250cm9sbGVyKCdQdXJjaGFzZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCBQdXJjaGFzZSkge1xuXG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBmb2xpbzogJycsXG4gICAgICAgICAgICAgICAgYW1tb3VudDogMCxcbiAgICAgICAgICAgICAgICBicmFuY2g6ICcnLFxuICAgICAgICAgICAgICAgIHBob3RvOiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgICAgICAgICBQdXJjaGFzZS5jcmVhdGUoJHNjb3BlLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG59KSgpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGFuZ3VsYXJcbiAgICAgICAgLm1vZHVsZSgnbWVkaVB1bnRvcy5jb250cm9sbGVycycpXG4gICAgICAgIC5jb250cm9sbGVyKCdVc2VybGlzdEN0cmwnLCBmdW5jdGlvbigkaHR0cCwgJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsIFB1cmNoYXNlLCBBdXRoKSB7XG4gICAgICAgICAgICAkc2NvcGUucHVyY2hhc2VzID0gW107XG4gICAgICAgICAgICAkc2NvcGUudXNlciA9IEF1dGguZ2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmdldFB1cmNoYXNlcygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHNjb3BlLmdldFB1cmNoYXNlcyA9IGZ1bmN0aW9uIGdldFB1cmNoYXNlcygpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgICAgICBpZDogJHNjb3BlLnVzZXIuaWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFB1cmNoYXNlLmdldEJ5VXNlcihwYXJhbXMgLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5wdXJjaGFzZXMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvbkVycm9yKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmluaXQoKTtcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH0pO1xufSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBhbmd1bGFyXG4gICAgICAgIC5tb2R1bGUoJ21lZGlQdW50b3MuY29udHJvbGxlcnMnKVxuICAgICAgICAuY29udHJvbGxlcignTmF2QmFyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgQXV0aCkge1xuICAgICAgICAgICAgJHNjb3BlLmlzTG9nZ2VkID0gQXV0aC5nZXRVc2VyKCk7XG4gICAgICAgIH0pO1xufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
