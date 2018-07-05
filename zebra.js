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
	Cell = (function() {
		var obj = function(cell) {
			this.cell = cell;
			this.unique = [];
		};
		obj.prototype = {
			Get: function() {
				switch (this.cell.getAttribute("class").replace(/^first /, "")) {
				case "on":
					return 1;
				case "off":
					return -1;
				}
				return 0;
			},
			Set: function(val) {
				this.cell.setAttribute("class", (this.cell.getAttribute("class").includes("first") ? "first " : "") + (val == 1 ? "on" : (val == -1 ? "off" : "")));
			},
			AddUnique: function(group) {
				this.unique.push(group);
			},
			Solve: function() {
				if (this.Get() == 0) {
					if (this.unique.some(u => u.every(cell => cell.Get() == -1))) {
						this.Set(1);
					} else if (this.unique.some(u => u.filter(cell => cell.Get() == 1).length == 1)) {
						this.Set(-1);
					}
					if (this.Get() != 0) {
						this.unique.forEach(u => u.filter(cell => cell.Get() == 0).forEach(cell => cell.Solve()));
					}
				}
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
		    solver = createElement("button"),
		    cells = [],
		    firstCell = firstRow.appendChild(createElement("td")),
		    data = {};
		firstCell.setAttribute("colspan", "2");
		firstCell.setAttribute("rowspan", "2");
		categories.forEach(function(cat) {
			var crosses = {};
			cat.Values.forEach(function(val) {
				var mdata = {};
				categories.filter(mcat => mcat != cat).forEach(function(mcat) {
					var values = {};
					mcat.Values.forEach(function(val) {
						values[val.toUpperCase()] = null;
					});
					mdata[mcat.Title.toUpperCase()] = values;
				});
				crosses[val.toUpperCase()] = mdata;
			});
			data[cat.Title.toUpperCase()] = crosses;
		});

		categories.slice(1).forEach(function(cat) {
			var catTitle = firstRow.appendChild(createElement("th"));
			catTitle.textContent = cat.Title;
			catTitle.setAttribute("colspan", numRows);
			cat.Values.forEach(function(title, pos) {
				var cell = secondRow.appendChild(createElement("th"));
				cell.appendChild(createElement("div")).textContent = title;
				if (pos === 0) {
					cell.setAttribute("class", "first");
				}
			});
		});
		categories.slice(2).concat(categories[0]).reverse().forEach(function(cat, pos) {
			var rowCatTitle = cat.Title.toUpperCase();
			cat.Values.forEach(function(title, cpos) {
				var row = tbody.appendChild(createElement("tr")),
				    rowTitle = title.toUpperCase();
				if (cpos == 0) {
					var catTitle = row.appendChild(createElement("th"));
					catTitle.appendChild(createElement("div")).textContent = cat.Title;
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
					var columnCatTitle = mcat.Title.toUpperCase();
					mcat.Values.forEach(function(val, i) {
						var elm = row.appendChild(createElement("td")),
						    cell = new Cell(elm),
						    columnTitle = val.toUpperCase();
						cells.push(cell) - 1;
						elm.addEventListener("click", function() {
							if (this.Get() == 1) {
								this.Set(0);
							} else {
								this.Set(1);
							}
						}.bind(cell, i));
						elm.addEventListener("contextmenu", function(e) {
							e.preventDefault();
							if (this.Get() == -1) {
								this.Set(0);
							} else {
								this.Set(-1);
							}
						}.bind(cell));
						if (i == 0) {
							elm.setAttribute("class", "first");
						} else {
							elm.setAttribute("class", "");
						}
						data[rowCatTitle][rowTitle][columnCatTitle][columnTitle] = cell;
						data[columnCatTitle][columnTitle][rowCatTitle][rowTitle] = cell;
					});
				});
				if (pos > 0) {
					var span = row.appendChild(createElement("td"));
					span.setAttribute("colspan", pos * numRows);
					span.setAttribute("class", "span");
				}
			});
		});
		window.Set = function(cat1, title1, cat2, title2, onoff) {
			this[cat1.toUpperCase()][title1.toUpperCase()][cat2.toUpperCase()][title2.toUpperCase()].Set(onoff);
		}.bind(data);
		Object.values(data).forEach(a => Object.values(a).forEach(b => Object.values(b).forEach(c => Object.keys(c).forEach(d => c[d].AddUnique(Object.keys(c).filter(e => e != d).map(f => c[f]))))));
		rules.addEventListener("blur", parseRules.bind(rules, categories));
		solver.textContent = "Solve";
		solver.addEventListener("click", cells.forEach.bind(cells, cell => cell.Solve()));
		document.body.appendChild(table);
		document.body.appendChild(rules);
		document.body.appendChild(solver);
	},
	parseRules = function(categories) {

	};
	init();
});
