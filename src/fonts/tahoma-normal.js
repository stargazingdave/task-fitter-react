﻿import { jsPDF } from "jspdf"
var callAddFont = function () {
        this.addFileToVFS('tahoma-normal.ttf', font);
        this.addFont('tahoma-normal.ttf', 'tahoma', 'normal');
    };
jsPDF.API.events.push(['addFonts', callAddFont])