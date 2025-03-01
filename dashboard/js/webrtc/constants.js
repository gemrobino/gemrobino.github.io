/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* exported Constants */
'use strict';

var Constants = {
  // Action type for remote web socket communication.
  WS_ACTION: 'ws',
  // Action type for remote xhr communication.
  XHR_ACTION: 'xhr',
  // Action type for adding a command to the remote clean up queue.
  QUEUEADD_ACTION: 'addToQueue',
  // Action type for clearing the remote clean up queue.
  QUEUECLEAR_ACTION: 'clearQueue',
  // Web socket action type specifying that an event occured.
  EVENT_ACTION: 'event',

  // Web socket action type to create a remote web socket.
  WS_CREATE_ACTION: 'create',
  // Web socket event type onerror.
  WS_EVENT_ONERROR: 'onerror',
  // Web socket event type onmessage.
  WS_EVENT_ONMESSAGE: 'onmessage',
  // Web socket event type onopen.
  WS_EVENT_ONOPEN: 'onopen',
  // Web socket event type onclose.
  WS_EVENT_ONCLOSE: 'onclose',
  // Web socket event sent when an error occurs while calling send.
  WS_EVENT_SENDERROR: 'onsenderror',
  // Web socket action type to send a message on the remote web socket.
  WS_SEND_ACTION: 'send',
  // Web socket action type to close the remote web socket.
  WS_CLOSE_ACTION: 'close'
};

var SSConstants = {
  VERSION_CODE: '0.1',
  CLIENT_HELLO: 'ClientHello',
  NOTIFICATION_HELLO: 'NotificationHello',
  //keep this 'type' not 'Type'!!
  MESSAGE_TYPE: 'type',
  REQFUEST: 'request',
  SERVER : 'server', 
  MESSAGE : 'message',
  DEST: 'dest',
  SRC: 'src',
  VERSION: 'version',
  ROOM_ID: 'roomId',
  OFFER: 'offer',
  ANSWER: 'answer',
  CANDIDATE: 'candidate',
  CLICK: 'click',
  MOUSEDOWN: 'mouseDown',
  MOUSEUP: 'mouseUp',
  MOUSEMOVE: 'mouseMove',
  CONTROL: 'control',
  HANG_UP: 'Hangup',
  USER_DROPPED: 'dropped',
  TEST_ROOM_ID: 'fe7ca87e-9e06-4f47-8c6f-35799d3fa75f',
    CALLING: 'calling',
    CALL_CANCEL: 'cancelCall',
    BATCH_CALL: 'batchCalls',
    UNAUTHORIZED: 'unauthorized',
    REJECT_CALL: 'rejectCall',
    GLOBAL_EVENT: 'global',
    GOHOME: 'goHome',
    GOBACK: 'goBack',
    GOUP: 'goUp',
    GODOWN: 'goDown',
    GOLEFT: 'goLeft',
    GORIGHT: 'goRight'
};

