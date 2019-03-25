
var fScale_All;

/*
let fScale_Month_PT;
let fScale_Month_PX;
let fScale_Total_PX;

var g_nDisplayMode = 0;
let g_nLineType = 0;

var fScale_All_Relative;
var fScale_All_Individual;
*/

var fHeightScale = 0.9;

var g_nTotalCount_Max = 0;

var ALL_HEIGHT = COUNTRY_HEIGHT * 2;

function funcDraw_All_Main() {

	funcPageDisplayControl("span_id_options_all");

	// -----------------------

	g_vTotalIndex = [];

	for (let i = 1; i <= 2; i++) {

		g_vTotalIndex.push(i * 500 * Math.pow(10, 3));
	}

	// -----------------------------------------

	let d3LineInterpolate = (g_nLineType == 0)	? d3.curveLinear : d3.curveMonotoneX;

	nMonth_Min = d3.min(g_dsTouristsJOSM, function (d) { return d.month; });//"1101";
	nMonth_Max = d3.max(g_dsTouristsJOSM, function (d) { return d.month; });//"1809";

	let nMounth_Count = getMonthCount(nMonth_Min, nMonth_Max);

	//var nTotalCount_Max = d3.max(g_dsTouristsJOSM, function (d) { return d.total; });

	g_nTotalCount_Max = 0;
	
	for (let nType = 0; nType < vTouristType.length; nType++) {

		if (vTouristType[nType].path_display) {

			let nCount = d3.max(g_dsMonthes, function (d) { return d3.sum(d.values, vTouristType[nType].data); });

			if (g_nTotalCount_Max < nCount)
				g_nTotalCount_Max = nCount;
		}
	}

	// -------

	fScale_All = d3.scaleLinear()
							.domain([0, 1])
							.range([0, ALL_HEIGHT]);

	fScale_Month_PT = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([0, MAIN_WIDTH]);

	fScale_Month_PX = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([0, funcGetSVGMain_PX(MAIN_WIDTH)]);

	fScale_Total_PX = d3.scaleLinear()
							.domain([0, g_nTotalCount_Max])
							.range([0, funcGetSVGMain_PX(ALL_HEIGHT * fHeightScale)]);

	// ---------------------------------------------------------------

	let divOptions_Background = d3.select("#div_id_page_options_background");

	let divOptions = divOptions_Background.append("div")
												.attr("id", "div_id_page_options");

	funcDraw_CountriesDisplay_All(divOptions);

	funcDraw_LineType_All(divOptions);

	// -----------------------------------------------------------------------------------------------

	let svgMain = d3.select("#div_id_main")
					.append("svg")	
						.attr("id", "svg_id_main");

	let svgAll = svgMain.append("g")
							.attr("id", "g_id_all");

	//let d3_curve_type = d3.curveLinear;//d3.curveMonotoneX;//d3.curveLinear; //d3.curveBasis;

	for (let nType = 0; nType < vTouristType.length; nType++) {

		vTouristType[nType].fscale_rel = d3.line()
											.x(function(d_month) 
												{ 
													return fScale_Month_PX(getMonthCount(nMonth_Min, d_month.key)); 
												})
											.y(function(d_month) 
												{ 
													//let sum = d3.sum(d_month.values, vTouristType[nType].data(d_month.values));
													let funcSum = function(_d) { 

														let nCount = 0;

														switch (nType) {

															case TOURIST_TYPE_TOTAL: 			{ nCount = _d.total; break; }
															case TOURIST_TYPE_PLEASURE: 		{ nCount = _d.pleasure; break; }
															case TOURIST_TYPE_BUSINESS: 		{ nCount = _d.business + _d.conference + _d.exhibition; break; }
															case TOURIST_TYPE_VISIT_RELATIVES: 	{ nCount = _d.visit_relatives; break; }
															case TOURIST_TYPE_STUDY: 			{ nCount = _d.study; break; }
															case TOURIST_TYPE_OTHERS: 			{ nCount = _d.medical_treatment + _d.others + _d.unstated; break; }
														}

														return nCount; 
													};

													return funcGetSVGMain_PX(ALL_HEIGHT) - fScale_Total_PX(d3.sum(d_month.values, funcSum)); 
												})
												.curve(d3LineInterpolate);

		vTouristType[nType].line.push(
			[
				vTouristType[nType].fscale_rel(g_dsMonthes)
			]);
	}

	// -----------------------------------------------------------------------------------------------

	funcDraw_AllMonthes(svgAll, g_dsMonthes, 
						fScale_All, 
						fScale_Month_PT,
						fScale_Total_PX,
						vTouristType);

	svgAll.append("text")
					.attr("id", "text_id_month_title")
					.attr("class", "font_size_10 color_main")
					.attr("text-anchor", "start");

	svgAll.append("line")
					.attr("id", "line_id_month_select")
					.attr("class", "color_main");

	for (let idx in g_vTotalIndex) {

		idx_s = parseInt(idx) + 1;
	
		svgAll.append("text")
					.attr("id", "text_id_total_index_" + idx_s)
					.attr("class", "text_class_ruler font_size_10 color_main")
					.attr("text-anchor", "end");
	}

	funcDraw_AllCountryTitle(svgAll, g_dsTouristsJOSM,
						  fScale_Month_PT, 
						  fScale_Total_PX, 
						  fScale_All);

	$("#div_id_main").css("height", "400pt");
	$("#svg_id_main").css("height", "400pt");
}

function funcDraw_CountriesDisplay_All(divOptions) {

	for (let nType = 0; nType < vTouristType.length; nType++) {

		divOptions.append("span")
					.attr("id", "span_id_path_" + vTouristType[nType].id_name + "_display")
					.attr("class", "span_class_path_display span_class_options font_size_10")
					.text(vTouristType[nType].field_name);

		d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display")
				.style("border-color", vTouristType[nType].color);

		let cColor = (vTouristType[nType].path_display) ? COLOR_BACKGROUND : vTouristType[nType].color;
		let cBorderColor = (vTouristType[nType].path_display) ? vTouristType[nType].color : COLOR_BACKGROUND;

		d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display")
				.style("color", cColor)
				.style("background-color", cBorderColor)

		$("#span_id_path_" + vTouristType[nType].id_name + "_display").mouseover(function() {
  
  			if (!vTouristType[nType].path_display) {
				$(this).css("color", COLOR_BACKGROUND)
						.css("background-color", vTouristType[nType].color);
  			}
		});

		$("#span_id_path_" + vTouristType[nType].id_name + "_display").mouseout(function() {
  
  			if (!vTouristType[nType].path_display) {
				$(this).css("color", vTouristType[nType].color)
						.css("background-color", COLOR_BACKGROUND);
			}
		});

		$("#span_id_path_" + vTouristType[nType].id_name + "_display").click(function() {

			vTouristType[nType].path_display = !vTouristType[nType].path_display;

			{
				let fOpacity = (vTouristType[nType].path_display) ? 1 : 0;

				d3.selectAll(".path_" + vTouristType[nType].id_name)
					.attr("stroke-opacity", fOpacity);
			}

			{
				let cColor = (vTouristType[nType].path_display) ? COLOR_BACKGROUND : vTouristType[nType].color;
				let cBorderColor = (vTouristType[nType].path_display) ? vTouristType[nType].color : COLOR_BACKGROUND;

				d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display")
						.style("color", cColor)
						.style("background-color", cBorderColor)
			}

			// -------

			funcDraw_All();
		});
	}
}

function funcDraw_LineType_All(divOptions) {
	
	divOptions.append("span")
				.attr("id", "span_id_options_line_type_all")
				.attr("class", "span_class_options font_size_10 color_main")
				.text((g_nLineType == 0) ? "Show Curve" : "Show Straight");

	$('#span_id_options_line_type_all').click(function() { 

		g_nLineType = (g_nLineType == 0) ? 1 : 0;

		if (g_nLineType == 1) {

			$(this).html("Show Straight");

		} else {

			$(this).html("Show Curve");
		}

		funcDraw_All();
	});
}

function funcDraw_AllMonthes(svgAll, d, 
							 fScale_All, 
							 fScale_Month_PT,
							 fScale_Total_PX,
						   	 vTouristType) {

	let stroke_opacity_s = 1.0;//0.8;
	let stroke_opacity_e = 1.0;//0.6;

	let monthes = g_nAllCountrysCount;
	
	// -------

	let svgMonthes = svgAll.append("svg")
								.attr("id", "svg_id_all_visitors")
								.attr("class", "svg_class_monthes")
								.attr("width", MAIN_WIDTH + "pt")
								.attr("height", (ALL_HEIGHT * 2) + "pt")
								.attr("x", 0 + "pt")
								.attr("y", fScale_All(0) + "pt");

	{
		svgMonthes.append("line")
						.attr("id", "line_id_zero")
						.attr("class", "color_total")
						.attr("x1", fScale_Month_PT(getMonthCount(nMonth_Min, d[0].key)) + "pt")
						.attr("y1", function(d_month) { return (ALL_HEIGHT) + "pt"; })
						.attr("x2", fScale_Month_PT(getMonthCount(nMonth_Min, d[d.length - 1].key)) + "pt")
						.attr("y2", function(d_month) { return (ALL_HEIGHT) + "pt"; });
	}

	// -------

	for (let nType = 0; nType < vTouristType.length; nType++) {

		//if (vTouristType[nType].path_display) {

			let fStrokeOpacity = (vTouristType[nType].path_display) ? 1 : 0;

			svgMonthes.append("path")
						.attr("class", ("path_" + vTouristType[nType].id_name) + " " + vTouristType[nType].class_name_path + " " + vTouristType[nType].class_name_color)
						.attr("d", vTouristType[nType].line[0][0])
						.attr("stroke-opacity", fStrokeOpacity);
		//}
	}

	// -------

	svgMonthes.selectAll("circle.circle_class_month_all")
		.data(d)
		.enter()
			.append("circle")
				.attr("class", "color_main circle_class_month_all")
				.attr("cx", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.key)) + "pt"; })
				.attr("cy", function(d_month) { return (ALL_HEIGHT) + "pt"; })
				.attr("opacity", 0)
				.attr("r", 0.5 + "pt");
			
	// ------- 

	svgMonthes.selectAll("line.month_all")
		.data(d)
		.enter()
			.append("line")
				.attr("class", "line_class_month color_main month_all")
				.attr("x1", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.key)) + "pt"; })
				.attr("y1", function(d_month) { return ALL_HEIGHT + "pt"; })
				.attr("x2", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.key)) + "pt"; })
				.attr("y2", function(d_month) { return 0 + "pt"; })
				.on("mouseover", function (d_month) {

					showMonthCircles_All();

					let formatNumStr = d3.format(",");
					let formatPercent = d3.format(".2p");

					let pt_x = fScale_Month_PT(getMonthCount(nMonth_Min, d_month.key));

					let text_anchor = (pt_x < MAIN_WIDTH / 2) ? "start" : "end";
					let text_anchor_rev = (pt_x < MAIN_WIDTH / 2) ? "end" : "start";
					let pt_x_text = pt_x;//pt_x + ((pt_x < MAIN_WIDTH / 2) ? 5 : -5);
					let pt_x_text_rev = pt_x + ((pt_x < MAIN_WIDTH / 2) ? -5 : 5);

					d3.select("#line_id_month_select")
						.attr("x1", pt_x + "pt")
						.attr("y1", fScale_All(0) + "pt")
						.attr("x2", pt_x + "pt")
						.attr("y2", fScale_All(0) + ALL_HEIGHT + "pt");

					let formatS = d3.format(".0s");
					let formatS_2 = d3.format(".3s");

					for (let idx in g_vTotalIndex) {

						let idx_s = parseInt(idx) + 1;

						if (g_vTotalIndex[idx] < g_nTotalCount_Max) {
							//y = (fScale_All(0) + ALL_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
						} else if (idx_s == 1) {
							g_vTotalIndex[idx] = g_nTotalCount_Max / (idx_s + 1);
						} else {
							break;
						}
							
						y = (fScale_All(0) + ALL_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
						text = formatS(g_vTotalIndex[idx]);

						//let y = (fScale_All(0) + ALL_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
						//let text = formatS(g_vTotalIndex[idx]);

						d3.select("#text_id_total_index_" + idx_s)
							.attr("x", pt_x + ((pt_x < MAIN_WIDTH / 2) ? 5 : -5) + "pt")
							.attr("y", y + "pt")
							.attr("text-anchor", text_anchor)
							.text(text);
					}

					let nYear = d_month.key.toString().substring(0, 2);
					let nMonth = d_month.key.toString().substring(2, 4);
					
					let sMonth = d3.timeFormat("%b")(new Date(nYear, (nMonth - 1)));

					let sMonthYear = (sMonth  + ". '" + nYear);

					d3.select("#text_id_month_title")
						.attr("x", pt_x_text + "pt")
						.attr("y", (fScale_All(0) + ALL_HEIGHT + 12) + "pt")
						.attr("text-anchor", text_anchor)
						.text(sMonthYear);

					d3.select("#text_id_month_subtitle").remove();

					let nTotal = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_TOTAL].data);
					let nPleasure = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_PLEASURE].data);
					let nBusiness = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_BUSINESS].data);
					let nVisitRelatives = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_VISIT_RELATIVES].data);
					let nStudy = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_STUDY].data);
					let nOthers = d3.sum(d_month.values, vTouristType[TOURIST_TYPE_OTHERS].data);

					svgAll.append("text")
									.attr("id", "text_id_month_subtitle")
									.attr("class", "font_size_10 color_main")
									.attr("x", pt_x_text + "pt")
									.attr("y", (fScale_All(0) + ALL_HEIGHT + 25) + "pt")
									.attr("text-anchor", text_anchor)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_TOTAL].path_display) ? formatNumStr(nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_TOTAL].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_PLEASURE].path_display) ? formatNumStr(nPleasure) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_PLEASURE].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_BUSINESS].path_display) ? formatNumStr(nBusiness) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_BUSINESS].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_VISIT_RELATIVES].path_display) ? formatNumStr(nVisitRelatives) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_VISIT_RELATIVES].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_STUDY].path_display) ? formatNumStr(nStudy) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_STUDY].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_OTHERS].path_display) ? formatNumStr(nOthers) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_OTHERS].color)
										.append("tspan")
											.text("visited")
											.attr("fill", COLOR_MAIN);

					d3.select("#text_id_month_subtitle_2").remove();

					svgAll.append("text")
									.attr("id", "text_id_month_subtitle_2")
									.attr("class", "font_size_10 color_main")
									.attr("x", pt_x_text + "pt")
									.attr("y", (fScale_All(0) + ALL_HEIGHT + 36) + "pt")
									.attr("text-anchor", text_anchor)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_TOTAL].path_display) ? formatNumStr(nTotal) + " " : "")
											.attr("fill", COLOR_BACKGROUND)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_PLEASURE].path_display) ? formatPercent(nPleasure / nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_PLEASURE].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_BUSINESS].path_display) ? formatPercent(nBusiness / nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_BUSINESS].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_VISIT_RELATIVES].path_display) ? formatPercent(nVisitRelatives / nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_VISIT_RELATIVES].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_STUDY].path_display) ? formatPercent(nStudy / nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_STUDY].color)
										.append("tspan")
											.text((vTouristType[TOURIST_TYPE_OTHERS].path_display) ? formatPercent(nOthers / nTotal) + " " : "")
											.attr("fill", vTouristType[TOURIST_TYPE_OTHERS].color)
										.append("tspan")
											.text("visited")
											.attr("fill", COLOR_BACKGROUND);

			    })
				.on("mouseout", function (d_month) {

					hideMonthCircles_All();
			    });

	// ----------------------------

	for (let y = 12; y <= 18; y++) {

		svgMonthes.append("text")
					.attr("class", "text_class_month_year_all font_size_10 color_main")
					.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(y + "01"))) + "pt")
					.attr("y", ALL_HEIGHT + 12 + "pt")
					.text("'" + y);
	}
}

function funcDraw_AllCountryTitle(svgAll, d, 
								fScale_Month_PT, 
								fScale_Total_PX, 
								fScale_All) {

	let padding_top = 40;
	let text_spacing = 18;
	let title_font_size = 10;

	let text_x = PADDING_LEFT;
	let text_y = fScale_All(0) + padding_top;

	let formatNumStr = d3.format(",");
	let formatPercent = d3.format(".2p");

	svgCountry_title = svgAll.append("g")
								.attr("class", "country_title")
								.on("mouseover", function (d_month) {

									showMonthCircles_All();
								})
								.on("mouseout", function (d_month) {

									hideMonthCircles_All();
							    });

	// draw text
	{
		svgCountry_title.append("text")
							.attr("class", "text_class_country_title font_size_16 color_main")
							.attr("x", text_x + "pt")
							.attr("y", text_y + title_font_size + "pt") 
							.text("Jan. '11 - Sep. '18");

		svgCountry_title.append("text")
							.attr("class", "text_class_month_subtitle font_size_12 color_main")
							.attr("x", text_x + "pt")
							.attr("y", text_y + title_font_size + text_spacing + "pt") 
							.text(formatNumStr(d3.sum(d, function (d) { return d.total; })) + " visited");
	}
}

function showMonthCircles_All() {

	d3.selectAll("circle.circle_class_month_all")
		.attr("opacity", 0.4);

	//d3.selectAll("text.text_class_month_year_all")
	//	.attr("opacity", 0.4);
}

function hideMonthCircles_All() {

	d3.selectAll("circle.circle_class_month_all")
		.attr("opacity", 0);

	//d3.selectAll("text.text_class_month_year_all")
	//	.attr("opacity", 0);

	d3.select("#text_id_month_title")
		.attr("x", -100 + "pt")
		.attr("y", -100 + "pt");

	d3.select("#text_id_month_subtitle")
		.attr("x", -100 + "pt")
		.attr("y", -100 + "pt");

	d3.select("#text_id_month_subtitle_2")
		.attr("x", -100 + "pt")
		.attr("y", -100 + "pt");

	d3.select("#line_id_month_select")
		.attr("x1", -100 + "pt")
		.attr("y1", -100 + "pt")
		.attr("x2", -100 + "pt")
		.attr("y2", -100 + "pt");

	d3.selectAll(".text_class_ruler")
		.attr("x", -100 + "pt")
		.attr("y", -100 + "pt");
}
