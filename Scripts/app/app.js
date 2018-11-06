var textAreaValueUpdating = false;
var textAreaValueChanged = false;

$(function(){
	window.addEventListener("resize", function(){
		setBackground();
	}, true);

	$(".values-switch").on("change", function(){
		var element = $(this);
		if(element.is(":checked")) {
			showValues(valueLists[element.data("list-name")]);
		}
	});

	$(".results").on("click", ".btn-download-csv", function(){
		CommonHelper.DownloadCsv("Жеребьевка.csv", getResultCsvText());
	});
	$(".results").on("click", ".btn-copy-all", function(){
		var selected = $(".results .result-group");
		ClipboardHelper.CopyTextToClipboard(
			getResultCsvText(),
			function(){ indicateCopyToClipboardResult(selected, true); },
			function(){ indicateCopyToClipboardResult(selected, false); });
	});
	$(".results").on("click", ".btn-copy-group", function(){
		var selected = $(this).closest(".result-group");
		ClipboardHelper.CopyTextToClipboard(
			getResultGroupCsvText(selected),
			function(){ indicateCopyToClipboardResult(selected, true); },
			function(){ indicateCopyToClipboardResult(selected, false); });
	});

	$(".start-btn").click(draw);

	$(".buttons").on("click", ".load-saved-result-btn", function(){
		loadResults($(this).data("key"));
	}).on("click", ".remove-all-saved-results-btn", function(){
		removeAllSavedResults();
	}).on("click", ".remove-saved-result-btn", function(){
		var element = $(this);
		removeSavedResult(element, element.data("key"));
		return false;
	});

	$(".values").on("change input", function(){
		textAreaValueChanged = true;
		updateFilterAndIndicator(!textAreaValueUpdating);
	});
	$(".values").on("focusout", function(){
		if(textAreaValueChanged) {
			textAreaValueChanged = false;
			updateFilterAndIndicator();
		}
	});

	setBackground();
	fillPreviousResultsMenu();
	createNumberOfGroupsOptions();
	initSelect2Filters();
	showValues(valueLists["allCountries"]);
});

// initialization
function createNumberOfGroupsOptions() {
	var i = 1;

	while(i++ < 10) {
		$(".number-of-groups").append($("<option value='" + i + "'" + (i == 4 ? "selected" : "") + ">" + i + " штук" + (i > 4 ? "" : "и") + "</option>"))
	}
}
function fillPreviousResultsMenu() {
	var keys = DataStorageHelper.ReadLocal(ResultsKeysKey);
	if(keys && keys.length > 0) {
		sortSavedResultsKeysDesc(keys);

		var html = "";

		$.each(keys, function(index, key) {
			html += '<div class="dropdown-item saved-results-menu-item load-saved-result-btn" data-key="' + key + '">' +
				key + '</div><button class="btn btn-danger btn-sm remove-saved-result-btn" data-key="' + key + '"></button>';
		});
		html += '<div class="dropdown-divider"></div><div class="dropdown-item saved-results-menu-item remove-all-saved-results-btn">Очистить сохраненные</div>'

		$(".saved-results-menu").html(html);
		$(".saved-results-dropdown").show();
	} else {
		$(".saved-results-dropdown").hide();
	}
}
function initSelect2Filters(){
	$(".multiselect").select2({
		language: "ru",
		width: "280px",
		allowClear: true,
		multiple: true,
		closeOnSelect: false,
		dropdownCssClass: "multiselect-dropdown",
		placeholder: function() {
        $(this).data('placeholder');
    }
	}).on("select2:close", function () {
		if($(".items-select").val().length > 0 || $(".excluded-items-select").val() > 0) {
			$(".values").prop("readonly", true);
		} else {
			$(".values").prop("readonly", false);
		}
		updateFilterAndIndicator(true);
	});
}
function setBackground() {
	$(".results").attr("style", BackgroundBuilder.GetBackgroundCss(".results", 240, BackgroundBuilder.Modes.Bananas));
	$("body").attr("style", BackgroundBuilder.GetBackgroundCss("body", 240, BackgroundBuilder.Modes.Stickers, true));
}

// filtering
function updateFilterAndIndicator(indicatorOnly) {
	var distinctValues = getDistinctValues();

	if(distinctValues.length == 0) {
		if(!indicatorOnly) {
			setFilter(null);
			setFilter(null, true);
		}
		$(".lines-count").text("");
		$(".start-btn").prop("disabled", true);
	} else {
		if(!indicatorOnly) {
			setFilter(distinctValues);
			setFilter(distinctValues, true);
		}
		$(".lines-count").text("(" + distinctValues.length + ") ");
		$(".start-btn").prop("disabled", false);
	}
}
function setFilter(distinctValues, excluded) {
	var filterSelector = "." + (excluded ? "excluded-" : "") + "items-select";

	$(filterSelector + " option:not(.all-option)").remove();

	if(distinctValues != null) {
		var html = "";
		$.each(distinctValues, function(index, value) {
			html += "<option value='" + value + "'>" + value + "</option>";
		});

		$(filterSelector).append($(html));
	}
}

// values
function getDistinctValues() {
	return $(".values").prop("readonly")
		? getValuesFromFilters()
		: CommonHelper.Distinct(getValuesFromTextArea());
}
function getValues() {
	return $(".values").prop("readonly")
		? getValuesFromFilters()
		: getValuesFromTextArea();
}
function getValuesFromFilters() {
	var values = $(".items-select").val();
	var excluded = $(".excluded-items-select").val();

	if(values.length == 0) {
		values = CommonHelper.Distinct(getValuesFromTextArea());
	}

	return values.filter(function(item) {
	  return excluded.indexOf(item) == -1;
	});
}
function getValuesFromTextArea() {
	return $(".values")
		.val()
		.split(/\r|\r\n|\n/)
		.filter(function(s){ return s.replace(/\s/g, "") !== ""; });
}
function showValues(values){
	textAreaValueUpdating = true;

	var textArea = $(".values");

	textArea.prop("readonly", false);
	if(values == null){
		textArea.val("").change();
	} else {
		textArea.val(values.join("\n")).change();
	}

	textAreaValueUpdating = false;
}

// csv export
function getResultCsvText() {
	var selected = $(".results .result-group");
	var lines = [];

	$.each(selected, function(index, value) {
		lines.push(getResultGroupCsvText(value));
	});

	return lines.join("\r\n");
}
function getResultGroupCsvText(resultGroupElement) {
	var items = $(".list-group-item", resultGroupElement);
	var itemTextValues = [];

	$.each(items, function(index, value) {
		itemTextValues.push(value.innerText);
	});

	return itemTextValues.join("\t");
}

// indication
function indicateCopyToClipboardResult(selected, result) {
	var elementClass = result ? "copied" : "copy-error";

	selected.removeClass("copied");
	selected.removeClass("copy-error");

	selected.addClass(elementClass);
	setTimeout(function(){
		selected.removeClass(elementClass);
	}, 300);
}
function loading(loading) {
	if(loading) {
		$(".loader-wrap").show();
	} else {
		$(".loader-wrap").hide();
	}
}

// save/load results
function saveResults(groups, values) {
	var key = CommonHelper.FormatDate(new Date(), true);
	var keys = DataStorageHelper.ReadLocal(ResultsKeysKey) || [];

	keys.push(key);
	DataStorageHelper.SaveLocal(key, { values: values, groups: groups });

	if(keys.length > MaxSavedResultsCount) {
		sortSavedResultsKeysDesc(keys);
		var oldestKey = keys.pop();
		DataStorageHelper.RemoveLocal(oldestKey);
	}

	DataStorageHelper.SaveLocal(ResultsKeysKey, keys);
	fillPreviousResultsMenu();
}
function loadResults(key) {
	var data = DataStorageHelper.ReadLocal(key);

	$(".mode-label.active").removeClass("active");
	$(".values-switch[data-list-name='other']").prop('checked', true).change().closest(".mode-label").addClass("active");
	showValues(data.values);
	showResults(data.groups);
}
function removeAllSavedResults() {
	var keys = DataStorageHelper.ReadLocal(ResultsKeysKey) || [];

	$.each(keys, function(index, key) {
		DataStorageHelper.RemoveLocal(key);
	});
	DataStorageHelper.RemoveLocal(ResultsKeysKey);

	fillPreviousResultsMenu();
}
function removeSavedResult(element, key) {
	var keys = DataStorageHelper.ReadLocal(ResultsKeysKey) || [];
	CommonHelper.RemoveFromArray(keys, key);

	DataStorageHelper.SaveLocal(ResultsKeysKey, keys);
	DataStorageHelper.RemoveLocal(key);

	fillPreviousResultsMenu();
}
function sortSavedResultsKeysDesc(keys) {
	if(keys && keys.length > 0) {
		keys.sort(function(x, y) {
		  if (CommonHelper.ParseDate(x) < CommonHelper.ParseDate(y)) {
		    return 1;
		  }
		  if (CommonHelper.ParseDate(x) > CommonHelper.ParseDate(y)) {
		    return -1;
		  }
		  return 0;
		});
	}
}

// drawing
function draw() {
	var distinctValues = getDistinctValues();
	var groupSize = parseInt($(".number-of-groups").val());

	CommonHelper.ShuffleArray(distinctValues);
	var groups = CommonHelper.SplitIntoGroups(distinctValues, groupSize);
	saveResults(groups, getValues());
	showResults(groups);
}
function showResults(groups) {
	var resultsDiv = $(".results");
	var html = "";

	if(groups.length > 0) {
		html += "<button type='button' class='btn btn-copy-all' title='Копировать все'></button>";
		html += "<button type='button' class='btn btn-download-csv' title='Экспорт в CSV'></button>";

		var i, j;
		for (i = 0; i < groups.length; i++) {
			html += "<div class='result-group col'><ul class='list-group'>";
			for (j = 0; j < groups[i].length; j++) {
				html += "<li class='list-group-item'>" + groups[i][j] + "</li>";
			}
			html += "</ul><button type='button' class='btn btn-copy-group' title='Копировать'></button></div>";
		}
	}

	resultsDiv.html(html);
	setBackground();
}
