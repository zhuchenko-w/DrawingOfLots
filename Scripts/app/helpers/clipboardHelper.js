var ClipboardHelper = {
	CopyTextToClipboard: function (text, successFunc, errorFunc) {
	  if (!navigator.clipboard) {
	    this.CopyTextToClipboardFallback(text, successFunc, errorFunc);
	    return;
	  }
	  navigator.clipboard.writeText(text).then(successFunc, errorFunc);
	},
	CopyTextToClipboardFallback: function (text, successFunc, errorFunc) {
	  var textArea = document.createElement("textarea");

		textArea.style.position = "fixed";
	  textArea.style.top = 0;
	  textArea.style.left = 0;
	  textArea.style.width = "2em";
	  textArea.style.height = "2em";
		textArea.style.padding = 0;
	  textArea.style.border = "none";
	  textArea.style.outline = "none";
	  textArea.style.boxShadow = "none";
	  textArea.style.background = "transparent";
	  textArea.value = text;

	  document.body.appendChild(textArea);
	  textArea.focus();
	  textArea.select();

	  try {
	    var succeeded = document.execCommand("copy");
	    if(succeeded) {
				successFunc();
			} else {
				errorFunc();
			}
	  } catch (err) {
	    errorFunc();
	  }

	  document.body.removeChild(textArea);
	}
};
