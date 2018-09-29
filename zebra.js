"use strict";
window.addEventListener("load", function() {
	const createHTML = (function() {
		const ns = document.getElementsByTagName("html")[0].namespaceURI,
		      childrenArr = function(elem, children) {
			if (typeof children === "string") {
				children.split("\n").forEach((child, n) => {
					if (n > 0) {
						elem.appendChild(document.createElementNS(ns, "br"))
					}
					elem.appendChild(document.createTextNode(child));
				});
			} else if (children) {
				if (children.hasOwnProperty("length")) {
					Array.from(children).forEach(c => childrenArr(elem, c));
				} else if (children instanceof Node) {
					elem.appendChild(children);
				}
			}
		      };
		return function(element, properties, children) {
			const elem = typeof element === "string" ? document.createElementNS(ns, element) : element;
			if (typeof properties === "string") {
				[properties, children] = [children, properties];
			}
			if (typeof properties === "object") {
				Object.keys(properties).forEach(k => {
					let prop = properties[k];
					if (prop !== undefined) {
						if (k.substr(0, 2) === "on" && typeof prop === "function") {
							elem.addEventListener(k.substr(2), prop.bind(elem));
						} else {
							elem.setAttribute(k, prop)
						}
					}
				});
			}
			childrenArr(elem, children);
			return elem;
		};
	      }()),
	      clearElement = function(elem) {
		while (elem.hasChildNodes()) {
			elem.removeChild(elem.lastChild);
		}
	      },
	      info = createHTML("div", {"id": "info"}),
	      addCategory = document.body.appendChild(createHTML(
		"button",
		"Add Category",
		{
			"onclick": function() {
				info.appendChild(createHTML(
					"div",
					{},
					[
						createHTML(
							"button",
							{
								"class": "closer",

								"onclick": function() {
									info.removeChild(this.parentNode);
								}
							},
							"X"
						),
						createHTML(
							"input",
							{
								"onfocus": function() {
									this.removeAttribute("class");
								}
							}
						),
						createHTML(
							"ol",
							{},
							Array.from({"length": numRows}, () => createHTML("li", {}, createHTML(
								"input",
								{
									"onfocus": function() {
										this.removeAttribute("class");
									}
								}
							)))
						)
					]
				));
			}
		}
	      ));
	let numRows = 2;
	document.body.appendChild(createHTML(
		"button",
		"Add Row",
		{
			"onclick": function() {
				numRows++;
				Array.from(info.getElementsByTagName("ol")).forEach(ol => ol.appendChild(createHTML(
					"li",
					{},
					createHTML(
						"input",
						{
							"onfocus": function() {
								this.removeAttribute("class");
							}
						}
					)
				)))
			}
		}
	));
	document.body.appendChild(createHTML(
		"button",
		"Remove Row",
		{
			"onclick": function() {
				if (numRows > 0) {
					numRows--;
					Array.from(info.getElementsByTagName("ol")).forEach(ol => ol.hasChildNodes() && ol.removeChild(ol.lastChild));
				}
			}
		}
	));
	document.body.appendChild(info);
	Array.from({length: 3}, addCategory.click.bind(addCategory));
	document.body.insertBefore(createHTML("button",	"Start", {"onclick": function() {
		if (info.childElementCount < 3 || numRows < 2) {
			alert("Need a minimum of 3 categories and 2 rows");
			return;
		}
		const categories = Array.from(info.getElementsByTagName("div"), cat => {
			const inputs = Array.from(cat.getElementsByTagName("input"));
			return {"Title": inputs[0].value, "Values": inputs.slice(1).map(input => input.value)};
		      });
		if (
			!categories.map(cat => cat.Title.replace(/[ |:]/, "_").toUpperCase()).map((cat, i, arr) => {
				if (arr.indexOf(cat) !== i) {
					info.getElementsByTagName("div")[i].getElementsByTagName("input")[0].setAttribute("class", "error");
					return false;
				}
				return true;
			}).reduce((acc, val) => val && acc) ||
			!categories.map((cat, i) => cat.Values.map(row => row.replace(/[ |:]/, "_").toUpperCase()).map((row, j, arr) => {
				if (arr.indexOf(row) !== j) {
					info.getElementsByTagName("div")[i].getElementsByTagName("input")[j+1].setAttribute("class", "error");
					return false;
				}
				return true;
			}).reduce((acc, val) => acc && val)).reduce((acc, val) => acc && val)
		) {
			return;
		}
		const rulesList = createHTML("table"),
		      rules = [],
		      cells = [],
		      updateCells = cells.forEach.bind(cells, c => c.Update()),
		      reduceObj = (acc, val) => Object.assign(acc, val),
		      data = categories.map(cat => new Object({
			[cat.Title]: cat.Values.map(val => new Object({
				[val]: categories.filter(mcat => mcat != cat).map(mcat => new Object({
					[mcat.Title]: mcat.Values.map(n => new Object({[n]: null})).reduce(reduceObj, {})
				})).reduce(reduceObj, {})
			})).reduce(reduceObj, {})
		      })).reduce(reduceObj, {}),
		      reduceBool = (acc, val) => acc || val,
		      blankPivot = (function() {
			const cats = categories.map(cat => cat.Title),
			      rows = cats.reduce((rows, cat, i) => {rows[cat] = categories[i].Values; return rows;}, {}),
			      mask = (catA, catB, rowB) => rows[catA].map(rowA => data[catB][rowB][catA][rowA].Get() === 0 ? 1 : 0).reduce((mask, val, i) => mask |= val << i);
			return function() {
				return cats.map(
					catA => cats.filter(
						catB => catB != catA
					).map(
						catB => Object.keys(data[catB]).map(
							rowB => {
								const mMask = mask(catA, catB, rowB);
								if (mMask > 0) {
									return categories.map(
										cat => cat.Title
									).filter(
										cat => cat !== catA && cat !== catB
									).map(
										catC => Object.keys(data[catC]).filter(
											rowC => {
												const m = mask(catA, catC, rowC)
												return m > 0 && (m & mMask) === 0;
											}
										).map(
											rowC => {
												if (data[catB][rowB][catC][rowC].Get() === 0) {
													data[catB][rowB][catC][rowC].Set(-1);
													return true;
												}
												return false;
											}
										).reduce(reduceBool, false)
									).reduce(reduceBool, false)
								}
								return false;
							}
						).reduce(reduceBool, false)
					).reduce(reduceBool, false)
				).reduce(reduceBool, false);
			};
		      }()),
		      re = /[ :|]/g;
		class Cell {
			constructor(elm, cats, vals) {
				this.cell = elm;
				this.cats = cats;
				this.vals = vals;
				this.unique = [];
				this.value = 0;
			}
			Get() {
				return this.value;
			}
			Set(val) {
				this.value = val;
			}
			Update() {
				this.cell.setAttribute("class", (this.cell.getAttribute("class").includes("first") ? "first " : "") + (this.value == 1 ? "on" : (this.value == -1 ? "off" : "")));
			}
			AddUnique(group) {
				this.unique.push(group);
			}
			Solve(data) {
				let changed = false;
				const self = this;
				if (this.Get() === 0) {
					if (this.unique.some(u => u.every(cell => cell.Get() === -1))) {
						this.Set(1);
						changed = true;
					} else if (this.unique.some(u => u.filter(cell => cell.Get() === 1).length === 1)) {
						this.Set(-1);
						changed = true;
					}
				}
				if (this.Get() === 1) {
					Object.keys(data[this.cats[0]][this.vals[0]]).filter(k => k !== this.cats[1]).forEach(k => Object.keys(data[this.cats[0]][this.vals[0]][k]).forEach(function(j) {
						const valA = data[self.cats[0]][self.vals[0]][k][j],
						      valB = data[self.cats[1]][self.vals[1]][k][j];
						if (valA.Get() !== 0 && valB.Get() === 0) {
							valB.Set(valA.Get());
							changed = true;
						} else if (valB.Get() !== 0 && valA.Get() === 0) {
							valA.Set(valB.Get());
							changed = true;
						}
					}));
				}
				return changed;
			}
			Sanity() {
				switch (this.Get()) {
				case -1:
					if (this.unique.some(u => u.every(cell => cell.Get() === -1))) {
						return false;
					}
					break;
				case 1:
					if (this.unique.some(u => u.some(cell => cell.Get() === 1))) {
						return false;
					}
					break;
				}
				return true;
			}
		}

		clearElement(document.body);
		document.body.appendChild(createHTML(
			"table",
			{},
			[
				createHTML(
					"thead",
					{},
					[
						createHTML(
							"tr",
							{},
							[
								createHTML("td", {"colspan": "2", "rowspan": "2"}),
								categories.slice(1).map(
									cat => createHTML(
										"th",
										{"colspan": numRows},
										cat.Title
									)
								)
							]
						),
						createHTML(
							"tr",
							{},
							categories.slice(1).map(
								cat => cat.Values.map(
									(title, pos) => createHTML(
										"th",
										pos === 0 ? {"class": "first"} : {},
										createHTML("div", title)
									)
								)
							)
						)
					]
				),
				createHTML(
					"tbody",
					{},
					categories.slice(2).concat(categories[0]).reverse().map((cat, pos) => cat.Values.map((title, cpos) => createHTML(
						"tr",
						cpos === 0 ? {"class": "first"} : {},
						[
							cpos === 0 ? [
								createHTML(
									"th",
									{
										"class": "cat",
										"rowspan": numRows
									},
									createHTML(
										"div",
										cat.Title
									)
								)
							] : [],
							createHTML(
								"th",
								cpos === 0 ? {"class": "first"} : {},
								title
							),
							categories.slice(1, categories.length - pos).map(mcat => mcat.Values.map((val, i) => {
								const elm = createHTML(
									"td",
									{
										"class": i === 0 ? "first" : "",
										"id": (cat.Title.replace(re, "_") + ":" + title.replace(re, "_") + "|" + mcat.Title.replace(re, "_") + ":" + val.replace(re, "_")).toUpperCase(),

										"onclick": function() {
											if (cell.Get() === 1) {
												cell.Set(0);
											} else {
												cell.Set(1);
											}
											cell.Update();
										},
										"oncontextmenu": function(e) {
											e.preventDefault();
											if (cell.Get() == -1) {
												cell.Set(0);
											} else {
												cell.Set(-1);
											}
											cell.Update();
										}
									}
								      ),
								      cell = new Cell(elm, [cat.Title, mcat.Title], [title, val]);
								cells.push(cell);
								data[cat.Title][title][mcat.Title][val] = cell;
								data[mcat.Title][val][cat.Title][title] = cell;
								return elm;
							})),
							pos === 0 ? [] : [
								createHTML(
									"td",
									{
										"class": "span",
										"colspan": pos * numRows
									}
								)
							]
						]
					)))
				)
			]
		));
		document.body.appendChild(createHTML(
			"button",
			"Solve",
			{
				"onclick": function() {
					if (cells.filter(cell => !cell.Sanity()).length > 0) {
						alert("Invalid State");
						return;
					}
					while(cells.map(cell => cell.Solve(data)).reduce(reduceBool, false) || rules.map(r => r()).reduce(reduceBool, false) || blankPivot()){}
					if (cells.filter(cell => !cell.Sanity()).length > 0) {
						alert("Invalid State");
					}
					updateCells();
				}
			}
		));
		document.body.appendChild(createHTML(
			"button",
			"Add Rule",
			{
				"onclick": (function() {
					const ruleFunc = function(catA, catB, rowB, catC, rowC, not, leftRight, far) {
						let changed = false;
						const dataB = data[catB][rowB][catA],
						      dataC = data[catC][rowC][catA];
						[[dataB, dataC], [dataC, dataB]].forEach(data => {
							Object.keys(data[0]).forEach(function(val, num) {
								if (data[0][val].Get() !== 0) {
									return;
								}
								let possibleCells = [];
								if (leftRight > -1) {
									if (far < 0) {
										possibleCells = possibleCells.concat(Array(-far).fill(0).map((v, n) => num - n - 1));
									} else {
										possibleCells.push(num - far);
									}
								}
								if (leftRight < 1) {
									if (far < 0) {
										possibleCells = possibleCells.concat(Array(-far).fill(0).map((v, n) => n + num + 1));
									} else {
										possibleCells.push(num + far);
									}
								}
								possibleCells = possibleCells.filter(n => n >= 0 && n < numRows);
								if (not) {
									possibleCells = Array(numRows).fill(0).map((v, n) => n).filter(n => !possibleCells.includes(n));
								}
								if (possibleCells.every(c => data[1][Object.keys(data[1])[c]].Get() === -1)) {
									data[0][val].Set(-1);
									changed = true;
								}
							})
							leftRight = -leftRight;
						});
						return changed;
					      },
					      none = function() {},
					      enableButton = function() {
						if ([0, 1, 2, 6, 7].every(n => selects[n].selectedIndex > 0)) {
							done.removeAttribute("disabled");
						}
					      },
					      writeRule = function() {
						ruleParts[3].textContent = (not.checked ? "Not " : "") + (selects[3].selectedIndex > 0 && selects[4].selectedIndex === 0 && selects[5].selectedIndex === 0 ? "Adjacent To" : (selects[3].selectedIndex > 0 ? selects[3].value + " " + (selects[4].selectedIndex + 1) + " " : "") + selects[5].value);
					      },
					      catFrag = createHTML(
						new DocumentFragment(),
						{},
						categories.map(cat => createHTML(
							"option",
							 {
							 	"value": cat.Title
							 },
							 cat.Title
						))
					      ),
					      valFrag = createHTML(
						new DocumentFragment(),
						{},
						categories.map(cat => createHTML(
							"optgroup",
							{
								"label": cat.Title
							},
							cat.Values.map(v => createHTML("option", {"value": v}, v))
						))
					      ),
					      overlay = createHTML(
						"div",
						{
						      "id": "overlay"
						},
						[
							createHTML(
								"div",
								{},
								[
									createHTML(
										"button",
										"X",
										{
											"id": "closer",

											"onclick": function() {
												document.body.removeChild(overlay);
											}
										}
									),
									createHTML("h1", "Add Rule"),
									createHTML(
										"div",
										{
											"id": "rule",
										},
										["In Category ", "Category A", ", Category ", "Category B", ", Row ", "Row B", " is ", "Rule", " Category ", "Category C", ", Row ", "Row C", "."].map((t, n) => (n & 1) == 0 ? t : createHTML("span", {"title": t}, "???")),
									),
									[
										[
											"Category A",
											function() {
												if (this.selectedIndex === 0) {
													return;
												}
												this.childNodes[0].setAttribute("disabled", "disabled");
												this.childNodes[0].style.display = "none";
												[selects[1], selects[6]].forEach(s => {
													s.removeAttribute("disabled");
													Array.from(s.childNodes).forEach(n => n.removeAttribute("disabled"));
													s.childNodes[this.selectedIndex].setAttribute("disabled", "disabled");
												});
												ruleParts[0].textContent = this.childNodes[this.selectedIndex].getAttribute("value");
												enableButton();
											},
											[
												createHTML(
													"option",
													"--Choose Main Category--"
												),
												catFrag.cloneNode(true)
											]
										],
										[
											"Category B",
											function() {
												if (this.selectedIndex === 0) {
													return;
												}
												this.childNodes[0].setAttribute("disabled", "disabled");
												this.childNodes[0].style.display = "none";
												Array.from(selects[2].childNodes).forEach(n => n.style.display = "none");
												selects[2].childNodes[this.selectedIndex].style.display = "";
												selects[2].removeAttribute("disabled");
												selects[2].selectedIndex = 0;
												ruleParts[1].textContent = this.childNodes[this.selectedIndex].getAttribute("value");
												ruleParts[2].textContent = "???";
												enableButton();
											},
											[
												createHTML(
													"option",
													"--Choose Second Category--"
												),
												catFrag.cloneNode(true)
											]
										],
										[
											"Value B",
											function() {
												if (this.selectedIndex === 0) {
													return;
												}
												this.childNodes[0].setAttribute("disabled", "disabled");
												this.childNodes[0].style.display = "none";
												Array.from(selects[7].childNodes).filter((v, i) => i != 0).forEach(n => n.childNodes.forEach(m => m.removeAttribute("disabled")));
												selects[7].getElementsByTagName("option")[this.selectedIndex].setAttribute("disabled", "disabled");
												ruleParts[2].textContent = this.getElementsByTagName("option")[this.selectedIndex].getAttribute("value");
												enableButton();
											},
											[
												createHTML(
													"option",
													"--Choose Category Row--"
												),
												valFrag.cloneNode(true)
											]
										],
										[
											"Not",
											writeRule
										],
										[
											"Within",
											function() {
												switch (this.selectedIndex) {
												case 0:
													selects[5].firstChild.textContent = "On One Side Of";
													break;
												case 1:
													selects[5].firstChild.textContent = "Of";
													break;
												case 2:
													selects[5].firstChild.textContent = "From";
													break;
												}
												selects[5].firstChild.value = selects[5].firstChild.textContent;
												if (this.selectedIndex === 0) {
													selects[4].setAttribute("disabled", "disabled");
												} else {
													selects[4].removeAttribute("disabled");
												}
												writeRule();
											},
											["", "Within", "Exactly"].map(t => createHTML("option", {"value": t}, t))
										],
										[
											"Distance",
											writeRule,
											Array.from({"length": numRows}, (v, n) => (n+1).toString()).map(n => createHTML("option", {"value": n}, n))
										],
										[
											"Direction",
											writeRule,
											["", "After", "Before"].map(t => createHTML("option", {"value": t}, t))
										],
										[
											"Category C",
											function() {
												if (this.selectedIndex === 0) {
													return;
												}
												this.childNodes[0].setAttribute("disabled", "disabled");
												this.childNodes[0].style.display = "none";
												Array.from(selects[7].childNodes).forEach(n => n.style.display = "none");
												selects[7].childNodes[this.selectedIndex].style.display = "";
												selects[7].removeAttribute("disabled");
												selects[7].selectedIndex = 0;
												ruleParts[4].textContent = this.childNodes[this.selectedIndex].getAttribute("value");
												ruleParts[5].textContent = "???";
												enableButton();
											},
											[
												createHTML(
													"option",
													"--Choose Third Category--"
												),
												catFrag.cloneNode(true)
											]
										],
										[
											"Value C",
											function() {
												if (this.selectedIndex === 0) {
													return;
												}
												this.childNodes[0].setAttribute("disabled", "disabled");
												this.childNodes[0].style.display = "none";
												Array.from(selects[2].childNodes).filter((v, i) => i != 0).forEach(n => n.childNodes.forEach(m => m.removeAttribute("disabled")));
												selects[2].getElementsByTagName("option")[this.selectedIndex].setAttribute("disabled", "disabled");
												ruleParts[5].textContent = this.getElementsByTagName("option")[this.selectedIndex].getAttribute("value");
												enableButton();
											},
											[
												createHTML(
													"option",
													"--Choose Category Row--"
												),
												valFrag.cloneNode(true)
											]
										],
									].map(p => [
										createHTML(
											"label",
											{
												"for": p[0].split(" ").map((v, i) => i === 0 ? v.toLowerCase() : v).join("")
											},
											p[0]
										),
										createHTML(
											p[0] === "Not" ? "input" : "select",
											{
												"id": p[0].split(" ").map((v, i) => i === 0 ? v.toLowerCase() : v).join(""),
												"type": p[0] === "Not" ? "checkbox" : undefined,

												"onchange": p[1],
											},
											p[2]
										),
										createHTML("br")
									]),
									createHTML(
										"button",
										"Add",
										{
											"disabled": "disabled",
											"id": "done",

											"onclick": function() {
												const n = rules.push(ruleFunc.bind(null, selects[0].value, selects[1].value, selects[2].value, selects[6].value, selects[7].value, not.checked, selects[5].selectedIndex === 2 ? -1: selects[5].selectedIndex, selects[3].selectedIndex === 0 ? -numRows : (selects[4].selectedIndex + 1) * (selects[4].selectedIndex === 1 ? -1 : 1))) - 1;
												rulesList.appendChild(createHTML(
													"tr",
													{},
													createHTML(
														"td",
														{},
														[
															createHTML(
																"button",
																"X",
																{
																	"onclick": function() {
																		rulesList.removeChild(this.parentNode.parentNode);
																		rules[n] = none;
																	}
																}
															),
															createHTML(
																"span",
																document.getElementById("rule").textContent
															)
														]
													)
												));
												closer.click();
											}
										}
									)
								]
							)
						]
					      ),
					      ruleParts = Array.from(overlay.getElementsByTagName("span")),
					      selects = Array.from(overlay.getElementsByTagName("select")),
					      not = overlay.getElementsByTagName("input")[0];
					return function() {
						ruleParts.forEach(t => t.textContent = "???");
						selects[0].childNodes[0].style.display = "";
						selects[0].childNodes[0].removeAttribute("disabled");
						selects[0].selectedIndex = 0;
						[1, 2, 6, 7].map(n => selects[n]).forEach(s => {
							s.setAttribute("disabled", "disabled");
							s.style.display = "";
							s.selectedIndex = 0;
							Array.from(s.childNodes).forEach(o => {
								o.removeAttribute("disabled")
								o.style.display = "";
								Array.from(o.childNodes).filter(op => op.nodeType !== 3).forEach(op => {
									op.removeAttribute("disabled");
								});
							});
						});
						not.checked = false;
						selects[3].selectedIndex = 0;
						selects[4].selectedIndex = 0;
						selects[5].selectedIndex = 0;
						selects[4].setAttribute("disabled", "disabled");
						selects[5].firstChild.textContent = "On One Side Of";
						selects[5].firstChild.value = selects[5].firstChild.textContent;
						overlay.firstChild.lastChild.setAttribute("disabled", "disabled");
						writeRule();
						document.body.appendChild(overlay);
					};
				}())
			}
		));
		document.body.appendChild(rulesList);

		Object.values(data).forEach(a => Object.values(a).forEach(b => Object.values(b).forEach(c => Object.keys(c).forEach(d => c[d].AddUnique(Object.keys(c).filter(e => e != d).map(f => c[f]))))));
	}}), document.body.insertBefore(createHTML("br"), info));
});
