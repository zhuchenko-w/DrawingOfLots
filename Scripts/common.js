var textAreaValueUpdating = false;
var textAreaValueChanged = false;

$(function(){
	$("#all-countries").on('change', function(){
		if($(this).is(":checked")) {
			showValues(AllCountries);
		}
	});
	$("#all-states").on('change', function(){
		if($(this).is(":checked")){
			showValues(AllStates);
		}
	});
	$("#other").on('change', function(){
		if($(this).is(":checked")) {
			showValues(null);
		}
	});

	$(".results").on("click", ".btn-download-csv", function(){
		downloadCsv("Жеребьевка.csv", getResultCsvText());
	});
	$(".results").on("click", ".btn-copy-all", function(){
		copyTextToClipboard($(".results .result-group"), getResultCsvText());
	});
	$(".results").on("click", ".btn-copy-group", function(){
		var selected = $(this).closest(".result-group");
		copyTextToClipboard(selected, getResultGroupCsvText(selected));
	});

	$(".start-btn").click(draw);

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

	createNumberOfGroupsOptions();
	initSelect2();
	showValues(AllCountries);
});

function initSelect2(){
	$(".multiselect").select2({
		language: "ru",
		width: "300px",
		allowClear: true,
		multiple: true,
		closeOnSelect: false,
		dropdownCssClass: "multiselect-dropdown",
		placeholder: "Все"
	}).on("select2:close", function () {
		if($(this).val().length > 0) {
			$(".values").prop("readonly", true);
		} else {
			$(".values").prop("readonly", false);
		}
		updateFilterAndIndicator(true);
	});
}
function createNumberOfGroupsOptions() {
	var i = 1;

	while(i++ < 11) {
		$(".number-of-groups").append($("<option value='" + i + "'" + (i == 4 ? "selected" : "") + ">" + i + " штук" + (i > 4 ? "" : "и") + "</option>"))
	}
}

function updateFilterAndIndicator(indicatorOnly) {
	var distinctValues = getDistinctValues();

	if(distinctValues.length == 0) {
		if(!indicatorOnly) {
			setFilter(null);
		}
		$(".lines-count").text("");
		$(".start-btn").prop("disabled", true);
	} else {
		if(!indicatorOnly) {
			setFilter(distinctValues);
		}
		$(".lines-count").text("(" + distinctValues.length + ") ");
		$(".start-btn").prop("disabled", false);
	}
}
function setFilter(distinctValues) {
	$(".items-select option:not(.all-option)").remove();

	if(distinctValues != null) {
		var html = "";
		$.each(distinctValues, function(index, value) {
			html += "<option value='" + value + "'>" + value + "</option>";
		});

		$(".items-select").append($(html));
	}
}
function getDistinctValues() {
	return $(".values").prop("readonly")
		? $(".multiselect").val()
		: distinct(
				$(".values")
					.val()
					.split(/\r|\r\n|\n/)
					.filter(function(s){ return s.replace(/\s/g, "") !== ""; }));
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

function indicateCopyToClipboardResult(selected, result) {
	var elementClass = result ? "copied" : "copy-error";

	selected.removeClass("copied");
	selected.removeClass("copy-error");

	selected.addClass(elementClass);
	setTimeout(function(){
		selected.removeClass(elementClass);
	}, 300);
}
function fallbackCopyTextToClipboard(selected, text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var succeeded = document.execCommand("copy");
    indicateCopyToClipboardResult(selected, succeeded);
  } catch (err) {
    indicateCopyToClipboardResult(selected, false);;
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(selected, text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    indicateCopyToClipboardResult(selected, true);
  }, function(err) {
    indicateCopyToClipboardResult(selected, false);
  });
}
function downloadCsv(filename, data) {
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

function draw() {
	var distinctValues = getDistinctValues();
	var groupSize = parseInt($(".number-of-groups").val());
	var resultsDiv = $(".results");

	shuffle(distinctValues);
	var groups = split(distinctValues, groupSize);
	resultsDiv.html("");

	if(groups.length > 0) {
		resultsDiv.append("<button type='button' class='btn btn-copy-all' title='Копировать все'></button>");
		resultsDiv.append("<button type='button' class='btn btn-download-csv' title='Экспорт в CSV'></button>");

		var i, j;
		for (i = 0; i < groups.length; i++) {
			var html = "<div class='result-group col'><ul class='list-group'>";
			for (j = 0; j < groups[i].length; j++) {
				html += "<li class='list-group-item'>" + groups[i][j] + "</li>";
			}
			html += "</ul><button type='button' class='btn btn-copy-group' title='Копировать'></button></div>";
			resultsDiv.append($(html));
		}
	}
}
function shuffle(values) {
	var i, temp, j;
	var count = values.length

	for (i = 0; i < count; i++) {
		j = ~~(Math.random() * count);
		temp = values[i];
		values[i] = values[j];
		values[j] = temp;
	}

	return values;
}
function split(values, groupSize){
		var result = [];

		while (values.length) {
				result.push(values.splice(0, groupSize));
		}

		if(result.length > 1
			 && $(".concat-remainder").is(":checked")
			 && result[result.length - 1].length < groupSize) {
			result[result.length - 2] = result[result.length - 2].concat(result[result.length - 1]);
			result.pop();
		}

		return result;
}
function distinct(values) {
	var distinctValues = [];
	$.each(values, function(index, value) {
		var trimmedValue = $.trim(value);
		if ($.inArray(trimmedValue, distinctValues) == -1) {
			distinctValues.push(trimmedValue);
		}
	});
	return distinctValues;
}

const AllStates = [
	"Айдахо",
	"Айова",
	"Алабама",
	"Аляска",
	"Аризона",
	"Арканзас",
	"Вайоминг",
	"Вашингтон",
	"Вермонт",
	"Вирджиния",
	"Висконсин",
	"Гавайи",
	"Делавэр",
	"Джорджия",
	"Западная Вирджиния",
	"Иллинойс",
	"Индиана",
	"Калифорния",
	"Канзас",
	"Кентукки",
	"Колорадо",
	"Коннектикут",
	"Луизиана",
	"Массачусетс",
	"Миннесота",
	"Миссисипи",
	"Миссури",
	"Мичиган",
	"Монтана",
	"Мэн",
	"Мэриленд",
	"Небраска",
	"Невада",
	"Нью-Гэмпшир",
	"Нью-Джерси",
	"Нью-Йорк",
	"Нью-Мексико",
	"Огайо",
	"Оклахома",
	"Орегон",
	"Пенсильвания",
	"Род-Айленд",
	"Северная Дакота",
	"Северная Каролина",
	"Теннесси",
	"Техас",
	"Флорида",
	"Южная Дакота",
	"Южная Каролина",
	"Юта"
];

const AllCountries = [
	"Афганистан",
	"Австралия",
	"Австрия",
	"Азербайджан",
	"Албания",
	"Алжир",
	"Ангола",
	"Андорра",
	"Антигуа и Барбуда",
	"Аргентина",
	"Армения",
	"Багамы",
	"Бангладеш",
	"Барбадос",
	"Бахрейн",
	"Белиз",
	"Белоруссия",
	"Бельгия",
	"Бенин",
	"Бирма/Мьянма",
	"Болгария",
	"Боливия",
	"Босния и Герцеговина",
	"Ботсвана",
	"Бразилия",
	"Бруней",
	"Буркина-Фасо",
	"Бурунди",
	"Бутан",
	"Вануату",
	"Ватикан",
	"Венгрия",
	"Венесуэла",
	"Восточный Тимор",
	"Вьетнам",
	"Габон",
	"Гаити",
	"Гайана",
	"Гамбия",
	"Гана",
	"Гватемала",
	"Гвинея",
	"Гвинея-Бисау",
	"Германия",
	"Гондурас",
	"Гренада",
	"Греция",
	"Дания",
	"Джибути",
	"Джорджия",
	"Доминика",
	"Доминиканская Республика",
	"Египет",
	"Замбия",
	"Западная Сахара",
	"Зимбабве",
	"Израиль",
	"Индия",
	"Индонезия",
	"Иордания",
	"Ирак",
	"Иран",
	"Ирландия",
	"Исландия",
	"Испания",
	"Италия",
	"Йемен",
	"Кабо-Верде",
	"Казахстан",
	"Камбоджа",
	"Камерун",
	"Канада",
	"Катар",
	"Кения",
	"Кипр",
	"Кирибати",
	"Китай",
	"Колумбия",
	"Коморские острова",
	"Конго",
	"Конго, демократическая республика",
	"Корея, север",
	"Корея, юг",
	"Коста-Рика",
	"Кот-д'Ивуар / Кот-д'Ивуар",
	"Куба",
	"Кувейт",
	"Кыргызстан",
	"Лаос",
	"Латвия",
	"Лесото",
	"Либерия",
	"Ливан",
	"Ливия",
	"Литва",
	"Лихтенштейн",
	"Люксембург",
	"Маврикий",
	"Мавритания",
	"Мадагаскар",
	"Македония",
	"Малави",
	"Малайзия",
	"Мали",
	"Мальдивы",
	"Мальта",
	"Марокко",
	"Маршалловы Острова",
	"Мексика",
	"Микронезия",
	"Мозамбик",
	"Молдова",
	"Монако",
	"Монголия",
	"Намибия",
	"Науру",
	"Непал",
	"Нигер",
	"Нигерия",
	"Нидерланды",
	"Никарагуа",
	"Новая Зеландия",
	"Норвегия",
	"Объединенные Арабские Эмираты",
	"Оман",
	"Пакистан",
	"Палау",
	"Палестина",
	"Панама",
	"Папуа - Новая Гвинея",
	"Парагвай",
	"Перу",
	"Польша",
	"Португалия",
	"Российская Федерация",
	"Руанда",
	"Румыния",
	"Сальвадор",
	"Самоа",
	"Сан-Марино",
	"Сан-Томе и Принсипи",
	"Саудовская Аравия",
	"Свазиленд",
	"Сейшельские острова",
	"Сенегал",
	"Сент-Винсент и Гренадины",
	"Сент-Китс и Невис",
	"Сент-Люсия",
	"Сербия",
	"Сингапур",
	"Сирия",
	"Словакия",
	"Словения",
	"Соединенное Королевство",
	"Соединенные Штаты",
	"Соломоновы Острова",
	"Сомали",
	"Судан",
	"Суринам",
	"Сьерра-Леоне",
	"Таджикистан",
	"Таиланд",
	"Танзания",
	"Того",
	"Тонга",
	"Тринидад и Тобаго",
	"Тувалу",
	"Тунис",
	"Туркмения",
	"Турция",
	"Уганда",
	"Узбекистан",
	"Украина",
	"Уругвай",
	"Фиджи",
	"Филиппины",
	"Финляндия",
	"Франция",
	"Хорватия",
	"Центральноафриканская Республика",
	"Чад",
	"Черногория",
	"Чешская Республика",
	"Чили",
	"Швейцария",
	"Швеция",
	"Шри-Ланка",
	"Эквадор",
	"Экваториальная Гвинея",
	"Эритрея",
	"Эстония",
	"Эфиопия",
	"Южная Африка",
	"Южный Судан",
	"Ямайка",
	"Япония"
];
