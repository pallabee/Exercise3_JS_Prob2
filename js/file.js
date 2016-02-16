
var fs = require('fs');
//Create Continent Lookup from country-continent mapping excel file
var contFile=fs.readFileSync('../data/country-cont.csv','utf-8').toString().split('\n');
var continentLookup=[];
for (var l = 0, llen = contFile.length; l < llen; l++) {
    var currentline = contFile[l].trim().split(",");
    if(contFile[l]){
      var cObj = new Object();
      cObj.country = currentline[0];
      cObj.continent=currentline[1];
      continentLookup.push(cObj);
    }
  }
//Read Data file
var input = fs.createReadStream('../data/WDI_Data.csv');
readLines(input, func);

var lineArr = [];

function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    //Storing column headers in an array
    var headers = lineArr[0].trim().split(",");
    //Lookup for Year (1993-2014)
    var yearLookup = [];
    for (var h = 4, hlen = headers.length; h < hlen; h++) {
      var yrObj = new Object();
      yrObj.year = headers[h].trim();
      yearLookup.push(yrObj);
    }
    //Declare Object array here for final json
    var GDPData = [],
      perCapitaGDPData = [],
      GNIData = [],
      perCapitaGNIData = [],
      gdpIndia = [],asArr=[],asArr=[],afArr=[],euArr=[],saArr=[],naArr=[],ocArr=[],aggrCont =[];
    //Looping thorough header elements
    for (var h = 0, hlen = headers.length; h < hlen; h++) {
      if (headers[h].indexOf("2005") > -1) {
        yearIndex = h;
      }

      //Check if header of current cell is a year
      var yresult = searchYearLookup(headers[h], yearLookup);
      //console.log(yresult);
      if (typeof yresult !== 'undefined') {
        var asObj= new Object();
        var afObj= new Object();
        var euObj= new Object();
        var naObj= new Object();
        var saObj= new Object();
        var ocObj= new Object();
        var asAgg =0,afAgg =0,euAgg =0,naAgg =0,saAgg =0,ocAgg =0;
        //Looping through all lines for each year
        for (var l = 1, llen = lineArr.length; l < llen; l++) {
          //Check if line is not empty string
          if (lineArr[l]) {
            //Loading each line into an array
            var currentline = lineArr[l].split(",");
            //Filtering GDP,GNI data for 15 countries for the year 2005 - Problem 1(1 and 2)
            if (yresult === "2005") {
              if (currentline[yearIndex] !== "") {
                //Problem No.1 - GDP (constant 2005 US$) + GNI (constant 2005 US$)
                if (currentline[2] === "GDP at market prices (constant 2005 US$)") {
                  var gdpObj = new Object();
                  gdpObj.country = currentline[0];

                  gdpObj.GDP = parseFloat(currentline[49]).toFixed(2);
                  GDPData.push(gdpObj);
                } else if (currentline[2] === "GNI (constant 2005 US$)") {
                  var gniObj = new Object();
                  gniObj.country = currentline[0];

                  gniObj.GNI = parseFloat(currentline[49]).toFixed(2);
                  GNIData.push(gniObj);
                }
                //Problem No.2 - GDP per capita (constant 2005 US$) + GNI per capita (constant 2005 US$)
                if (currentline[2] === "GDP per capita (constant 2005 US$)") {
                  var pcGdpObj = new Object();
                  pcGdpObj.country = currentline[0];

                  pcGdpObj.GDP = parseFloat(currentline[49]).toFixed(2);
                  perCapitaGDPData.push(pcGdpObj);
                } else if (currentline[2] === "GNI per capita (constant 2005 US$)") {
                  var pcGniObj = new Object();
                  pcGniObj.country = currentline[0];

                  pcGniObj.GNI = parseFloat(currentline[49]).toFixed(2);
                  perCapitaGNIData.push(pcGniObj);
                }

              }
            }
            //GDP growth for India over the given time period.-Problem 2 c(country, countryArray)
            if (currentline[h] !== "") {

              if (currentline[2] === "GDP growth (annual %)") {
                if (currentline[0] === "India") {
                  var indObj = new Object();
                  indObj.x = yresult;
                  indObj.y = parseFloat(currentline[h]).toFixed(4);

                  gdpIndia.push(indObj);
                }

              }
              //Continent Problem
              if (currentline[2] === "GDP per capita (constant 2005 US$)") {
                var continent = searchCountryLookup(currentline[0], continentLookup);
                switch (continent) {
                   case 'AS':
                   asObj.year = yresult;
                   asObj.continent = continent;
                   asAgg +=parseFloat(currentline[h]);
                   asObj.GDP=asAgg.toFixed(2);
                   break;

                   case 'AF':
                   afObj.year = yresult;
                   afObj.continent = continent;
                   afAgg +=parseFloat(currentline[h]);
                   afObj.GDP=afAgg.toFixed(2);
                   break;

                   case 'EU':
                   euObj.year = yresult;
                   euObj.continent = continent;
                   euAgg +=parseFloat(currentline[h]);
                   euObj.GDP=euAgg.toFixed(2);
                   break;

                   case 'NA':
                   naObj.year = yresult;
                   naObj.continent = continent;
                   naAgg +=parseFloat(currentline[h]);
                   naObj.GDP=naAgg.toFixed(2);
                   break;

                   case 'SA':
                   saObj.year = yresult;
                   saObj.continent = continent;
                   saAgg +=parseFloat(currentline[h]);
                   saObj.GDP=saAgg.toFixed(2);
                   break;

                   case 'OC':
                   ocObj.year = yresult;
                   ocObj.continent = continent;
                   ocAgg +=parseFloat(currentline[h]);
                   ocObj.GDP=ocAgg.toFixed(2);
                   break;
                   default:
                }
              }

            }

          }
        }

        if(!(isEmpty(asObj))){
            asArr.push(asObj);}
        if(!(isEmpty(afObj))){
            afArr.push(afObj);}
        if(!(isEmpty(euObj))){
            euArr.push(euObj);}
        if(!(isEmpty(naObj))){
            naArr.push(naObj);}
        if(!(isEmpty(saObj))){
            saArr.push(saObj);}
        if(!(isEmpty(ocObj))){
            ocArr.push(ocObj);}

      }

    }
    //Create continent aggregate data
    for (var g = 0; g < asArr.length; g++) {
      obj ={};
      obj["year"]=asArr[g].year;
      obj["AS"]=asArr[g].GDP;
      obj["AF"]=afArr[g].GDP;
      obj["EU"]=euArr[g].GDP;
      obj["NA"]=naArr[g].GDP;
      obj["SA"]=saArr[g].GDP;
      obj["OC"]=ocArr[g].GDP;

      aggrCont.push(obj);
    }

    //Create Json for constant GDP
  var cGDPdata = createJsonData(GDPData, GNIData);
    //Create Json for per capita GDP
  var pcGDPdata = createJsonData(perCapitaGDPData, perCapitaGNIData);

  //Writing to JSON file
  writetoFile('../data/constantGDP.json',JSON.stringify(cGDPdata)); //Problem 1
  writetoFile('../data/percapitaGDP.json',JSON.stringify(pcGDPdata));//Problem 2
  writetoFile('../data/gdpIndia.json',JSON.stringify(gdpIndia));//Problem 3
  writetoFile('../data/aggrContinent.json',JSON.stringify(aggrCont)); //Problem 4
  });
}

function func(data) {
  lineArr.push(data.trim());
}

function writetoFile(path, jsonResult) {

  fs.writeFile(path, jsonResult, function(err) {
    if (err) {
      console.log('There has been an error saving your json data.');
      console.log(err.message);
      return;
    }
    console.log('JSON saved successfully.');
  });
}
function createJsonData(GDPData, GNIData) {
  //Consolidates GNI,GDP data into a single object
  for (var i = 0; i < GDPData.length; i++) {
    var c = GDPData[i].country;
    for (var j = 0; j < GNIData.length; j++) {
      if (GNIData[j].country === c) {
        GDPData[i].GNI = GNIData[j].GNI;
      }
    }
  }
  //Sorting data in descending order of 'GDP'
  GDPData.sort(function(a, b) {
    return b.GDP - a.GDP;
  });
  //Get GDP data for top 15 countries
  return GDPData.slice(0, 15);
}
//Searching Lookup to find year match
function searchCountryLookup(country, countryArray) {
  for (var i = 0; i < countryArray.length; i++) {
    if (countryArray[i].country === country.trim()) {
      return countryArray[i].continent;
    }
  }
}
//Check if Object is Empty
function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }

  return true;
}
//Searching Lookup to find year match
function searchYearLookup(year, yearArray) {
  for (var i = 0; i < yearArray.length; i++) {
    if (yearArray[i].year === year.trim()) {
      return yearArray[i].year;
    }
  }
}
