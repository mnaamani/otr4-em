var Module = require("../../build/libotr4.js");
var jsapi_ = Module.jsapi;
var _malloc = Module._malloc;
var _free = Module._free;
var _pointerStringify = Module.Pointer_stringify;

module.exports.Fingerprint = Fingerprint;

function Fingerprint(ptr) {
	if (ptr !== 0) {
		this._pointer = ptr;
	} else {
		return undefined;
	}
}

Fingerprint.prototype.fingerprint = function () {
	var fp = _malloc(45);
	jsapi_.fingerprint_get_fingerprint(this._pointer, fp);
	var human = _pointerStringify(fp);
	_free(fp);
	return human;
};

Fingerprint.prototype.trust = function () {
	return jsapi_.fingerprint_get_trust(this._pointer);
};
