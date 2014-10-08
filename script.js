var sendMessage = function(message) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, message);
  });
};

var getURLParts = function(url) {
  var dotIndex = url.indexOf(".");
  var slashIndex = url.indexOf("/", dotIndex);

  if (slashIndex == -1) {
    return {
      domain: url,
      params: ""
    };
  }

  return {
    domain: url.substring(0, slashIndex),
    params: url.substring(slashIndex+1)
  };
};

var saveScript = function(url, script, match) {
  var urlParts = getURLParts(url);


  if (typeof currentMatch !== undefined) {
    delete existingDomainScripts[currentMatch];
  }
  existingDomainScripts[match] = script;

  currentMatch = match;

  var objectToSave = {};
  objectToSave[urlParts.domain] = existingDomainScripts;
  chrome.storage.sync.set(objectToSave, function() {
    console.log('Script saved', objectToSave);
  });
};

var doesUrlMatch = function(url, pattern) {
  var regx = new RegExp(pattern.replace("*", ".*"));
  return regx.test(url);
};

var findMatchingScript = function(urlParts) {
  var longestMatch = {key: ""};
  for (var x in existingDomainScripts) {
    if (doesUrlMatch(urlParts.params, x) && x.length > longestMatch.key.length) {
      longestMatch = {
        key: x,
        script: existingDomainScripts[x]
      };
    }
  }
  return longestMatch;
};

var loadScript = function(url) {
  var urlParts = getURLParts(url);

  chrome.storage.sync.get(urlParts.domain, function(data) {
    if (data[urlParts.domain]) {
      existingDomainScripts = data[urlParts.domain];
      var script = findMatchingScript(urlParts);

      if (typeof script.script !== undefined) {
        $("textarea").val(script.script);
        $("input").val(script.key);
        currentMatch = script.key;
      }
    }
    myCodeMirror = CodeMirror.fromTextArea($("textarea")[0], {
      theme: "monokai"
    });
  });
};

var myCodeMirror;
var existingDomainScripts = {};
var currentMatch;

$(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var url = tabs[0].url;
    var urlParts = getURLParts(url);
    $(".domain").html(urlParts.domain + "/");
    loadScript(url);
  });

  $("button.run").on("click", function() {
    sendMessage({script: myCodeMirror.getValue()});
  });

  $("button.save").on("click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var url = tabs[0].url;
      saveScript(url, myCodeMirror.getValue(), $("input").val());
    });
  });
});
