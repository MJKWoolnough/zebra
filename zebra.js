"use strict";
window.addEventListener("load", function() {
	var createElement = document.createElementNS.bind(document, document.getElementsByTagName("html")[0].namespaceURI),
	    clearNode = function(node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.lastChild);
		}
	    },
	    addCategory = document.body.appendChild(createElement("button")),
	    addRow = document.body.appendChild(createElement("button")),
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
		var set = createElement("div"),
		    values = set.appendChild(createElement("ol"));
		set.insertBefore(createElement("input"), values);
		for (var i = 0; i < numRows; i++) {
			values.appendChild(createElement("li")).appendChild(createElement("input"));
		}
		info.appendChild(set);
	});
	addRow.addEventListener("click", function() {
		numRows++;
		Array.prototype.slice.apply(document.body.getElementsByTagName("ol")).forEach(ol => ol.appendChild(createElement("li")).appendChild(createElement("input")));
	});
	addCategory.click();
	addCategory.click();
	addCategory.click();
	done.addEventListener("click", function() {
		var categories = Array.prototype.slice.apply(info.getElementsByTagName("div")).map(function(cat) {
			var inputs = Array.prototype.slice.apply(cat.getElementsByTagName("input"));
			return {"Title": inputs[0].value, "Values": inputs.slice(1).map(input => input.value)};
		    }),
		    table = createElement("table"),
		    thead = table.appendChild(createElement("thead")),
		    firstRow = thead.appendChild(createElement("tr")),
		    secondRow = thead.appendChild(createElement("tr")),
		    tbody = table.appendChild(createElement("tbody")),
		    solver = createElement("button"),
		    addRule = createElement("button"),
		    rulesList = createElement("table"),
		    rules = [],
		    cells = [],
		    firstCell = firstRow.appendChild(createElement("td")),
		    updateCells = cells.forEach.bind(cells, c => c.Update()),
		    data = {},
		    Cell = (function() {
			var obj = function(cell) {
				this.cell = cell;
				this.cats = [];
				this.vals = [];
				this.unique = [];
				this.value = 0;
			};
			obj.prototype = {
				Get: function() {
					return this.value;
				},
				Set: function(val) {
					this.value = val;
				},
				Update: function() {
					this.cell.setAttribute("class", (this.cell.getAttribute("class").includes("first") ? "first " : "") + (this.value == 1 ? "on" : (this.value == -1 ? "off" : "")));
				},
				AddUnique: function(group) {
					this.unique.push(group);
				},
				Solve: function(data) {
					var unchanged = true,
					    self = this;
					if (this.Get() === 0) {
						if (this.unique.some(u => u.every(cell => cell.Get() == -1))) {
							this.Set(1);
							unchanged = false;
						} else if (this.unique.some(u => u.filter(cell => cell.Get() == 1).length == 1)) {
							this.Set(-1);
							unchanged = false;
						}
					}
					if (this.Get() === 1) {
						Object.keys(data[this.cats[0]][this.vals[0]]).filter(k => k !== this.cats[1]).forEach(k => Object.keys(data[this.cats[0]][this.vals[0]][k]).forEach(function(j) {
							var valA = data[self.cats[0]][self.vals[0]][k][j],
							    valB = data[self.cats[1]][self.vals[1]][k][j];
							if (valA.Get() !== 0 && valB.Get() == 0) {
								valB.Set(valA.Get());
								unchanged = false;
							} else if (valB.Get() !== 0 && valA.Get() == 0) {
								valA.Set(valB.Get());
								unchanged = false;
							}
						}));
					}
					return unchanged;
				}
			};
			return obj;
		    }()),
		    adjacentCells = function(cellNum) {
			var cells = [];
			if (cellNum > 0) {
				cells.push(cellNum - 1);
			}
			if (cellNum < numRows - 1) {
				cells.push(cellNum + 1);
			}
			return cells;
		    },
		    adjacentTo = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			Object.keys(dataB).every(function(val, num) {
				if (dataB[val].Get() === 0 && adjacentCells(num).every(c => dataC[Object.keys(dataC)[c]].Get() === -1)) {
					dataB[val].Set(-1);
					unchanged = false;
				}
				return true;
			});
			Object.keys(dataC).every(function(val, num) {
				if (dataC[val].Get() === 0 && adjacentCells(num).every(c => dataB[Object.keys(dataB)[c]].Get() === -1)) {
					dataC[val].Set(-1);
					unchanged = false;
				}
				return true;
			});
			return unchanged;
		    },
		    leftOf = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			[dataB[Object.keys(dataB)[numRows-1]], dataC[Object.keys(dataC)[0]]].filter(cell => cell.Get() == 0).forEach(function(cell) {
				cell.Set(-1);
				unchanged = false;
			});
			Object.keys(dataC).slice(1).every(function(val, num) {
				var other = dataB[Object.keys(dataB)[num]];
				switch (dataC[val].Get()) {
				case -1:
					if (other.Get() !== -1) {
						other.Set(-1);
						unchanged = false;
					}
					break;
				case 0:
					break;
				case 1:
					if (other.Get() !== 1) {
						other.Set(1);
						unchanged = false;
						return false;
					}
				}
				return true;
			});
			Object.keys(dataB).slice(0, -1).every(function(val, num) {
				var other = dataC[Object.keys(dataC)[num+1]];
				switch (dataB[val].Get()) {
				case -1:
					if (other.Get() !== -1) {
						other.Set(-1);
						unchanged = false;
					}
					break;
				case 0:
					break;
				case 1:
					if (other.Get() !== 1) {
						other.Set(1);
						unchanged = false;
						return false;
					}
				}
				return true;
			});
			return unchanged;
		    },
		    before = function(catA, catB, rowB, catC, rowC) {
			var unchanged = true,
			    dataB = data[catB][rowB][catA],
			    dataC = data[catC][rowC][catA];
			Object.keys(dataB).every(function(k) {
				if (dataC[k].Get() == 0) {
					dataC[k].Set(0);
					unchanged = false;
				}
				return dataB[k].Get() === 0;
			});
			Object.keys(dataB).reverse().every(function(k) {
				if (dataB[k].Get() == 0) {
					dataB[k].Set(0);
					unchanged = false;
				}
				return dataB[k].Get() === 0;
			});
			return unchanged;
		    };
		clearNode(document.body);
		firstCell.setAttribute("colspan", "2");
		firstCell.setAttribute("rowspan", "2");
		categories.forEach(function(cat) {
			var crosses = {};
			cat.Values.forEach(function(val) {
				var mdata = {};
				categories.filter(mcat => mcat != cat).forEach(function(mcat) {
					var values = {};
					mcat.Values.forEach(function(val) {
						values[val] = null;
					});
					mdata[mcat.Title] = values;
				});
				crosses[val] = mdata;
			});
			data[cat.Title] = crosses;
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
			var rowCatTitle = cat.Title;
			cat.Values.forEach(function(title, cpos) {
				var row = tbody.appendChild(createElement("tr")),
				    rowTitle = title;
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
					var columnCatTitle = mcat.Title;
					mcat.Values.forEach(function(val, i) {
						var elm = row.appendChild(createElement("td")),
						    cell = new Cell(elm),
						    columnTitle = val;
						cells.push(cell);
						elm.addEventListener("click", function() {
							if (this.Get() == 1) {
								this.Set(0);
							} else {
								this.Set(1);
							}
							this.Update();
						}.bind(cell, i));
						elm.addEventListener("contextmenu", function(e) {
							e.preventDefault();
							if (this.Get() == -1) {
								this.Set(0);
							} else {
								this.Set(-1);
							}
							this.Update();
						}.bind(cell));
						if (i == 0) {
							elm.setAttribute("class", "first");
						} else {
							elm.setAttribute("class", "");
						}
						cell.cats = Array(rowCatTitle, columnCatTitle);
						cell.vals = Array(rowTitle, columnTitle);
						elm.setAttribute("id", (rowCatTitle + ":" + rowTitle + "|" + columnCatTitle + ":" + columnTitle).toUpperCase().replace(/ /, "_"));
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
		Object.values(data).forEach(a => Object.values(a).forEach(b => Object.values(b).forEach(c => Object.keys(c).forEach(d => c[d].AddUnique(Object.keys(c).filter(e => e != d).map(f => c[f]))))));
		solver.textContent = "Solve";
		solver.addEventListener("click", function() {while(!this()||!rules.every(r => r())){}updateCells();}.bind(cells.every.bind(cells, cell => cell.Solve(data))));
		addRule.textContent = "Add Rule";
		addRule.addEventListener("click", (function() {
			var overlay = createElement("div"),
			    content = overlay.appendChild(createElement("div")),
			    close = content.appendChild(createElement("button")),
			    ongoing = content.appendChild(createElement("div")),
			    title = content.appendChild(createElement("h1")),
			    choices = content.appendChild(createElement("div")),
			    catA = "",
			    catAClick = function(c) {
				catA = c;
				ongoing.textContent = "In " + c;
				title.textContent = "First Pivot Category";
				clearNode(choices);
				Object.keys(data).filter(k => k != c).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catBClick.bind(null, cat));
				});
			    },
			    catB = "",
			    catBClick = function(c) {
				catB = c;
				ongoing.textContent += ", Category " + c;
				title.textContent = "First Pivot Row";
				clearNode(choices);
				Object.keys(data[c]).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", rowBClick.bind(null, cat));
				});
			    },
			    rowB = "",
			    rowBClick = function(c) {
				rowB = c;
				ongoing.textContent += ", Row " + c;
				title.textContent = "Method";
				clearNode(choices);
				Object.keys(modes).forEach(function(m) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = m;
					butt.addEventListener("click", modeClick.bind(null, m));
				});
			    },
			    modes = {
				"Adjacent To": adjacentTo,
				"Left/Up Of": leftOf,
				"Right/Down Of": function(catA, catB, rowB, catC, rowC) {return leftOf(catA, catC, rowC, catB, rowB);},
				"Before": before,
				"After": function(catA, catB, rowB, catC, rowC) {return before(catA, catC, rowC, catB, rowB);},
			    },
			    mode = function(){},
			    modeClick = function(c) {
				mode = modes[c];
				ongoing.textContent += ", is " + c + " ";
				title.textContent = "Second Pivot Category";
				clearNode(choices);
				Object.keys(data).filter(k => k != c).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catCClick.bind(null, cat));
				});
			    },
			    catC = "",
			    catCClick = function(c) {
				catC = c;
				ongoing.textContent += "Category " + c;
				title.textContent = "Second Pivot Row";
				clearNode(choices);
				Object.keys(data[c]).filter(k => c !== catB || k != rowB).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", rowCClick.bind(null, cat));
				});
			    },
			    rowC = "",
			    rowCClick = function(c) {
				    rowC = c;
				    ongoing.textContent += ", Row " + c + ".";
				    title.textContent = "";
				    clearNode(choices);
				    var butt = choices.appendChild(createElement("button"));
				    butt.textContent = "Add Rule";
				    butt.addEventListener("click", addRule);
			    },
			    none = function(){return true;},
			    addRule = function() {
				var t = rulesList.appendChild(createElement("tr")),
				    r = t.appendChild(createElement("td")),
				    remove = r.appendChild(createElement("button")),
				    n = rules.push(mode.bind(null, catA, catB, rowB, catC, rowC)) - 1,
				    desc = r.appendChild(createElement("span"));
				remove.textContent = "X";
				remove.addEventListener("click", function() {
					rulesList.removeChild(t);
					rules[n] = none;
				});
				desc.textContent = ongoing.textContent;
				close.click();
			    };
			overlay.setAttribute("id", "overlay");
			choices.setAttribute("id", "choices");
			close.addEventListener("click", document.body.removeChild.bind(document.body, overlay));
			close.innerText = "X";
			return function() {
				ongoing.textContent = "";
				clearNode(choices);
				title.textContent = "Main Category";
				Object.keys(data).forEach(function(cat) {
					var butt = choices.appendChild(createElement("button"));
					butt.textContent = cat;
					butt.addEventListener("click", catAClick.bind(null, cat));
				});
				document.body.appendChild(overlay);
			};
		}()));
		updateCells();
		document.body.appendChild(table);
		document.body.appendChild(solver);
		document.body.appendChild(addRule);
		document.body.appendChild(rulesList);
	});
});
