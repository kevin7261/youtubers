

function funcDraw_AboutMe_Main() {

	funcPageDisplayControl("span_id_options_about_me");

	// ---------------------------------------------------

	d3.select("#div_id_main")
		.append("div")	
			.attr("id", "div_id_about_me_title")	
			.attr("class", "div_class_about_me font_size_16 color_main")	
				.text("About Me");

	d3.select("#div_id_main")
		.append("div")	
			.attr("id", "div_id_about_me_content")	
			.attr("class", "div_class_about_me font_size_12 color_main")	
				.text("smilekevin");
}
