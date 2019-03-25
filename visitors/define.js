
const MAIN_WIDTH = 800; // pt
const COUNTRY_HEIGHT = 150; // pt

const PADDING_LEFT = 50; // pt

const COLOR_BACKGROUND = "#223A59";
const COLOR_MAIN = "#FCFCFC";

const PATH_TRANSLATION_TIME = 1000;

const TOURIST_TYPE_TOTAL = 0;
const TOURIST_TYPE_PLEASURE = 1; 
const TOURIST_TYPE_BUSINESS = 2; // business, conference, exhibition
const TOURIST_TYPE_VISIT_RELATIVES = 3;
const TOURIST_TYPE_STUDY = 4;
const TOURIST_TYPE_OTHERS = 5; // medical_treatment, others

/*
const TOURIST_TYPE_BUSINESS = 0;
const TOURIST_TYPE_PLEASURE = 1;
const TOURIST_TYPE_VISIT_RELATIVES = 2;
const TOURIST_TYPE_CONFERENCE = 3;
const TOURIST_TYPE_STUDY = 4;
const TOURIST_TYPE_EXBITION = 5;
const TOURIST_TYPE_MEDICAL_TREATMENT = 6;
const TOURIST_TYPE_OTHERS = 7;
const TOURIST_TYPE_TOTAL = 8;
*/

let vTouristType = 
[
	{
		"id": TOURIST_TYPE_TOTAL,
		"field_name": "Total",
		"id_name": "total",
		"class_name_path": "path_class_total",
		"class_name_color": "color_total",
		"color": "#FCFCFC", 
		"data": function(d) { return d.total; }, 
		"fscale_rel": null, 
		"fscale_ind": null, 
		"path_display": true,
		"line": []
	},
	{
		"id": TOURIST_TYPE_PLEASURE, 
		"field_name": "Pleasure", 
		"id_name": "pleasure",
		"class_name_path": "path_class_except_total",
		"class_name_color": "color_pleasure", 
		"color": "#FF7F50",
		"data": function(d) { return d.pleasure; }, 
		"fscale_rel": null, 
		"fscale_ind": null, 
		"path_display": true,
		"line": []
	},
	{
		"id": TOURIST_TYPE_BUSINESS,
		"field_name": "Business", 
		"id_name": "business",
		"class_name_path": "path_class_except_total",
		"class_name_color": "color_business", 
		"color": "#FFD700",
		"data": function(d) { return d.business + d.conference + d.exhibition; }, 
		"fscale_rel": null, 
		"fscale_ind": null, 
		"path_display": true,
		"line": []
	},
	{
		"id": TOURIST_TYPE_VISIT_RELATIVES, 
		"field_name": "Visit Relatives", 
		"id_name": "visit_relatives", 
		"class_name_path": "path_class_except_total", 
		"class_name_color": "color_visit_relatives", 
		"color": "#ADFF2F", 
		"data": function(d) { return d.visit_relatives; }, 
		"fscale_rel": null, 
		"fscale_ind": null,
		"path_display": true, 
		"line": []
	},
	{
		"id": TOURIST_TYPE_STUDY,
		"field_name": "Study", 
		"id_name": "study", 
		"class_name_path": "path_class_except_total", 
		"class_name_color": "color_study",
		"color": "#87CEFA", 
		"data": function(d) { return d.study; }, 
		"fscale_rel": null, 
		"fscale_ind": null, 
		"path_display": true,
		"line": []
	},
	{
		"id": TOURIST_TYPE_OTHERS,
		"field_name": "Others",
		"id_name": "others", 
		"class_name_path": "path_class_except_total",
		"class_name_color": "color_others",
		"color": "#CD853F",
		"data": function(d) { return d.medical_treatment + d.others + d.unstated; }, 
		"fscale_rel": null, 
		"fscale_ind": null, 
		"path_display": false,
		"line": []
	},
];

// --------------------------------------------------------------------------------

var g_sIDName_SelectedPage = "";

// --------------------------------------------------------------------------------

var g_dsTouristsJOSM = [];
var g_dsCountries = [];
var g_dsMonthes = [];
var g_dsYears = [];

var nMonth_Min;
var nMonth_Max;

var g_nDisplayMode = 0;
let g_nLineType = 0;
