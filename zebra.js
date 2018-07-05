"use strict";
window.addEventListener("load", function() {
	var createElement = document.createElementNS.bind(document, document.getElementsByTagName("html")[0].namespaceURI),
	clearNode = function(node) {
		node.parentNode.replaceChild(node.cloneNode(false), node);
	},
	Category = (function() {
		var obj = function(parent) {
			this.parent = parent;
			this.Title = "";
			this.Values = [];
		};
		obj.prototype = {
			SetTitle: function(title) {
				this.Title = title;
			},
			SetValue: function(num, value) {
				this.Values[num] = value;
			},
			AddRow: function() {
				this.SetValue(this.Values.length, "");
				var input = this.parent.appendChild(createElement("li")).appendChild(createElement("input"));
				input.addEventListener("blur", (function(row) {
					categories[catNum].SetValue(row, this.value);
				}).bind(input, i));
			}
		};
		return obj;
	}()),
	init = function() {
		clearNode(document.body);
		var categories = [],
		    addCategory = document.body.appendChild(createElement("button")),
		    addRow = document.body.appendChild(createElement("button")),
		    addRowCell = function(parent, catNum) {
			var i = categories[catNum].Values.length,
			    input = parent.appendChild(createElement("li")).appendChild(createElement("input"));
			categories[catNum].SetValue(i, "");
			input.addEventListener("blur", function() {
				categories[catNum].SetValue(i, input.value);
			});
		    },
		    done = document.body.appendChild(createElement("button")),
		    info = createElement("div"),
		    numRows = 2;
		document.body.appendChild(createElement("br"));
		document.body.appendChild(info);
		addCategory.innerHTML = "Add Category";
		addRow.innerHTML = "Add Row";
		info.setAttribute("id", "info");
		done.innerHTML = "Start";
		addCategory.addEventListener("click", function() {
			var catNum = categories.length,
			    set = createElement("div"),
			    title = set.appendChild(createElement("input")),
			    values = set.appendChild(createElement("ol"));
			categories[catNum] = new Category(values);
			title.addEventListener("blur", function() {
				categories[catNum].SetTitle(this.value);
			});
			for (var i = 0; i < numRows; i++) {
				addRowCell(values, catNum);
			}
			info.appendChild(set);
		});
		addRow.addEventListener("click", function() {
			numRows++;
			Array.prototype.slice.apply(document.body.getElementsByTagName("ol")).forEach(addRowCell);
		});
		addCategory.click();
		addCategory.click();
		addCategory.click();
		done.addEventListener("click", grid.bind(null, categories));
	},
	grid = function(categories) {
		clearNode(document.body);
		var numRows = categories[0].Values.length,
		    table = createElement("table"),
		    thead = table.appendChild(createElement("thead")),
		    firstRow = thead.appendChild(createElement("tr")),
		    secondRow = thead.appendChild(createElement("tr")),
		    tbody = table.appendChild(createElement("tbody")),
		    rules = createElement("textarea"),
		    solver = createElement("button");
		var firstCell = firstRow.appendChild(createElement("td"));
		firstCell.setAttribute("colspan", "2");
		firstCell.setAttribute("rowspan", "2");

		categories.slice(1).forEach(function(cat) {
			var catTitle = firstRow.appendChild(createElement("th"));
			catTitle.textContent = cat.Title;
			catTitle.setAttribute("colspan", numRows);
			cat.Values.forEach(function(title, pos) {
				var cell = secondRow.appendChild(createElement("th"));
				cell.textContent = title;
				if (pos === 0) {
					cell.setAttribute("class", "first");
				}
			});
		});
		categories.slice(2).concat(categories[0]).reverse().forEach(function(cat, pos) {
			cat.Values.forEach(function(title, cpos) {
				var row = tbody.appendChild(createElement("tr"));
				if (cpos == 0) {
					var catTitle = row.appendChild(createElement("th"));
					catTitle.textContent = cat.Title;
					catTitle.setAttribute("rowspan", numRows);
					catTitle.setAttribute("class", "cat");
					row.setAttribute("class", "first");
				}
				var cell = row.appendChild(createElement("th"));
				cell.textContent = title;
				if (cpos === 0) {
					cell.setAttribute("class", "first");
				}
				categories.slice(1, categories.length - pos).forEach(function(mcat) {
					for (var i = 0; i < numRows; i++) {
						var cell = row.appendChild(createElement("td"));
						cell.addEventListener("click", function(i, e) {
							var className = this.getAttribute("class").includes("on") ? "":"on";
							if (i == 0) {
								className += " first";
							}
							this.setAttribute("class", className);
						}.bind(cell, i));
						cell.addEventListener("contextmenu", function(i, e) {
							e.preventDefault();
							var className = this.getAttribute("class").includes("off") ? "":"off";
							if (i == 0) {
								className += " first";
							}
							this.setAttribute("class", className);
						}.bind(cell, i));
						if (i == 0) {
							cell.setAttribute("class", "first");
						} else {
							cell.setAttribute("class", "");
						}
					}
				});
				if (pos > 0) {
					var span = row.appendChild(createElement("td"));
					span.setAttribute("colspan", pos * numRows);
					span.setAttribute("class", "span");
				}
			});
		});
		rules.addEventListener("blur", parseRules.bind(rules, categories));
		solver.textContent = "Solve";
		solver.addEventListener("click", solve.bind(categories));
		document.body.appendChild(table);
		document.body.appendChild(rules);
		document.body.appendChild(solver);
	},
	parseRules = function(categories) {

	},
	solve = function(categories) {
	};
	init();
});
