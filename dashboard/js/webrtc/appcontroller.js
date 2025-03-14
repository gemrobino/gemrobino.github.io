/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals trace, InfoBox, setUpFullScreen, isFullScreen, RoomSelection, $ */
/* exported AppController, remoteVideo */

'use strict';

// TODO(jiayl): remove |remoteVideo| once the chrome browser tests are updated.
// Do not use in the production code.
var remoteVideo = $('#remote-video');

// Keep this in sync with the HTML element id attributes. Keep it sorted.
var UI_CONSTANTS = {
  backButton: '#back-button',
  confirmJoinButton: '#confirm-join-button',
  confirmJoinDiv: '#confirm-join-div',
  confirmJoinRoomSpan: '#confirm-join-room-span',
  fullscreenButton: '#fullscreen',
  hangupButton: '#hangup',
  homeButton: '#home-button',
  icons: '#icons',
  infoDiv: '#info-div',
  //localVideo: '#local-video',
  //miniVideo: '#mini-video',
  muteAudioButton: '#mute-audio',
  //muteVideoSvg: '#mute-video',
  newRoomButton: '#new-room-button',
  newRoomLink: '#new-room-link',
  navUpButton: '#nav-up',
  navDownButton: '#nav-down',
  navRightButton: '#nav-right',
  navLeftButton: '#nav-left',
  remoteVideo: '#remote-video',
  rejoinButton: '#rejoin-button',
  rejoinDiv: '#rejoin-div',
  rejoinLink: '#rejoin-link',
  roomLinkHref: '#room-link-href',
  roomSelectionDiv: '#room-selection',
  roomSelectionInput: '#room-id-input',
  roomSelectionInputLabel: '#room-id-input-label',
  roomSelectionJoinButton: '#join-button',  
  sharingDiv: '#sharing-div',
  statusDiv: '#status-div',
  turnInfoDiv: '#turn-info-div',
  videosDiv: '#videos',
};

// The controller that connects the Call with the UI.
var AppController = function(loadingParams) {
  trace('Initializing; server= ' + loadingParams.roomServer + '.');
  trace('Initializing; room=' + loadingParams.roomId + '.');

  this.hangupButton_ = $(UI_CONSTANTS.hangupButton);
  this.icons_ = $(UI_CONSTANTS.icons);
  //this.localVideo_ = $(UI_CONSTANTS.localVideo);
  //this.miniVideo_ = $(UI_CONSTANTS.miniVideo);
  this.sharingDiv_ = $(UI_CONSTANTS.sharingDiv);
  this.statusDiv_ = $(UI_CONSTANTS.statusDiv);
  this.turnInfoDiv_ = $(UI_CONSTANTS.turnInfoDiv);
  this.remoteVideo_ = $(UI_CONSTANTS.remoteVideo);
  this.videosDiv_ = $(UI_CONSTANTS.videosDiv);
  this.roomLinkHref_ = $(UI_CONSTANTS.roomLinkHref);
  this.rejoinDiv_ = $(UI_CONSTANTS.rejoinDiv);
  this.rejoinLink_ = $(UI_CONSTANTS.rejoinLink);
  this.newRoomLink_ = $(UI_CONSTANTS.newRoomLink);
  this.rejoinButton_ = $(UI_CONSTANTS.rejoinButton);
  this.newRoomButton_ = $(UI_CONSTANTS.newRoomButton);
  this.isRemoteHasVideo_ = true;

  this.backButtonIconSet_= new AppController.IconSet_(UI_CONSTANTS.backButton);
  this.muteAudioIconSet_ =
      new AppController.IconSet_(UI_CONSTANTS.muteAudioButton);
  //this.muteVideoIconSet_ =
    //  new AppController.IconSet_(UI_CONSTANTS.muteVideoSvg);
  this.fullscreenIconSet_ =
      new AppController.IconSet_(UI_CONSTANTS.fullscreenButton);

  this.loadingParams_ = loadingParams;
  this.loadUrlParams_();

  var paramsPromise = Promise.resolve({});

  Promise.resolve(paramsPromise).then(function(newParams) {
    // Merge newly retrieved params with loadingParams.
    if (newParams) {
      Object.keys(newParams).forEach(function(key) {
        this.loadingParams_[key] = newParams[key];
      }.bind(this));
    }

    this.newRoomButton_.addEventListener('click',
        this.onNewRoomClick_.bind(this), false);
    this.rejoinButton_.addEventListener('click',
        this.onRejoinClick_.bind(this), false);

    this.roomLink_ = '';
    this.roomSelection_ = null;
    this.localStream_ = null;
    this.remoteVideoResetTimer_ = null;

    // If the params has a roomId specified, we should connect to that room
    // immediately. If not, show the room selection UI.
    if (this.loadingParams_.roomId) {
      //this.hide_(roomSelectionDiv);
        this.createCall_(this.loadingParams_.roomId);
        this.finishCallSetup_(this.loadingParams_.roomId);
  
     // this.roomSelection_.removeEventListeners();
      //this.roomSelection_ = null;
      if (this.localStream_) {
        this.attachLocalStream_();
      }
    }
  }.bind(this)).catch(function(error) {
    trace('Error initializing: ' + error.message);
  }.bind(this));

    //Hank: get the remote video size, so we can dynamically do the RC window in future
    this.remoteVideo_.addEventListener('loadedmetadata', this.onVideoSizeInitialized_.bind(this));
    this.remoteVideo_.onresize = this.onVideoSizeChange_.bind(this);
};


AppController.prototype.onVideoSizeChange_ = function () {
    trace('Remote video size changed to ' +
        this.remoteVideo_.videoWidth + 'x' + this.remoteVideo_.videoHeight);
    if (this.remoteVideo_.videoWidth * this.remoteVideo_.videoHeight == 0) {
        this.isRemoteHasVideo_ = false;
        this.remoteVideo_.oncanplay = undefined;
        this.deactivate_(this.remoteVideo_);
        this.hide_(this.remoteVideo_);
    }
};

AppController.prototype.onVideoSizeInitialized_ = function () {
    trace('Remote video videoWidth: ' + this.remoteVideo_.videoWidth +
        'px,  videoHeight: ' + this.remoteVideo_.videoHeight + 'px');
    if (this.remoteVideo_.videoWidth * this.remoteVideo_.videoHeight == 0) {
        this.isRemoteHasVideo_ = false;
        this.remoteVideo_.oncanplay = undefined;
        this.deactivate_(this.remoteVideo_);
        this.hide_(this.remoteVideo_);
    }
};

AppController.prototype.createCall_ = function(roomId) {
  this.call_ = new Call(this.loadingParams_);
  this.infoBox_ = new InfoBox($(UI_CONSTANTS.infoDiv), this.call_,
      this.loadingParams_.versionInfo);

  var roomErrors = this.loadingParams_.errorMessages;
  var roomWarnings = this.loadingParams_.warningMessages;
  if (roomErrors && roomErrors.length > 0) {
    for (var i = 0; i < roomErrors.length; ++i) {
      this.infoBox_.pushErrorMessage(roomErrors[i]);
    }
    return;
  } else if (roomWarnings && roomWarnings.length > 0) {
    for (var j = 0; j < roomWarnings.length; ++j) {
      this.infoBox_.pushWarningMessage(roomWarnings[j]);
    }
  }

  // TODO(jiayl): replace callbacks with events.
  this.call_.onremotehangup = this.onRemoteHangup_.bind(this);
  this.call_.onremotesdpset = this.onRemoteSdpSet_.bind(this);
  this.call_.onremotestreamadded = this.onRemoteStreamAdded_.bind(this);
  this.call_.onlocalstreamadded = this.onLocalStreamAdded_.bind(this);

  this.call_.onsignalingstatechange =
      this.infoBox_.updateInfoDiv.bind(this.infoBox_);
  this.call_.oniceconnectionstatechange =
      this.infoBox_.updateInfoDiv.bind(this.infoBox_);
  this.call_.onnewicecandidate =
      this.infoBox_.recordIceCandidateTypes.bind(this.infoBox_);

  this.call_.onerror = this.displayError_.bind(this);
  this.call_.onturnstatusmessage = this.displayTurnStatus_.bind(this);
  this.call_.oncallerstarted = this.displaySharingInfo_.bind(this);
};

AppController.prototype.showRoomSelection_ = function() {
  var roomSelectionDiv = $(UI_CONSTANTS.roomSelectionDiv);
  this.roomSelection_ = new RoomSelection(roomSelectionDiv, UI_CONSTANTS);

  this.show_(roomSelectionDiv);
};

AppController.prototype.setupUi_ = function() {
  this.iconEventSetup_();
  window.onmousemove = this.showIcons_.bind(this);

  $(UI_CONSTANTS.navUpButton).onclick = this.navUp_.bind(this);
  $(UI_CONSTANTS.navDownButton).onclick = this.navDown_.bind(this);
  $(UI_CONSTANTS.navLeftButton).onclick = this.navLeft_.bind(this);
  $(UI_CONSTANTS.navRightButton).onclick = this.navRight_.bind(this);

  $(UI_CONSTANTS.homeButton).onclick = this.goHome_.bind(this);
  $(UI_CONSTANTS.backButton).onclick = this.goBack_.bind(this);
  $(UI_CONSTANTS.muteAudioButton).onclick = this.toggleAudioMute_.bind(this);
  //$(UI_CONSTANTS.muteVideoSvg).onclick = this.toggleVideoMute_.bind(this);
  $(UI_CONSTANTS.fullscreenButton).onclick = this.toggleFullScreen_.bind(this);
  $(UI_CONSTANTS.hangupButton).onclick = this.hangup_.bind(this);

  setUpFullScreen();
};

AppController.prototype.finishCallSetup_ = function(roomId) {
  this.call_.start(roomId);
  this.setupUi_();

  // Call hangup with async = false. Required to complete multiple
  // clean up steps before page is closed.
  window.onbeforeunload = function() {
    this.call_.hangup(false);
  }.bind(this);

  window.onpopstate = function(event) {
    if (!event.state) {
      // TODO (chuckhays) : Resetting back to room selection page not
      // yet supported, reload the initial page instead.
      trace('Reloading main page.');
      location.href = location.origin;
    } else {
      // This could be a forward request to open a room again.
      if (event.state.roomLink) {
        location.href = event.state.roomLink;
      }
    }
  };
};

AppController.prototype.hangup_ = function() {
  trace('Hanging up.');
  this.hide_(this.icons_);
  this.displayStatus_('Hanging up');
  this.transitionToDone_();

  // Call hangup with async = true.
  this.call_.hangup(true);
  // Reset key and mouse event handlers.
  document.onkeypress = null;
  window.onmousemove = null;
};

AppController.prototype.onRemoteHangup_ = function() {
  this.displayStatus_('The remote side hung up.'); 
  this.call_.onRemoteHangup();
  this.transitionToDone_();
};

AppController.prototype.onRemoteSdpSet_ = function(hasRemoteVideo) {
  if (hasRemoteVideo) {
    trace('Waiting for remote video.');
    this.waitForRemoteVideo_();
  } else {
    trace('No remote video stream; not waiting for media to arrive.');
    // TODO(juberti): Make this wait for ICE connection before transitioning.
    this.transitionToActive_();
  }
};

AppController.prototype.waitForRemoteVideo_ = function() {
  // Wait for the actual video to start arriving before moving to the active
  // call state.
  if (this.remoteVideo_.readyState >= 2) { // i.e. can play
    trace('Remote video started; currentTime: ' +
          this.remoteVideo_.currentTime);
    this.transitionToActive_();
  } else {
    this.remoteVideo_.oncanplay = this.waitForRemoteVideo_.bind(this);
  }
};

AppController.prototype.onRemoteStreamAdded_ = function(stream) {
  this.deactivate_(this.sharingDiv_);
  this.displayTurnStatus_('');
  trace('Remote stream added.');
  this.remoteVideo_.srcObject = stream;
  this.infoBox_.getRemoteTrackIds(stream);


  if (this.remoteVideoResetTimer_) {
    clearTimeout(this.remoteVideoResetTimer_);
    this.remoteVideoResetTimer_ = null;
  }
};

AppController.prototype.onLocalStreamAdded_ = function(stream) {
  trace('User has granted access to local media.');
  this.localStream_ = stream;
  this.infoBox_.getLocalTrackIds(this.localStream_);

  if (!this.roomSelection_) {
    this.attachLocalStream_();
  }
};

AppController.prototype.attachLocalStream_ = function() {
  trace('Attaching local stream.');
  //this.localVideo_.srcObject = this.localStream_;

  this.displayStatus_('');
  //this.activate_(this.localVideo_);
  this.show_(this.icons_);
  if (this.localStream_.getAudioTracks().length === 0) {
    this.hide_($(UI_CONSTANTS.muteAudioButton));
  }
};

AppController.prototype.transitionToActive_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;
  var connectTime = window.performance.now();
  this.infoBox_.setSetupTimes(this.call_.startTime, connectTime);
  this.infoBox_.updateInfoDiv();
  trace('Call setup time: ' + (connectTime - this.call_.startTime).toFixed(0) +
      'ms.');

  // Prepare the remote video and PIP elements.
  //trace('reattachMediaStream: ' + this.localVideo_.srcObject);
  //this.miniVideo_.srcObject = this.localVideo_.srcObject;

  // Transition opacity from 0 to 1 for the remote and mini videos.
  this.activate_(this.remoteVideo_);
  //this.activate_(this.miniVideo_);
  // Transition opacity from 1 to 0 for the local video.
  //this.deactivate_(this.localVideo_);

  //this.show_(this.localVideo_);
  this.show_(this.remoteVideo_);
  //this.show_(this.miniVideo_);
  this.show_(this.hangupButton_);
  this.show_($(UI_CONSTANTS.muteAudioButton));
  //this.show_($(UI_CONSTANTS.muteVideoSvg));
  this.show_($(UI_CONSTANTS.fullscreenButton));  

  //this.localVideo_.srcObject = null;
  // Rotate the div containing the videos 180 deg with a CSS transform.
  this.activate_(this.videosDiv_);
  this.displayStatus_('');
};

AppController.prototype.transitionToWaiting_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;

  this.hide_(this.hangupButton_);
  // Rotate the div containing the videos -180 deg with a CSS transform.
  this.deactivate_(this.videosDiv_);

  if (!this.remoteVideoResetTimer_) {
    this.remoteVideoResetTimer_ = setTimeout(function() {
      this.remoteVideoResetTimer_ = null;
      trace('Resetting remoteVideo src after transitioning to waiting.');
      this.remoteVideo_.srcObject = null;
    }.bind(this), 800);
  }

  // Set localVideo.srcObject now so that the local stream won't be lost if the
  // call is restarted before the timeout.
  //this.localVideo_.srcObject = this.miniVideo_.srcObject;

  // Transition opacity from 0 to 1 for the local video.
  //this.activate_(this.localVideo_);
  // Transition opacity from 1 to 0 for the remote and mini videos.
  this.deactivate_(this.remoteVideo_);
  //this.deactivate_(this.miniVideo_);
};

AppController.prototype.transitionToDone_ = function() {
  // Stop waiting for remote video.
  this.remoteVideo_.oncanplay = undefined;
  //this.deactivate_(this.localVideo_);
  this.deactivate_(this.remoteVideo_);
  //this.deactivate_(this.miniVideo_);
  
  //this.hide_(this.localVideo_);
  this.hide_(this.remoteVideo_);
  //this.hide_(this.miniVideo_);

  this.hide_(this.hangupButton_);
  this.hide_($(UI_CONSTANTS.muteAudioButton));
  this.deactivate_(this.videosDiv_);
  //this.hide_($(UI_CONSTANTS.muteVideoSvg));
  this.hide_($(UI_CONSTANTS.fullscreenButton));  
  this.showRoomSelection_();
  //this the ui is not show at all: this.show_(roomSelectionDiv);
  this.displayStatus_('');
  this.displayTurnStatus_('');
  window.close;
  
};

AppController.prototype.onRejoinClick_ = function() {
  this.deactivate_(this.rejoinDiv_);
  this.hide_(this.rejoinDiv_);
  this.call_.restart();
  this.setupUi_();
};

AppController.prototype.onNewRoomClick_ = function() {
  this.deactivate_(this.rejoinDiv_);
  this.hide_(this.rejoinDiv_);
  this.showRoomSelection_();
};

// Spacebar, or m: toggle audio mute.
// c: toggle camera(video) mute.
// f: toggle fullscreen.
// i: toggle info panel.
// q: quit (hangup)
// Return false to screen out original Chrome shortcuts.
AppController.prototype.onKeyPress_ = function(event) {
  switch (String.fromCharCode(event.charCode)) {
    case ' ':
    case 'm':
      if (this.call_) {
        this.call_.toggleAudioMute();
        this.muteAudioIconSet_.toggle();
      }
      return false;
    case 'c':
      if (this.call_) {
        this.call_.toggleVideoMute();
        this.muteVideoIconSet_.toggle();
      }
      return false;
    case 'f':
      this.toggleFullScreen_();
      return false;
    case 'i':
      this.infoBox_.toggleInfoDiv();
      return false;
    case 'q':
      this.hangup_();
      return false;
    case 'l':
      //this.toggleMiniVideo_();
      return false;
    default:
      return;
  }
};

AppController.prototype.pushCallNavigation_ = function(roomId, roomLink) {
  window.history.pushState({'roomId': roomId, 'roomLink': roomLink}, roomId,
      roomLink);
};

AppController.prototype.displaySharingInfo_ = function(roomId, roomLink) {
  this.roomLinkHref_.href = roomLink;
  this.roomLinkHref_.text = roomLink;
  this.roomLink_ = roomLink;
  this.pushCallNavigation_(roomId, roomLink);
  this.activate_(this.sharingDiv_);
};

AppController.prototype.displayStatus_ = function(status) {
  if (status === '') {
    this.deactivate_(this.statusDiv_);
  } else {
    this.activate_(this.statusDiv_);
  }
  this.statusDiv_.innerHTML = status;
};

AppController.prototype.displayTurnStatus_ = function(status) {
  /*Hank no need this
  if (status === '') {
    this.deactivate_(this.turnInfoDiv_);
  } else {
    this.activate_(this.turnInfoDiv_);
  }
  this.turnInfoDiv_.innerHTML = status;
  */
};

AppController.prototype.displayError_ = function(error) {
  trace(error);
  this.infoBox_.pushErrorMessage(error);
};

AppController.prototype.navDown_ = function() {
  trace('Down pressed');
  this.call_.sendDownEvent();
};

AppController.prototype.navUp_ = function() {
  trace('Up pressed');
  this.call_.sendUpEvent();
};

AppController.prototype.navLeft_ = function() {
  trace('Left pressed');
  this.call_.sendLeftEvent();
};

AppController.prototype.navRight_ = function() {
  trace('Right pressed');
  this.call_.sendRightEvent();
};

AppController.prototype.goHome_ = function() {
  trace('Home pressed');
  this.call_.sendHomeEvent();
};


AppController.prototype.goBack_ = function() {
  trace('Back pressed');
  this.call_.sendBackEvent();
};

AppController.prototype.toggleAudioMute_ = function() {
  this.call_.toggleAudioMute();
  this.muteAudioIconSet_.toggle();
};

AppController.prototype.toggleVideoMute_ = function() {
  this.call_.toggleVideoMute();
  this.muteVideoIconSet_.toggle();
};

AppController.prototype.toggleFullScreen_ = function() {
  if (isFullScreen()) {
    trace('Exiting fullscreen.');
    document.querySelector('svg#fullscreen title').textContent =
        'Enter fullscreen';
    document.cancelFullScreen();
  } else {
    trace('Entering fullscreen.');
    document.querySelector('svg#fullscreen title').textContent =
        'Exit fullscreen';
    document.body.requestFullScreen();
  }
  this.fullscreenIconSet_.toggle();
};

AppController.prototype.toggleMiniVideo_ = function() {
  if (this.miniVideo_.classList.contains('active')) {
    this.deactivate_(this.miniVideo_);
  } else {
    this.activate_(this.miniVideo_);
  }
};

AppController.prototype.hide_ = function(element) {
  element.classList.add('hidden');
};

AppController.prototype.show_ = function(element) {
  element.classList.remove('hidden');
};

AppController.prototype.activate_ = function(element) {
  element.classList.add('active');
};

AppController.prototype.deactivate_ = function(element) {
  element.classList.remove('active');
};

AppController.prototype.showIcons_ = function() {
  if (!this.icons_.classList.contains('active')) {
    this.activate_(this.icons_);
    this.setIconTimeout_();
  }
};

AppController.prototype.hideIcons_ = function() {
  if (this.icons_.classList.contains('active')) {
    this.deactivate_(this.icons_);
  }
};

AppController.prototype.setIconTimeout_ = function() {
  if (this.hideIconsAfterTimeout) {
    window.clearTimeout.bind(this, this.hideIconsAfterTimeout);
  }
  this.hideIconsAfterTimeout = window.setTimeout(function() {
    this.hideIcons_();
  }.bind(this), 5000);
};

AppController.prototype.iconEventSetup_ = function() {
  this.icons_.onmouseenter = function() {
    window.clearTimeout(this.hideIconsAfterTimeout);
  }.bind(this);

  this.icons_.onmouseleave = function() {
    this.setIconTimeout_();
  }.bind(this);
};

AppController.prototype.loadUrlParams_ = function() {
  /* eslint-disable dot-notation */
  // Suppressing eslint warns about using urlParams['KEY'] instead of
  // urlParams.KEY, since we'd like to use string literals to avoid the Closure
  // compiler renaming the properties.
  var DEFAULT_VIDEO_CODEC = 'VP9';
  var urlParams = queryStringToDictionary(window.location.search);
  this.loadingParams_.audioSendBitrate = urlParams['asbr'];
  this.loadingParams_.audioSendCodec = urlParams['asc'];
  this.loadingParams_.audioRecvBitrate = urlParams['arbr'];
  this.loadingParams_.audioRecvCodec = urlParams['arc'];
  this.loadingParams_.opusMaxPbr = urlParams['opusmaxpbr'];
  this.loadingParams_.opusFec = urlParams['opusfec'];
  this.loadingParams_.opusDtx = urlParams['opusdtx'];
  this.loadingParams_.opusStereo = urlParams['stereo'];
  this.loadingParams_.videoSendBitrate = urlParams['vsbr'];
  this.loadingParams_.videoSendInitialBitrate = urlParams['vsibr'];
  this.loadingParams_.videoSendCodec = urlParams['vsc'];
  this.loadingParams_.videoRecvBitrate = urlParams['vrbr'];
  this.loadingParams_.videoRecvCodec = urlParams['vrc'] || DEFAULT_VIDEO_CODEC;
  this.loadingParams_.videoFec = urlParams['videofec'];
  /* eslint-enable dot-notation */
};

AppController.IconSet_ = function(iconSelector) {
  this.iconElement = document.querySelector(iconSelector);
};

AppController.IconSet_.prototype.toggle = function() {
  if (this.iconElement.classList.contains('on')) {
    this.iconElement.classList.remove('on');
    // turn it off: CSS hides `svg path.on` and displays `svg path.off`
  } else {
    // turn it on: CSS displays `svg.on path.on` and hides `svg.on path.off`
    this.iconElement.classList.add('on');
  }
};
