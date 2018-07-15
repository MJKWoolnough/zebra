"use strict";
window.addEventListener("load", function() {
	var createElement = document.createElementNS.bind(document, document.getElementsByTagName("html")[0].namespaceURI),
	    info = document.getElementById("info"),
	    done = Array.from(document.getElementsByTagName("button"))[3],
	    button = document.body.insertBefore(createElement("button"), document.getElementsByTagName("br")[0]);
	button.textContent = "Load";
	button.addEventListener("click", function() {
		var data = JSON.parse(window.localStorage.getItem("zebra"));
		if (!data) {
			return;
		}
		setData(data["names"]);
		done.click();
		data["on"].map(n => [
			Object.keys(data["names"])[n[0]],
			n[1],
			Object.keys(data["names"])[n[2]],
			n[3]]
		).forEach(n => setCell(n[0], data["names"][n[0]][n[1]], n[2], data["names"][n[2]][n[3]], 1));
		data["off"].map(n => [
			Object.keys(data["names"])[n[0]],
			n[1],
			Object.keys(data["names"])[n[2]],
			n[3]]
		).forEach(n => setCell(n[0], data["names"][n[0]][n[1]], n[2], data["names"][n[2]][n[3]], -1));
		data["rules"].map(n => [
			Object.keys(data["names"])[n[0]],
			Object.keys(data["names"])[n[1]],
			n[2],
			n[3],
			Object.keys(data["names"])[n[4]],
			n[5]
		]).forEach(n => addRule(n[0], n[1], data["names"][n[1]][n[2]], n[3], n[4], data["names"][n[4]][n[5]]));
	});
	done.addEventListener("click", function() {
		console.log(info.parentNode);
		if (info.parentNode !== null) {
			return;
		}
		var button = document.body.insertBefore(createElement("button"), document.getElementsByTagName("table")[1]),
		    names = Array.from(info.getElementsByTagName("div")).reduce(function(data, cat) {
			var inputs = Array.from(cat.getElementsByTagName("input"));
			data[inputs[0].value] = inputs.slice(1).map(input => input.value);
			return data;
		    }, {}),
		    re = /[ :|]/g,
		    namesFlat = Object.keys(names).reduce(function(data, name) {
			data[name.replace(re, "_").toUpperCase()] = names[name].map(n => n.replace(re, "_").toUpperCase());
			return data;
		    }, {}),
		    tds = Array.from(document.getElementsByTagName("table")[0].getElementsByTagName("td")),
		    ruleRE = /^In (.*), Category (.*), Row (.*), is (.*) Category (.*), Row (.*).$/;
		button.textContent = "Save";
		button.addEventListener("click", function() {
			var rules = Array.from(document.getElementsByTagName("table")[1].getElementsByTagName("span"));
			window.localStorage.setItem("zebra", JSON.stringify({
				"names": names,
				"on": tds.filter(
					cell => cell.hasAttribute("class") && cell.getAttribute("class").includes("on")
				).map(
					cell => cell.getAttribute("id").split("|").map(function(part) {
						var parts = part.split(":");
						return [Object.keys(namesFlat).indexOf(parts[0]), namesFlat[parts[0]].indexOf(parts[1])];
					}).reduce((acc, val) => acc.concat(val), [])
				),
				"off": tds.filter(
					cell => cell.hasAttribute("class") && cell.getAttribute("class").includes("off")
				).map(
					cell => cell.getAttribute("id").split("|").map(function(part) {
						var parts = part.split(":");
						return [Object.keys(namesFlat).indexOf(parts[0]), namesFlat[parts[0]].indexOf(parts[1])];
					}).reduce((acc, val) => acc.concat(val), [])
				),
				"rules": rules.map(function(ruleRow) {
					var matches = ruleRow.textContent.match(ruleRE);
					return [
						Object.keys(names).indexOf(matches[1]),
						Object.keys(names).indexOf(matches[2]),
						names[matches[2]].indexOf(matches[3]),
						matches[4],
						Object.keys(names).indexOf(matches[5]),
						names[matches[5]].indexOf(matches[6])
					];
				})
			}));
		});
	});
});
