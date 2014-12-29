/** @module otr */
(function () {
    "user strict";
    /*
     *  Off-the-Record Messaging bindings for node/javascript
     *  Copyright (C) 2012  Mokhtar Naamani,
     *                      <mokhtar.naamani@gmail.com>
     *
     *  This program is free software; you can redistribute it and/or modify
     *  it under the terms of version 2 of the GNU General Public License as
     *  published by the Free Software Foundation.
     *
     *  This program is distributed in the hope that it will be useful,
     *  but WITHOUT ANY WARRANTY; without even the implied warranty of
     *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     *  GNU General Public License for more details.
     *
     *  You should have received a copy of the GNU General Public License
     *  along with this program; if not, write to the Free Software
     *  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
     */
    var root = this,
        otr, OTRBindings, util, events, nextTick;

    var inBrowser = false;

    /** The available values used for the policy parameter of an otr Session()
     *
     *  @alias module:otr.POLICY
     *  @readonly
     *  @enum {number}
     */
    var POLICY = {
        'NEVER': 0x00,
        'ALLOW_V1': 0x01,
        'ALLOW_V2': 0x02,
        'ALLOW_V3': 0x04,
        'REQUIRE_ENCRYPTION': 0x08,
        'SEND_WHITESPACE_TAG': 0x10,
        'WHITESPACE_START_AKE': 0x20,
        'ERROR_START_AKE': 0x40,
        /** ALLOW_V1 | ALLOW_V2 | ALLOW_V3 */
        'VERSION_MASK': 0x01 | 0x02 | 0x03,
        /** VERSION_MASK | SEND_WHITESPACE_TAG | WHITESPACE_START_AKE | ERROR_START_AKE */
        'OPPORTUNISTIC': 0x01 | 0x02 | 0x03 | 0x10 | 0x20 | 0x40,
        /** VERSION_MASK */
        'MANUAL': 0x01 | 0x02 | 0x03,
        /** VERSION_MASK | REQUIRE_ENCRYPTION | WHITESPACE_START_AKE | ERROR_START_AKE */
        'ALWAYS': 0x01 | 0x02 | 0x03 | 0x08 | 0x20 | 0x40,
        /** OPPORTUNISTIC */
        'DEFAULT': 0x01 | 0x02 | 0x03 | 0x10 | 0x20 | 0x40
    };

    var MSGEVENT_ARRAY = ["NONE", "ENCRYPTION_REQUIRED", "ENCRYPTION_ERROR", "CONNECTION_ENDED", "SETUP_ERROR",
        "MSG_REFLECTED", "MSG_RESENT", "RCVDMSG_NOT_IN_PRIVATE", "RCVDMSG_UNREADABLE", "RCVDMSG_MALFORMED",
        "LOG_HEARTBEAT_RCVD", "LOG_HEARTBEAT_SENT", "RCVDMSG_GENERAL_ERR", "RCVDMSG_UNENCRYPTED",
        "RCVDMSG_UNRECOGNIZED", "RCVDMSG_FOR_OTHER_INSTANCE"
    ];

    /** The 'value' property of "msg_event" events emitted by a Session()
     *
     *  @alias module:otr.MSGEVENT
     *  @readonly
     *  @enum {number}
     */
    var MSGEVENT = {
        /**0*/
        "NONE": 0,
        "ENCRYPTION_REQUIRED": 1,
        "ENCRYPTION_ERROR": 2,
        "CONNECTION_ENDED": 3,
        "SETUP_ERROR": 4,
        "MSG_REFLECTED": 5,
        "MSG_RESENT": 6,
        "RCVDMSG_NOT_IN_PRIVATE": 7,
        "RCVDMSG_UNREADABLE": 8,
        "RCVDMSG_MALFORMED": 9,
        "LOG_HEARTBEAT_RCVD": 10,
        "LOG_HEARTBEAT_SENT": 11,
        "RCVDMSG_GENERAL_ERR": 12,
        "RCVDMSG_UNENCRYPTED": 13,
        "RCVDMSG_UNRECOGNIZED": 14,
        "RCVDMSG_FOR_OTHER_INSTANCE": 15,
        /** method to convert MSGEVENT number to string
         * @type {function}
         */
        name: function (n) {
            return MSGEVENT_ARRAY[n];
        }
    };

    function msgEvent(val, message, error) {
        return ({
            value: val,
            name: MSGEVENT.name(val),
            message: message,
            error: error
        });
    }

    if (typeof exports !== 'undefined') {

        OTRBindings = require("./bindings.js");
        util = require('util');
        events = require('events');
        otr = new OTRBindings();
        if (otr.version() !== "4.1.0-emscripten") {
            console.error("Error. excpecting libotr4.1.0-emscripten! exiting..");
            process.exit();
        }

        util.inherits(Session, events.EventEmitter);

        module.exports = {
            /** @method
             *  @returns {String} libotr version information
             */
            version: otr.version,
            User: User,
            POLICY: POLICY,
            MSGEVENT: MSGEVENT
        };

        nextTick = function (func) {
            setTimeout(func, 0);
        };

    } else {
        inBrowser = true;
        OTRBindings = root.OTRBindings;
        events = undefined;
        otr = new OTRBindings();
        if (otr.version() != "4.1.0-emscripten") {
            alert("Warning. Excpecting libotr4.1.0-emscripten! OTR library not loaded.");
        } else {
            root.OTR = {
                version: otr.version,
                User: User,
                POLICY: POLICY,
                MSGEVENT: MSGEVENT
            };
        }
        nextTick = function (func) {
            setTimeout(func, 0);
        };
    }

    /** Represents a users's keys, fingerprints and instance tags
     *  stored in files on the VFS.
     *  @alias module:otr.User
     *  @constructor
     *  @param {Object} [config] object with string properties: keys, fingerprints, instags
     */
    function User(files) {
        this.state = new otr.UserState();
        this.keys = otr.VFS.nextFileName();
        this.fingerprints = otr.VFS.nextFileName();
        this.instags = otr.VFS.nextFileName();

        //load files from the real file system
        if (files) {
            if (files.keys) {
                try {
                    this.loadKeysFromFS(files.keys);
                } catch (e) {
                    console.error("Warning Reading Keys:", e);
                }
            }
            if (files.fingerprints) {
                try {
                    this.loadFingerprintsFromFS(files.fingerprints);
                } catch (e) {
                    console.error("Warning Reading Fingerprints:", e);
                }
            }
            if (files.instags) {
                try {
                    this.loadInstagsFromFS(files.instags);
                } catch (e) {
                    console.error("Warning Reading Instags:", e);
                }
            }
        }
    }

    function expandHomeDir(path) {
        if (inBrowser) return path;
        var USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        if (path && path[0] === '~') {
            //expand home directory
            return path.replace("~", USER_HOME);
        }
        return path;
    }

    User.prototype.loadKeysFromFS = function (filename, transform) {
        otr.VFS.importFile(expandHomeDir(filename), this.keys, transform);
        this.state.readKeysSync(this.keys);
    };

    User.prototype.loadFingerprintsFromFS = function (filename, transform) {
        otr.VFS.importFile(expandHomeDir(filename), this.fingerprints, transform);
        this.state.readFingerprintsSync(this.fingerprints);
    };

    User.prototype.loadInstagsFromFS = function (filename, transform) {
        otr.VFS.importFile(expandHomeDir(filename), this.instags, transform);
        this.state.readInstagsSync(this.instags);
    };

    User.prototype.saveKeysToFS = function (filename, transform) {
        otr.VFS.exportFile(this.keys, expandHomeDir(filename), transform);
    };

    User.prototype.saveFingerprintsToFS = function (filename, transform) {
        otr.VFS.exportFile(this.fingerprints, expandHomeDir(filename), transform);
    };

    User.prototype.saveInstagsToFS = function (filename, transform) {
        otr.VFS.exportFile(this.instags, expandHomeDir(filename), transform);
    };

    User.prototype.keysToString = function () {
        return otr.VFS.readFileData(this.keys).toString();
    };

    User.prototype.fingerprintsToString = function () {
        return otr.VFS.readFileData(this.fingerprints).toString();
    };

    User.prototype.instagsToString = function () {
        return otr.VFS.readFileData(this.instags).toString();
    };

    User.prototype.stringToKeys = function (str) {
        otr.VFS.makeFile(this.keys, new Buffer(str));
        this.state.readKeysSync(this.keys);
    };

    User.prototype.stringToFingerprints = function (str) {
        otr.VFS.makeFile(this.fingerprints, new Buffer(str));
        this.state.readFingerprintsSync(this.fingerprints);
    };

    User.prototype.stringToInstags = function (str) {
        otr.VFS.makeFile(this.instags, new Buffer(str));
        this.state.readInstagsSync(this.instags);
    };

    User.prototype.accounts = function () {
        var user = this,
            accounts = this.state.accounts(),
            list = [];
        accounts.forEach(function (account) {
            list.push(new Account(user, account.accountname, account.protocol));
        });
        return list;
    };

    User.prototype.writeFingerprints = function () {
        this.state.writeFingerprintsSync(this.fingerprints);
    };

    User.prototype.writeTrustedFingerprints = function () {
        this.state.writeTrustedFingerprintsSync(this.fingerprints);
    };

    User.prototype.writeKeys = function () {
        this.state.writeKeysSync(this.keys);
    };

    User.prototype.getMessagePollDefaultInterval = function () {
        return this.state.getMessagePollDefaultInterval();
    };

    User.prototype.messagePoll = function (ops, opdata) {
        this.state.messagePoll(ops, opdata);
    };

    User.prototype.account = function (accountname, protocol) {
        return new Account(this, accountname, protocol);
    };

    function Account(user, accountname, protocol) {
        var account = this;
        this.name = function () {
            return accountname;
        };
        this.protocol = function () {
            return protocol;
        };
        this.generateKey = function (callback) {
            user.state.generateKey(user.keys, accountname, protocol, function () {
                if (callback) {
                    callback.apply(account, arguments);
                }
            });
        };
        this.deleteKey = function () {
            this.state.deleteKeyOnFile(user.keys, accountname, protocol);
        };
        this.key = function () {
            return user.state.findKey(accountname, protocol);
        };
        this.fingerprint = function () {
            return user.state.fingerprint(accountname, protocol);
        };
        this.importKey = function (key, base) {
            user.state.importKey(accountname, protocol, key, base);
            user.state.writeKeysSync(user.keys);
        };
        this.generateInstag = function (callback) {
            try {
                user.state.generateInstag(user.instags, accountname, protocol);
                if (callback) {
                    callback(null, user.state.findInstag(accountname, protocol));
                }
            } catch (e) {
                if (callback) {
                    callback(e, null);
                }
            }
        };
        this.instag = function () {
            return user.state.findInstag(accountname, protocol);
        };
        this.contact = function (recipient) {
            return new Contact(user, accountname, protocol, recipient);
        };
        this.contacts = function () {
            var contexts = user.state.masterContexts(),
                contacts = [];
            contexts.forEach(function (context) {
                if (context.their_instance() !== 0) {
                    return;
                }
                contacts.push(new Contact(user, accountname, protocol, context.username()));
            });
            return contacts;
        };
    }

    function Contact(user, accountname, protocol, recipient) {
        var context = new otr.ConnContext(user.state, accountname, protocol, recipient);
        this.name = function () {
            return recipient;
        };
        this.openSession = function (parameters) {
            return new Session(user, new otr.ConnContext(user.state, accountname, protocol, recipient),
                parameters);
        };
        this.fingerprints = function () {
            return context.masterFingerprints();
        };
    }

    function Session(user, context, parameters) {
        var session = this;
        if (events) {
            events.EventEmitter.call(this);
        } else {
            this._events = {};
        }
        this.user = user;
        this.context = context;
        this.parameters = parameters;
        this.ops = new otr.MessageAppOps(otrEventHandler(session));
        this.message_poll_interval = setInterval(function () {
            user.messagePoll(session.ops, 0);
        }, user.getMessagePollDefaultInterval() * 1000 || 70 * 1000);
    }

    Session.prototype.start = function () {
        return this.send("?OTR?");
    };

    Session.prototype.send = function (message, instag) {
        var session = this;
        nextTick(function () {
            instag = instag || 1; //default instag = BEST
            //message can be any object that can be serialsed to a string using it's .toString() method.
            var msgout = session.ops.messageSending(session.user.state, session.context.accountname(),
                session.context
                .protocol(),
                session.context.username(), message.toString(), instag, session);
            if (msgout) {
                //frag policy something other than SEND_ALL.. results in a fragment to be sent manually
                session.emit("inject_message", msgout);
            }
        });
    };

    Session.prototype.recv = function (message) {
        var session = this;
        nextTick(function () {
            //message can be any object that can be serialsed to a string using it's .toString() method.
            var msg = session.ops.messageReceiving(session.user.state, session.context.accountname(),
                session.context
                .protocol(),
                session.context.username(), message.toString(), session);
            if (msg) {
                session.emit("message", msg, session.isEncrypted());
            }
        });
    };

    Session.prototype.end = function () {
        var session = this;
        nextTick(function () {
            if (session.message_poll_interval) {
                clearInterval(session.message_poll_interval);
            }
            session.ops.disconnect(session.user.state, session.context.accountname(), session.context.protocol(),
                session.context.username(),
                session.context.their_instance());
            nextTick(function () {
                session.emit("plaintext");
            });
        });
    };

    Session.prototype.smpStart = function (secret) {
        var session = this;
        var sec = secret;
        sec = sec || (this.parameters ? this.parameters.secret : undefined);
        if (sec) {
            nextTick(function () {
                session.ops.initSMP(session.user.state, session.context, sec);
            });
        } else {
            throw (new Error("No Secret Provided"));
        }
    };

    Session.prototype.smpStartQuestion = function (question, secret) {
        var session = this;
        if (!question) {
            throw (new Error("No Question Provided"));
        }
        var sec = secret;
        if (!sec) {
            sec = this.parameters ? this.parameters.secrets : undefined;
            if (!sec) {
                throw (new Error("No Secrets Provided"));
            }
            sec = sec[question];
        }
        if (!sec) {
            throw (new Error("No Secret Matched for Question"));
        }
        nextTick(function () {
            session.ops.initSMP(session.user.state, session.context, sec, question);
        });
    };

    Session.prototype.smpRespond = function (secret) {
        var session = this;
        var sec = secret || undefined;
        if (!sec) {
            sec = this.parameters || undefined;
        }
        if (!sec) {
            throw (new Error("No Secret Provided"));
        }
        nextTick(function () {
            session.ops.respondSMP(session.user.state, session.context, sec);
        });
    };

    Session.prototype.smpAbort = function () {
        var session = this;
        nextTick(function () {
            session.ops.abortSMP(session.user.state, session.context);
        });
    };

    Session.prototype.isEncrypted = function () {
        return (this.context.msgstate() === 1);
    };

    Session.prototype.isAuthenticated = function () {
        return (this.context.trust() === "smp");
    };

    Session.prototype.extraSymKey = function (use, usedata) {
        return this.ops.extraSymKey(this.user.state, this.context, use, usedata);
    };

    Session.prototype.theirInstance = function () {
        return this.context.their_instance();
    };

    Session.prototype.ourInstance = function () {
        return this.context.our_instance();
    };

    Session.prototype.protocolVersion = function () {
        return this.context.protocol_version();
    };

    Session.prototype.theirFingerprint = function () {
        return this.context.fingerprint();
    };

    Session.prototype.destroy = function () {
        var session = this;
        if (session.message_poll_interval) {
            clearInterval(session.message_poll_interval);
        }
        session.removeAllListeners();
        session.end();
    };

    //add a simple events API for use in the browser
    if (!Session.prototype.on) {
        Session.prototype.on = function (e, cb) {
            //used to register callbacks
            //store event name e in this._events
            if (this._events[e]) {
                this._events[e].push(cb);
            } else {
                this._events[e] = [cb];
            }
            return this;
        };
    }

    if (!Session.prototype.listeners) {
        Session.prototype.listeners = function (e) {
            if (this._events[e]) {
                return this._events[e];
            }
            return [];
        };
    }

    if (!Session.prototype.emit) {
        Session.prototype.emit = function (e) {
            //used internally to fire events
            //'apply' event handler function  to 'this' channel pass eventname 'e' and arguemnts.slice(1)
            var self = this;
            var args = Array.prototype.slice.call(arguments);
            var listeners_count = 0;
            if (this._events && this._events[e]) {
                listeners_count = this._events[e].length;
                this._events[e].forEach(function (cb) {
                    cb.apply(self, args.length > 1 ? args.slice(1) : [undefined]);
                });
                if (listeners_count > 0) return true;
            }
            return false;
        };
    }

    if (!Session.prototype.removeAllListeners) {
        Session.prototype.removeAllListeners = function (e) {
            if (e) {
                if (this._events[e]) {
                    this._events[e] = [];
                }
            } else {
                this._events = {};
            }
            return this;
        };
    }

    function otrEventHandler(otrSession) {
        function emit() {
            otrSession.emit.apply(otrSession, arguments);
        }
        return (function (o) {
            switch (o.EVENT) {
            case "smp_error":
                otrSession.abort_smp();
                emit("smp", "failed");
                return;
            case "smp_request":
                emit("smp", "request", o.question);
                return;
            case "smp_complete":
                emit("smp", "complete");
                return;
            case "smp_failed":
                emit("smp", "failed");
                return;
            case "smp_aborted":
                emit("smp", "aborted");
                return;
            case "is_logged_in":
                if (typeof otrSession.online === 'function') {
                    if (otrSession.online()) return 1;
                    return 0;
                }
                return 1; //remote party is assumed to be online
            case "gone_secure":
                emit(o.EVENT);
                return;
            case "gone_insecure":
                //never get's called by libotr4.0.0?
                emit(o.EVENT);
                return;
            case "policy":
                if (!otrSession.parameters) {
                    return POLICY.DEFAULT;
                }
                if (typeof otrSession.parameters.policy === 'number') {
                    return (otrSession.parameters.policy); //todo: validate policy
                }
                return POLICY.DEFAULT;
            case "max_message_size":
                if (!otrSession.parameters) return 0;
                return otrSession.parameters.MTU || 0;
            case "inject_message":
                emit(o.EVENT, o.message);
                return;
            case "new_fingerprint":
                emit(o.EVENT, o.fingerprint);
                return;
            case "write_fingerprints":
                emit(o.EVENT);
                return;
            case "still_secure":
                emit(o.EVENT);
                return;
            case "msg_event":
                emit(o.EVENT, msgEvent(o.event, o.message, o.err));
                return;
            case "received_symkey":
                emit(o.EVENT, o.use, o.usedata, o.key);
                return;
            case "remote_disconnected":
                return emit("disconnect");
            case "update_context_list": //raise this event on user object instead of session?
                emit(o.EVENT);
                return;
            case "create_privkey": //raise this event on account object instead of session?
                emit(o.EVENT, o.accountname, o.protocol);
                return;
            case "create_instag": //raise this event on account object instead of session?
                emit(o.EVENT, o.accountname, o.protocol);
                return;
            }
        });
    }

}).call();
