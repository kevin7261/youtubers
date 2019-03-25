
var fScale_Country;
var fScale_Month_PT;
var fScale_Month_PX;
var fScale_Total_PX;

var vCountryRulerMax = [];
var vfScale_Total_PX_Country = [];

var g_fHeightScale = 0.8;

var g_nTotalCount_Max = 0;

function funcDraw_ByCountry_Main() {

	g_fHeightScale = 0.8;

	funcPageDisplayControl("span_id_options_by_country");

	// -----------------------

	g_vTotalIndex = [];

	for (let i = 1; i <= 2; i++) {

		g_vTotalIndex.push(i * 250 * Math.pow(10, 3) * g_fHeightScale);//g_vTotalIndex.push(i * 5 * Math.pow(10, 6));
	}

	for (let i in g_dsCountries) {

		g_vDisplayMode.push(0);
	}

	// -----------------------------------------

	let d3LineInterpolate = (g_nLineType == 0)	? d3.curveLinear : d3.curveMonotoneX;

	let nMounth_Count = getMonthCount(nMonth_Min, nMonth_Max);

	//g_nTotalCount_Max = d3.max(g_dsTouristsJOSM, function (d) { return d.total; });

	g_nTotalCount_Max = 0;
	
	for (let nType = 0; nType < vTouristType.length; nType++) {

		if (vTouristType[nType].path_display) {
		
			let nCount = d3.max(g_dsTouristsJOSM, vTouristType[nType].data);

			if (g_nTotalCount_Max < nCount)
				g_nTotalCount_Max = nCount;
		}
	}

	// ---------------------------------------------------------------

	fScale_Country = d3.scaleLinear()
							.domain([0, g_dsCountries.length])
							.range([0, COUNTRY_HEIGHT * g_dsCountries.length]);

	fScale_Month_PT = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([0, MAIN_WIDTH]);

	fScale_Month_PX = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([0, funcGetSVGMain_PX(MAIN_WIDTH)]);

	fScale_Total_PX = d3.scaleLinear()
							.domain([0, g_nTotalCount_Max])
							.range([0, funcGetSVGMain_PX(COUNTRY_HEIGHT * g_fHeightScale)]);

	// ---------------------------------------------------------------

	let divOptions_Background = d3.select("#div_id_page_options_background");

	let divOptions = divOptions_Background.append("div")
												.attr("id", "div_id_page_options");

	funcDraw_CountriesDisplay(divOptions);

	displayOptions(g_bShowOptions = false);

	funcDraw_DisplayMode(divOptions);

	funcDraw_LineType(divOptions);

	funcDraw_CountriesPanel(divOptions);

	// -----------------------------------------------------------------------------------------------

	let svgMain = d3.select("#div_id_main")
					.append("svg")	
						.attr("id", "svg_id_main");

	let svgCountries = svgMain.append("g")
						.attr("id", "g_id_countries");

	//let d3_curve_type = d3.curveLinear;//d3.curveMonotoneX;//d3.curveLinear; //d3.curveBasis;

	for (let nType = 0; nType < vTouristType.length; nType++) {

		vTouristType[nType].fscale_rel = d3.line()
											.x(function(d_month) { return fScale_Month_PX(getMonthCount(nMonth_Min, d_month.month)); })
											.y(function(d_month) { return funcGetSVGMain_PX(COUNTRY_HEIGHT) - fScale_Total_PX(vTouristType[nType].data(d_month)); })
												.curve(d3LineInterpolate);
	}

	g_dsCountries.forEach(function(d, i) {

		let dsTourists = d.values.sort(function(a, b) { return d3.ascending(a.month, b.month); });

		if (dsTourists.length == 0)
			return;

		// -------

		//let nTotal_Max_Country = d3.max(dsTourists, function (d_month) { return d_month.total; });

		let	nTotal_Max_Country = 0;
	
		for (let nType = 0; nType < vTouristType.length; nType++) {

			if (vTouristType[nType].path_display) {
			
				let nCount = d3.max(dsTourists, vTouristType[nType].data);

				if (nTotal_Max_Country < nCount)
					nTotal_Max_Country = nCount;
			}
		}

		let nCountryRulerMax = 0;

		for (let x = 1; x <= 10; x++)
		{
			nCountryRulerMax = Math.pow(10, x - 1);

			if (nTotal_Max_Country < nCountryRulerMax) {

				for (let y = 0; y < 3; y++) {
					
					let ruler_this = nCountryRulerMax;

					if (nTotal_Max_Country < ruler_this * (3 / 4)) 
						nCountryRulerMax = ruler_this * (3 / 4);
					else
						break;
					
					if (nTotal_Max_Country < ruler_this * (2 / 4)) 
						nCountryRulerMax = ruler_this * (2 / 4);
					else
						break;
					
					if (nTotal_Max_Country < ruler_this * (1 / 4)) 
						nCountryRulerMax = ruler_this * (1 / 4);
					else
						break;

				}

				break;
			}
		}

		vCountryRulerMax.push(nCountryRulerMax);

		let fScale_Total_PX_Country = d3.scaleLinear()
												.domain([0, nTotal_Max_Country])
												.range([0, funcGetSVGMain_PX(COUNTRY_HEIGHT * g_fHeightScale)]);

		vfScale_Total_PX_Country.push(fScale_Total_PX_Country);

		for (let nType = 0; nType < vTouristType.length; nType++) {

			vTouristType[nType].fscale_ind = d3.line()
												.x(function(d_month) { return fScale_Month_PX(getMonthCount(nMonth_Min, d_month.month)); })
												.y(function(d_month) { return funcGetSVGMain_PX(COUNTRY_HEIGHT) - fScale_Total_PX_Country(vTouristType[nType].data(d_month)); })
													.curve(d3LineInterpolate);
		
			vTouristType[nType].line.push(
				[
					vTouristType[nType].fscale_rel(dsTourists), 
					vTouristType[nType].fscale_ind(dsTourists)
				]);
		}
	});

	g_dsCountries.forEach(function(d, i) {

		funcDraw_Countries(svgCountries, d, i, 
								fScale_Country, 
								fScale_Month_PT,
								fScale_Total_PX,
								vfScale_Total_PX_Country[i],
							    vTouristType,
								vCountryRulerMax[i]);

	});

	svgCountries.append("text")
					.attr("id", "text_id_month_title")
					.attr("class", "font_size_10 color_main")
					.attr("text-anchor", "start");

	svgCountries.append("line")
					.attr("id", "line_id_month_select")
					.attr("class", "color_main");

	for (let idx in g_vTotalIndex) {

		idx_s = parseInt(idx) + 1;
	
		svgCountries.append("text")
						.attr("id", "text_id_total_index_" + idx_s)
						.attr("class", "text_class_ruler font_size_10 color_main")
						.attr("text-anchor", "end");
	}

	g_dsCountries.forEach(function(d, i) {

		funcDraw_CountryTitle(svgCountries, d, i, 
							   fScale_Month_PT, 
							   fScale_Total_PX, 
							   vfScale_Total_PX_Country[i], 
							   fScale_Country, 
							   vTouristType[TOURIST_TYPE_TOTAL].line[i],//vLineTotal[i], 
							   vCountryRulerMax[i]);
	});

	$("#div_id_main").css("height", (g_dsCountries.length * COUNTRY_HEIGHT + 100) + "pt");
	$("#svg_id_main").css("height", (g_dsCountries.length * COUNTRY_HEIGHT + 100) + "pt");
}

function funcDraw_CountriesDisplay(divOptions) {

	divOptions.append("span")
				.attr("id", "span_id_countries_display")
				.attr("class", "span_class_options font_size_10");

	$('#span_id_countries_display').click(function() { 
	
		g_bShowOptions = !g_bShowOptions;

		displayOptions(g_bShowOptions);
	});

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

			funcDraw_ByCountry();
		});
	}
}

function funcDraw_DisplayMode(divOptions) {
	
	divOptions.append("span")
				.attr("id", "span_id_options_display_mode")
				.attr("class", "span_class_options font_size_10 color_main")
				.text((g_nDisplayMode == 0) ? "Show Individual" : "Show Relative");
	/*			
	d3.select("#span_id_options_display_mode")
			.style("color", COLOR_MAIN)
			.style("background-color", COLOR_BACKGROUND);
	*/

	$('#span_id_options_display_mode').click(function() { 

		g_nDisplayMode = (g_nDisplayMode == 0) ? 1 : 0;

		if (g_nDisplayMode == 1) {

			$(this).html("Show Relative");

  			//$(this).css({"color": COLOR_BACKGROUND,
  			//			 "background-color": COLOR_MAIN});

		} else {

			$(this).html("Show Individual");

  			//$(this).css({"color": COLOR_MAIN,
  			//			 "background-color": COLOR_BACKGROUND});
		}

		g_dsCountries.forEach(function(d, i) {

			g_vDisplayMode[i] = g_nDisplayMode;

			let svgCountries = d3.select("#g_id_countries");

			funcDraw_Countries(svgCountries, d, i, 
									fScale_Country, 
									fScale_Month_PT,
									fScale_Total_PX,
									vfScale_Total_PX_Country[i],
									vTouristType,
									vCountryRulerMax[i]);

			funcDraw_CountryTitle(svgCountries, d, i, 
								   fScale_Month_PT, 
								   fScale_Total_PX, 
								   vfScale_Total_PX_Country[i],
								   fScale_Country, 
									vTouristType[TOURIST_TYPE_TOTAL].line[i],
								   vCountryRulerMax[i]);
		});	
	});
}

function funcDraw_LineType(divOptions) {
	
	divOptions.append("span")
				.attr("id", "span_id_options_line_type")
				.attr("class", "span_class_options font_size_10 color_main")
				.text((g_nLineType == 0) ? "Show Curve" : "Show Straight");
	/*			
	d3.select("#span_id_options_display_mode")
			.style("color", COLOR_MAIN)
			.style("background-color", COLOR_BACKGROUND);
	*/

	$('#span_id_options_line_type').click(function() { 

		g_nLineType = (g_nLineType == 0) ? 1 : 0;

		if (g_nLineType == 1) {

			$(this).html("Show Straight");

  			//$(this).css({"color": COLOR_BACKGROUND,
  			//			 "background-color": COLOR_MAIN});

		} else {

			$(this).html("Show Curve");

  			//$(this).css({"color": COLOR_MAIN,
  			//			 "background-color": COLOR_BACKGROUND});
		}

		funcDraw_ByCountry();
	});
}

function funcDraw_CountriesPanel(divOptions) {

	let width = 0;
	let divOptions_Sub = divOptions.append("div")
										.attr("class", "div_class_countries_panel");

	$('.div_class_countries_panel').hide();

	g_dsCountries.forEach(function(d, i) {

		let sClassName = d.values[0].class_residence;
		let sCountry = d.values[0].country;

		let divOptions_Sub_a = divOptions_Sub.append("a")
												.attr("class", "a_class_option")
												.on("click",function() {

							    					$(document).scrollTop($("#a_id_country_" + sClassName).offset().top - 340);  
												});
		
		divOptions_Sub_a_span = divOptions_Sub_a.append("span")
													.attr("id", "span_id_country_" + sClassName)
													.attr("class", "");
		
		divOptions_Sub_a_span.append("span")
								.attr("class", "span_class_country_text font_size_12 color_main")
								.text(sCountry);

		px = document.getElementById("span_id_country_" + sClassName).offsetWidth;
		pt = funcGetSVGMain_PT(px);

		width += (pt + 3);

		if (width > 800 - (50 * 2) - 175)
		{
			width = 0;
		}
	});
}

function funcDraw_Countries(svgCountries, d, i, 
							 fScale_Country, 
							 fScale_Month_PT,
							 fScale_Total_PX,
							 fScale_Total_PX_Country,
						   	 vTouristType,
							 vCountryRulerMax) {

	let sClassName = d.values[0].class_residence;
	let sCountry = d.values[0].country;

	let idx_s = 1;
	let idx_e = 0;
	let stroke_opacity_s = 1.0;//0.8;
	let stroke_opacity_e = 1.0;//0.6;

	if (g_vDisplayMode[i] == 0)
	{
		idx_s = 1;
		idx_e = 0;

		stroke_opacity_s = 1.0;//0.8;
		stroke_opacity_e = 1.0;//0.6;
	}
	else
	{
		idx_s = 0;
		idx_e = 1;

		stroke_opacity_s = 1.0;//0.6;
		stroke_opacity_e = 1.0;//0.8;
	}

	if (d.values.length == 0)
		return;

	let monthes = d.values;
	// -------

	d3.select("#svg_id_months_" + sClassName).remove();

	let svgMonthes = svgCountries.append("svg")
									.attr("id", "svg_id_months_" + sClassName)
									.attr("class", "svg_class_monthes")
									.attr("width", MAIN_WIDTH + "pt")
									.attr("height", (COUNTRY_HEIGHT * 2) + "pt")
									.attr("x", 0 + "pt")
									.attr("y", fScale_Country(i) + "pt");


	{
		svgMonthes.append("line")
						.attr("id", "line_id_zero")
						.attr("class", "color_total")
						.attr("x1", fScale_Month_PT(getMonthCount(nMonth_Min, d.values[0].month)) + "pt")
						.attr("y1", function(d_month) { return (COUNTRY_HEIGHT) + "pt"; })
						.attr("x2", fScale_Month_PT(getMonthCount(nMonth_Min, d.values[d.values.length - 1].month)) + "pt")
						.attr("y2", function(d_month) { return (COUNTRY_HEIGHT) + "pt"; });
	}

	// -------

	for (let nType = 0; nType < vTouristType.length; nType++) {

		//if (vTouristType[nType].path_display) {

			let fStrokeOpacity = (vTouristType[nType].path_display) ? 1 : 0;

			svgMonthes.append("path")
						.attr("class", ("path_" + vTouristType[nType].id_name) + " " + vTouristType[nType].class_name_path + " " + vTouristType[nType].class_name_color)
						.attr("d", vTouristType[nType].line[i][idx_s])
						.attr("stroke-opacity", fStrokeOpacity)//.attr("stroke-opacity", stroke_opacity_s)
						.transition()
						.duration(PATH_TRANSLATION_TIME)
						.attr("d", vTouristType[nType].line[i][idx_e])
						.attr("stroke-opacity", fStrokeOpacity)//.attr("stroke-opacity", stroke_opacity_e);
		//}
	}

	// -------

	svgMonthes.selectAll("circle.circle_class_month_" + sClassName)
		.data(monthes)
		.enter()
			.append("circle")
				.attr("class", "color_main circle_class_month_" + sClassName)
				.attr("cx", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.month)) + "pt"; })
				.attr("cy", function(d_month) { return (COUNTRY_HEIGHT) + "pt"; })
				.attr("opacity", 0)
				.attr("r", 0.5 + "pt");
			
	// ------- 

	//let nCountryTotal_Max = d3.max(monthes, function (d_month) { return d_month.total; })

	let nCountryTotal_Max = 0;

	for (let nType = 0; nType < vTouristType.length; nType++) {

		if (vTouristType[nType].path_display) {
		
			let nCount = d3.max(monthes, vTouristType[nType].data);

			if (nCountryTotal_Max < nCount)
				nCountryTotal_Max = nCount;
		}
	}

	svgMonthes.selectAll("line.month_" + sClassName)
		.data(monthes)
		.enter()
			.append("line")
				.attr("class", "line_class_month color_main month_" + sClassName)
				.attr("x1", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.month)) + "pt"; })
				.attr("y1", function(d_month) { return COUNTRY_HEIGHT + "pt"; })
				.attr("x2", function(d_month) { return fScale_Month_PT(getMonthCount(nMonth_Min, d_month.month)) + "pt"; })
				.attr("y2", function(d_month) { return 0 + "pt"; })
				.on("mouseover", function (d_month) {

					showMonthCircles(sClassName);

					showDislikeRatio(sClassName);

					let formatNumStr = d3.format(",");
					let formatPercent = d3.format(".2p");

					let pt_x = fScale_Month_PT(getMonthCount(nMonth_Min, d_month.month));

					let text_anchor = (pt_x < MAIN_WIDTH / 2) ? "start" : "end";
					let text_anchor_rev = (pt_x < MAIN_WIDTH / 2) ? "end" : "start";
					let pt_x_text = pt_x;//pt_x + ((pt_x < MAIN_WIDTH / 2) ? 5 : -5);
					let pt_x_text_rev = pt_x + ((pt_x < MAIN_WIDTH / 2) ? -5 : 5);

					d3.select("#line_id_month_select")
						.attr("x1", pt_x + "pt")
						.attr("y1", fScale_Country(i) + "pt")
						.attr("x2", pt_x + "pt")
						.attr("y2", fScale_Country(i) + COUNTRY_HEIGHT + "pt");

					let formatS = d3.format(".0s");
					let formatS_2 = d3.format(".3s");

					for (let idx in g_vTotalIndex) {

						idx_s = parseInt(idx) + 1;

						let y, text;

						if (g_vDisplayMode[i] == 0) {

							if (g_vTotalIndex[idx] < g_nTotalCount_Max) {
								//y = (fScale_Country(i) + COUNTRY_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
							} else if (idx_s == 1) {
								g_vTotalIndex[idx] = g_nTotalCount_Max / (idx_s + 1);
							} else {
								break;
							}
							
							y = (fScale_Country(i) + COUNTRY_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
							text = formatS(g_vTotalIndex[idx]);

						} else {

							y = (fScale_Country(i) + COUNTRY_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX_Country(vCountryRulerMax / g_vTotalIndex.length * idx_s)));

							if (vCountryRulerMax / g_vTotalIndex.length * idx_s < nCountryTotal_Max) 
								text = formatS_2(vCountryRulerMax / g_vTotalIndex.length * idx_s);
						}

						if (text != "") {

							d3.select("#text_id_total_index_" + idx_s)
								.attr("x", pt_x + ((pt_x < MAIN_WIDTH / 2) ? 5 : -5) + "pt")
								.attr("y", y + "pt")
								.attr("text-anchor", text_anchor)
								.text(text);
						}

					}

					let nYear = d_month.month.toString().substring(0, 2);
					let nMonth = d_month.month.toString().substring(2, 4);
					
					let sMonth = d3.timeFormat("%b")(new Date(nYear, (nMonth - 1)));

					let sMonthYear = (sMonth  + ". '" + nYear);

					d3.select("#text_id_month_title")
						.attr("x", pt_x_text + "pt")
						.attr("y", (fScale_Country(i) + COUNTRY_HEIGHT + 12) + "pt")
						.attr("text-anchor", text_anchor)
						.text(sMonthYear);

					d3.select("#text_id_month_subtitle").remove();

					let nTotal = d_month.total;
					let nPleasure = d_month.pleasure;
					let nBusiness = d_month.business + d_month.conference + d_month.exhibition;
					let nVisitRelatives = d_month.visit_relatives;
					let nStudy = d_month.study;
					let nOthers = d_month.medical_treatment + d_month.others + d_month.unstated;

					svgCountries.append("text")
									.attr("id", "text_id_month_subtitle")
									.attr("class", "font_size_10 color_main")
									.attr("x", pt_x_text + "pt")
									.attr("y", (fScale_Country(i) + COUNTRY_HEIGHT + 25) + "pt")
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

					svgCountries.append("text")
									.attr("id", "text_id_month_subtitle_2")
									.attr("class", "font_size_10 color_main")
									.attr("x", pt_x_text + "pt")
									.attr("y", (fScale_Country(i) + COUNTRY_HEIGHT + 36) + "pt")
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

					hideMonthCircles(sClassName);
			    });

	// ----------------------------

	for (let y = 12; y <= 18; y++) {

		svgMonthes.append("text")
					.attr("id", "text_id_month_year_" + y + "_" + sClassName)
					.attr("class", "text_class_month_year font_size_10 color_main")
					.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(y + "01"))) + "pt")
					.attr("y", COUNTRY_HEIGHT + 12 + "pt")
					.attr("fill-opacity", 0)
					.text("'" + y);
	}
}

function funcDraw_CountryTitle(svgCountries, d, i, 
								fScale_Month_PT, 
								fScale_Total_PX, 
								fScale_Total_PX_Country, 
								fScale_Country, 
								vLineTotal,
								vCountryRulerMax) {

	let sClassName = d.values[0].class_residence;
	let sCountry = d.values[0].country;
	let sRegion = d.values[0].class_region;

	d3.select("#a_id_country_" + sClassName).remove();
	d3.select("#rect_id_month_mode_" + sClassName).remove();
	d3.select("#text_id_month_mode_" + sClassName).remove();

	let padding_top = 45;
	let text_spacing = 18;
	let title_font_size = 10;
	//let subtitle_font_size = 3;
	//let mode_radius = subtitle_font_size;

	let text_x = PADDING_LEFT;
	let text_y = fScale_Country(i) + padding_top;

	let formatNumStr = d3.format(",");
	let formatPercent = d3.format(".2p");

	svgCountry_title = svgCountries.append("a")
										.attr("id", "a_id_country_" + sClassName)
										.attr("target", "_blank")
										.append("g")
											.attr("class", "country_title")
											.on("mouseover", function (d_month) {

												showMonthCircles(sClassName);

												showDislikeRatio(sClassName);
											})
											.on("mouseout", function (d_month) {

												hideMonthCircles(sClassName);

												hideDislikeRatio(sClassName);
										    });

	// draw text
	{
		let title_font_size = 10;
		let nCircleWidth = 32;

		svgCountry_title.append("circle")
							.attr("class", "circle_class_country color_main")
							.attr("cx", text_x + (nCircleWidth / 2) + "pt")
							.attr("cy", text_y + title_font_size + 3 + "pt") 
							.attr("r", (nCircleWidth / 2) + "pt");

		svgCountry_title.append("text")
							.attr("class", "text_class_region font_size_12 color_main font_weight_200")
							.attr("text-anchor", "middle")
							.attr("x", text_x + (nCircleWidth / 2) + "pt")
							.attr("y", text_y + title_font_size + 7 + "pt") 
							.text(getRegionBriefName(sRegion));

		svgCountry_title.append("text")
							.attr("class", "text_class_country_title font_size_16 color_main")
							.attr("x", text_x + nCircleWidth + title_font_size + "pt")
							.attr("y", text_y + title_font_size + "pt") 
							.text(sCountry);

		svgCountry_title.append("text")
							.attr("class", "text_class_month_subtitle font_size_12 color_main")
							.attr("x", text_x + nCircleWidth + title_font_size + "pt")
							.attr("y", text_y + title_font_size + text_spacing + "pt") 
							.text(formatNumStr(d3.sum(d.values, function (d) { return d.total; })) + " visited");
	}

	/*
	// mode
	{
		let nTextWidth = 75;

		svgCountryMode = svgCountries;
		
		svgCountryMode.append("rect")
							.attr("id", "rect_id_month_mode_" + sClassName)
							.attr("class", "rect_class_month_mode")
							.attr("x", (MAIN_WIDTH - PADDING_LEFT - nTextWidth) + "pt")
							.attr("y", (text_y) + "pt")
							.attr("width", (nTextWidth) + "pt")
							.attr("height", title_font_size + (mode_radius * 2) + "pt")
							.attr("fill", (g_vDisplayMode[i] == 0) ? COLOR_BACKGROUND : COLOR_MAIN)
							.attr("fill-opacity", 0)
							.attr("stroke-opacity", 0)
							.on("mouseover", function (d_month) {

								showMonthCircles(sClassName);

								showDislikeRatio(sClassName);

							})
							.on("mouseout", function (d_month) {

								hideMonthCircles(sClassName);

								hideDislikeRatio(sClassName);
						    })
							.on("click", function() {

								g_vDisplayMode[i] = (g_vDisplayMode[i] == 0) ? 1 : 0;

								funcDraw_Countries(svgCountries, d, i, 
														fScale_Country, 
														fScale_Month_PT,
														fScale_Total_PX,
														fScale_Total_PX_Country,
														vTouristType,
														vCountryRulerMax);

								funcDraw_CountryTitle(svgCountries, d, i, 
													   fScale_Month_PT, 
													   fScale_Total_PX, 
													   fScale_Total_PX_Country, 
													   fScale_Country, 
													   vTouristType[TOURIST_TYPE_TOTAL].line[i],
													   vCountryRulerMax);
							});

		svgCountryMode.append("text")
							.attr("id", "text_id_month_mode_" + sClassName)
							.attr("class", "text_class_month_mode font_size_9")
							.attr("x", (MAIN_WIDTH - PADDING_LEFT - (nTextWidth / 2) - mode_radius) + "pt")
							.attr("y", (text_y + title_font_size + mode_radius - 1) + "pt")
							.attr("fill", (g_vDisplayMode[i] == 0) ? COLOR_MAIN : COLOR_BACKGROUND)
							.attr("fill-opacity", 0)
							.attr("text-anchor", "middle")
							.text(((g_vDisplayMode[i] == 0) ? "Show Individual" : "Show Relative"))
							.on("mouseover", function (d_month) {

								showMonthCircles(sClassName);

								showDislikeRatio(sClassName);

							})
							.on("mouseout", function (d_month) {

								hideMonthCircles(sClassName);

								hideDislikeRatio(sClassName);
						    })
							.on("click", function() {

								g_vDisplayMode[i] = (g_vDisplayMode[i] == 0) ? 1 : 0;

								funcDraw_Countries(svgCountries, d, i, 
														fScale_Country, 
														fScale_Month_PT,
														fScale_Total_PX,
														fScale_Total_PX_Country,
													    vTouristType,
														vCountryRulerMax);

								funcDraw_CountryTitle(svgCountries, d, i, 
													   fScale_Month_PT, 
													   fScale_Total_PX, 
													   fScale_Total_PX_Country, 
													   fScale_Country, 
													   vTouristType[TOURIST_TYPE_TOTAL].line[i],
													   vCountryRulerMax);
													   
								// ---------------------------------------------------------
								
								let formatS = d3.format(".0s");
								let formatS_2 = d3.format(".3s");

								for (let idx in g_vTotalIndex) {

									idx_s = parseInt(idx) + 1;
									
									let y_pt_prev = d3.select("#text_id_total_index_" + idx_s).attr("y");

									let y, text;

									if (g_vDisplayMode[i] == 0) {

										y = (fScale_Country(i) + COUNTRY_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX(g_vTotalIndex[idx])));
										text = formatS(g_vTotalIndex[idx]);
									}
									else {

										y = (fScale_Country(i) + COUNTRY_HEIGHT - funcGetSVGMain_PT(fScale_Total_PX_Country(vCountryRulerMax / g_vTotalIndex.length * idx_s)));
										text = formatS_2(vCountryRulerMax / g_vTotalIndex.length * idx_s);
									}

									d3.select("#text_id_total_index_" + idx_s)
											.attr("y", y_pt_prev)
											.transition()
											.duration(PATH_TRANSLATION_TIME)
											.attr("y", y + "pt")
											.text(text);
								}
							});
	}
	*/
}

function getRegionBriefName(class_region) {

	let sBrief = "";

	switch (class_region) {

		case "asia" : sBrief = "AS"; break;
		case "europe" : sBrief = "EU"; break;
		case "america" : sBrief = "AM"; break;
		case "africa" : sBrief = "AF"; break;
		case "oceania" : sBrief = "OC"; break;
	}

	return sBrief;
}

function showMonthCircles(nCountryID) {

	d3.selectAll("circle.circle_class_month_" + nCountryID)
		.attr("opacity", 0.4);

	for (let y = 12; y <= 18; y++) {

		d3.select("#text_id_month_year_" + y + "_" + nCountryID)
			.attr("fill-opacity", 0.4);
	}
}

function hideMonthCircles(nCountryID) {

	d3.selectAll("circle.circle_class_month_" + nCountryID)
		.attr("opacity", 0);

	for (let y = 12; y <= 18; y++) {

		d3.select("#text_id_month_year_" + y + "_" + nCountryID)
			.attr("fill-opacity", 0);
	}
}

function showDislikeRatio(nChannelID) {

	d3.select("#rect_id_month_mode_" + nChannelID)
		.attr("fill-opacity", 1)
		.attr("stroke-opacity", 1);

	d3.select("#text_id_month_mode_" + nChannelID)
		.attr("fill-opacity", 1);
}

function hideDislikeRatio(nChannelID) {

	d3.select("#rect_id_month_mode_" + nChannelID)
		.attr("fill-opacity", 0)
		.attr("stroke-opacity", 0);

	d3.select("#text_id_month_mode_" + nChannelID)
		.attr("fill-opacity", 0);

	// ---------

	d3.select("#text_id_month_title")
		.attr("fill-opacity", 0);

	d3.select("#text_id_month_subtitle")
		.attr("fill-opacity", 0);

	d3.select("#text_id_month_subtitle_2")
		.attr("fill-opacity", 0);

	d3.select("#line_id_month_select")
		.attr("stroke-opacity", 0);

	d3.selectAll(".text_class_ruler")
		.attr("fill-opacity", 0);
}

// -----------------------------------------------------

function displayOptions(bShowOptions = true)
{
	let sTitle = "Select Country";

	if (bShowOptions)
	{
		$('#span_id_countries_display').text(sTitle + "　ⅹ");

		$('.div_class_countries_panel').show('fast');
	}
	else
	{
		$('#span_id_countries_display').text(sTitle + "　ⅴ");

		$('.div_class_countries_panel').hide('fast');
	}
}

// -----------------------------------------------------

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
