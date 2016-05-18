(function() {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService, $scope, $window) {
        var vm = this;
        var peer = null;
		var peerApiKey = 'w35b9kn366y4aemi';
		
        vm.user = null;
        $scope.streamId = null;
        $scope.online = [];
        $scope.button = "Start Streaming";
        $scope.connect = 0;
        $scope.isDisabled = true;

        // Compatibility shim
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        initController();
        setUpPeer();

		$('#videoStream').hide();
        $('#step1').hide();
        $('#step2').hide();
        $('#step3').hide();

        $scope.end = function() {
            window.existingCall.close();
            $('#step1').hide();
            $('#step3').hide();
            $('#step2').show();
            getStreaming();
        }

        $scope.step1 = function() {
            //Check if user is connected and streaming
            if ($scope.connect == 0) {
                // Get audio/video stream

                navigator.getUserMedia({
                    audio: true,
                    video: true
                }, function(stream) {
                    // Set your video displays
                    $('#my-video').prop('src', URL.createObjectURL(stream));
                    window.localStream = stream;
                    streamUser();
                    step2();
                    $('#videoStream').show();

                    $scope.connect = 1;
                    $scope.button = "Disconnect";
                }, function() {
                    $('#step1-error').show();
                });
            } else {
                // Close stream and disconnect user

                peer.disconnect();
                DisconnectUser();
                window.localStream.getVideoTracks()[0].stop();
                $('#videoStream').hide();
                $('#step1').hide();
                $('#step2').hide();
                $('#step3').hide();

                $scope.connect = 0;
                $scope.button = "Start Streaming";
            }

        }

        $scope.CallUser = function(id) {
            if (id == $scope.streamId) {
                alert("You can't call yourself");
                return false;
            }
            var call = id;
            step3(call);
        }

        $window.onbeforeunload = function() {
            if ($scope.connect == 1)
                DisconnectUser();
        }

        function setUpPeer() {

            // PeerJS object
            peer = new Peer({
                key: peerApiKey,
                debug: 3
            });
            peer.on('open', function() {
                UpdateStreamId(peer.id);
                getStreaming();
            });

            // Receiving a call
            peer.on('call', function(call) {
                // Answer the call automatically (instead of prompting user) for demo purposes
                call.answer(window.localStream);
                answer(call);
            });

        }

        function step2() {
            $('#step1, #step3').hide();
            $('#step2').show();
        }

        function step3(id) {
            // Hang up on an existing call if present
            var outgoingCall = peer.call(id, window.localStream);
            if (window.existingCall) {
                window.existingCall.close();
            }
            // Wait for stream on the call, then set peer video display
            outgoingCall.on('stream', function(stream) {
                $('#their-video').prop('src', URL.createObjectURL(stream));
            });

            // UI stuff
            window.existingCall = outgoingCall;
            //$('#their-id').text(outgoingCall.peer);
            outgoingCall.on('close', step2);
            $('#step1, #step2').hide();
            $('#step3').show();
        }

        function answer(id) {
            // Hang up on an existing call if present
            var outgoingCall = id;
            if (window.existingCall) {
                window.existingCall.close();
            }
            // Wait for stream on the call, then set peer video display
            outgoingCall.on('stream', function(stream) {
                $('#their-video').prop('src', URL.createObjectURL(stream));
            });

            // UI stuff
            window.existingCall = outgoingCall;
            //$('#their-id').text(outgoingCall.peer);
            outgoingCall.on('close', step2);
            $('#step1, #step2').hide();
            $('#step3').show();
        }

        function UpdateStreamId(id) {
            // Set current user Stread Id
            $scope.streamId = id;
            $scope.isDisabled = false;
            $scope.$apply();
        }

        function initController() {
            // get current user
            UserService.GetCurrent().then(function(user) {
                vm.user = user;
            });

        }

        function getStreaming() {
            // get online streaming users;
            UserService.GetAll()
                .then(function(users) {
                    $scope.online = users;
                })
                .catch(function(error) {});
        }

        function streamUser() {
            // Set user online for streaming
            UserService.Streaming(vm.user, $scope.streamId)
                .then(function() {
                    getStreaming();
                })
                .catch(function(error) {});
        }

        function DisconnectUser() {
            // Set user offline for streaming
            UserService.Disconnect(vm.user);
        }

    }

})();