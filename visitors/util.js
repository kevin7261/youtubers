
function getMonthCount(nYearMonth_Start, nYearMonth_End) {

	let nYear_Start = parseInt(nYearMonth_Start.toString().substring(0, 2));
	let nMonth_Start = parseInt(nYearMonth_Start.toString().substring(2, 4));
	let nYear_End = parseInt(nYearMonth_End.toString().substring(0, 2));
	let nMonth_End = parseInt(nYearMonth_End.toString().substring(2, 4));

	let nMonthCount = 0;

	if (nYear_Start == nYear_End) {

		for (let m = nMonth_Start; m < nMonth_End; m++) 
			nMonthCount += 1;

		nMonthCount++;

	} else {

		nMonthCount += ((nYear_End - nYear_Start - 1) * 12);

		for (let m = nMonth_Start; m <= 12; m++)
			nMonthCount += 1;

		for (let m = 1; m <= nMonth_End; m++)
			nMonthCount += 1;
	}

	return nMonthCount;
}

function funcPageDisplayControl(sIDName_SelectedPage) {

	if (g_sIDName_SelectedPage != "") {

		console.log(g_sIDName_SelectedPage);

		$("#" + g_sIDName_SelectedPage)
				.css("border-bottom-color", COLOR_BACKGROUND);

		$("#" + g_sIDName_SelectedPage)
				.hover(
					function() {
						$(this).css("border-bottom-color", COLOR_MAIN);
					},
					function() {
						$(this).css("border-bottom-color", COLOR_BACKGROUND);
					});
	}

	g_sIDName_SelectedPage = sIDName_SelectedPage;

	$("#" + g_sIDName_SelectedPage).unbind('mouseenter mouseleave')


	$("#" + g_sIDName_SelectedPage)
			.css("border-bottom-color", COLOR_MAIN);
}

// -------------------------------------------------


function funcGetSVGMain_PX(pt)
{
	return pt * (g_nSVG_Main_W_PX / g_nSVG_Main_W_PT);
}

function funcGetSVGMain_PT(px)
{
	return px * (g_nSVG_Main_W_PT / g_nSVG_Main_W_PX);
}
