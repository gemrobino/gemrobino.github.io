/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals randomString, Storage, parseJSON */
/* exported RoomSelection */

'use strict';

var RoomSelection = function(roomSelectionDiv,
  uiConstants, recentRoomsKey, setupCompletedCallback) {
  this.roomSelectionDiv_ = roomSelectionDiv;

  this.setupCompletedCallback_ = setupCompletedCallback;

  this.roomIdInputLabel_ = this.roomSelectionDiv_.querySelector(
      uiConstants.roomSelectionInputLabel);
  this.roomJoinButton_ = this.roomSelectionDiv_.querySelector(
      uiConstants.roomSelectionJoinButton);

  this.onRoomIdInput_();

  this.roomIdInputListener_ = this.onRoomIdInput_.bind(this);

  this.roomIdKeyupListener_ = this.onRoomIdKeyPress_.bind(this);

  this.roomJoinButtonListener_ = this.onJoinButton_.bind(this);
  this.roomJoinButton_.addEventListener(
      'click', this.roomJoinButtonListener_, false);

  // Public callbacks. Keep it sorted.
  this.onRoomSelected = null;

  this.recentlyUsedList_ = new RoomSelection.RecentlyUsedList(recentRoomsKey);
  this.startBuildingRecentRoomList_();
};

RoomSelection.matchRandomRoomPattern = function(input) {
  return input.match(/^\d{9}$/) !== null;
};

RoomSelection.prototype.removeEventListeners = function() {

  this.roomJoinButton_.removeEventListener(
      'click', this.roomJoinButtonListener_);
};

RoomSelection.prototype.startBuildingRecentRoomList_ = function() {
  this.recentlyUsedList_.getRecentRooms().then(function(recentRooms) {
    this.buildRecentRoomList_(recentRooms);
    if (this.setupCompletedCallback_) {
      this.setupCompletedCallback_();
    }
  }.bind(this)).catch(function(error) {
    trace('Error building recent rooms list: ' + error.message);
  }.bind(this));
};

RoomSelection.prototype.onRoomIdInput_ = function() {
  // Validate room id, enable/disable join button.
  // The server currently accepts only the \w character class and
  // hyphen+underscor.
  /* Hank no need this 
  var room = this.roomIdInput_.value;
  var valid = room.length >= 5;
  var re = /^([a-zA-Z0-9-_]+)+$/;
  valid = valid && re.exec(room);
  if (valid) {
    this.roomJoinButton_.disabled = false;
    this.roomIdInput_.classList.remove('invalid');
    this.roomIdInputLabel_.classList.add('hidden');
  } else {
    this.roomJoinButton_.disabled = true;
    this.roomIdInput_.classList.add('invalid');
    this.roomIdInputLabel_.classList.remove('hidden');
  }
  */
};

RoomSelection.prototype.onRoomIdKeyPress_ = function(event) {
  if (event.which !== 13 || this.roomJoinButton_.disabled) {
    return;
  }
  this.onJoinButton_();
};

RoomSelection.prototype.onRandomButton_ = function() {
  this.onRoomIdInput_();
};

RoomSelection.prototype.onJoinButton_ = function() {
};

RoomSelection.prototype.makeRecentlyUsedClickHandler_ = function(roomName) {
  return function(e) {
    e.preventDefault();
    this.loadRoom_(roomName);
  };
};

RoomSelection.prototype.loadRoom_ = function(roomName) {
  this.recentlyUsedList_.pushRecentRoom(roomName);
  if (this.onRoomSelected) {
    this.onRoomSelected(roomName);
  }
};

RoomSelection.RecentlyUsedList = function(key) {
  // This is the length of the most recently used list.
  this.LISTLENGTH_ = 10;

  this.RECENTROOMSKEY_ = key || 'recentRooms';
  this.storage_ = new Storage();
};

// Add a room to the recently used list and store to local storage.
RoomSelection.RecentlyUsedList.prototype.pushRecentRoom = function(roomId) {
  // Push recent room to top of recent list, keep max of this.LISTLENGTH_
  // entries.
  return new Promise(function(resolve, reject) {
    if (!roomId) {
      resolve();
      return;
    }

    this.getRecentRooms().then(function(recentRooms) {
      recentRooms = [roomId].concat(recentRooms);
      // Remove any duplicates from the list, leaving the first occurance.
      recentRooms = recentRooms.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
      recentRooms = recentRooms.slice(0, this.LISTLENGTH_);
      this.storage_.setStorage(this.RECENTROOMSKEY_,
          JSON.stringify(recentRooms), function() {
            resolve();
          });
    }.bind(this)).catch(function(err) {
      reject(err);
    }.bind(this));
  }.bind(this));
};

// Get the list of recently used rooms from local storage.
RoomSelection.RecentlyUsedList.prototype.getRecentRooms = function() {
  return new Promise(function(resolve) {
    this.storage_.getStorage(this.RECENTROOMSKEY_, function(value) {
      var recentRooms = parseJSON(value);
      if (!recentRooms) {
        recentRooms = [];
      }
      resolve(recentRooms);
    });
  }.bind(this));
};
