(function() {
    'use strict';

    angular
        .module('mediPuntos.routes', ['ui.router'])
        .config(function($stateProvider, $urlRouterProvider) {

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
           });
})();
