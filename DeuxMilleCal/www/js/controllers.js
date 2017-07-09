//var profile_data;
   angular.module('starter.controllers', ['ionic', 'ngCordova', 'ngCordovaOauth'])

     .controller('LoginCtrl', function($scope, $state, $cordovaOauth, homeFactory) {

       $scope.facebooklogin = function() {

         console.log("facebook login clicked.");

         $cordovaOauth.facebook("273083806475263", ["email"]).then(function(result) {
           // alert("Auth Success..!!"+JSON.stringify(result));
           var access_token_res = result.access_token;
           alert(access_token_res);
           var link = 'http://www.clubdeuxmille.com/api/user/fb_connect/?access_token=access_token_res';
           homeFactory
             .facebookCall(link, 'GET')
             .then(function(response) {
               $scope.facebook_res = response.data;

             })
         }, function(error) {
           alert("Auth Failed..!!" + error);
         });
         alert('facebook response: ', $scope.facebook_res);
         $state.go('tab.deuxmillecols');
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

           var link1 = 'http://www.clubdeuxmille.com/api/get_nonce/?controller=user&method=generate_auth_cookie';
           homeFactory
             .apiCall(link1, 'GET')
             .then(function(response) {
               $rootScope.hide();
               console.log(response);
               if (response.data.status == "ok") {

                 var link = 'https://www.clubdeuxmille.com/api/user/generate_auth_cookie/?username=' + $scope.user.email + '&password=' + $scope.user.password;

                 homeFactory
                   .apiCall(link, 'GET')
                   .then(function(response) {
                     var result = response.data;
                     if (result.status == "ok") {
                       $rootScope.userID = result.user.id;
                       $state.go('tab.deuxmillecols');
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

       var link = 'http://www.clubdeuxmille.com/api/posts/get_cols_posts/?cols_per_page=-1';

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
       $scope.slideChanged = function(index) {
         $scope.slideIndex = index;
       };

       $scope.choose_member_avatar = "../img/avarta_add.png";
       $scope.choose_member_name = "Compare to another rider";
       $scope.choose_member_time = "";
       $scope.choose_member_time_text = "";
       $scope.choose_member_speed = "";
       $scope.choose_member_speed_text = "";

       //Getting self member profile information
       $rootScope.show();
       var link = 'https://www.clubdeuxmille.com/api/user.get_memberinfo/?user_id=' + $rootScope.userID.toString();
       console.log(link);
       homeFactory
         .apiCall(link, 'GET')
         .then(function(response) {
           $rootScope.hide();
           var result = response.data;
           if (result.status == "ok") {
             $scope.member_id = result.id;
             $scope.member_avatar = result.avatar;
             $scope.member_ftp = result.ftp;
             $scope.member_weight = result.weight;
             var W = parseFloat($scope.member_weight);
             var gradient, length;
             if ($ionicSlideBoxDelegate.currentIndex() == 0) {
                 gradient = $scope.avggradient0;
                 length = $scope.length0;
             } else if ($ionicSlideBoxDelegate.currentIndex() == 1) {
                 gradient = $scope.avggradient1;
                 length = $scope.length1;
             } else if ($ionicSlideBoxDelegate.currentIndex() == 2) {
                 gradient = $scope.avggradient2;
                 length = $scope.length2;
             } else if ($ionicSlideBoxDelegate.currentIndex() == 3) {
                 gradient = $scope.avggradient3;
                 length = $scope.length3;
             }
             var A = 0.509; //Frontal area
             var Cd = 0.63; //Drag coefficient
             var dt = 3; //Drivetrain loss
             var Crr = 0.005; //Rolling resistance coefficient
             var rho = 1.225; //Air Density
             var g = 9.8067; //Gravity
             var G = parseFloat(gradient);
             var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
             var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
             var a = 0.5 * A * Cd * rho;
             var b = 0;
             var c = FG + FRR;

             //Method 2 - To calculate Velocity
             var P = parseFloat($scope.member_ftp);
             var vh = 0;
             var D = parseFloat(length);
             var d = -P * (1 / (1 - (dt / 100)));
             var e = vh / 3.6;

             var V = $rootScope.NewtonRaphson(a, c, e, d);
             var temp_V = (V + vh) / 3.6;
             var FD = a * temp_V * temp_V;
             var FR = FG + FRR + FD; //Fresist

             var WRK = FR * D; //Work
             var T = 3.6 * D / V; //Time

             $scope.timeSelection = T;

             $scope.$watch('timeSelection', function(newValue, oldValue) {
               var hours = '' + parseInt($scope.timeSelection / 3600);
               var minutes = '' + parseInt(($scope.timeSelection - hours * 3600) / 60);
               var seconds = '' + parseInt($scope.timeSelection % 60);
               $scope.member_targettime = hours + ":" + minutes + ":" + seconds;
             }, true);

           } else {
             alert("User Login failed!")
           }
         });

       //Getting all of member profile information
       $rootScope.show();
       $rootScope.json_member_result = [];
       var link = 'https://www.clubdeuxmille.com/api/user/get_all_memberinfo/';
       homeFactory
         .colsCall(link, 'GET')
         .then(function(response) {
           $rootScope.hide();
           var result = response.data;
           console.log("all member object info:", result);
           for (var i = 0; i < result.length; i++) {
             $rootScope.json_member_result.push({
               member_name: result[i].name,
               member_avatar: result[i].avatar
             });
           }
         });

       $ionicModal.fromTemplateUrl('templates/choosemember.html', {
         scope: $scope
       }).then(function(modal) {
         $scope.modal = modal;
       });

       $scope.choose_member = function(u) {
         console.log("selected member:", u);
         $scope.choose_member_avatar = u.member_avatar;
         $scope.choose_member_name = u.member_name;
         $scope.choose_member_time = "00:53:34";
         $scope.choose_member_time_text = "TARGET TIME";
         $scope.choose_member_speed = "13.6kph";
         $scope.choose_member_speed_text = "TARGET SPEED";
         $scope.modal.hide();
       };

     })

     .controller('ChooseMemberCtrl', function($state, $scope, $rootScope, $ionicLoading, homeFactory) {
       $rootScope.show();

       $rootScope.json_member_result = [];

       var link = 'https://www.clubdeuxmille.com/api/user/get_memberinfo/?user_id=36';
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
       var rho = 1.225; //Air Density
       var g = 9.8067; //Gravity

       $scope.data = {};
       $scope.data.timeSelection = 1000;

       $scope.$watch('data.timeSelection', function(newValue, oldValue) {
         var hours = '' + parseInt($scope.data.timeSelection / 3600);
         var minutes = '' + parseInt(($scope.data.timeSelection - hours * 3600) / 60);
         var seconds = '' + parseInt($scope.data.timeSelection % 60);
         $scope.data.timeDisplay = hours + ":" + minutes + ":" + seconds;
       }, true);

       //$scope.data.speedSelection = 24;
       $scope.data.distanceSelection = 15000;
       $scope.data.windSelection = 0;
       $scope.data.gradientSelection = 0;

       $scope.data.seaLevelSelection = false;

       $scope.$on("$ionicView.enter", function(event, data) {

         if ($rootScope.profile_data == null) {
           $scope.data.wattsSelection = 312;
           $scope.data.totalweightSelection = 83;
         } else {
           $scope.data.wattsSelection = $rootScope.profile_data.ftp;
           $scope.data.totalweightSelection = parseFloat($rootScope.profile_data.weight) + parseFloat($rootScope.profile_data.bikeweight);
         }

         $scope.powerChange($scope.data.wattsSelection);
       });

       $scope.seaLevelToggleChange = function(val) {
         if (val) {
           $scope.data.gradientSelection = 0;
           $scope.gradientChange($scope.data.gradientSelection);
         }
       }

       $scope.speedChange = function(val) {
         //Basic Calculations
         var W = parseFloat($scope.data.totalweightSelection);
         var G = parseFloat($scope.data.gradientSelection);
         var FG = g * Math.sin(Math.atan(G / 100)) * W; //Fgravity
         var FRR = g * Math.cos(Math.atan(G / 100)) * W * Crr //Frolling-resistance
         var a = 0.5 * A * Cd * rho;
         var b = 0;
         //var c = FG + FRR;

         //Method 1 - To calculate Power
         var V = parseFloat(val);
         var vh = parseFloat($scope.data.windSelection);
         var D = parseFloat($scope.data.distanceSelection);
         var temp_V = (V + vh) / 3.6;
         var FD = a * temp_V * temp_V; //Fdrag
         var FR = FG + FRR + FD; //Fresist

         var WRK = FR * D; //Work
         var T = 3.6 * D / V; //Time

         $scope.data.timeSelection = T;
         $scope.data.wattsSelection = '' + parseInt((1 / (1 - (dt / 100))) * FR * (V / 3.6));
       }

       $scope.powerChange = function(val) {
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
         var d = -P * (1 / (1 - (dt / 100)));
         var e = vh / 3.6;

         $scope.data.speedSelection = '' + parseInt($rootScope.NewtonRaphson(a, c, e, d));
         var V = $rootScope.NewtonRaphson(a, c, e, d);
         var temp_V = (V + vh) / 3.6;
         var FD = a * temp_V * temp_V;
         var FR = FG + FRR + FD; //Fresist

         var WRK = FR * D; //Work
         var T = 3.6 * D / V; //Time

         $scope.data.timeSelection = T;
       }

       $rootScope.NewtonRaphson = function(a, c, e, d) {
         var vi = 30;
         var i = 1;
         var converged = false;
         var fvel, fdvel, dv, cct;
         do {
           fvel = a * vi * vi * vi + 2 * a * e * vi * vi + (a * e * e + c) * vi + d;
           fdvel = 3 * a * vi * vi + 4 * a * e * vi + a * e * e + c;
           dv = fvel / fdvel;

           cct = Math.abs(dv / vi);
           vi -= dv;
           if (cct < 0.001) {
             converged = true;
           } else {
             i += 1;
           }
         } while (i < 100 && converged == false);

         if (converged == false) {
           return 0;
         } else {
           return vi * 3.6;
         }
       }

       $scope.distanceChange = function(val) {
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
         var d = -P * (1 / (1 - (dt / 100)));
         var e = vh / 3.6;

         $scope.data.speedSelection = '' + parseInt($rootScope.NewtonRaphson(a, c, e, d));
         var V = $rootScope.NewtonRaphson(a, c, e, d);
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
         $scope.data.wattsSelection = '' + parseInt((1 / (1 - (dt / 100))) * FR * (V / 3.6));
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
         var d = -P * (1 / (1 - (dt / 100)));
         var e = vh / 3.6;

         $scope.data.speedSelection = '' + parseInt($rootScope.NewtonRaphson(a, c, e, d));
         var V = $rootScope.NewtonRaphson(a, c, e, d);
         var temp_V = (V + vh) / 3.6;
         var FD = a * temp_V * temp_V;
         var FR = FG + FRR + FD; //Fresist

         var WRK = FR * D; //Work
         var T = 3.6 * D / V; //Time

         $scope.data.timeSelection = T;
       }

     })

     .controller('ProfileCtrl', function($scope, $rootScope, $ionicModal, homeFactory) {

       //Getting self member profile information
       $rootScope.show();
       var link = 'https://www.clubdeuxmille.com/api/user.get_memberinfo/?user_id=' + $rootScope.userID.toString();
       console.log(link);
       homeFactory
         .apiCall(link, 'GET')
         .then(function(response) {
           $rootScope.hide();
           var result = response.data
           if (result.status == "ok") {
             $scope.image = result.avatar;
             $scope.name = result.name;
             $scope.country = result.nickname;
             $scope.level = result.user_col_level;
             $scope.conquredCols_data = result.user_cols_data;
             $scope.conquredCols = result.user_cols_data != null ? result.user_cols_data.length : 0;
            //  profile_data = {};
            //  profile_data.units = result.units != null ? result.units : '';
            //  profile_data.ftp = result.ftp != null ? result.ftp : '';
            //  profile_data.weight = result.weight != null ? result.weight : '';
            //  profile_data.bikeweight = "15";
            //  profile_data.pwr = "30";
           } else {
             alert("User Login failed!")
           }
         });

       $scope.logout = function() {
         console.log('logout click!');
       }

       $rootScope.profile_data = {};
       $rootScope.profile_data.units = "KM";
       $rootScope.profile_data.ftp = "26";
       $rootScope.profile_data.weight = "70";
       $rootScope.profile_data.bikeweight = "15";
       $rootScope.profile_data.pwr = "30";

       $scope.newData = {
         units: '',
         ftp: '',
         weight: '',
         bikeweight: '',
         pwr: ''
       };

       $ionicModal.fromTemplateUrl('templates/modal_edit.html', {
         scope: $scope
       }).then(function(modal) {
         $scope.modal = modal;
       });

       $scope.savedata = function() {
         $rootScope.profile_data = $scope.newData;
         $scope.modal.hide();
       };


     });
