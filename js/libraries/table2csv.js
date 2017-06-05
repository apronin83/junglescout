 /*
 * Updated by: Mohammad M. AlBanna
 * Website: MBanna.info 
 * Facebook: FB.com/MBanna.info
 *
 * Convert table to CSV file
 */

jQuery.fn.table2CSV = function(options) {
    var options = jQuery.extend({
        separator: ',',
        header: [],
        delivery: 'popup', // popup, value
        fileName: "content",
        firstRows: [] //print rows before tables
    },
    options);

    var csvData = [];
    var headerArr = [];
    var el = this;

    //header
    var numCols = options.header.length;
    var tmpRow = []; // construct header avalible array

    if (numCols > 0) {
        for (var i = 0; i < numCols; i++) {
            tmpRow[tmpRow.length] = formatData(options.header[i]);
        }
    } else {
        $(el).filter(':visible').find('thead:first th').each(function() {
            if ($(this).css('display') != 'none') tmpRow[tmpRow.length] = $(this).text();
        });
    }

    row2CSV(tmpRow);

    // actual data
    $(el).find('tr').each(function() {
        var tmpRow = [];
        $(this).filter(':visible').find('td').each(function() {
            if ($(this).css('display') != 'none') tmpRow[tmpRow.length] = formatData($(this).html());
        });
        row2CSV(tmpRow);
    });
    
    if (options.delivery == 'popup') {
        var mydata = csvData.join('\n');
       
        return popup(options.fileName,options.firstRows,mydata);
    } else {
        var mydata = csvData.join('\n');
        return mydata;
    }

    function row2CSV(tmpRow) {
        var tmp = tmpRow.join('') // to remove any blank rows
        if (tmpRow.length > 0 && tmp != '') {
            var mystr = tmpRow.join(options.separator);
            csvData[csvData.length] = mystr;
        }
    }

    function formatData(input) {
        //Replace and
        var output = input.replace(/&amp;+/g, "&");

        //Replace tooltip value
        output = output.replace("--i", "N.A.");

        //Replace &nbsp;
        output = output.replace(/&nbsp;/g, " ");

        //Replace &#x27a5;
        output = output.replace(/&#x27a5;/g, "->");

        //Replace quotes
        output = output.replace(/&quot;+/g, "");
        output = output.replace(/\"/g, "");

        //Replace quote
        output = output.replace(/&#39;+/g, "\'");

        //Replace <
        output = output.replace(/&lt;+/g, "<");

        //Replace Special UTF-8
        output = output.replace(/[^(\x20-\x7F\$\€\£)]/g,"");

        //Replace sharp
        output = output.replace(/\#/g, "");

        //HTML
        output = output.replace(/\<[^\<]+\>/g, "");
        
        if (output == "") return '';
        return '"' + output + '"';
    }

    function popup(filename,firstRows, data) {
        var a = document.createElement('a');
        var e = document.createEvent('MouseEvents');
        var rows = "";
        //Replace Special UTF-8
        filename = formatData(filename);
        filename = filename.replace(/\"/g,"");
        filename = filename.length > 80 ? filename.substring(0, 80) + "..." : filename;

        $.each(firstRows, function(index, val) {
            //Replace Special UTF-8
            val = formatData(val);
            rows += val+",,,,,,,,,,,,\n";
        });
        rows += ",,,,,,,,,,,,,\n";//Make a new line
        a.href = 'data:application/csv;charset=utf-8,' + encodeURIComponent(rows+data);
        a.download = filename+".csv";
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(e);
        return true;
    }
};