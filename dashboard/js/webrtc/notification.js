/* exported GoNotification */

//import Swal from ~/node_modules/sweetalert2 / dist / sweetalert2.js'

'use strict';

var GoNotification = function (url, groupId, token, adminUserId) {
    this.wssUrl_ = url;
    this.groupId_ = groupId;
    this.channel_ = new NotificationChannel(url, groupId, token, adminUserId);
    this.channel_.onmessage = this.onChannelMessage_.bind(this);
    
    var channelPromise = this.channel_.open().catch(function (error) {
        this.onError_('WebSocket open error: ' + error.message);
        return Promise.reject(error);
    }.bind(this));
    Promise.all([channelPromise]).then(function () {
        this.channel_.register();
    }.bind(this)).catch(function (error) {
        this.onError_('WebSocket register error: ' + error.message);
    }.bind(this));
};
GoNotification.prototype.onChannelMessage_ = function(message) {
    var messageObj = parseJSON((JSON.stringify(message)));
    if (!messageObj) {
        return;
    }

    if (messageObj.type === SSConstants.SERVER) {
        trace('Notification channel server hello');
        this.clientId_ = messageObj.clientId;
    } else if (messageObj.type === SSConstants.CALLING) {

        var notification = {
            roomId: messageObj.roomId,
            peerName: messageObj.peerName,
            peerId: messageObj.peerId
        };
        this.onCalling(notification);
    } else if (messageObj.type === SSConstants.CALL_CANCEL) {

        var notification = {
            roomId: messageObj.roomId
        };
        this.onCallCancel(notification);
    }
    else if (messageObj.type === SSConstants.BATCH_CALL) {

        var notification = {
            callList: messageObj.callList
        };
        this.onBatchCalling(notification);
    }
    else if (messageObj.type === 'unauthorized') {
        this.onUnauthorized(messageObj.message);
    }
    else {
        trace('ERROR: server uknown messag type: ' + messageObj.type );
    }
};
GoNotification.prototype.onCallCancel = function (callInfo) {
    var info = {
        roomId: callInfo.roomId
    };

    handleCallCancel(info);
};

GoNotification.prototype.onCalling = function (callInfo) {
    var info = {
        roomId: callInfo.roomId,
        peerName: callInfo.peerName,
        groupId: this.groupId_
    };
    handleCall(info);
};

GoNotification.prototype.rejectCall = function (roomId, groupId) {
    trace('Rejecting call: ' + roomId);

    var message = {
        type: SSConstants.REJECT_CALL,
        roomId: roomId,
        group: groupId
    };
    this.channel_.send(message);
};
GoNotification.prototype.onBatchCalling = function (callInfo) {
    var batchCalls = [];

    var json = JSON.parse(JSON.stringify(callInfo));
    var entId = this.groupId_;

    json.callList.forEach(call => {
        var info = {
            roomId: call.roomId,
            peerName: call.peerName,
            groupId: entId
        };
        batchCalls.push(info);
    });
    handleBatchCall(batchCalls);
};
GoNotification.prototype.onUnauthorized = function (msg) {
    handleUnauthorized(msg);
};
GoNotification.prototype.onError_ = function (message) {
    trace('ERROR: ' + message);
};