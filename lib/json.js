var swapKeyValue = function (obj) {
  var copy = {};
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[obj[key]] = key;
    }
  }
  return copy;
}

var debugJSON = function(str) {
  if (str[0] !== '{' && str[0] !== '[') {
    console.error('WARNING: Your JSON doesn\'t start with "{" or "[" (and JSON.parse failed).');
    return;
  }
  
  var lastChar = str[str.length-1];
  if (lastChar !== '}' && lastChar !== ']') {
    console.error('WARNING: Your JSON doesn\'t end with "}" or "]" (and JSON.parse failed). Maybe you only read the first chunk of some data?');
    if (lastChar === '\n' || lastChar === '\n') {
      console.error('WARNING:   The last char of your JSON is \\r or \\n.');
    }
  }
  
  var OPENER = { "{":"}"
               , "[":"]"};
  var CLOSER = swapKeyValue(OPENER);
  var i=0, strDelimiter=null,openerStack=[],escaping=false,opened=false;
  var chr;
  while (i < str.length) {
    chr = str[i++];
    if (escaping) {
      escaping = false;
      continue;
    }
    if (strDelimiter === chr) {
      strDelimiter = null;
      continue;
    }
    if ((chr === '"' || chr === "'") && strDelimiter === null) {
      strDelimiter = chr;
      continue;
    }
    if (chr === '\\' && strDelimiter !== null) {
      escaping = true;
      continue;
    }
    if (strDelimiter !== null) continue;
    if (OPENER.hasOwnProperty(chr)) {
      if (openerStack.length == 0 && opened) {
        console.error('WARNING: Your JSON has an opening symbol after the main object has been closed (and JSON.parse failed).'+
                      'If you\'re working with newline-delimited JSON or so, wrong delimiter insertion/splitting could be the cause.');
        return;
      }
      openerStack.push(chr);
      opened = true;
    }
    if (CLOSER.hasOwnProperty(chr)) {
      if (openerStack.length === 0) {
        console.error('WARNING: Your JSON has a closing symbol after everything has been closed (and JSON.parse failed).');
        return;
      }
      var lastOpener = openerStack[openerStack.length - 1];
      var requiredOpener = CLOSER[chr];
      if (lastOpener !== requiredOpener) {
        console.error('WARNING: Your JSON has a "'+chr+'" where the only valid closing symbol would be "'+OPENER[lastOpener]+'" (and JSON.parse failed).');
        return;
      }
      openerStack.pop();
    }
  }
  if (openerStack.length > 0) {
    console.error('WARNING: Your JSON looks incomplete (as if only the first chunk or so was read) (and JSON.parse failed).');
    return;
  }
}



var JSON_parse = JSON.parse;
JSON.parse = function(str) {
  var strType = typeof str;
  if (strType !== 'string') {
    if (strType === 'undefined') {
      console.error('WARNING: JSON.parse was called without data (undefined).');
    } else {
      console.error('WARNING: JSON.parse was called with a first argument with the type '+strType+', are you maybe double-decoding?');
    }
  }
  if (str === '') {
    console.error('WARNING: JSON.parse was called without data (empty string).');
  }
  try {
    return JSON_parse.apply(this, arguments);
  } catch (e) {
    debugJSON(str);
    throw e;
  }
};

var JSON_stringify = JSON.stringify;
JSON.stringify = function(obj) {
  var objType = typeof obj;
  if (objType === 'string') {
    console.error('WARNING: JSON.stringify was called with a string, are you maybe double-encoding?');
  } else if (objType === 'undefined') {
    console.error('WARNING: JSON.stringify was called without arguments');
  } else if (objType !== 'object' && objType !== 'array') {
    console.error('WARNING: JSON.stringify was called with a '+objType);
  }
  return JSON_stringify.apply(this, arguments);
}
