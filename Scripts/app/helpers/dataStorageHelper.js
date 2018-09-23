var DataStorageHelper = {
	SaveLocal: function (key, data) {
		if (typeof(Storage) !== "undefined") {
	    saveToLocalStorage(key, data);
		} else {
			saveCookie(key, data);
		}
	},
	ReadLocal: function (key) {
		if (typeof(Storage) !== "undefined") {
			return readFromLocalStorage(key);
		} else {
			return readCookie(key);
		}
	},
	RemoveLocal: function (key) {
		if (typeof(Storage) !== "undefined") {
			return removeFromLocalStorage(key);
		} else {
			return removeCookie(key);
		}
	}
};

//web storage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function readFromLocalStorage(key) {
	var result = localStorage[key];
  result && (result = JSON.parse(result));
  return result;
}
function removeFromLocalStorage(key) {
	localStorage.removeItem(key);
}

//cookies
function saveCookie(key, data) {
	if (navigator.cookieEnabled) {
		var cookie = [key, "=", JSON.stringify(data), "; domain=.", window.location.host.toString(), "; path=/;"].join("");
	  document.cookie = cookie;
	}	else {
			alert("Включите cookie для комфортной работы с этим сайтом");
	}
}
function readCookie(key) {
 if (navigator.cookieEnabled) {
	 var result = document.cookie.match(new RegExp(key + "=([^;]+)"));
	 result && (result = JSON.parse(result[1]));
	 return result;
 }	else {
		 alert("Включите cookie для комфортной работы с этим сайтом");
		 return null;
 }
}
function removeCookie(key) {
 if (navigator.cookieEnabled) {
	 var expiration = new Date();
	 expiration.setTime(expiration.getTime() - (1000*60*60*24));// 1000ms
	 var cookie = [key, "=; domain=.", window.location.host.toString(), "; path=/", "; expires=", expiration.toGMTString(), ";"].join("");
	 document.cookie = cookie;
 }	else {
		 alert("Включите cookie для комфортной работы с этим сайтом");
 }
}
