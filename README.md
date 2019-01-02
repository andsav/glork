Install frontend
=================

Requires *node*, *npm* & *closure compiler*

`npm install -g grunt-cli`

`npm install`

Install Closure Compiler:

`wget https://dl.google.com/closure-compiler/compiler-latest.zip`

Create link to closure compiler from path demanded in the gruntfile:

`mkdir -p /opt/closure/build/`

`ln -s #PATH_TO_CLOSURE_COMPILER.JAR# /opt/closure/build/compiler.jar`

example:

`ln -s /usr/local/opt/closure-compiler/libexec/closure-compiler-v20170218.jar /opt/closure/build/compiler.jar`

or modify the path in `gruntfile.js`, replacing every instance of `closurePath: "/opt/closure",` with the path to the closure compiler directory. Note that the plugin will look for *closurePath*/build/compiler.jar

Install backend
===============

Requires *go*

`cd server`

`make`

