var CommonHelper = {
	FormatDate: function (date, withTime) {
	    return [date.getDate().padLeft(), (date.getMonth() + 1).padLeft(), date.getFullYear()].join(".") +
	            (withTime ? " " + [date.getHours().padLeft(), date.getMinutes().padLeft(), date.getSeconds().padLeft(), date.getMilliseconds().padLeft()].join(":") : "");
	},
	ParseDate: function(dateString) {
		var parts = dateString.split(/[\s\.:]+/);
		return new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5], parts[6]);
	},
	RemoveFromArray: function(arr, item) {
		var index = $.inArray(item, arr);
		if (index !== -1) arr.splice(index, 1);
	},
	ShuffleArray: function (values) {
		var i, temp, j;
		var count = values.length

		for (i = 0; i < count; i++) {
			j = ~~(Math.random() * count);
			temp = values[i];
			values[i] = values[j];
			values[j] = temp;
		}

		return values;
	},
	SplitIntoGroups: function (values, groupSize){
		var result = [];

		for(var i = 0; i < values.length; i += groupSize) {
	    result.push(values.slice(i, i + groupSize));
	  }

		if(result.length > 1
			 && $(".concat-remainder").is(":checked")
			 && result[result.length - 1].length < groupSize) {
			result[result.length - 2] = result[result.length - 2].concat(result[result.length - 1]);
			result.pop();
		}

		return result;
	},
	Distinct: function (values) {
		var distinctValues = [];
		$.each(values, function(index, value) {
			var trimmedValue = $.trim(value);
			if ($.inArray(trimmedValue, distinctValues) == -1) {
				distinctValues.push(trimmedValue);
			}
		});
		return distinctValues;
	},
	DownloadCsv: function (filename, data) {
		var charset = "UTF-16LE";
		var fixedData = [];
		var charCode;

	  fixedData.push(255, 254);
	  for (var i = 0; i < data.length; i++) {
		  charCode = data.charCodeAt(i);
		  fixedData.push(charCode & 0xff);
		  fixedData.push(charCode / 256 >>> 0);
	  }

		var blob = new Blob([new Uint8Array(fixedData)], {
			type: "text/csv;charset="+ charset + ";"
		});
	  if (navigator.msSaveBlob) {
	    navigator.msSaveBlob(blob, filename);
	  } else {
			var url = URL.createObjectURL(blob);
			var link = document.createElement("a");
	    if (link.download !== undefined) {
	        link.setAttribute("href", url);
	        link.setAttribute("download", filename);
	        link.style.visibility = 'hidden';
	        document.body.appendChild(link);
	        link.click();
	        document.body.removeChild(link);
	    } else {
				window.open(encodeURI(url));
			}
	  }
	}
};
