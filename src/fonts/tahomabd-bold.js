﻿import { jsPDF } from "jspdf"
var callAddFont = function () {
this.addFileToVFS('tahomabd-bold.ttf', font);
this.addFont('tahomabd-bold.ttf', 'tahomabd', 'bold');
};
jsPDF.API.events.push(['addFonts', callAddFont])