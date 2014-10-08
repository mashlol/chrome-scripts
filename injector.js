var doesUrlMatch = function(url, pattern) {
  var regx = new RegExp(pattern.replace("*", ".*"));
  return regx.test(url);
};

var findMatchingScript = function(urlParts, domainScripts) {
  var longestMatch = {key: ""};
  for (var x in domainScripts) {
    if (doesUrlMatch(urlParts.params, x) && x.length > longestMatch.key.length) {
      longestMatch = {
        key: x,
        script: domainScripts[x]
      };
    }
  }
  return longestMatch;
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

var urlParts = getURLParts(window.location.href);

chrome.storage.sync.get(urlParts.domain, function(data) {
  if (data[urlParts.domain]) {
    var script = findMatchingScript(urlParts, data[urlParts.domain]);
    if (typeof script.script !== undefined) {
      eval(script.script);
    }
  }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.script) {
      eval(request.script);
    }
  }
);
