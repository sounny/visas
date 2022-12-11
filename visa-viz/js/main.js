//global variables
var countryList = ["Afghanistan","Albania","Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Republic of the Congo", "Democratic Republic of the Congo", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Singapore", "Sierra Leone", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
var expressed = "United States"; //initial attribute
var csvData = "";
//chartFrame dimensions
var chartWidth = window.innerWidth * 0.425,
    chartHeight = 473,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
//create proportional scale for bars/axis
var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 50]);


//begin when window loads
//window.onload = setMap();
window.onload = setWorldMap();

//set up World map
function setWorldMap(){

    //////// MAP, PROJECTION, PATH ////////
    //map frame - add new map svg
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", window.innerWidth * 0.5)
        .attr("height", 420);
    //projection
    var projection = d3.geoMercator()
        .scale((window.innerWidth * 0.5 - 3) / (2 * Math.PI))
        .translate([window.innerWidth * 0.5 / 2, 420 / 2]);
    //path
    var path = d3.geoPath()
        .projection(projection);

    //////// QUEUE BLOCKS ////////
    var promises = [];
    promises.push(d3.csv("data/countryVisaTransposedCSV.csv"));
    promises.push(d3.json("data/countriesTOPO.json"));
    Promise.all(promises).then(callback);

    // begin map/chart setup in callback
    function callback(data){
        countryVisaCSV = data[0];
        countries = data[1];
        setGraticule(map, path);

        //pull data from topojson
        var countriesFeature = topojson.feature(countries, countries.objects.countries).features;
        console.log(countriesFeature);
  
        //join csv data to JSON enum units
        countriesFeature = joinWorldData(countriesFeature, countryVisaCSV);
        console.log(countriesFeature);
        //create color scale
        var colorScale = makeColorScale(countryVisaCSV);
        //add enum units to the map
        setWorldEnumerationUnits(countriesFeature, map, path, colorScale);

        var AFGname = countriesFeature[1].properties.ADMIN;
        console.log(AFGname);

    };

    
};

function joinWorldData(countriesFeature, csvData){
    var matchesFound = 0;
    //loop thru csv, assign attributes to json states
    for (var i=0; i<csvData.length; i++){
        var csvCountry = csvData[i]; //the current state
        var csvKey = csvCountry.ID; //the CSV state name //was the CSV primary key

        //loop thru json states to find matching csv state
        for (var a=0; a<countriesFeature.length; a++){
            var geojsonProps = countriesFeature[a].properties; //the current state geojson properties
            var geojsonKey = geojsonProps.ADMIN; //the geojson key-> the stateFeature Name
        
           //when keys match, add csv data to json object's properties
           if (geojsonKey == csvKey){
                //assign all attributes and values
                countryList.forEach(function(attr){
                    var val = parseFloat(csvCountry[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };

        };
    };

    return countriesFeature;
};

function setWorldEnumerationUnits(countriesFeature, map, path, colorScale) {
    //add US States to map
    var countries = map.selectAll(".countries")
        .data(statesFeature)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "country " + d.properties.name;
        })
        .attr("d", path)
        .style("fill", function(d){
            return colorScale(d.properties[expressed]);
        })
        .style("stroke", "#000")
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .on("mouseover", function(d){
            highlight(d.properties);
        })
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
        .on("mousemove", moveLabel);
    
    var desc = states.append("desc")
        .text('{"stroke": "#000", "stroke-width": "1px"}');
};









//set up choropleth map
function setMap(){

    //////// MAP, PROJECTION, PATH ////////
    //add new map svg
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", window.innerWidth * 0.5)
        .attr("height", 420);
    //create AlbersUSA projection centered on USA
    var projection = d3.geoMercator()//d3.geoAlbersUsa()
        //.scale(900)
        //.translate([387.5,215])
        .scale((window.innerWidth * 0.5 - 3) / (2 * Math.PI))
        .translate([window.innerWidth * 0.5 / 2, 420 / 2]);
    var path = d3.geoPath()
        .projection(projection);
 
    

    //////// QUEUE BLOCKS ////////
    var promises = [];
    promises.push(d3.csv("data/countryVisaTransposedCSV.csv"));
    promises.push(d3.json("data/countriesTOPO.json"));
    promises.push(d3.csv("data/cropDataCSV.csv")); //load attributes from csv
    promises.push(d3.json("data/UsaStatesTopoJson5.topojson")); //load choropleth spatial data
    Promise.all(promises).then(callback);

    // begin map/chart setup in callback
    function callback(data){
        countryVisaCSV = data[0];
        countries = data[1];
        csvData = data[2];
        usaStates = data[3];
        setGraticule(map, path);

        //pull data from topojson
        var statesFeature = topojson.feature(usaStates, usaStates.objects.states).features;
        console.log(statesFeature);
        //join csv data to JSON enum units
        statesFeature = joinData(statesFeature, csvData);
        //create color scale
        var colorScale = makeColorScale(csvData);
        //add enum units to the map
        setEnumerationUnits(statesFeature, map, path, colorScale);
        //built chart
        setChart(csvData, colorScale);
        //create dropdown menu
        createDropdown();
    };
};

//////// GRATICULE ////////
function setGraticule(map, path) {
    var graticule = d3.geoGraticule()
        .step([10, 10]); //place graticule lines every 10 degrees of longitude and latitude
    // graticule background
    var gratBackground = map.append("path")
        .datum(graticule.outline()) //bind graticule background
        .attr("class", "gratBackground") //assign class for styling
        .attr("d", path) //project graticule
    // graticule lines
    var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
        .data(graticule.lines()) //bind graticule lines to each element to be created
        .enter() //create an element for each datum
        .append("path") //append each element to the svg as a path element
        .attr("class", "gratLines") //assign class for styling
        .attr("d", path); //project graticule lines
};

function joinData(statesFeature, csvData){
    //loop thru csv, assign attributes to json states
    for (var i=0; i<csvData.length; i++){
        var csvState = csvData[i]; //the current state
        var csvKey = csvState.state; //the CSV state name //was the CSV primary key

        //loop thru json states to find matching csv state
        for (var a=0; a<statesFeature.length; a++){
            var geojsonProps = statesFeature[a].properties; //the current state geojson properties
            var geojsonKey = geojsonProps.name; //the geojson key-> the stateFeature Name

            //when keys match, add csv data to json object's properties
            if (geojsonKey == csvKey){
                //assign all attributes and values
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvState[attr]); //get csv attribute value
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties
                });
            };
        };
    };

    return statesFeature;
};

function setEnumerationUnits(statesFeature, map, path, colorScale) {
    //add US States to map
    var states = map.selectAll(".states")
        .data(statesFeature)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "state " + d.properties.name;
        })
        .attr("d", path)
        .style("fill", function(d){
            return colorScale(d.properties[expressed]);
        })
        .style("stroke", "#000")
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .on("mouseover", function(d){
            highlight(d.properties);
        })
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
        .on("mousemove", moveLabel);
    
    var desc = states.append("desc")
        .text('{"stroke": "#000", "stroke-width": "1px"}');
};

//create color scale generator
function makeColorScale(data){
    var colorClasses = [
        //"#ffffd4",
        "#fee391",
        "#fec44f",
        "#fe9929",
        "#d95f0e",
        "#993404"
    ];

    // QUANTILE
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };
    colorScale.domain(domainArray);
    return colorScale;
};

// test for data value and return color
function choropleth(props, colorScale){
    var val = parseFloat(props[expressed]);
    //assign a color - otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};

//create coordinated bar chart
function setChart(csvData, colorScale){
    //svg element for bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("class", "chart");
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.name;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) +leftPadding;
        })
        .attr("height", function(d){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return yScale(parseFloat(d[expressed]));
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        })
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel);
    
    var desc = bars.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');
    
    var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function(a, b){
            return b[expressed]-a[expressed];
        })
        .attr("class", function(d){
            return "numbers " + d.name;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i){
            var fraction = (chartWidth / csvData.length);
            return (i * fraction + (fraction - 1) / 2) + leftPadding;
        })
        .attr("y", function(d){
            return yScale(parseFloat(d[expressed])) - 15;
        })
        .text(function(d){
            return Math.round(d[expressed]);
        });
    var desc = numbers.append("desc")
        .text('{"stroke": "none", "stroke-width": "0px"}');
    
    var chartTitle = chart.append("text")
        .attr("x", 20+leftPadding)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Visa restriction breakdown for " + expressed.toUpperCase() + ": [***PIE CHART HERE]");

    //create vertical axis generator
    var yAxis = d3.axisLeft(yScale);
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
};

function createDropdown(){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });

    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select one");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
};

function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var states = d3.selectAll(".states")
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });

    //re-sort, resize, and recolor bars
    var bars = d3.selectAll(".bar")
        //re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition() //add animation
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
        updateChart(bars, csvData.length, colorScale);
    
};

function updateChart(bars, n, colorScale) {
    //position bars
    bars.attr("x", function(d, i){
        return i * (chartInnerWidth / n) + leftPadding;
    })
    //size/resize bars
    .attr("height", function(d, i){
        return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr("y", function(d, i){
        return yScale(parseFloat(d[expressed])) + topBottomPadding;
    })
    //recolor bars
    .style("fill", function(d){
        return choropleth(d, colorScale);
    });
    
    var chartTitle = d3.select(".chartTitle")
        .text("Percent of USA's " + expressed.toUpperCase() + " production in each state");
    
    d3.selectAll("svg").remove();
    setMap();
};

//function to highlight enumeration units and bars
function highlight(props){
    //change stroke
    var selected = d3.selectAll("." + props.ID)
        .style("stroke", "red")
        .style("stroke-width", "3.5");
    setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.name)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
    
    d3.select(".infolabel")
        .remove();
};

function setLabel(props){
    //label content
    var labelAttribute = "<h1>" + (Math.ceil(props[expressed]* 100) / 100) +
        "%</h1>of <b>" + expressed + "</b> production";

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.name + "_label")
        .html(labelAttribute);

    var stateName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.name);
};

function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};