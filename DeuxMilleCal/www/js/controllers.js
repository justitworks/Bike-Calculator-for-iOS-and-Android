//var profile_data;
angular.module('starter.controllers', ['ionic', 'ngCordova', 'ngCordovaOauth'])

  // here functions that are needed globally are defined
  .run(function($rootScope) {

    $rootScope.formatIntegerToTwoDigits = function(val) {
      return val < 10 ? '0' + val.toString() : val.toString();
    }

    // function that loads profile data after login
    $rootScope.loadProfileData = function(homeFactory, $state) {
      var link = 'http://www.deuxmille.cc/api/user.get_memberinfo/?user_id=' + $rootScope.userID.toString() + '&insecure=cool';
      console.log(link);
      homeFactory
        .apiCall(link, 'GET')
        .then(function(response) {
          var result = response.data;
          if (result.status == "ok") {
            $rootScope.profileResults = result;
            if (result != null) {
              $rootScope.profile_data = {};
              $rootScope.profile_data.avatar = result.avatar;
              $rootScope.profile_data.units = result.units != null ? result.units : '';
              $rootScope.profile_data.ftp = result.ftp != null ? result.ftp : '';
              $rootScope.profile_data.weight = result.weight != null ? result.weight : '';
              $rootScope.profile_data.bikeweight = result.bike_weight != null ? result.bike_weight : '';
              $rootScope.profile_data.pwr = (result.ftp != null && result.weight != null) ? Math.round(parseFloat(result.ftp) / parseFloat(result.weight) * 10) / 10 : '';
            }
          } else {
            alert('No profile data!');
          }
          $state.go('tab.deuxmillecols');
        });
    }

    // Newton-Raphson algorithm implementation
    $rootScope.NewtonRaphson = function(a, c, e, d) {
      var vi = 20;
      var i = 1;
      var converged = false;
      var fvel, fdvel, dv, cct;
      while (i < 100 && converged == false) {
        fvel = a * vi * vi * vi + 2 * a * e * vi * vi + (a * e * e + c) * vi + d;
        fdvel = 3 * a * vi * vi + 4 * a * e * vi + a * e * e + c;
        dv = fvel / fdvel;

        cct = Math.abs(dv / vi);
        vi -= dv;
        if (cct < 0.001) {
          converged = true;
        }
        i += 1;
      }

      if (converged == false) {
        return 0;
      } else {
        return vi * 3.6;
      }
    }

    $rootScope.recalculate = function(gradient, ftp, length, weight) {
      var A = 0.509; //Frontal area
      var Cd = 0.63; //Drag coefficient
      var dt = 3; //Drivetrain loss
      var Crr = 0.005; //Rolling resistance coefficient
      var rho = 1.056; //Air Density
      var g = 9.8067; //Gravity
      var G = parseFloat(gradient);
      var FG = g * Math.sin(Math.atan(G / 100)) * weight; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * weight * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;
      var c = FG + FRR;

      //Method 2 - To calculate Velocity
      var P = parseFloat(ftp) * 0.9;
      var vh = 0;
      var D = parseFloat(length) * 1000;
      var d = -P * ((1 - (dt / 100)));
      var e = vh / 3.6;

      var V = $rootScope.NewtonRaphson(a, c, e, d);
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V;
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time
      var time = null;
      if (V != 0) {
        time = T;
      } else {
        time = 'undefined';
      }
      return {
        speed: V,
        time: time
      };
    }
  })

  .controller('LoginCtrl', function($scope, $state, $cordovaOauth, $rootScope, homeFactory) {

    $scope.facebooklogin = function() {

      $cordovaOauth.facebook("273083806475263", ["email"]).then(function(result) {
        var access_token_res = result.access_token;
        var link = 'http://www.deuxmille.cc/api/user/fb_connect/?access_token=' + access_token_res + '&insecure=cool';
        homeFactory
          .facebookCall(link, 'GET')
          .then(function(response) {
            $scope.facebook_res = response.data;
            $rootScope.userID = response.data.wp_user_id;
            $rootScope.loadProfileData(homeFactory, $state);
          })
      }, function(error) {
        alert("Auth Failed..!!" + error);
      });
    }

    $scope.login = function() {
      console.log("login clicked.");
      $state.go('email_login');
    }

  })

  .controller('Email_LoginCtrl', function($scope, $rootScope, $state, homeFactory) {


    $scope.user = {
      email: "",
      password: ""
    };

    $scope.forgot = function() {
      console.log('forgot');
    }

    $scope.login = function() {

      console.log('email :', $scope.user.email);
      console.log('password:', $scope.user.password);

      if ($scope.user.email.length == 0 || $scope.user.password.length == 0) {
        alert("email or password is not specified.")
      } else {

        $rootScope.show();

        var link1 = 'http://www.deuxmille.cc/api/get_nonce/?controller=user&method=generate_auth_cookie';
        homeFactory
          .apiCall(link1, 'GET')
          .then(function(response) {
            $rootScope.hide();
            console.log(response);
            if (response.data.status == "ok") {

              var link = 'https://www.deuxmille.cc/api/user/generate_auth_cookie/?username=' + $scope.user.email + '&password=' + $scope.user.password + '&insecure=cool';

              homeFactory
                .apiCall(link, 'GET')
                .then(function(response) {
                  var result = response.data;
                  if (result.status == "ok") {
                    $rootScope.userID = result.user.id;
                    $rootScope.authCookie = result.cookie;
                    $rootScope.loadProfileData(homeFactory, $state);
                  } else {
                    alert("User Login failed!")
                  }
                });
            }
          })
      }
    }

    $scope.login_facebook = function() {
      console.log('facebook login');

    }

  })

  .controller('DeuxmillecolsCtrl', function($state, $scope, $rootScope, $ionicLoading, homeFactory) {

    $rootScope.show();

    $rootScope.json_result = [];

    var link = 'http://www.deuxmille.cc/api/posts/get_cols_posts/?cols_per_page=-1';

    homeFactory
      .colsCall(link, 'GET')
      .then(function(response) {
        $rootScope.hide();

        var result = response.data;
        var result_cols = result.posts;

        for (var i = 0; i < result_cols.length; i++) {

          var title_result = result_cols[i].title;

          var name0 = result_cols[i].meta.roads_0_road_name;
          var altitude0 = result_cols[i].meta.roads_0_altitude;
          var vertical0 = result_cols[i].meta.roads_0_vertical;
          var length0 = result_cols[i].meta.roads_0_length;
          var avggradient0 = result_cols[i].meta.roads_0_avggradient;

          var name1 = result_cols[i].meta.roads_1_road_name;
          var altitude1 = result_cols[i].meta.roads_1_altitude;
          var vertical1 = result_cols[i].meta.roads_1_vertical;
          var length1 = result_cols[i].meta.roads_1_length;
          var avggradient1 = result_cols[i].meta.roads_1_avggradient;

          var name2 = result_cols[i].meta.roads_2_road_name;
          var altitude2 = result_cols[i].meta.roads_2_altitude;
          var vertical2 = result_cols[i].meta.roads_2_vertical;
          var length2 = result_cols[i].meta.roads_2_length;
          var avggradient2 = result_cols[i].meta.roads_2_avggradient;

          var name3 = result_cols[i].meta.roads_3_road_name;
          var altitude3 = result_cols[i].meta.roads_3_altitude;
          var vertical3 = result_cols[i].meta.roads_3_vertical;
          var length3 = result_cols[i].meta.roads_3_length;
          var avggradient3 = result_cols[i].meta.roads_3_avggradient;

          $rootScope.json_result.push({
            cols_title: title_result,
            name0: name0,
            altitude0: altitude0,
            vertical0: vertical0,
            length0: length0,
            avggradient0: avggradient0,
            name1: name1,
            altitude1: altitude1,
            vertical1: vertical1,
            length1: length1,
            avggradient1: avggradient1,
            name2: name2,
            altitude2: altitude2,
            vertical2: vertical2,
            length2: length2,
            avggradient2: avggradient2,
            name3: name3,
            altitude3: altitude3,
            vertical3: vertical3,
            length3: length3,
            avggradient3: avggradient3
          });
        }

        console.log($rootScope.json_result.length);
      });

    $scope.item_click = function(value) {
      console.log("item click;", value);
      $rootScope.selected_item = value;
      $rootScope.member_add_flag = false;
      $state.go('tab.deuxmillecol-detail');
    }

  })

  .controller('DeuxmillecolsDetailCtrl', function($state, $scope, $rootScope, $ionicModal, $ionicSlideBoxDelegate, homeFactory) {

    //selected col's detail information
    console.log("come;", $rootScope.selected_item);
    var col_item = $rootScope.selected_item;
    $scope.title = col_item.cols_title;

    $scope.name0 = col_item.name0;
    $scope.altitude0 = col_item.altitude0;
    $scope.vertical0 = col_item.vertical0;
    $scope.length0 = col_item.length0;
    $scope.avggradient0 = col_item.avggradient0;

    $scope.name1 = col_item.name1;
    $scope.altitude1 = col_item.altitude1;
    $scope.vertical1 = col_item.vertical1;
    $scope.length1 = col_item.length1;
    $scope.avggradient1 = col_item.avggradient1;

    $scope.name2 = col_item.name2;
    $scope.altitude2 = col_item.altitude2;
    $scope.vertical2 = col_item.vertical2;
    $scope.length2 = col_item.length2;
    $scope.avggradient2 = col_item.avggradient2;

    $scope.name3 = col_item.name3;
    $scope.altitude3 = col_item.altitude3;
    $scope.vertical3 = col_item.vertical3;
    $scope.length3 = col_item.length3;
    $scope.avggradient3 = col_item.avggradient3;

    if ($scope.name0 == null) {
      $scope.flag0 = false
    } else {
      $scope.flag0 = true
    }

    if ($scope.name1 == null) {
      $scope.flag1 = false
    } else {
      $scope.flag1 = true
    }

    if ($scope.name2 == null) {
      $scope.flag2 = false
    } else {
      $scope.flag2 = true
    }

    if ($scope.name3 == null) {
      $scope.flag3 = false
    } else {
      $scope.flag3 = true
    }
    $scope.slideIndex = 0;
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
      // recalculate when slide index changed
      $scope.recalculateForSimul(parseFloat($scope.member_weight), parseFloat($scope.member_ftp), false);
      if ($scope.choose_member_weight && $scope.choose_member_ftp) {
        $scope.recalculateForSimul(parseFloat($scope.choose_member_weight), parseFloat($scope.choose_member_ftp), true);
      }
    };

    $scope.choose_member_avatar = "img/avarta_add.png";
    $scope.choose_member_name = "Compare to another rider";
    $scope.choose_member_time = "";
    $scope.choose_member_time_text = "";
    $scope.choose_member_speed = "";
    $scope.choose_member_speed_text = "";

    // function for simulation results calculation
    $scope.recalculateForSimul = function(W, ftp, second) {
      var gradient, length;
      if ($scope.slideIndex == 0) {
        gradient = $scope.avggradient0;
        length = $scope.length0;
      } else if ($scope.slideIndex == 1) {
        gradient = $scope.avggradient1;
        length = $scope.length1;
      } else if ($scope.slideIndex == 2) {
        gradient = $scope.avggradient2;
        length = $scope.length2;
      } else if ($scope.slideIndex == 3) {
        gradient = $scope.avggradient3;
        length = $scope.length3;
      }
      var result = $rootScope.recalculate(gradient, ftp, length, W);
      if (!second) {
        $scope.timeSelection = result.time;
        $scope.member_targetspeed = Math.round(result.speed * 10) / 10 + ' km/h';
      } else {
        $scope.timeSelection2 = result.time;
        $scope.choose_member_speed = Math.round(result.speed * 10) / 10 + ' km/h';
      }
    }

    //Getting self member profile information
    $rootScope.show();
    var profileResults = $rootScope.profile_data;
    $rootScope.hide();
    if (profileResults != null) {
      $scope.member_id = profileResults.id;
      $scope.member_avatar = profileResults.avatar;
      $scope.member_ftp = profileResults.ftp;
      $scope.member_weight = parseFloat(profileResults.weight) + parseFloat(profileResults.bikeweight);

      $scope.recalculateForSimul(parseFloat($scope.member_weight), parseFloat($scope.member_ftp), false);

      $scope.$watch('timeSelection', function(newValue, oldValue) {
        if (newValue) {
          var hours = $rootScope.formatIntegerToTwoDigits(parseInt($scope.timeSelection / 3600));
          var minutes = $rootScope.formatIntegerToTwoDigits(parseInt(($scope.timeSelection - hours * 3600) / 60));
          var seconds = $rootScope.formatIntegerToTwoDigits(parseInt($scope.timeSelection % 60));
          $scope.member_targettime = hours + ":" + minutes + ":" + seconds;
        } else {
          $scope.member_targettime = 'Undefined time';
        }
      }, true);

    } else {
      alert("User Login failed!")
    }

    $ionicModal.fromTemplateUrl('templates/modal_rate.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalRate = modal;
      $scope.currentColName = '';
      if ($scope.slideIndex == 0) {
        $scope.currentColName = $scope.name0;
      } else if ($scope.slideIndex == 1) {
        $scope.currentColName = $scope.name1;
      } else if ($scope.slideIndex == 2) {
        $scope.currentColName = $scope.name2;
      } else if ($scope.slideIndex == 3) {
        $scope.currentColName = $scope.name3;
      }
    });

    //Getting all of member profile information
    $rootScope.show();
    $rootScope.json_member_result = [];
    var link = 'http://www.deuxmille.cc/api/user/get_all_memberinfo/?insecure=cool';
    homeFactory
      .colsCall(link, 'GET')
      .then(function(response) {
        $rootScope.hide();
        var result = response.data;
        console.log("all member object info:", result);
        for (var i = 0; i < result.length; i++) {
          if (result[i].ftp && result[i].weight && result[i].bike_weight && result[i].user_col_level) {
            $rootScope.json_member_result.push({
              member_name: result[i].name,
              member_avatar: result[i].avatar,
              member_ftp: result[i].ftp,
              member_weight: parseFloat(result[i].weight) + 8,
              member_cat: result[i].user_col_level
            });
          }
        }
        $rootScope.json_member_result.sort(function(a) {
          return parseInt(a.member_cat.split(' ')[1]);
        });
        for (var i = 0; i < result.length; i++) {
          if (result[i].ftp && result[i].weight && result[i].bike_weight && result[i].user_col_level == '') {
            $rootScope.json_member_result.push({
              member_name: result[i].name,
              member_avatar: result[i].avatar,
              member_ftp: result[i].ftp,
              member_weight: parseFloat(result[i].weight) + 8,
              member_cat: result[i].user_col_level
            });
          }
        }
        console.log($rootScope.json_member_result);
      });

    $scope.$watch('timeSelection2', function(newValue, oldValue) {
      if (newValue && newValue != 'undefined') {
        var hours = $rootScope.formatIntegerToTwoDigits(parseInt($scope.timeSelection2 / 3600));
        var minutes = $rootScope.formatIntegerToTwoDigits(parseInt(($scope.timeSelection2 - hours * 3600) / 60));
        var seconds = $rootScope.formatIntegerToTwoDigits(parseInt($scope.timeSelection2 % 60));
        $scope.choose_member_time = hours + ":" + minutes + ":" + seconds;
      } else if (newValue == 'undefined') {
        $scope.choose_member_time = newValue;
      }
    }, true);

    $ionicModal.fromTemplateUrl('templates/choosemember.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.choose_member = function(u) {
      console.log("selected member:", u);
      $scope.choose_member_avatar = u.member_avatar;
      $scope.choose_member_name = u.member_name;
      $scope.choose_member_weight = u.member_weight;
      $scope.choose_member_ftp = u.member_ftp;
      $scope.choose_member_time_text = "TARGET TIME";
      $scope.choose_member_speed_text = "TARGET SPEED";
      $scope.recalculateForSimul(parseFloat($scope.choose_member_weight), parseFloat($scope.choose_member_ftp), true);
      $scope.modal.hide();
    };

  })

  .controller('ChooseMemberCtrl', function($state, $scope, $rootScope, $ionicLoading, homeFactory) {
    $rootScope.show();

    $rootScope.json_member_result = [];

    var link = 'http://www.deuxmille.cc/api/user/get_memberinfo/?user_id=36';
    homeFactory
      .colsCall(link, 'GET')
      .then(function(response) {
        $rootScope.hide();

        var result = response.data;
        var result_name = result.name;
        var result_avarta = result.avatar;

        $rootScope.json_member_result.push({
          member_name: result_name,
          member_avatar: result_avarta
        });
      });

    $scope.loadMore = function() {

    }

    $scope.item_click = function(value) {
      console.log("item click;", value);
      $rootScope.selected_member = value;
      $rootScope.member_add_flag = true;
      $state.go('tab.deuxmillecol-detail');
    }

    $scope.close = function() {
      console.log("close click:");
      $rootScope.member_add_flag = false;
      $state.go('tab.deuxmillecol-detail');
    }
  })

  .controller('CalculatorCtrl', function($scope, $rootScope) {

    //Constant
    var A = 0.509; //Frontal area
    var Cd = 0.63; //Drag coefficient
    var dt = 3; //Drivetrain loss
    var Crr = 0.005; //Rolling resistance coefficient
    var rho = 1.226; //Air Density
    var g = 9.8067; //Gravity

    $scope.data = {};
    $scope.data.timeSelection = 1000;

    var distanceChanging = true;

    $scope.$watch('data.timeSelection', function(newValue, oldValue) {
      if (newValue != null) {
        var hours = $rootScope.formatIntegerToTwoDigits(parseInt($scope.data.timeSelection / 3600));
        var minutes = $rootScope.formatIntegerToTwoDigits(parseInt(($scope.data.timeSelection - hours * 3600) / 60));
        var seconds = $rootScope.formatIntegerToTwoDigits(parseInt($scope.data.timeSelection % 60));
        $scope.data.timeDisplay = hours + ":" + minutes + ":" + seconds;
      } else {
        $scope.data.timeDisplay = 'undefined';
      }
    }, true);

    // click handlers for + or - pressed
    $scope.minusTimeClicked = function() {
      $scope.data.timeSelection = parseFloat($scope.data.timeSelection) - 1;
      $scope.timeChange($scope.data.timeSelection);
    }

    $scope.plusTimeClicked = function() {
      $scope.data.timeSelection = parseFloat($scope.data.timeSelection) + 1;
      $scope.timeChange($scope.data.timeSelection);
    }

    $scope.minusDistanceClicked = function() {
      $scope.data.distanceSelection = parseFloat($scope.data.distanceSelection) - 100;
      $scope.distanceChange($scope.data.distanceSelection);
    }

    $scope.plusDistanceClicked = function() {
      $scope.data.distanceSelection = parseFloat($scope.data.distanceSelection) + 100;
      $scope.distanceChange($scope.data.distanceSelection);
    }

    $scope.minusSpeedClicked = function() {
      $scope.data.speedSelection = parseFloat($scope.data.speedSelection) - 1;
      $scope.speedChange($scope.data.speedSelection);
    }

    $scope.plusSpeedClicked = function() {
      $scope.data.speedSelection = parseFloat($scope.data.speedSelection) + 1;
      $scope.speedChange($scope.data.speedSelection);
    }

    $scope.minusPowerClicked = function() {
      $scope.data.wattsSelection = parseFloat($scope.data.wattsSelection) - 1;
      $scope.powerChange($scope.data.wattsSelection);
    }

    $scope.plusPowerClicked = function() {
      $scope.data.wattsSelection = parseFloat($scope.data.wattsSelection) + 1;
      $scope.powerChange($scope.data.wattsSelection);
    }

    $scope.minusWindClicked = function() {
      $scope.data.windSelection = parseFloat($scope.data.windSelection) - 1;
      $scope.windChange($scope.data.windSelection);
    }

    $scope.plusWindClicked = function() {
      $scope.data.windSelection = parseFloat($scope.data.windSelection) + 1;
      $scope.windChange($scope.data.windSelection);
    }

    $scope.minusGradientClicked = function() {
      $scope.data.gradientSelection = Math.round((parseFloat($scope.data.gradientSelection) - 0.1) * 10) / 10;
      $scope.gradientChange($scope.data.gradientSelection);
    }

    $scope.plusGradientClicked = function() {
      $scope.data.gradientSelection = Math.round((parseFloat($scope.data.gradientSelection) + 0.1) * 10) / 10;
      $scope.gradientChange($scope.data.gradientSelection);
    }

    $scope.minusWeightClicked = function() {
      $scope.data.totalweightSelection = parseFloat($scope.data.totalweightSelection) - 0.5;
      $scope.weightChange($scope.data.totalweightSelection);
    }

    $scope.plusWeightClicked = function() {
      $scope.data.totalweightSelection = parseFloat($scope.data.totalweightSelection) + 0.5;
      $scope.weightChange($scope.data.totalweightSelection);
    }

    $scope.data.distanceSelection = 15000;
    $scope.data.windSelection = 0;
    $scope.data.gradientSelection = 0;

    $scope.$watch('data.distanceSelection', function(newValue) {
      $scope.data.distanceDisplay = Math.round(newValue / 1000 * 10) / 10;
    }, true);

    $scope.data.seaLevelSelection = false;

    $scope.$on("$ionicView.enter", function(event, data) {

      $scope.data.wattsSelection = $rootScope.profile_data.ftp ? $rootScope.profile_data.ftp : 312;
      $scope.data.totalweightSelection = $rootScope.profile_data.weight && $rootScope.profile_data.bikeweight ? parseFloat($rootScope.profile_data.weight) + parseFloat($rootScope.profile_data.bikeweight) : 83;

      $scope.powerChange($scope.data.wattsSelection);
      $scope.distanceChange($scope.data.distanceSelection);
    });

    // listener for time change
    $scope.timeChange = function(val) {
      if (distanceChanging) {
        var V = parseFloat($scope.data.distanceSelection) / val * 3.6;
        $scope.data.speedSelection = Math.round(V * 10) / 10;
        $scope.speedChange(V);
      } else {
        var V = parseFloat($scope.data.speedSelection);
        $scope.data.distanceSelection = V / 3.6 * parseFloat(val);
      }
    }

    // listener for sea level / mountain toggle change
    $scope.seaLevelToggleChange = function(val) {
      if (val) {
        rho = 1.056;
      } else {
        rho = 1.226;
      }
      $scope.powerChange($scope.data.wattsSelection);
    }

    $scope.speedChange = function(val) {
      //Basic Calculations
      var W = parseFloat($scope.data.totalweightSelection);
      var G = parseFloat($scope.data.gradientSelection);
      var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;

      //Method 1 - To calculate Power
      var V = parseFloat(val);
      var vh = parseFloat($scope.data.windSelection);
      var D = parseFloat($scope.data.distanceSelection);
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V; //Fdrag
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time

      if (val != 0) {
        $scope.data.timeSelection = T;
      } else {
        $scope.data.timeSelection = null;
      }
      $scope.data.wattsSelection = '' + Math.round((1 / (1 - (dt / 100)) * FR * (V / 3.6)) * 10) / 10;
    }

    $scope.powerChange = function(val) {
      distanceChanging = false;
      //Basic Calculations
      var W = parseFloat($scope.data.totalweightSelection);
      var G = parseFloat($scope.data.gradientSelection);
      var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;
      var c = FG + FRR;

      //Method 2 - To calculate Velocity
      var P = parseFloat(val);
      var vh = parseFloat($scope.data.windSelection);
      var D = parseFloat($scope.data.distanceSelection);
      var d = -P * ((1 - (dt / 100)));
      var e = vh / 3.6;

      var V = $rootScope.NewtonRaphson(a, c, e, d);
      $scope.data.speedSelection = '' + Math.round(V * 10) / 10;
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V;
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time

      $scope.data.timeSelection = T;
    }

    $scope.distanceChange = function(val) {
      distanceChanging = true;
      var V = parseFloat($scope.data.speedSelection);
      var D = parseFloat(val);
      var T = 3.6 * D / V; //Time
      $scope.data.timeSelection = T;
    }

    $scope.gradientChange = function(val) {
      var W = parseFloat($scope.data.totalweightSelection);
      var G = parseFloat(val);
      var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;
      var c = FG + FRR;
      var P = parseFloat($scope.data.wattsSelection);
      var vh = parseFloat($scope.data.windSelection);
      var D = parseFloat($scope.data.distanceSelection);
      var d = -P * (1 - (dt / 100));
      var e = vh / 3.6;

      var V = $rootScope.NewtonRaphson(a, c, e, d);
      $scope.data.speedSelection = '' + Math.round(V * 10) / 10;
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V;
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time

      $scope.data.timeSelection = T;
    }

    $scope.windChange = function(val) {
      var W = parseFloat($scope.data.totalweightSelection);
      var G = parseFloat($scope.data.gradientSelection);
      var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;
      //Method 1 - To calculate Power
      var V = parseFloat($scope.data.speedSelection);
      var vh = parseFloat(val);
      var D = parseFloat($scope.data.distanceSelection);
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V; //Fdrag
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time

      $scope.data.timeSelection = T;
      $scope.data.wattsSelection = '' + Math.round((1 / (1 - (dt / 100)) * FR * (V / 3.6)) * 10) / 10;
    }

    $scope.weightChange = function(val) {
      var W = parseFloat(val);
      var G = parseFloat($scope.data.gradientSelection);
      var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
      var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
      var a = 0.5 * A * Cd * rho;
      var b = 0;
      var c = FG + FRR;

      //Method 2 - To calculate Velocity
      var P = parseFloat($scope.data.wattsSelection);
      var vh = parseFloat($scope.data.windSelection);
      var D = parseFloat($scope.data.distanceSelection);
      var d = -P * ((1 - (dt / 100)));
      var e = vh / 3.6;

      var V = $rootScope.NewtonRaphson(a, c, e, d);
      $scope.data.speedSelection = '' + Math.round(V * 10) / 10;
      var temp_V = (V + vh) / 3.6;
      var FD = a * temp_V * temp_V;
      var FR = FG + FRR + FD; //Fresist

      var WRK = FR * D; //Work
      var T = 3.6 * D / V; //Time

      $scope.data.timeSelection = T;
    }

  })

  .controller('ProfileCtrl', function($scope, $rootScope, $ionicModal, $state, homeFactory) {

    //Getting self member profile information
    $rootScope.show();
    var result = $rootScope.profileResults;
    $rootScope.hide();
    if (result.status == "ok") {
      $scope.image = result.avatar;
      $scope.name = result.name;
      $scope.country = result.country;
      $scope.level = result.user_col_level;
      $scope.conquredCols_data = result.user_cols_data;
      $scope.conquredCols = result.user_cols_data != null ? result.user_cols_data.length : 0;
    } else {
      alert("User Login failed!");
    }

    // $scope.goToColsList = function() {
    //     sta
    // }

    $scope.logout = function() {
      console.log('logout click!');
      $rootScope.userID = '';
      $rootScope.profile_data = {};
      $state.go('login');
    }

    // profile data now is set in the beginning
    // $rootScope.profile_data = {};
    // $rootScope.profile_data.units = "KM";
    // $rootScope.profile_data.ftp = "26";
    // $rootScope.profile_data.weight = "70";
    // $rootScope.profile_data.bikeweight = "15";
    // $rootScope.profile_data.pwr = "30";

    $scope.newData = {
      avatar: $rootScope.profile_data.avatar,
      units: $rootScope.profile_data.units,
      ftp: $rootScope.profile_data.ftp,
      weight: $rootScope.profile_data.weight,
      bikeweight: $rootScope.profile_data.bikeweight,
      pwr: $rootScope.profile_data.pwr
    };

    $ionicModal.fromTemplateUrl('templates/modal_edit.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.updatePwr = function(ftp, weight) {
      if (ftp && ftp.length > 0 && weight && weight.length > 0) {
        $scope.newData.pwr = Math.round(parseFloat(ftp) / parseFloat(weight) * 10) / 10;
      } else {
        $scope.newData.pwr = '';
      }
    };

    $scope.savedata = function() {
      $rootScope.profile_data = $scope.newData;
      var link = 'http://www.deuxmille.cc/api/user/update_user_meta_vars/?cookie=' + $rootScope.authCookie +
        //'&jsf_units=' + $rootScope.profile_data.units +
        '&jsf_ftp=' + $rootScope.profile_data.ftp +
        '&jsf_weight=' + $rootScope.profile_data.weight +
        '&jsf_bike_weight=' + $rootScope.profile_data.bikeweight + '&insecure=cool';
      homeFactory.apiCall(link, 'GET').then(function(response) {
        if (response.data.status == 'ok') {
          alert('Profile data was successfully updated');
        } else {
          alert('Update error!');
        }
      })
      $scope.modal.hide();
    };


  });
