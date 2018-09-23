function fallbackToLocalStylsheet(href) {
  var link = document.createElement("link");
  link.href = href;
  link.rel = "stylesheet";
  link.type = "text/css";
  document.querySelector("head").insertBefore(link, document.querySelector(".app-style"));
}
