function parseTable(table) {
  tb = table.tBodies[0];

  // get headers
  headers = []
  for (var i = 0; i < tb.rows[0].cells.length; i++) {
    headers.push(tb.rows[0].cells[i].innerText);
  }

  // get table data
  data = [];

  for (var i = 0; i < tb.rows.length - 1; i++) {
    rData = [];

    for (var j = 0; j < tb.rows[i+1].cells.length; j++) {
      rData.push(tb.rows[i+1].cells[j].innerText);
    }

    data.push(rData);
  }

  return [headers, data];
}


function parsePlan(tableD) {
  plan = [
    {}, {}, {}, {}, {}
  ];

  data = tableD[1];
  hours = [];

  // for row in data
  for (var r = 0; r < data.length; r++) {
    hours.push(data[r][1]);

    // for column in row
    for (var c = 2; c < data[r].length; c++) {
      l = data[r][c];
      week_d = c - 2; // week day = column - 2

      // if lesson is not null
      if (l.toString().length > 1) {

        // if there are two (or more) lessons at the same time
        if (l.includes("\n")) {
          l = l.split("\n");

          for (var i = 0; i < l.length; i++) {
            l[i] = l[i].split(" ");

            l[i] = [l[i][0], l[i][2], l[i][1]];
          }
        }
        // one lesson at a time
        else {
          l = l.split(" ");

          l = [l[0], l[2], l[1]];
        }

        // subject, location, comment
        plan[week_d][r] = l;
      }
    }
  }

  return [plan, hours];
}
