﻿import { jsPDF } from "jspdf"
var callAddFont = function () {
this.addFileToVFS('segoeui-normal.ttf', font);
this.addFont('segoeui-normal.ttf', 'segoeui', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])