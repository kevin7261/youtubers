
const RANK_LINE_WIDTH = 8;

var ALL_HEIGHT = COUNTRY_HEIGHT * 2.25;

var g_nRankingType = TOURIST_TYPE_TOTAL;//TOURIST_TYPE_OTHERS;//TOURIST_TYPE_VISIT_RELATIVES;//TOURIST_TYPE_BUSINESS;//TOURIST_TYPE_PLEASURE;//TOURIST_TYPE_TOTAL;

var g_fHeightScale = 0.9;

function funcDraw_ByRanking_Main() {

	funcPageDisplayControl("span_id_options_by_ranking");

	// ---------------------------------------------------

	g_vTotalIndex = [];

	for (let i = 1; i <= 2; i++) {

		g_vTotalIndex.push(i * 250 * Math.pow(10, 3) * g_fHeightScale);//g_vTotalIndex.push(i * 5 * Math.pow(10, 6));
	}

	for (let i in g_dsCountries) {

		g_vDisplayMode.push(0);
	}

	// -----------------------------------------

	let nMounth_Count = getMonthCount(nMonth_Min, nMonth_Max);

	//g_nTotalCount_Max = d3.max(g_dsTouristsJOSM, function (d) { return d.total; });
	g_nTotalCount_Max = d3.max(g_dsMonthes, 
								function (d) {
									return d3.sum(d.values, vTouristType[g_nRankingType].data);
								});

	// ---------------------------------------------------------------

	fScale_All = d3.scaleLinear()
							.domain([0, g_dsCountries.length])
							.range([0, COUNTRY_HEIGHT * g_dsCountries.length]);

	fScale_Month_PT = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([0 + (RANK_LINE_WIDTH / 2), MAIN_WIDTH - (RANK_LINE_WIDTH / 2)]);

	fScale_Month_PX = d3.scaleLinear()
							.domain([1, nMounth_Count])
							.range([funcGetSVGMain_PX(0 + (RANK_LINE_WIDTH / 2)), 
									funcGetSVGMain_PX(MAIN_WIDTH - (RANK_LINE_WIDTH / 2))]);

	fScale_Total_PT = d3.scaleLinear()
							.domain([0, g_nTotalCount_Max])
							.range([0, (ALL_HEIGHT * g_fHeightScale)]);

	// ---------------------------------------------------------------

	let divOptions_Background = d3.select("#div_id_page_options_background");

	let divOptions = divOptions_Background.append("div")
												.attr("id", "div_id_page_options");
	
	funcDraw_CountriesPanel_Rank(divOptions);
	
	// -----------------------------------------------------------------------------------------------

	let svgMain = d3.select("#div_id_main")
					.append("svg")	
						.attr("id", "svg_id_main");

	let svgRank = svgMain.append("g")
							.attr("id", "g_id_rank");

	let dsMonthes = [];

	for (let i = 0; i < g_dsMonthes.length; i++) {

		let nMonth = g_dsMonthes[i].key;
		let dsMonth = g_dsMonthes[i].values
						.sort(function(a, b) { 

							switch (g_nRankingType) {
						  		case TOURIST_TYPE_TOTAL: 			return d3.descending(a.total, b.total); break;
						  		case TOURIST_TYPE_PLEASURE: 		return d3.descending(a.pleasure, b.pleasure); break;
						  		case TOURIST_TYPE_BUSINESS: 		return d3.descending(a.business + a.conference + a.exhibition, b.business + b.conference + b.exhibition); break;
						  		case TOURIST_TYPE_VISIT_RELATIVES:  return d3.descending(a.visit_relatives, b.visit_relatives); break;
						  		case TOURIST_TYPE_STUDY: 			return d3.descending(a.study, b.study); break;
						  		case TOURIST_TYPE_OTHERS: 			return d3.descending(a.medical_treatment + a.others + a.unstated, b.medical_treatment + b.others + b.unstated); break;
						  	}
						});

		dsMonthes.push(dsMonth);
	}

	funcDraw_ByRankingLine(svgRank, g_dsMonthes, 
						fScale_All, 
						fScale_Month_PT,
						vTouristType);

	svgRank.append("text")
					.attr("id", "text_id_month_title")
					.attr("class", "font_size_10 color_main")
					.attr("text-anchor", "start");

	funcDraw_RankInfo(svgRank);

	$("#div_id_main").css("height", "400pt");
	$("#svg_id_main").css("height", "400pt");
}

var vTopCountries = [];

var vTopCountriesColor = 
[
	"RGB(205, 82, 82)",
	"RGB(217, 104, 49)",
	"RGB(230, 179, 61)",
	"RGB(38, 157, 128)",
	"RGB(1, 158, 213)",
	"#888888",
	"#AAAAAA",
	"#CCCCCC"
];

function getCountryColor(class_residence) {

	let c = COLOR_MAIN;

	for (let i = 0; i < vTopCountries.length; i++) {

		if (class_residence == vTopCountries[i].class_residence) {

			c = vTopCountries[i].color;

			break;
		}
	}

	return c;
}

function getCountryMonthRankList(dsMonthes, class_residence) {

	let vRankList = [];

	for (let nMonthIdx = 0; nMonthIdx < dsMonthes.length; nMonthIdx++) {

		let nMonth = parseInt(dsMonthes[nMonthIdx].key);
		let dsMonth = dsMonthes[nMonthIdx].values;

		let nRank = 0;

		for (var i = 0; i  < dsMonth.length; i ++) {

			if (class_residence == dsMonth[i].class_residence) {
				
				nRank = i + 1;

				break;
			}
		}

		vRankList.push({"month": nMonth, "rank": nRank});
	}

	return vRankList;
}

function funcDraw_ByRankingLine(svgRank, dsMonthes, 
							 fScale_All, 
							 fScale_Month_PT,
						   	 vTouristType) {

	let stroke_opacity_s = 1.0;//0.8;
	let stroke_opacity_e = 1.0;//0.6;

	let monthes = g_nAllCountrysCount;

	// -------

	let svgRankLine = svgRank.append("svg")
				.attr("id", "svg_id_rank")
				.attr("class", "svg_class_rank")
				.attr("width", MAIN_WIDTH + "pt")
				.attr("height", (ALL_HEIGHT * 2) + "pt")
				.attr("x", 0 + "pt")
				.attr("y", fScale_All(0) + "pt");

	// -------

	let dsMonthes_Newest = g_dsMonthes[g_dsMonthes.length - 1].values
																.sort(function(a, b) { 

																	switch (g_nRankingType) {
																  		case TOURIST_TYPE_TOTAL: 			return d3.descending(a.total, b.total); break;
																  		case TOURIST_TYPE_PLEASURE: 		return d3.descending(a.pleasure, b.pleasure); break;
																  		case TOURIST_TYPE_BUSINESS: 		return d3.descending(a.business + a.conference + a.exhibition, b.business + b.conference + b.exhibition); break;
																  		case TOURIST_TYPE_VISIT_RELATIVES:  return d3.descending(a.visit_relatives, b.visit_relatives); break;
																  		case TOURIST_TYPE_STUDY: 			return d3.descending(a.study, b.study); break;
																  		case TOURIST_TYPE_OTHERS: 			return d3.descending(a.medical_treatment + a.others + a.unstated, b.medical_treatment + b.others + b.unstated); break;
																  	}
																  	//return d3.descending(a.total, b.total);
																});

	vTopCountries = [];

	for (let i = 0; i < 8; i++) {

		vTopCountries.push(
			{
				"color": vTopCountriesColor[i],
				"class_residence": dsMonthes_Newest[i].class_residence
			});
	}

	let formatNumStr = d3.format(",");
	let formatPercent = d3.format(".2p");
	
	for (let nMonthIdx = 0; nMonthIdx < dsMonthes.length; nMonthIdx++) {

		let nMonth = parseInt(dsMonthes[nMonthIdx].key);
		let dsMonth = dsMonthes[nMonthIdx].values;
		let nCountryCount = dsMonthes[nMonthIdx].values.length;

		svgRankLine.selectAll("line.line_class_month_" + nMonth)
			.data(dsMonth)
			.enter()
				.append("line")
					.attr("id", function(d) { return "line_id_month_" + nMonth + "_" + d.class_residence; })
					.attr("class", "line_class_month_" + nMonth)
					.attr("x1", function(d) { return fScale_Month_PT(getMonthCount(nMonth_Min, nMonth)) + "pt"; })
					.attr("y1", function(d, nRank) { 

												let nSum = d3.sum(dsMonth, function(_d, i) {

													if (nRank <= i) {

														switch (g_nRankingType) {
													  		case TOURIST_TYPE_TOTAL: 			return _d.total; break;
													  		case TOURIST_TYPE_PLEASURE: 		return _d.pleasure; break;
													  		case TOURIST_TYPE_BUSINESS: 		return _d.business + _d.conference + _d.exhibition; break;
													  		case TOURIST_TYPE_VISIT_RELATIVES:  return _d.visit_relatives; break;
													  		case TOURIST_TYPE_STUDY: 			return _d.study; break;
													  		case TOURIST_TYPE_OTHERS: 			return _d.medical_treatment + _d.others + _d.unstated; break;
													  	}
													}
												});

												return (ALL_HEIGHT - fScale_Total_PT(nSum)) + "pt"; 
											})
					.attr("x2", function(d) { return fScale_Month_PT(getMonthCount(nMonth_Min, nMonth)) + "pt"; })
					.attr("y2", function(d, nRank) { 

												let nSum = d3.sum(dsMonth, function(_d, i) {

													if (nRank <= i - 1) {
																				
														switch (g_nRankingType) {
													  		case TOURIST_TYPE_TOTAL: 			return _d.total; break;
													  		case TOURIST_TYPE_PLEASURE: 		return _d.pleasure; break;
													  		case TOURIST_TYPE_BUSINESS: 		return _d.business + _d.conference + _d.exhibition; break;
													  		case TOURIST_TYPE_VISIT_RELATIVES:  return _d.visit_relatives; break;
													  		case TOURIST_TYPE_STUDY: 			return _d.study; break;
													  		case TOURIST_TYPE_OTHERS: 			return _d.medical_treatment + _d.others + _d.unstated; break;
													  	}
													}
												});

												return ((ALL_HEIGHT - fScale_Total_PT(nSum)) - 0.25) + "pt"; 
											})
					.attr("stroke-width", RANK_LINE_WIDTH + "pt")
					.attr("stroke-opacity", 0.8)
					.attr("stroke", function(d) { return getCountryColor(d.class_residence); })
					.on("mouseover", function (d, nRank) {

						showMonthCircles_Rank();

						let cDisplay = getCountryColor(d.class_residence);
						let cType = vTouristType[g_nRankingType].color;

						let nYear = nMonth.toString().substring(0, 2);
						let _nMonth = nMonth.toString().substring(2, 4);
						
						let sMonth = d3.timeFormat("%b")(new Date(nYear, (_nMonth - 1)));

						let sMonthYear = (sMonth  + ". '" + nYear);

						d3.select("#text_id_month_total_selected")
							.attr("fill", cType)
							.text(sMonthYear);

						d3.select("#circle_id_rank_selected")
							.attr("stroke", cType)
							//.attr("stroke", getCountryColor(d.class_residence))
							.attr("stroke-opacity", 1);

						d3.select("#text_id_rank_selected")
							.attr("fill", cType)
							//.attr("fill", getCountryColor(d.class_residence))
							.text(nRank + 1);

						d3.select("#text_id_country_selected")
							.attr("fill", cType)
							.text(d.country);

						let nSum = d3.sum(dsMonth, vTouristType[g_nRankingType].data);
						
						let nCount = 0;

						switch (g_nRankingType) {
					  		case TOURIST_TYPE_TOTAL: 			nCount = d.total; break;
					  		case TOURIST_TYPE_PLEASURE: 		nCount = d.pleasure; break;
					  		case TOURIST_TYPE_BUSINESS: 		nCount = d.business + d.conference + d.exhibition; break;
					  		case TOURIST_TYPE_VISIT_RELATIVES:  nCount = d.visit_relatives; break;
					  		case TOURIST_TYPE_STUDY: 			nCount = d.study; break;
					  		case TOURIST_TYPE_OTHERS: 			nCount = d.medical_treatment + d.others + d.unstated; break;
					  	}

						let fPercent = nCount / nSum;

						d3.select("#text_id_total_selected")
							.attr("fill", cType)
							.text(formatNumStr(nCount) + " visited (" + formatPercent(fPercent) + ")");

						// ----------

						/*
						let vRankList = getCountryMonthRankList(dsMonthes, d.class_residence);

						for (var i = 0; i < vRankList.length; i++) {

							let nMonth = vRankList[i].month;
							let nRank = vRankList[i].rank;

							d3.select("#text_id_month_rank_" + nMonth)
								.attr("fill", cDisplay)
								.attr("fill-opacity", 0.4)
								.text((nRank > 0) ? nRank : "");
						}
						*/

						d3.select("#text_id_month_rank_" + nMonth)
							.attr("fill", cType)
							.text(formatNumStr(nSum));//.text((nRank + 1));

						d3.select("#text_id_month_selected_rank")
							.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, nMonth)) + "pt")
							.attr("y", ALL_HEIGHT + 12 + "pt")
							.attr("fill", cType)
							.text(sMonthYear);

							console.log(sMonthYear);

						// ----------

						d3.selectAll(".line_class_month_" + nMonth)
							.attr("stroke-opacity", 1);

						d3.selectAll("#line_id_month_" + nMonth + "_" + d.class_residence)
							.attr("stroke-width", RANK_LINE_WIDTH + 4 + "pt");
					})
					.on("mouseout", function (d) {

						hideMonthCircles_Rank();

						d3.select("#text_id_month_total_selected")
							.text("");

						d3.select("#circle_id_rank_selected")
							.attr("stroke-opacity", 0);

						d3.select("#text_id_rank_selected")
							.text("");

						d3.select("#text_id_country_selected")
							.text("");

						d3.select("#text_id_total_selected")
							.text("");

							// ----------

						//d3.selectAll(".text_class_month_rank")
						//	.text("");

						d3.select("#text_id_month_rank_" + nMonth)
							.text("");

							// ----------

						d3.selectAll(".line_class_month_" + nMonth)
							.attr("stroke-opacity", 0.8);

						d3.selectAll("#line_id_month_" + nMonth + "_" + d.class_residence)
							.attr("stroke-width", RANK_LINE_WIDTH + "pt");
					});
	}

	// ----------------------------

	svgRankLine.selectAll("text.text_class_month_rank")
		.data(dsMonthes)
		.enter()
		.append("text")
			.attr("id", function (d) { return "text_id_month_rank_" + d.key; })
			.attr("class", "text_class_month_rank font_size_10 color_main")
			.attr("x", function (d) { return fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(d.key))) + "pt"; })//.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(y + "01"))) + "pt")
			.attr("y", function(d, nRank) { 

						let nSum = d3.sum(d.values, vTouristType[g_nRankingType].data);

						return (ALL_HEIGHT - fScale_Total_PT(nSum) - 5) + "pt"; 
					})
			.text("");

	svgRankLine.append("text")
					.attr("id", "text_id_month_selected_rank")
					.attr("class", "font_size_10 color_main")
					.text("");

	// ----------------------------

	for (let y = 12; y <= 18; y++) {

		svgRankLine.append("text")
					.attr("class", "text_class_month_year_rank font_size_10 color_main")
					.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(y + "01"))) + "pt")//.attr("x", fScale_Month_PT(getMonthCount(nMonth_Min, parseInt(y + "01"))) + "pt")
					.attr("y", ALL_HEIGHT + 12 + "pt")
					.text("'" + y);
	}
}

function funcDraw_CountriesPanel_Rank(divOptions) {

	for (let nType = 0; nType < vTouristType.length; nType++) {

		divOptions.append("span")
					.attr("id", "span_id_path_" + vTouristType[nType].id_name + "_display_ranking")
					.attr("class", "span_class_path_display span_class_options font_size_10")
					.text(vTouristType[nType].field_name);

		d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking")
				.style("border-color", vTouristType[nType].color);

		let cColor = (g_nRankingType == nType) ? COLOR_BACKGROUND : vTouristType[nType].color;
		let cBorderColor = (g_nRankingType == nType) ? vTouristType[nType].color : COLOR_BACKGROUND;

		d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking")
				.style("color", cColor)
				.style("background-color", cBorderColor)

		$("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking").mouseover(function() {
  
  			if (g_nRankingType != nType) {
				$(this).css("color", COLOR_BACKGROUND)
						.css("background-color", vTouristType[nType].color);
  			}
		});

		$("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking").mouseout(function() {
  
  			if (g_nRankingType != nType) {
				$(this).css("color", vTouristType[nType].color)
						.css("background-color", COLOR_BACKGROUND);
			}
		});

		$("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking").click(function() {

			g_nRankingType = nType;

			{
				let fOpacity = (g_nRankingType == nType) ? 1 : 0;

				d3.selectAll(".path_" + vTouristType[nType].id_name)
					.attr("stroke-opacity", fOpacity);
			}

			{
				let cColor = (g_nRankingType == nType) ? COLOR_BACKGROUND : vTouristType[nType].color;
				let cBorderColor = (g_nRankingType == nType) ? vTouristType[nType].color : COLOR_BACKGROUND;

				d3.select("#span_id_path_" + vTouristType[nType].id_name + "_display_ranking")
						.style("color", cColor)
						.style("background-color", cBorderColor)
			}

			// -------

			funcDraw_ByRanking();
		});
	}
}

function funcDraw_RankInfo(svgRank) {

	let padding_top = 40;
	let text_spacing = 18;
	let title_font_size = 10;

	let text_x = PADDING_LEFT;
	let text_y = padding_top;

	let nCircleWidth = 32;

	svgRank.append("text")
					.attr("id", "text_id_month_total_selected")
					.attr("class", "text_class_month_subtitle font_size_12")
					.attr("x", text_x + "pt")
					.attr("y", text_y + title_font_size + (text_spacing * 0) + "pt") 
					.text("");

	svgRank.append("circle")
					.attr("id", "circle_id_rank_selected")
					.attr("cx", text_x + (nCircleWidth / 2) + "pt")
					.attr("cy", text_y + title_font_size + (text_spacing * 0) + text_spacing + 4 + 5 + "pt") 
					.attr("r", (nCircleWidth / 2) + "pt");

	svgRank.append("text")
					.attr("id", "text_id_rank_selected")
					.attr("class", "text_class_country_title font_size_16 font_weight_600")
					.attr("x", text_x + (nCircleWidth / 2) + "pt")
					.attr("y", text_y + title_font_size + (text_spacing * 0) + text_spacing + 10 + 5 + "pt") 
					.text("");

	svgRank.append("text")
					.attr("id", "text_id_country_selected")
					.attr("class", "text_class_country_title font_size_16")
					.attr("x", text_x + nCircleWidth + title_font_size + "pt")
					.attr("y", text_y + title_font_size + (text_spacing * 1) + 5 + "pt") 
					.text("");

	svgRank.append("text")
					.attr("id", "text_id_total_selected")
					.attr("class", "text_class_month_subtitle font_size_12")
					.attr("x", text_x + nCircleWidth + title_font_size + "pt")
					.attr("y", text_y + title_font_size + (text_spacing * 2) + 5 + "pt")  
					.text("");
}

function showMonthCircles_Rank() {
}

function hideMonthCircles_Rank() {
}
