/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals parseJSON, trace, sendUrlRequest, RemoteWebSocket */
/* exported SignalingChannel */

'use strict';

// This class implements a signaling channel based on WebSocket.
var SignalingChannel = function(wssUrl, wssPostUrl, groupId, roomId, token) {
  this.wssUrl_ = wssUrl;
  this.wssPostUrl_ = wssPostUrl;
  this.roomId_ = roomId;
  this.clientId_ = null;
  this.websocket_ = null;
  this.registered_ = false;
  this.groupId_ = groupId;
  this.token_ = token;

  // Public callbacks. Keep it sorted.
  this.onerror = null;
  this.onmessage = null;
};

SignalingChannel.prototype.open = function() {
  if (this.websocket_) {
    trace('ERROR: SignalingChannel has already opened.');
    return;
  }

  trace('Opening signaling channel.');
  return new Promise(function(resolve, reject) {
    this.websocket_ = new WebSocket(this.wssUrl_);

    this.websocket_.onopen = function() {
      trace('Signaling channel opened.');

      this.websocket_.onerror = function() {
        trace('Signaling channel error.');
      };
      this.websocket_.onclose = function(event) {
        // TODO(tkchin): reconnect to WSS.
        trace('Channel closed with code:' + event.code +
            ' reason:' + event.reason);
        this.websocket_ = null;
        this.registered_ = false;
      };

      //if (this.clientId_ && this.roomId_) {
        this.register(this.roomId_, this.clientId_);
      //}

      resolve();
    }.bind(this);

    this.websocket_.onmessage = function(event) {
      var message = parseJSON(event.data);

      if(message.type != 'server') {
        trace('WSS->C: ' + event.data);
      }
      else {
        trace('WSS->C: got server hello, has ice config infor =  ' + event.data.includes("Turn") + ', length of the message is : ' + event.data.length);
      }

      if (!message) {
        trace('Failed to parse WSS message: ' + event.data);
        return;
      }
      if (message.error) {
        trace('Signaling server error message: ' + message.error);
        return;
      }
      this.onmessage(message);
    }.bind(this);

    this.websocket_.onerror = function() {
      reject(Error('WebSocket error.'));
    };
  }.bind(this));
};

SignalingChannel.prototype.register = function(roomId, clientId) {
  if (this.registered_) {
    trace('ERROR: SignalingChannel has already registered.');
    return;
  }

  if (!this.websocket_ || this.websocket_.readyState !== WebSocket.OPEN) {
    trace('WebSocket not open yet; saving the IDs to register later.');
    return;
  }
  trace('Sending Hello on signaling channel.');
  var registerMessage = {
    type: SSConstants.CLIENT_HELLO,
    version: SSConstants.VERSION_CODE,
    group: this.groupId_,
    token: this.token_,
    roomId: this.roomId_
  };
  this.websocket_.send(JSON.stringify(registerMessage));
  this.registered_ = true;

  // TODO(tkchin): Better notion of whether registration succeeded. Basically
  // check that we don't get an error message back from the socket.
  trace('Signaling channel registered.');
};

SignalingChannel.prototype.close = function(async) {
  if (this.websocket_) {
    this.websocket_.close();
    this.websocket_ = null;
  }

  if (!this.clientId_ || !this.roomId_) {
    return;
  }
  // Tell WSS that we're done.
  var path = this.getWssPostUrl();

  return sendUrlRequest('DELETE', path, async).catch(function(error) {
    trace('Error deleting web socket connection: ' + error.message);
  }.bind(this)).then(function() {
    this.clientId_ = null;
    this.roomId_ = null;
    this.registered_ = false;
  }.bind(this));
};

SignalingChannel.prototype.send = function(message) {
  /*Hank, not needed for now
  if (!this.roomId_ || !this.clientId_) {
    trace('ERROR: SignalingChannel has not registered.');
    return;
  }
  */
   //Hank: hacking for make demo work
  
   var msgJson = JSON.stringify(message);
   var demoMessage = {
    type: 'Call',
    group: this.groupId_,
    message: msgJson,
  };
  var msgString = JSON.stringify(demoMessage);

  trace('C->WSS: ' + msgString);

  if (this.websocket_ && this.websocket_.readyState === WebSocket.OPEN) {
    this.websocket_.send(msgString);
  } else {
    var path = this.getWssPostUrl();
    var xhr = new XMLHttpRequest();
    xhr.open('POST', path, true);
    xhr.send(wssMessage.msg);
  }
};

SignalingChannel.prototype.getWssPostUrl = function() {
  return this.wssPostUrl_ + '/' + this.roomId_ + '/' + this.clientId_;
};
