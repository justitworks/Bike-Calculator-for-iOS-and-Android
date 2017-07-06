angular.module('starter.services', [])

.factory('homeFactory', function ($http, $rootScope, $timeout) {
  return {
    facebookCall: function(link, type){
      return $http({
        method: type,
        url: link,
        headers:{
            'Content-Type': 'application/json'
        },
        timeout: 25000
      }).success(function(response){
        return response;
      }).error(function(error){
        return error;
      });
    },
    colsCall: function (link, type) {
      return $http({
        method: type,
        url: link,
        headers:{
            'Content-Type': 'application/json'
        },
        timeout: 25000
      }).success(function (response) {
        return response;
      }).error(function (error) {
        return error;
      })
    },
    apiCall: function (link, type) {
      return $http({
        method: type,
        url: link,
        headers:{
            'Content-Type': 'application/json'
        },
        timeout: 25000
      }).success(function (response) {
        return response;
      }).error(function (error) {
        return error;
      })
    }
  }
});
