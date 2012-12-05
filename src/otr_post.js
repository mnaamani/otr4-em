var globalScope = this;

if( typeof require !== "undefined" ){
    module.exports.getModule=function(){
        return globalScope.Module;
    }
}
