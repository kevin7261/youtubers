
VIDEOS_YEAR_START = 16;
VIDEOS_YEAR_END = 18;

MAIN_WIDTH = 800; // pt
YOUTUBER_HEIGHT = 150; // pt

PADDING_LEFT = 50; // pt
YOUTUBER_IMAGE_WIDTH = 40; // pt

var g_dsYoutubers = [];

function funcLoadData(sFilePath, sFileName, fAfterLoad) {

	let sPathName = g_sFilePath + "/" + g_sFileName + ".json";

	d3.json(sPathName, function(error, data) {
		
		if (error) console.log(error);

		//g_dsYoutubers = data.youtubers;
		g_dsYoutubers = data.youtubers.filter(function(d) { if (d.videos.length > 0) return d; })
									  .sort(function(a, b) { return d3.descending(a.subscriber_count, b.subscriber_count); });
		
		fAfterLoad();
    });
}

function funcDraw() {

	funcDraw_Title();
	funcDraw_Content();
}

function funcDraw_Title() {

}

function funcDraw_Content() {

	let nDate_Min = parseInt(VIDEOS_YEAR_START + "0101");//d3.min(g_dsYoutubers, function (d) { return parseInt(d.videos[d.videos.length - 1].date); });
	let nDate_Max = parseInt(VIDEOS_YEAR_END + "1231");//d3.max(g_dsYoutubers, function (d) { return parseInt(d.videos[0].date); });
	let nViewCount_Max = d3.max(g_dsYoutubers, function (d) { return d3.max(d.videos, function (d_video) { return d_video.view_count; }); });
	let nLikeCount_Max = d3.max(g_dsYoutubers, function (d) { return d3.max(d.videos, function (d_video) { return d_video.like_count; }); });
	let nDislikeCount_Max = d3.max(g_dsYoutubers, function (d) { return d3.max(d.videos, function (d_video) { return d_video.dislike_count; }); });

	let fScale_Youtuber = d3.scaleLinear()
								.domain([0, g_dsYoutubers.length])
								.range([0, YOUTUBER_HEIGHT * g_dsYoutubers.length]);

	let nDate_Count = getDateNumber("181231", VIDEOS_YEAR_START, VIDEOS_YEAR_END);

	let fScale_Date_PT = d3.scaleLinear()
								.domain([0, nDate_Count])
								.range([0, MAIN_WIDTH]);

	let fScale_Date_PX = d3.scaleLinear()
								.domain([0, nDate_Count])
								.range([0, funcGetSVGMain_PX(MAIN_WIDTH)]);

	let fScale_ViewCount_PX = d3.scaleLinear()
								.domain([0, nViewCount_Max])
								.range([0, funcGetSVGMain_PX(YOUTUBER_HEIGHT * 20)]);

	let fScale_DislikeCount_PX = d3.scaleLinear()
								.domain([0, nViewCount_Max])
								.range([0, -funcGetSVGMain_PX(YOUTUBER_HEIGHT * 20)]);

	let fScale_LikeRatio = d3.scaleLinear()
								.domain([0, 100])
								.range([0, 100]);

	let svgMain = d3.select("#" + "div_id_main")
					.append("svg")	
						.attr("id", "svg_id_main");

	let svgYoutubers = svgMain.append("g")
						.attr("id", "youtubers");

	let d3_curve_type = d3.curveBasis;//d3.curveBundle;//d3.curveCardinal;//d3.curveLinear;

	//let fLine_ViewCount_Ori = d3.line()
	//				.x(function(d) { return fScale_Date_PX(getDateNumber(d.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)); })
	//				.y(function(d) { return funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_ViewCount_PX(0); })
	//					.curve(d3_curve_type);

	let fLine_ViewCount = d3.line()
					.x(function(d) { return fScale_Date_PX(getDateNumber(d.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)); })
					.y(function(d) { return funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_ViewCount_PX(d.view_count); })
						.curve(d3_curve_type);

	let fLine_LikeCount = d3.line()
					.x(function(d) { return fScale_Date_PX(getDateNumber(d.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)); })
					.y(function(d) { return funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_ViewCount_PX(d.like_count * 50); })
						.curve(d3_curve_type);

	let fLine_DislikeCount = d3.line()
					.x(function(d) { return fScale_Date_PX(getDateNumber(d.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)); })
					.y(function(d) { return funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_DislikeCount_PX(d.dislike_count * 500); })
						.curve(d3_curve_type);

/*
	svgYoutubers.append("circle")
					.attr("id", "circle_id_view_count")
					.attr("class", "color_view")
					.attr("r", 1 + "pt");

	svgYoutubers.append("circle")
					.attr("id", "circle_id_like_count")
					.attr("class", "color_like")
					.attr("r", 1 + "pt");

	svgYoutubers.append("circle")
					.attr("id", "circle_id_dislike_count")
					.attr("class", "color_dislike")
					.attr("r", 1 + "pt");
*/

	g_dsYoutubers.forEach(function(d, i) {

		let svgYoutuber = svgMain.append("g")
									.attr("class", "youtuber");

		if (d.videos.length == 0)
			return;

		videos = d.videos.reverse();//.filter(function(d) { if (parseInt(d.date) >= VIDEOS_YEAR_START * 10000) { return d; } });

		// -------

		svgVideos = svgYoutuber.append("svg")
									.attr("id", "svg_id_videos_" + d.channel_id)
									.attr("class", "svg_class_videos")
									.attr("width", MAIN_WIDTH + "pt")
									.attr("height", (YOUTUBER_HEIGHT * 2) + "pt")
									.attr("x", 0 + "pt")
									.attr("y", fScale_Youtuber(i) + "pt");

		// -------

		//let lineViewCount_Ori = fLine_ViewCount_Ori(videos);
		let lineViewCount = fLine_ViewCount(videos);

		let path_view_count = svgVideos.append("path")
					.attr("class", "path_class_view color_view")
					//.attr("d", lineViewCount_Ori)
					//.transition()
					//.duration(3000)
					.attr("d", lineViewCount);

		// -------

		let lineLikeCount = fLine_LikeCount(videos);

		lineLikeCount += ("V" + (funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_ViewCount_PX(0 * 50)));
		lineLikeCount += ("H" + fScale_Date_PX(getDateNumber(videos[0].date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)));
		lineLikeCount += ("L" + fScale_Date_PX(getDateNumber(videos[0].date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "," + (funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_ViewCount_PX(videos[0].like_count * 50)));

		let path_like_count = svgVideos.append("path")
					.attr("class", "path_class_like color_like")
					.attr("d", lineLikeCount);

		// -------

		let lineDislikeCount = fLine_DislikeCount(videos);

		lineDislikeCount += ("V" + (funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_DislikeCount_PX(0 * 500)));
		lineDislikeCount += ("H" + fScale_Date_PX(getDateNumber(videos[0].date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)));
		lineDislikeCount += ("L" + fScale_Date_PX(getDateNumber(videos[0].date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "," + (funcGetSVGMain_PX(YOUTUBER_HEIGHT) - fScale_DislikeCount_PX(videos[0].dislike_count * 500)));

		let path_dislike_count = svgVideos.append("path")
					.attr("class", "path_class_dislike color_dislike")
					.attr("d", lineDislikeCount);

		// -------

		svgVideos.selectAll("circle.circle_class_video_" + d.channel_id)
			.data(videos)
			.enter()
				.append("circle")
					.attr("class", "color_view circle_class_video_" + d.channel_id)
					.attr("cx", function(d_video) { return (getDateNumber(d_video.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END) * MAIN_WIDTH / getDateNumber("181231", VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "pt"; })
					.attr("cy", function(d_video) { return (YOUTUBER_HEIGHT) + "pt"; })
					.attr("fill", "rgba(40, 40, 40)")
					.attr("r", 0.5 + "pt")
					.attr("opacity", 0);

		// -------

		svgVideos.append("rect")
						.attr("class", "")
						.attr("fill", "red")
						.attr("x", 0 + "pt")
						.attr("y", 0 + 50 + "pt") 
						.attr("width", MAIN_WIDTH + "pt")
						.attr("height", YOUTUBER_HEIGHT + "pt")
						.attr("fill-opacity", 0)
						.on("mouseover", function (d_video) {

							showVideoCircles(d.channel_id);

							showDislikeRatio(d.channel_id);

						})
						.on("mouseout", function (d_video) {

							hideVideoCircles(d.channel_id);

							hideDislikeRatio(d.channel_id);
					    });
				
		// ------- 

		svgVideos.selectAll("line.video_" + d.channel_id)
			.data(videos)
			.enter()
				.append("a")
				.attr("class", function(d_video) { return "a_class_video_title_" + d_video.video_id; })
				.attr("xlink:href", function(d_video) { return "https://www.youtube.com/watch?v=" + d_video.video_id; })
				.attr("target", "_blank")
				.append("line")
					.attr("class", "video_" + d.channel_id)
					.attr("x1", function(d_video) { return fScale_Date_PT(getDateNumber(d_video.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "pt"; })
					.attr("y1", function(d_video) { return (YOUTUBER_HEIGHT + 50) + "pt"; })
					.attr("x2", function(d_video) { return fScale_Date_PT(getDateNumber(d_video.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "pt"; })
					.attr("y2", function(d_video) { return (50) + "pt"; })
					.attr("stroke", "grey")
					.attr("stroke-width", 15 + "pt")
					.attr("stroke-opacity", 0)
					.on("mouseover", function (d_video, i_video) {
						
						/*
						var coordinates = d3.mouse(this);
						var nXpt = coordinates[0];
						var nYpt = coordinates[1];
						*/

						showVideoCircles(d.channel_id);

						showDislikeRatio(d.channel_id);

   						let formatNumStr = d3.format(",.10o");

   						let pt_x = fScale_Date_PT(getDateNumber(d_video.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END));

   						let text_anchor = (pt_x < MAIN_WIDTH / 2) ? "start" : "end";
   						let text_anchor_rev = (pt_x < MAIN_WIDTH / 2) ? "end" : "start";
   						let pt_x_text = pt_x + ((pt_x < MAIN_WIDTH / 2) ? 5 : -5);
   						let pt_x_text_rev = pt_x + ((pt_x < MAIN_WIDTH / 2) ? -5 : 5);

   						let date = "20" + d_video.date.substring(0, 2) + "年" +
			   					   d_video.date.substring(2, 4) + "月" +
			   					   d_video.date.substring(4, 6) + "日";

						d3.select("#line_id_video_select")
							.attr("x1", pt_x + "pt")
							.attr("y1", fScale_Youtuber(i) + "pt")
							.attr("x2", pt_x + "pt")
							.attr("y2", fScale_Youtuber(i) + (YOUTUBER_HEIGHT * 2) + "pt");

						/*
						d3.select("#text_id_video_date")
							.attr("x", pt_x_text + "pt")
							.attr("y", (fScale_Youtuber(i) + YOUTUBER_HEIGHT - 5) + "pt")
							.attr("text-anchor", text_anchor)
							.text(date);
						*/

						/*
						d3.select("#text_id_video_date")
							.attr("x", pt_x_text_rev + "pt")
							.attr("y", (fScale_Youtuber(i) + YOUTUBER_HEIGHT + 12) + "pt")
							.attr("text-anchor", text_anchor_rev)
							.text(d_video.date);
						*/

						d3.select("#text_id_video_title")
							.attr("x", pt_x_text + "pt")
							.attr("y", (fScale_Youtuber(i) + YOUTUBER_HEIGHT + 12) + "pt")
							.attr("text-anchor", text_anchor)
							.text(d_video.title);

						d3.select("#text_id_video_subtitle").remove();

						svgYoutubers.append("text")
										.attr("id", "text_id_video_subtitle")
										.attr("class", "font_size_6 color_sub")
										.attr("x", pt_x_text + "pt")
										.attr("y", (fScale_Youtuber(i) + YOUTUBER_HEIGHT + 22) + "pt")
										.attr("text-anchor", text_anchor)
										.append("tspan")
											.text(date + "　")
											.attr("fill", "#777777")
										.append("tspan")
											.text(formatNumStr(d_video.view_count) + "人次觀看　")
											.attr("fill", "#286DA8")
										.append("tspan")
											.text(formatNumStr(d_video.like_count) + "人喜歡　")
											.attr("fill", "#015249")
										.append("tspan")
											.text(formatNumStr(d_video.dislike_count) + "人不喜歡")
											.attr("fill", "#CD5360");

/*
						let x_pt = fScale_Date_PT(getDateNumber(d_video.date, VIDEOS_YEAR_START, VIDEOS_YEAR_END));
						let y_pt_view_count = YOUTUBER_HEIGHT - funcGetSVGMain_PT(fScale_ViewCount_PX(d_video.view_count));
						let y_pt_like_count = YOUTUBER_HEIGHT - funcGetSVGMain_PT(fScale_ViewCount_PX(d_video.like_count * 50));
						let y_pt_dislike_count = YOUTUBER_HEIGHT - funcGetSVGMain_PT(fScale_DislikeCount_PX(d_video.dislike_count * 500));

						px_view_count = getSelectCountCirclePX(path_view_count, x_pt, y_pt_view_count);
						px_like_count = getSelectCountCirclePX(path_like_count, x_pt, y_pt_like_count);
						px_dislike_count = getSelectCountCirclePX(path_dislike_count, x_pt, y_pt_dislike_count);

						d3.select("#circle_id_view_count")
						    .attr("cx", funcGetSVGMain_PT(px_view_count[0]) + "pt")
						    .attr("cy", fScale_Youtuber(i) + funcGetSVGMain_PT(px_view_count[1]) + "pt");

						d3.select("#circle_id_like_count")
						    .attr("cx", funcGetSVGMain_PT(px_like_count[0]) + "pt")
						    .attr("cy", fScale_Youtuber(i) + funcGetSVGMain_PT(px_like_count[1]) + "pt");

						d3.select("#circle_id_dislike_count")
						    .attr("cx", funcGetSVGMain_PT(px_dislike_count[0]) + "pt")
						    .attr("cy", fScale_Youtuber(i) + funcGetSVGMain_PT(px_dislike_count[1]) + "pt");
						    */

				    })
					.on("mouseout", function (d_video) {

						hideVideoCircles(d.channel_id);

						hideDislikeRatio(d.channel_id);
				    });

		// ----------------------------

		svgVideos.append("text")
					.attr("id", "text_id_video_year_2017_" + d.channel_id)
					.attr("class", "text_class_video_year font_size_6 color_main font_weigh_bold")
					.attr("x", fScale_Date_PT(getDateNumber("170101", VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "pt")
					.attr("y", YOUTUBER_HEIGHT + 32 + "pt")
					.attr("fill-opacity", 0)
					.text("2017");

		svgVideos.append("text")
					.attr("id", "text_id_video_year_2018_" + d.channel_id)
					.attr("class", "text_class_video_year font_size_6 color_main font_weigh_bold")
					.attr("x", fScale_Date_PT(getDateNumber("180101", VIDEOS_YEAR_START, VIDEOS_YEAR_END)) + "pt")
					.attr("y", YOUTUBER_HEIGHT + 32 + "pt")
					.attr("fill-opacity", 0)
					.text("2018");

		// ----------------------------

		funcDraw_ChannelName(svgMain, d, i, fScale_Youtuber, fScale_LikeRatio);
	});

	svgYoutubers.append("text")
					.attr("id", "text_id_video_date")
					.attr("class", "font_size_6 color_sub")
					.attr("text-anchor", "start");

	svgYoutubers.append("text")
					.attr("id", "text_id_video_title")
					.attr("class", "font_size_8 font_weight_bold")
					.attr("text-anchor", "start");

	/*
	svgYoutubers.append("text")
					.attr("id", "text_id_video_subtitle")
					.attr("class", "font_size_6 color_sub")
					.attr("text-anchor", "start");
	*/

	svgYoutubers.append("line")
					.attr("id", "line_id_video_select")
					.attr("class", "color_view");

}

function funcDraw_SelectVideo(svgMain, d, i, fScale_Youtuber, fScale_LikeRatio) {

}

function funcDraw_ChannelName(svgMain, d, i, fScale_Youtuber, fScale_LikeRatio) {

		let padding_top = 50;
		let image_right_padding = 10;
		let text_spacing = 6;
		let title_font_size = 10;
		let subtitle_font_size = 8;
		let dislikeratio_stroke_size = 3;

		let text_x = PADDING_LEFT + YOUTUBER_IMAGE_WIDTH + image_right_padding;
		let text_y = fScale_Youtuber(i) + padding_top;

   		let formatNumStr = d3.format(",.10o");
   		let formatPercent = d3.format(".3p");

		svgYoutuber_title = svgMain.append("a")
							.attr("xlink:href", "https://www.youtube.com/channel/" + d.channel_id)
							.attr("target", "_blank")
							.append("g")
								.attr("class", "youtuber_title");

   		// draw image
   		{
			var svgYoutuber_defs = svgYoutuber_title.append('defs');

			svgYoutuber_defs.append("pattern")
							    .attr("id", "pattern_id_youtuber_" + d.channel_id)
							    .attr("class", "pattern_class_youtuber")
							    .attr("width", YOUTUBER_IMAGE_WIDTH + "pt")
							    .attr("height", YOUTUBER_IMAGE_WIDTH + "pt")
							    .attr("x", PADDING_LEFT + "pt")
							    .attr("y", padding_top + fScale_Youtuber(i) + "pt")
						    	.attr("patternUnits", "userSpaceOnUse")
							    .append("image")
							    	.attr("class", "image_class_youtuber")
								    .attr("width", YOUTUBER_IMAGE_WIDTH + "pt")
								    .attr("height", YOUTUBER_IMAGE_WIDTH + "pt")
								    .attr("xlink:href", d.image);

			svgYoutuber_title.append("circle")
							    .attr("class", "circle_class_youtuber_image")
							    .attr("cx", PADDING_LEFT + (YOUTUBER_IMAGE_WIDTH / 2) + "pt")
							    .attr("cy", padding_top + (YOUTUBER_IMAGE_WIDTH / 2) + fScale_Youtuber(i) + "pt")
							    .attr("r", (YOUTUBER_IMAGE_WIDTH / 2) + "pt")
							    .attr("fill", "url(#pattern_id_youtuber_" + d.channel_id + ")");
   		}

   		// draw text
		{
			svgYoutuber_title.append("text")
								.attr("class", "text_class_youtuber_title font_weight_bold")
								.attr("x", text_x + "pt")
								.attr("y", text_y + title_font_size + "pt") 
								.text(d.title);

			svgYoutuber_title.append("text")
								.attr("class", "text_class_youtuber_subtitle font_size_8 color_sub")
								.attr("x", text_x + "pt")
								.attr("y", text_y + title_font_size + text_spacing + subtitle_font_size + "pt") 
								.text(formatNumStr(d.subscriber_count) + "人訂閱　" +
									　formatNumStr(d.view_count) + "人次觀看　" +
									　formatNumStr(d.videos.length) + "部影片　");// +
									　//"負面聲量" + formatPercent(d.dislike_rate_avg));

			svgYoutuber_title.append("line")
								.attr("class", "line_id_likeratiobar")
								.attr("x1", text_x + "pt")
								.attr("y1", text_y + title_font_size + text_spacing + subtitle_font_size + text_spacing + dislikeratio_stroke_size + dislikeratio_stroke_size + "pt")
								.attr("x2", text_x + fScale_LikeRatio(100 - (d.dislike_rate_avg * 100)) + "pt")
								.attr("y2", text_y + title_font_size + text_spacing + subtitle_font_size + text_spacing + dislikeratio_stroke_size + dislikeratio_stroke_size + "pt")
								.attr("stroke", "#015249")
								.attr("stroke-width", dislikeratio_stroke_size + "pt")
								.attr("stroke-opacity", 0.2);

			svgYoutuber_title.append("line")
								.attr("class", "line_id_likeratio")
								.attr("x1", text_x + fScale_LikeRatio(100 - (d.dislike_rate_avg * 100)) + "pt")
								.attr("y1", text_y + title_font_size + text_spacing + subtitle_font_size + text_spacing + dislikeratio_stroke_size + dislikeratio_stroke_size + "pt")
								.attr("x2", text_x + fScale_LikeRatio(100) + "pt")
								.attr("y2", text_y + title_font_size + text_spacing + subtitle_font_size + text_spacing + dislikeratio_stroke_size + dislikeratio_stroke_size + "pt")
								.attr("stroke", "#CD5360")
								.attr("stroke-width", dislikeratio_stroke_size + "pt")
								.attr("stroke-opacity", 0.2);

			svgYoutuber_title.append("text")
								.attr("id", "text_id_video_dislikeratio_" + d.channel_id)
								.attr("class", "text_class_video_dislikeratio font_size_8 color_dislike")
								.attr("x", text_x + fScale_LikeRatio(100) +text_spacing +"pt")
								.attr("y", text_y + title_font_size + text_spacing + subtitle_font_size + text_spacing + subtitle_font_size + "pt")
								.attr("fill-opacity", 0)
								.text("負面聲量" + formatPercent(d.dislike_rate_avg));
		}

}

function showVideoCircles(nChannelID) {

	d3.selectAll("circle.circle_class_video_" + nChannelID)
		.attr("opacity", 0.6);

	d3.select("#text_id_video_year_2017_" + nChannelID)
		.attr("fill-opacity", 0.4);

	d3.select("#text_id_video_year_2018_" + nChannelID)
		.attr("fill-opacity", 0.4);
}

function hideVideoCircles(nChannelID) {

	d3.selectAll("circle.circle_class_video_" + nChannelID)
		.attr("opacity", 0);

	d3.select("#text_id_video_year_2017_" + nChannelID)
		.attr("fill-opacity", 0);

	d3.select("#text_id_video_year_2018_" + nChannelID)
		.attr("fill-opacity", 0);
}

function showDislikeRatio(nChannelID) {

	d3.select("#text_id_video_dislikeratio_" + nChannelID)
		.attr("fill-opacity", 0.8);
}

function hideDislikeRatio(nChannelID) {

	d3.select("#text_id_video_dislikeratio_" + nChannelID)
		.attr("fill-opacity", 0);
}

function getSelectCountCirclePX(path, x_pt, y_pt) {

	let x_px = funcGetSVGMain_PX(x_pt);
	let y_px = funcGetSVGMain_PX(y_pt);

	return closestPoint(path.node(), [x_px, y_px]);
}

function getDateNumber(sDate, nYear_Start, nYear_End)
{
	days = 0;

	year = parseInt(sDate.substring(0, 2));
	month = parseInt(sDate.substring(2, 4));
	date = parseInt(sDate.substring(4, 6));

	leap_year = (year % 4 == 0);

	for (let y = nYear_Start; y <= nYear_End; y++)
	{
		if (year <= y)
			break;

		days += 365;

		if (y % 4)
			days += 1;
	}

	for (let m = 1; m <= 12; m++)
	{
		if (month <= m)
			break;

		switch (m)
		{
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				date += 31;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				date += 30;
				break;
			case 2:
				date += ((leap_year) ? 29 : 28);
				break;
		}
	}

	days += date;

	return days;
}


function funcGetSVGMain_PX(pt)
{
	return pt * (g_nSVG_Main_W_PX / g_nSVG_Main_W_PT);
}

function funcGetSVGMain_PT(px)
{
	return px * (g_nSVG_Main_W_PT / g_nSVG_Main_W_PX);
}

function closestPoint(pathNode, point) {
  var pathLength = pathNode.getTotalLength(),
      precision = 8,
      best,
      bestLength,
      bestDistance = Infinity;
  // linear scan for coarse approximation
  for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
    if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
      best = scan, bestLength = scanLength, bestDistance = scanDistance;
    }
  }
  // binary search for precise estimate
  precision /= 2;
  while (precision > 0.5) {
    var before,
        after,
        beforeLength,
        afterLength,
        beforeDistance,
        afterDistance;
    if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
      best = before, bestLength = beforeLength, bestDistance = beforeDistance;
    } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
      best = after, bestLength = afterLength, bestDistance = afterDistance;
    } else {
      precision /= 2;
    }
  }
  best = [best.x, best.y];
  best.distance = Math.sqrt(bestDistance);
  return best;
  function distance2(p) {
    var dx = p.x - point[0],
        dy = p.y - point[1];
    return dx * dx + dy * dy;
  }
}
