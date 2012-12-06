# OTR4-em - Off-the-Record Messaging [emscripten]

This module exposes a simple evented API which wraps around libotr4.0.0 compiled to javascript using the emscripten compiler.

You can install the module directly from npm registry:

    npm -g install otr4-em

Important Note:
The package includes an optimised/minified precompiled libotr4.js to simplify npm package installation.
It is however NOT a recommended practice to download a precompiled crypto library for obvious security reasons.

See [How-to build libotr4.js](https://github.com/mnaamani/otr4-em/blob/master/BUILDING)

[API](https://github.com/mnaamani/otr4-em/blob/master/doc/API.md)

### License
GPLv2

### built using
- [crypto-emscipten](https://github.com/mnaamani/crypto-emscripten/) libgcrypt/libotr builder.
- [libotr4.0.0](http://www.cypherpunks.ca/otr/) Off-The-Record Messaging library (GPLv2)
- [Emscripten](https://github.com/kripken/emscripten) Emscripten (MIT)
