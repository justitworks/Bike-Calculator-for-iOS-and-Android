angular.module('starter.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
  })

  .state('email_login', {
      url: '/email_login',
      templateUrl: 'templates/email_login.html',
      controller: 'Email_LoginCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.deuxmillecols', {
    url: '/deuxmillecols',
    views: {
      'tab-deuxmillecols': {
        templateUrl: 'templates/tab-deuxmillecols.html',
        controller: 'DeuxmillecolsCtrl'
      }
    }
  })
    .state('tab.deuxmillecol-detail', {
      url: '/deuxmillecols-detail',
      views: {
        'tab-deuxmillecols': {
          templateUrl: 'templates/deuxmillecols-detail.html',
          controller: 'DeuxmillecolsDetailCtrl'
        }
      }
    })
    // .state('tab.choosemember', {
    //   url: '/choosemember',
    //   views: {
    //     'tab-deuxmillecols': {
    //       templateUrl: 'templates/choosemember.html',
    //       controller: 'ChooseMemberCtrl'
    //     }
    //   }
    // })

  .state('tab.calculator', {
      url: '/calculator',
      views: {
        'tab-calculator': {
          templateUrl: 'templates/tab-calculator.html',
          controller: 'CalculatorCtrl'
        }
      }
    })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'ProfileCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});