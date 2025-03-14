/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals trace, requestIceServers, sendUrlRequest, sendAsyncUrlRequest,
   SignalingChannel, PeerConnectionClient, setupLoopback,
   parseJSON, Constants */

/* exported Call */

'use strict';

var Call = function(params) {
  this.params_ = params;
  this.roomServer_ = params.roomServer || '';

  this.channel_ = new SignalingChannel(params.wssUrl, params.wssPostUrl, params.groupId, params.roomId, params.token);
  this.channel_.onmessage = this.onRecvSignalingChannelMessage_.bind(this);

  this.pcClient_ = null;
  this.localStream_ = null;
  this.errorMessageQueue_ = [];
  this.startTime = null;

  // Public callbacks. Keep it sorted.
  this.oncallerstarted = null;
  this.onerror = null;
  this.oniceconnectionstatechange = null;
  this.onlocalstreamadded = null;
  this.onnewicecandidate = null;
  this.onremotehangup = null;
  this.onremotesdpset = null;
  this.onremotestreamadded = null;
  this.onsignalingstatechange = null;
  this.onturnstatusmessage = null;

  this.getMediaPromise_ = null;
  this.getIceServersPromise_ = null;
  this.iceServerPromiseHandlers_ = {};
  this.requestMediaAndIceServers_();
  this.maybeCreatePcClientAsync_();
};

Call.prototype.requestMediaAndIceServers_ = function() {
  this.getMediaPromise_ = this.maybeGetMedia_();
  this.getIceServersPromise_ = this.maybeGetIceServers_();
};

Call.prototype.isInitiator = function() {
  return this.params_.isInitiator;
};

Call.prototype.start = function(roomId) {
  this.connectToRoom_(roomId);
  if (this.params_.isLoopback) {
    setupLoopback(this.params_.wssUrl, roomId);
  }
};

Call.prototype.restart = function() {
  // Reinitialize the promises so the media gets hooked up as a result
  // of calling maybeGetMedia_.
  this.requestMediaAndIceServers_();
  this.start(this.params_.previousRoomId);
};

Call.prototype.hangup = function(async) {
  this.startTime = null;

  if (this.localStream_) {
    if (typeof this.localStream_.getTracks === 'undefined') {
      // Support legacy browsers, like phantomJs we use to run tests.
      this.localStream_.stop();
    } else {
      this.localStream_.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    this.localStream_ = null;
  }

  //send hangup to server
  var msg = {
    type: SSConstants.HANG_UP,
    group: this.params_.groupId,
    dest: 'test',
    src:   this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  }

  this.sendSignalingMessage_(msg);

  if (!this.params_.roomId) {
    return;
  }

  if (this.pcClient_) {
    this.pcClient_.close();
    this.pcClient_ = null;
  }

  // This section of code is executed in both sync and async depending on
  // where it is called from. When the browser is closed, the requests must
  // be executed as sync to finish before the browser closes. When called
  // from pressing the hang up button, the requests are executed async.

  var steps = [];
  steps.push({
    step: function() {
      // Send bye to the other client.
      var msg = {
        type : 'bye'
      };
      this.channel_.send(msg);
    }.bind(this),
    errorString: 'Error sending bye:'
  });
  steps.push({
    step: function() {
      // Close signaling channel.
      return this.channel_.close(async);
    }.bind(this),
    errorString: 'Error closing signaling channel:'
  });
  steps.push({
    step: function() {
      this.params_.roomId = null;
      this.params_.clientId = null;
    }.bind(this),
    errorString: 'Error setting params:'
  });

  if (async) {
    var errorHandler = function(errorString, error) {
      trace(errorString + ' ' + error.message);
    };
    var promise = Promise.resolve();
    for (var i = 0; i < steps.length; ++i) {
      promise = promise.then(steps[i].step).catch(
          errorHandler.bind(this, steps[i].errorString));
    }

    return promise;
  }
  // Execute the cleanup steps.
  var executeStep = function(executor, errorString) {
    try {
      executor();
    } catch (ex) {
      trace(errorString + ' ' + ex);
    }
  };

  for (var j = 0; j < steps.length; ++j) {
    executeStep(steps[j].step, steps[j].errorString);
  }

  if (this.params_.roomId !== null || this.params_.clientId !== null) {
    trace('ERROR: sync cleanup tasks did not complete successfully.');
  } else {
    trace('Cleanup completed.');
  }
  return Promise.resolve();
};

Call.prototype.getLeaveUrl_ = function() {
  return this.roomServer_ + '/leave/' + this.params_.roomId +
      '/' + this.params_.clientId;
};

Call.prototype.onRemoteHangup = function() {
  this.startTime = null;
  this.hangup();
};

Call.prototype.getPeerConnectionStates = function() {
  if (!this.pcClient_) {
    return null;
  }
  return this.pcClient_.getPeerConnectionStates();
};

Call.prototype.getPeerConnectionStats = function(callback) {
  if (!this.pcClient_) {
    return;
  }
  this.pcClient_.getPeerConnectionStats(callback);
};

Call.prototype.toggleVideoMute = function() {
  var videoTracks = this.localStream_.getVideoTracks();
  if (videoTracks.length === 0) {
    trace('No local video available.');
    return;
  }

  trace('Toggling video mute state.');
  for (var i = 0; i < videoTracks.length; ++i) {
    videoTracks[i].enabled = !videoTracks[i].enabled;
  }
  trace('Video ' + (videoTracks[0].enabled ? 'unmuted.' : 'muted.'));
};

Call.prototype.sendUpEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GOUP,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };

  this.sendSignalingMessage_(msg);
}

Call.prototype.sendDownEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GODOWN,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };

  this.sendSignalingMessage_(msg);
}

Call.prototype.sendLeftEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GOLEFT,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };

  this.sendSignalingMessage_(msg);
}

Call.prototype.sendRightEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GORIGHT,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };

  this.sendSignalingMessage_(msg);
}

Call.prototype.sendHomeEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GOHOME,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };

  this.sendSignalingMessage_(msg);
}

Call.prototype.sendBackEvent = function() {
  var msg = {
    type: SSConstants.CONTROL,
    eventType: SSConstants.GLOBAL_EVENT,
    event: SSConstants.GOBACK,
    dest: 'test',
    src: this.pcClient_.clientId_,
    roomId: this.pcClient_.roomId_
  };
  this.sendSignalingMessage_(msg);
}

Call.prototype.toggleAudioMute = function() {
  var audioTracks = this.localStream_.getAudioTracks();
  if (audioTracks.length === 0) {
    trace('No local audio available.');
    return;
  }

  trace('Toggling audio mute state.');
  for (var i = 0; i < audioTracks.length; ++i) {
    audioTracks[i].enabled = !audioTracks[i].enabled;
  }
  trace('Audio ' + (audioTracks[0].enabled ? 'unmuted.' : 'muted.'));
};

// Connects client to the room. This happens by simultaneously requesting
// media, requesting turn, and join the room. Once all three of those
// tasks is complete, the signaling process begins. At the same time, a
// WebSocket connection is opened using |wss_url| followed by a subsequent
// registration once GAE registration completes.
Call.prototype.connectToRoom_ = function(roomId) {
  this.params_.roomId = roomId;
  // Asynchronously open a WebSocket connection to WSS.
  // TODO(jiayl): We don't need to wait for the signaling channel to open before
  // start signaling.
  var channelPromise = this.channel_.open().catch(function(error) {
    this.onError_('WebSocket open error: ' + error.message);
    return Promise.reject(error);
  }.bind(this));

  // We only register with WSS if the web socket connection is open and if we're
  // already registered with GAE.
  //Hank: skip room joinPromise for now
  //Promise.all([channelPromise, joinPromise]).then(function() {
  Promise.all([channelPromise]).then(function() {
    this.channel_.register(this.params_.roomId, this.params_.clientId);

    // We only start signaling after we have registered the signaling channel
    // and have media and TURN. Since we send candidates as soon as the peer
    // connection generates them we need to wait for the signaling channel to be
    // ready.

    Promise.all([this.getMediaPromise_, this.getIceServersPromise_])
        .then(function() {
          this.startSignaling_();
        }.bind(this)).catch(function(error) {
          this.onError_('Failed to start signaling: ' + error.message);
        }.bind(this));
  }.bind(this)).catch(function(error) {
    this.onError_('WebSocket register error: ' + error.message);
  }.bind(this));
};

// Asynchronously request user media if needed.
Call.prototype.maybeGetMedia_ = function() {

  var mediaPromise = null;
  if (true) {
    var mediaConstraints = {
      video: false, //Hank: this will get type error when calling getUserMedia, so turn off alert
      audio: true
    };

    mediaPromise = navigator.mediaDevices.getUserMedia(mediaConstraints)
        .catch(function(error) {
          if (error.name !== 'NotFoundError') {
            throw error;
          }
          return navigator.mediaDevices.enumerateDevices()
              .then(function(devices) {
                var mic = devices.find(function(device) {
                  return device.kind === 'audioinput';
                });
                var constraints = {
                  video: false,
                  audio: mic && mediaConstraints.audio
                };
                return navigator.mediaDevices.getUserMedia(constraints);
              });
        })
        .then(function(stream) {
          trace('Got access to local media with mediaConstraints:\n' +
          '  \'' + JSON.stringify(mediaConstraints) + '\'');

          this.onUserMediaSuccess_(stream);
        }.bind(this)).catch(function(error) {
          this.onError_('Error getting user media: ' + error.message);
          this.onUserMediaError_(error);
        }.bind(this));
  } else {
    mediaPromise = Promise.resolve();
  }
  return mediaPromise;
};

// Asynchronously request an ICE server if needed.
Call.prototype.maybeGetIceServers_ = function () {
  return new Promise((resolve, reject) => {
    this.iceServerPromiseHandlers_.resolve = resolve;
    this.iceServerPromiseHandlers_.reject = reject;
  });
};

Call.prototype.onUserMediaSuccess_ = function(stream) {
  this.localStream_ = stream;
  if (this.onlocalstreamadded) {
    this.onlocalstreamadded(stream);
  }
};

Call.prototype.onUserMediaError_ = function(error) {
  var errorMessage = 'Failed to get access to local media. Error name was ' +
      error.name + '. Continuing without sending a stream.';
  this.onError_('getUserMedia error: ' + errorMessage);
  this.errorMessageQueue_.push(error);
  //Hank no need to alert alert(errorMessage);
};

Call.prototype.maybeCreatePcClientAsync_ = function() {
  return new Promise(function(resolve, reject) {
    if (this.pcClient_) {
      resolve();
      return;
    }

    if (typeof RTCPeerConnection.generateCertificate === 'function') {
      var certParams = {name: 'ECDSA', namedCurve: 'P-256'};
      RTCPeerConnection.generateCertificate(certParams)
          .then(function(cert) {
            trace('ECDSA certificate generated successfully.');
            this.params_.peerConnectionConfig.certificates = [cert];
            this.createPcClient_();
            resolve();
          }.bind(this))
          .catch(function(error) {
            trace('ECDSA certificate generation failed.');
            reject(error);
          });
    } else {
      this.createPcClient_();
      resolve();
    }
  }.bind(this));
};

Call.prototype.createPcClient_ = function() {
  this.pcClient_ = new PeerConnectionClient(this.params_, this.startTime);
  this.pcClient_.onsignalingmessage = this.sendSignalingMessage_.bind(this);
  this.pcClient_.onremotehangup = this.onremotehangup;
  this.pcClient_.onremotesdpset = this.onremotesdpset;
  this.pcClient_.onremotestreamadded = this.onremotestreamadded;
  this.pcClient_.onsignalingstatechange = this.onsignalingstatechange;
  this.pcClient_.oniceconnectionstatechange = this.oniceconnectionstatechange;
  this.pcClient_.onnewicecandidate = this.onnewicecandidate;
  this.pcClient_.onerror = this.onerror;
  this.pcClient_.onIceServerConfigReady = this.onIceServerConfigReady_;
  this.pcClient_.iceConfigPromiseHandler = this.iceServerPromiseHandlers_;
  trace('Created PeerConnectionClient');
};

Call.prototype.onIceServerConfigReady_ = function(icePromiseHandler) {
  icePromiseHandler.resolve("Ice Server config ready");
}
Call.prototype.startSignaling_ = function() {
  trace('Starting signaling.');
  if (this.isInitiator() && this.oncallerstarted) {
    this.oncallerstarted(this.params_.roomId, this.params_.roomLink);
  }

  this.startTime = window.performance.now();

  this.maybeCreatePcClientAsync_()
      .then(function() {
        if (this.localStream_) {
          trace('Adding local stream.');
          this.pcClient_.addStream(this.localStream_);
        }
        if (this.params_.isInitiator) {
          this.pcClient_.startAsCaller(this.params_.offerOptions);
        } else {
          this.pcClient_.startAsCallee(this.params_.messages);
        }
      }.bind(this))
      .catch(function(e) {
        this.onError_('Create PeerConnection exception: ' + e);
        alert('Cannot create RTCPeerConnection: ' + e.message);
      }.bind(this));
};

// Join the room and returns room parameters.
Call.prototype.joinRoom_ = function() {
  return new Promise(function(resolve, reject) {
    if (!this.params_.roomId) {
      reject(Error('Missing room id.'));
    }
    var path = this.roomServer_ + '/join/' +
        this.params_.roomId + window.location.search;

    sendAsyncUrlRequest('POST', path).then(function(response) {
      var responseObj = parseJSON(response);
      if (!responseObj) {
        reject(Error('Error parsing response JSON.'));
        return;
      }
      if (responseObj.result !== 'SUCCESS') {
        // TODO (chuckhays) : handle room full state by returning to room
        // selection state.
        // When room is full, responseObj.result === 'FULL'
        reject(Error('Registration error: ' + responseObj.result));
        if (responseObj.result === 'FULL') {
          var getPath = this.roomServer_ + '/r/' +
              this.params_.roomId + window.location.search;
          window.location.assign(getPath);
        }
        return;
      }
      trace('Joined the room.');
      resolve(responseObj.params);
    }.bind(this)).catch(function(error) {
      reject(Error('Failed to join the room: ' + error.message));
      return;
    }.bind(this));
  }.bind(this));
};

Call.prototype.onRecvSignalingChannelMessage_ = function(msg) {
  this.pcClient_.receiveSignalingMessage(msg);
};

Call.prototype.sendSignalingMessage_ = function(message) {
    this.channel_.send(message);
};

Call.prototype.onError_ = function(message) {
  if (this.onerror) {
    this.onerror(message);
  }
};
