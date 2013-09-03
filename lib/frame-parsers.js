/*
 * xbee-api
 * https://github.com/jouz/xbee-api
 *
 * Copyright (c) 2013 Jan Kolkmeier
 * Licensed under the MIT license.
 */

'use strict';

var C = require('./constants.js');

var frameParsers = exports = module.exports = {};

frameParsers[C.FRAME_TYPE.NODE_IDENTIFICATION] = function(frame, buffer) {
  frame.sender64 = frameParsers.ParseAddress(buffer, 0, 8);
  frame.sender16 = frameParsers.ParseAddress(buffer, 8, 2);
  frame.receiveOptions = buffer.readUInt8(10);
  frameParsers.ParseNodeIdentificationPayload(frame, buffer.slice(11));
};

frameParsers[C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET] = function(frame, buffer) {
  frame.remote64 = frameParsers.ParseAddress(buffer, 0, 8);
  frame.remote16 = frameParsers.ParseAddress(buffer, 8, 2);
  frame.receiveOptions = buffer.readUInt8(10);
  frame.payload = buffer.slice(11).toJSON();
};

frameParsers[C.FRAME_TYPE.MODEM_STATUS] = function(frame, buffer) {
  frame.status = buffer.readUInt8(0);
};

frameParsers[C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX] = function(frame, buffer) {
  frame.remote64 = frameParsers.ParseAddress(buffer, 0, 8);
  frame.remote16 = frameParsers.ParseAddress(buffer, 8, 2);
  frame.receiveOptions = buffer.readUInt8(10);
  frame.ioSample = buffer.slice(11).toJSON();
};

frameParsers[C.FRAME_TYPE.AT_COMMAND_RESPONSE] = function(frame, buffer) {
  frame.id = buffer.readUInt8(0);
  frame.command = String.fromCharCode(buffer.readUInt8(1), buffer.readUInt8(2));
  frame.commandStatus = buffer.readUInt8(3);
  frame.commandData = buffer.slice(4).toJSON();
}

frameParsers[C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE] = function(frame, buffer) {
  frame.id = buffer.readUInt8(0);
  frame.remote16 = frameParsers.ParseAddress(buffer, 1, 2);
  frame.remote64 = frameParsers.ParseAddress(buffer, 3, 8);
  frame.command = String.fromCharCode(buffer.readUInt8(11), buffer.readUInt8(12));
  frame.commandStatus = buffer.readUInt8(13);
  frame.commandData = buffer.slice(14).toJSON();
};

frameParsers[C.FRAME_TYPE.ZIGBEE_TRANSMIT_STATUS] = function(frame, buffer) {
  frame.id = buffer.readUInt8(0);
  frame.remote16 = frameParsers.ParseAddress(buffer, 1, 2);
  frame.transmitRetryCount = buffer.readUInt8(2);
  frame.deliveryStatus = buffer.readUInt8(3);
  frame.discoveryStatus = buffer.readUInt8(4);
};




// Todo: this function has a different profile...
frameParsers.ParseAddress = function(buffer, offset, length) {
  var _buffer = new Buffer(length);
  buffer.copy(_buffer, 0, offset, offset+length);
  return _buffer.toString('hex');
  // ALTERNATIVE:
  // return buffer.slice(offset,offset+length).toJSON();
};

frameParsers.ParseNodeIdentificationPayload = function(frame, buffer) {
  frame.remote16 = frameParsers.ParseAddress(buffer, 0, 2);
  frame.remote64 = frameParsers.ParseAddress(buffer, 2, 8);
  frame.nodeIdentifier = "";
  var ni = 10; // or 11?
  while (ni < buffer.length) { // TODO
    var byte = buffer.readUInt8(ni++);
    if (byte == 0) break;
    frame.nodeIdentifier += String.fromCharCode(byte);
  }
  frame.remoteParent16 = frameParsers.ParseAddress(buffer, ni, 2);
  frame.deviceType = buffer.readUInt8(ni+2);
  frame.sourceEvent = buffer.readUInt8(ni+3);
  frame.digiProfileID = frameParsers.ParseAddress(buffer, ni+4, 2);
  frame.digiManufacturerID = frameParsers.ParseAddress(buffer, ni+6, 2);
}