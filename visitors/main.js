
var g_nAllCountrysCount = 0;

var g_vDisplayMode = [];

var g_vTotalIndex = [];

// -------

var g_bShowOptions = false;

var g_sPage = 0;


$(document).ready(function(){

});

// -------

function funcLoadData(sFilePath, sFileName, funcAfterLoad, page) {

	g_sPage = (page != "") ? page : "all";//parseInt(page);


	let sPathName = g_sFilePath + "/" + g_sFileName + ".json";

	d3.json(sPathName, function(error, data) {
		
		if (error) console.log(error);
		
		g_dsTouristsJOSM = data.countries
									.filter(function(d) { if (d.class_residence != "unstated") return d; });

		g_dsCountries = d3.nest()
						  .key(function(d) { return d.class_residence; })
						  .entries(g_dsTouristsJOSM)
						  .sort(function(a, b) 
						  { 
						  	return d3.descending(
						  				d3.sum(a.values, function (d) { return d.total; }), 
						  				d3.sum(b.values, function (d) { return d.total; })
						  			); 
						  });

		g_dsMonthes = d3.nest()
						  .key(function(d) { return d.month; })
						  .entries(g_dsTouristsJOSM)
						  .sort(function(a, b) 
						  { 
						  	return d3.ascending(
						  				d3.sum(a.values, function (d) { return d.month; }), 
						  				d3.sum(b.values, function (d) { return d.month; })
						  			); 
						  });

		let dsYears = d3.nest()
						  .key(function(d) { return d.month.toString().substring(0, 2); })
						  .entries(g_dsTouristsJOSM)
						  .sort(function(a, b) 
						  { 
						  	return d3.ascending(
						  				d3.sum(a.values, function (d) { return d.month; }), 
						  				d3.sum(b.values, function (d) { return d.month; })
						  			); 
						  });

		g_dsYears = [];

		for (var i = 0; i < dsYears.length; i++) {

			g_dsYears.push(

				d3.nest()
					.key(function(d) { return d.class_residence; })
					.entries(dsYears[i].values)
					.sort(function(a, b) 
					{ 
					  	return d3.descending(
					  				d3.sum(a.values, function (d) { return d.total; }), 
					  				d3.sum(b.values, function (d) { return d.total; })
					  			); 
					})
			);
		}

		g_nAllCountrysCount = g_dsCountries.length;

		funcAfterLoad();
    });
}

function funcMain() {

	funcInit();

	funcDraw();
}

function funcInit() {

	$('#span_id_options_all').click(function() { 
	
		window.location.href = "index.html?p=all";

		//funcDraw_All();
	});

	$('#span_id_options_by_country').click(function() { 
	
		window.location.href = "index.html?p=by_country";
	
		//funcDraw_ByCountry();
	});

	$('#span_id_options_by_ranking').click(function() { 
	
		window.location.href = "index.html?p=by_ranking";
	
		//uncDraw_ByRanking();
	});

	$('#span_id_options_by_month').click(function() { 
	
		window.location.href = "index.html?p=by_month";
	
		//funcDraw_ByMonth();
	});

	$('#span_id_options_about_me').click(function() {
	
		window.location.href = "index.html?p=about_me"; 
	
		//funcDraw_AboutMe();
	});

	nMonth_Min = d3.min(g_dsTouristsJOSM, function (d) { return d.month; });//"1101";
	nMonth_Max = d3.max(g_dsTouristsJOSM, function (d) { return d.month; });//"1809";
}

function funcDraw() {

	funcDraw_Title();

	switch (g_sPage) {
		case "all": 		{ funcDraw_All(); break; }
		case "by_country": 	{ funcDraw_ByCountry(); break; }
		case "by_ranking":	{ funcDraw_ByRanking(); break; }
		case "by_month":	{ funcDraw_ByMonth(); break; }
		case "about_me": 	{ funcDraw_AboutMe(); break; }
	}
}

function funcDraw_Title() {

}

function funcDraw_All() {

	d3.select("#div_id_page_options").remove();
	d3.select(".div_class_countries_panel").remove();
	d3.select("#svg_id_main").remove();

	vCountryRulerMax = [];
	vfScale_Total_PX_Country = [];

	for (var i = 0; i < vTouristType.length; i++) {
		vTouristType[i].line = [];
	}

	funcDraw_All_Main();
}

function funcDraw_ByCountry() {

	d3.select("#div_id_page_options").remove();
	d3.select(".div_class_countries_panel").remove();
	d3.select("#svg_id_main").remove();

	vCountryRulerMax = [];
	vfScale_Total_PX_Country = [];

	for (var i = 0; i < vTouristType.length; i++) {
		vTouristType[i].line = [];
	}

	funcDraw_ByCountry_Main();

	//displayOptions(false);
}

function funcDraw_ByRanking() {

	d3.select("#div_id_page_options").remove();
	d3.select(".div_class_countries_panel").remove();
	d3.select("#svg_id_main").remove();

	funcDraw_ByRanking_Main();
}

function funcDraw_ByMonth() {

	d3.select("#div_id_page_options").remove();
	d3.select(".div_class_countries_panel").remove();
	d3.select("#svg_id_main").remove();

	funcDraw_ByMonth_Main();
}

function funcDraw_AboutMe() {

	d3.select("#div_id_page_options").remove();
	d3.select(".div_class_countries_panel").remove();
	d3.select("#svg_id_main").remove();

	funcDraw_AboutMe_Main();
}
