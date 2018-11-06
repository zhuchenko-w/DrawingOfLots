var BackgroundBuilder = {
	GetBackgroundCss: function (selector, blockSizePx, mode, setRandomBackgroundColor, onlyInBound) {
		var images = [];
		var backgroundBlendMode = "inherit";

		switch(mode) {
			case this.Modes.Stickers:
				for (var i = 1; i <= 32; i++) {
					images.push(i + ".png");
				}
				break;
			case this.Modes.Bananas:
				for (var i = 1; i <= 4; i++) {
					images.push("banana" + i + ".png");
				}
				backgroundBlendMode = "lighten";
				break;
			case this.Modes.BananaWall:
				images.push("bananas.jpg");
				break;
		}

		CommonHelper.ShuffleArray(images);

		var urls = [];
		var positions = [];
		var element = $(selector);
		var maxHeight = element.outerHeight();
		var maxWidth = element.outerWidth();
		var initialTop = onlyInBound ? (maxHeight - (~~(maxHeight / blockSizePx) * blockSizePx)) / 2 : 0;
		var initialLeft = onlyInBound ? (maxWidth - (~~(maxWidth / blockSizePx) * blockSizePx)) / 2 : 0;
		var top = initialTop;
		var left = initialLeft;
		var inBoundMultiplier = onlyInBound ? 1 : 0;
		var i = 0;
		while (top + blockSizePx * inBoundMultiplier <= maxHeight) {
			if(left + blockSizePx * inBoundMultiplier > maxWidth) {
				left = initialLeft;
				top += blockSizePx;
			} else {
				positions.push("top " + top + "px left " + left + "px");
				urls.push("url(Content/Images/Backgrounds/" + images[i] + ")");

				if(++i == images.length) {
						CommonHelper.ShuffleArray(images);
						i = 0;
				}

				left += blockSizePx;
			}
		}

		return "background-size: " + blockSizePx + "px; " +
			"background-repeat: no-repeat; " +
			(setRandomBackgroundColor ? "background-color: " + getRandomColor() + ";" : "") +
			"background-blend-mode: " + backgroundBlendMode + "; " +
			"background-image: " + urls.join(",") + "; " +
			"background-position: " +	positions.join(",") + ";";
	},
	Modes: {
		Stickers: 0,
		Bananas: 1,
		BananaWall: 2,
	}
};

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
