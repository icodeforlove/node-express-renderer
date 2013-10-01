setTimeout(function () {
	window.ServerRenderingCSS = '';

	Array.prototype.slice.call(document.styleSheets).forEach(function (stylesheet, index, array) {
	  if (!stylesheet.rules) return;
		Array.prototype.slice.call(stylesheet.rules).forEach(function (rule, index, array) {
			var properties = rule.cssText.match(/\{\s+?(.+)\s+?\}/);

			if (rule.type === 1) {
				window.ServerRenderingCSS += rule.selectorText + '{' + (properties ? properties[1] : '') + '}';
			} else if (rule.type === 7) {
				//css += rule.selectorText + '{' + (properties ? properties[1] : '') + '}'
				//console.log('@keyframes %s%c %s', rule.name, 'font-weight: normal; color: #999', rule.cssText.replace(/[^\{]*\{([\s\S]+)\}$/, '{$1}'));
			}
		});
	});

	Array.prototype.slice.call(document.styleSheets).forEach(function (stylesheet, index, array) {
	  if (!stylesheet.rules) return;

		Array.prototype.slice.call(stylesheet.rules).forEach(function (rule, index, array) {
			stylesheet.removeRule(0);
		});
	});
}, 0);