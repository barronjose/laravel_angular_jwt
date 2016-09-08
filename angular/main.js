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
