
var nYear_Min = 11;
var nYear_Max = 17;

var fScale_Circle;
var fScale_Radius;

var g_nMonthCount_Max = 0;

function funcDraw_ByMonth_Main() {

	funcPageDisplayControl("span_id_options_by_month");

	// ---------------------------------------------------------------
	
	let dsTouristTypeData = [];

	for (var nType = 0; nType < vTouristType.length; nType++) {

		let dsMonthes = [];
		let dsMonthSum = [];
		let dsYearMonthSum = [];

		for (let nYear = nYear_Min; nYear <= nYear_Max; nYear++) {

			dsYearMonthSum.push([]);
		}

		for (let nMonth = 0; nMonth <= 12; nMonth++) {

			dsMonthSum.push(0);

			for (let nYear = nYear_Min; nYear <= nYear_Max; nYear++) {

				dsYearMonthSum[nYear - nYear_Min].push(0);
			}
		}

		for (let i = 0; i < g_dsMonthes.length; i++) {

			let sMonth = g_dsMonthes[i].key;
			let vCountries = g_dsMonthes[i].values;

			let nYear = parseInt(sMonth.substring(0, 2));
			let nMonth = parseInt(sMonth.substring(2, 4));
			let nCountSum = d3.sum(vCountries, vTouristType[nType].data);

			if (nYear < nYear_Min)
				continue;

			if (nYear > nYear_Max)
				continue;

			dsMonthes.push({"year":nYear, "month":nMonth, "count_sum":nCountSum});

			dsMonthSum[nMonth] += nCountSum;
			dsYearMonthSum[nYear - nYear_Min][nMonth] += nCountSum;
		}

		dsTouristTypeData.push({"monthes":dsMonthes, "month_sum":dsMonthSum, "year_month_sum":dsYearMonthSum});
	}


	// ---------------------------------------------------

	fScale_Circle = d3.scaleLinear()
							.domain([0, 12])
							.range([0, 360]);

	// ---------------------------------------------------

	let divOptions_Background = d3.select("#div_id_page_options_background");

	let divOptions = divOptions_Background.append("div")
												.attr("id", "div_id_page_options");

	funcDraw_CountriesDisplay_Month(divOptions);

	// ---------------------------------------------------------------
	
	let svgMain = d3.select("#div_id_main")
					.append("svg")	
						.attr("id", "svg_id_main");

	let svgMonth = svgMain.append("g")
						.attr("id", "g_id_month")
						.attr("width", MAIN_WIDTH + "pt")
						.attr("height", MAIN_WIDTH + "pt");

	funcDraw_MonthRuler(svgMonth);

	funcDraw_Monthes_TouristTypes(svgMonth, 
					 			  dsTouristTypeData);

	funcDraw_MonthTitle(svgMonth);
	funcDraw_MonthInfo(svgMonth);

	// ---------------------------------------------------------------

	$("#div_id_main").css("height", "400pt");
	$("#svg_id_main").css("height", "400pt");
}

function funcDraw_Monthes_TouristTypes(svgMonth, 
						  			   dsTouristTypeData) {
	
	g_nMonthCount_Max = 0;
	
	for (let nType = 0; nType < vTouristType.length; nType++) {

		if (vTouristType[nType].path_display) {
		
			let dsMonthSum = dsTouristTypeData[nType].month_sum;

			let nMaxMonthSum = d3.max(dsMonthSum, function (d) { return d; });

			if (g_nMonthCount_Max < nMaxMonthSum)
				g_nMonthCount_Max = nMaxMonthSum;
		}
	}

	for (let nType = 0; nType < dsTouristTypeData.length; nType++) {

		let dsMonthes = dsTouristTypeData[nType].monthes;
		let dsMonthSum = dsTouristTypeData[nType].month_sum;
		let dsYearMonthSum = dsTouristTypeData[nType].year_month_sum;

		let nMaxMonthSum = d3.max(dsMonthSum, function (d) { return d; });

		fScale_Radius = d3.scaleLinear()
								.domain([0, g_nMonthCount_Max])
								.range([80, 240]);

		if (vTouristType[nType].path_display)
			funcDraw_Monthes(svgMonth, 
							 dsYearMonthSum,
							 nType);
	}

	svgMonth.select("#text_id_count_max")
				.attr("y", (MAIN_WIDTH / 4 + 15 - funcGetSVGMain_PT(fScale_Radius(g_nMonthCount_Max)) - 5) + "pt")
				.text(g_nMonthCount_Max);

	svgMonth.select("#circle_id_month_ruler_1")
				.attr("r", funcGetSVGMain_PT(fScale_Radius(g_nMonthCount_Max)) + "pt");

	svgMonth.select("#circle_id_month_ruler_2")
				.attr("r", funcGetSVGMain_PT(fScale_Radius(g_nMonthCount_Max / 2)) + "pt");
}

function funcDraw_Monthes(svgMonth, 
						  dsYearMonthSum,
						  nType) {

	let formatNumStr = d3.format(",");

	for (let y = 0; y < dsYearMonthSum.length; y++) {

		let nYear = y + nYear_Min;

		//console.log(dsYearMonthSum[y]);

		for (let nMonth = 1; nMonth <= 12; nMonth++) {

			let nTotal_Inner = (y - 1 >= 0) ? d3.sum(dsYearMonthSum, function (d, i) { if (i <= y - 1) return d[nMonth]; }) : 0;
			let nTotal_Outer = d3.sum(dsYearMonthSum, function (d, i) { if (i <= y) return d[nMonth]; });//dsYearMonthSum[y][nMonth];

	        let arc = d3.arc()
	                        .innerRadius(fScale_Radius(nTotal_Inner))
	                        .outerRadius(fScale_Radius(nTotal_Outer));

	        let pie = d3.pie()
						    .startAngle((Math.PI * 2 / 12) * (nMonth - 1)) 
						    .endAngle((Math.PI * 2 / 12)  * (nMonth));

			let nType_This = nType;
			let nYear_This = nYear;
			let nMonth_This = nMonth;
			let nCount_This = dsYearMonthSum[y][nMonth];
			let nCountSum_This = d3.sum(dsYearMonthSum, function(d) { return d[nMonth]; });

	        svgMonth.selectAll("g.path_class_" + nYear + "_" + nMonth)
	                      .data(pie([1]))
	                      .enter()
	                      .append("g")
	                      .append("path")
	                      	.attr("id", "path_id_" + nType_This + "_" + nYear + "_" + nMonth)
	            			.attr("class", "path_class_month_arc " + vTouristType[nType].class_name_color)
	            			.attr("d", arc)
	       					.attr("transform", "translate(" + funcGetSVGMain_PX(MAIN_WIDTH / 2) + "," + funcGetSVGMain_PX(MAIN_WIDTH / 4 + 15) + ") ")
	            			.attr("fill-opacity", ((y + 1) / dsYearMonthSum.length) * 0.8)
							.on("mouseover", function (d) {
								
								let sMonth = d3.timeFormat("%b")(new Date(nYear_This, (nMonth_This - 1)));

								let sMonthYear = (sMonth  + ". '" + nYear_This);

								d3.select("#path_id_" + nType_This + "_" + nYear + "_" + nMonth)
									.attr("fill-opacity", 1);

								d3.select("#text_id_month_selected")
									.attr("fill", vTouristType[nType_This].color)
									.text(sMonthYear);

								d3.select("#text_id_month_count_selected")
									.attr("fill", vTouristType[nType_This].color)
									.text(formatNumStr(nCount_This) + " visited");

								d3.select("#text_id_month_selected_total")
									.attr("fill", vTouristType[nType_This].color)
									.text(sMonth + ". in total");

								d3.select("#text_id_month_count_selected_total")
									.attr("fill", vTouristType[nType_This].color)
									.text(formatNumStr(nCountSum_This) + " visited");
							})
							.on("mouseout", function (d) {

								d3.select("#path_id_" + nType_This + "_" + nYear + "_" + nMonth)
									.attr("fill-opacity", ((y + 1) / dsYearMonthSum.length) * 0.8);

								d3.select("#text_id_month_selected")
									.text("");

								d3.select("#text_id_month_count_selected")
									.text("");

								d3.select("#text_id_month_selected_total")
									.text("");

								d3.select("#text_id_month_count_selected_total")
									.text("");
							});
		}
	}
}

function funcDraw_MonthInfo(svgMonth) {

	let padding_top = 40;
	let text_spacing = 18;
	let title_font_size = 10;

	let text_x = PADDING_LEFT;
	let text_y = padding_top;

	svgMonth.append("text")
						.attr("id", "text_id_month_selected")
						.attr("class", "text_class_country_title font_size_16")
						.attr("x", text_x + "pt")
						.attr("y", text_y + title_font_size + (text_spacing * 0)  + "pt") 
						.text("");

	svgMonth.append("text")
						.attr("id", "text_id_month_count_selected")
						.attr("class", "text_class_month_subtitle font_size_12")
						.attr("x", text_x + "pt")
						.attr("y", text_y + title_font_size + (text_spacing * 1) + "pt") 
						.text("");

	svgMonth.append("text")
						.attr("id", "text_id_month_selected_total")
						.attr("class", "text_class_month_subtitle font_size_12")
						.attr("x", text_x + "pt")
						.attr("y", text_y + title_font_size + (text_spacing * 2) + title_font_size + "pt") 
						.text("");

	svgMonth.append("text")
						.attr("id", "text_id_month_count_selected_total")
						.attr("class", "text_class_month_subtitle font_size_12")
						.attr("x", text_x + "pt")
						.attr("y", text_y + title_font_size + (text_spacing * 3) + title_font_size + "pt") 
						.text("");
}

function funcDraw_MonthRuler(svgMonth) {

	svgMonth.append("text")
				.attr("id", "text_id_count_max")
				.attr("class", "font_size_10 color_main text_anchor_middle")
				.attr("x", (MAIN_WIDTH / 2) + "pt")
				.attr("y", (MAIN_WIDTH / 4 + 15) + "pt")
				.text("");

	svgMonth.append("circle")
				.attr("id", "circle_id_month_ruler_1")
				.attr("class", "color_main circle_class_month_ruler")
				.attr("cx", (MAIN_WIDTH / 2) + "pt")
				.attr("cy", (MAIN_WIDTH / 4 + 15) + "pt");

	svgMonth.append("circle")
				.attr("id", "circle_id_month_ruler_2")
				.attr("class", "color_main circle_class_month_ruler")
				.attr("cx", (MAIN_WIDTH / 2) + "pt")
				.attr("cy", (MAIN_WIDTH / 4 + 15) + "pt");
}

function funcDraw_MonthTitle(svgMonth) {

	let vsMonthes = [];
	let vsTitles = [];

	for (let nMonth = 0; nMonth < 12; nMonth++) {

		vsMonthes.push(1);
		vsTitles.push(d3.timeFormat("%b")(new Date(0, nMonth)));
	}

    let arc = d3.arc()
                    .innerRadius(80 / 2)
                    .outerRadius(80);

    let pie = d3.pie();

    svgMonth.selectAll("text.text_class_month_title")
                  .data(pie(vsMonthes))
                  .enter()
                  .append("g")
                  .append("text")
        			.attr("class", "font_size_10 color_main text_anchor_middle text_class_month_title")
   					.attr("transform", function (d) { 
   						return "translate(" + 
   									(funcGetSVGMain_PX(MAIN_WIDTH / 2) + arc.centroid(d)[0]) + "," + 
   									(funcGetSVGMain_PX(MAIN_WIDTH / 4 + 15) + arc.centroid(d)[1] + 4) + ") "; })
					.text(function (d, i) { return vsTitles[i]; } );
}

function funcDraw_CountriesDisplay_Month(divOptions) {

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

			funcDraw_ByMonth();
		});
	}
}
