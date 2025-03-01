
'use strict';


var NotificationChannel = function(wssUrl, groupId, token, adminUserId) {
    this.wssUrl_ = wssUrl;
    this.groupId_ = groupId;
    this.token_ = token;
    this.adminUserId_ = adminUserId;
  this.clientId_ = null;
  this.websocket_ = null;
  this.registered_ = false;

  // Public callbacks. Keep it sorted.
  this.onerror = null;
  this.onmessage = null;
};

NotificationChannel.prototype.open = function() {
  if (this.websocket_) {
    trace('ERROR: NotificationChannel has already opened.');
    return;
  }

    trace('Opening notification channel.');
  return new Promise(function(resolve, reject) {
    this.websocket_ = new WebSocket(this.wssUrl_);

    this.websocket_.onopen = function() {
        trace('notification channel opened.');

      this.websocket_.onerror = function() {
          trace('notification channel error.');
      };
      this.websocket_.onclose = function(event) {
        // TODO(tkchin): reconnect to WSS.
          trace('notification Channel closed with code:' + event.code +
            ' reason:' + event.reason);
        this.websocket_ = null;
        this.registered_ = false;
      };

      resolve();
    }.bind(this);

    this.websocket_.onmessage = function(event) {
      //trace('WSS->C: ' + event.data);

      var message = parseJSON(event.data);
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

    this.websocket_.onerror = function(event) {
      reject(Error('WebSocket error with message: ' + event.message));
    };
  }.bind(this));
};

NotificationChannel.prototype.register = function() {
  if (this.registered_) {
      trace('ERROR: notification Channel has already registered.');
    return;
  }

  if (!this.websocket_ || this.websocket_.readyState !== WebSocket.OPEN) {
    trace('WebSocket not open yet; saving the IDs to register later.');
    return;
  }
    trace('Sending Hello on notification channel.');

    var registerMessage = {
        type: SSConstants.NOTIFICATION_HELLO,
        group: this.groupId_,
        token: this.token_,
        version: SSConstants.VERSION_CODE,
        adminUserId: this.adminUserId_
     };
     this.websocket_.send(JSON.stringify(registerMessage));
     this.registered_ = true;

     trace('notification channel registered.');
};

NotificationChannel.prototype.close = function (async) {
    if (this.websocket_) {
        this.websocket_.close();
        this.websocket_ = null;
    }
    this.clientId_ = null;
    this.wssUrl_ = null;
};

NotificationChannel.prototype.send = function(message) {
  
   var msgJson = JSON.stringify(message);
   var demoMessage = {
    type: 'Notification',
    message: msgJson,
  };
  var msgString = JSON.stringify(demoMessage);

  trace('C->WSS: ' + msgString);

  if (this.websocket_ && this.websocket_.readyState === WebSocket.OPEN) {
    this.websocket_.send(msgString);
  }
};
