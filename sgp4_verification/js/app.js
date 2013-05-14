var sgp4_verify_app = angular.module('sgp4Verify', []);
sgp4_verify_app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/sgp4_verify',      {templateUrl: 'templates/sgp4_verify.html',
                                 controller: TestCtrl}).
      when('/savage_test',      {templateUrl: 'templates/savage_test.html',
                                 controller: TestCtrl}).
      when('/sgp4_benchmark',   {templateUrl: 'templates/sgp4_benchmark.html',
                                 controller: TestCtrl}).
      otherwise({redirectTo: '/savage_test'});
}]);

