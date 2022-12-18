//global variables
var countryList = ["Afghanistan","Albania","Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Republic of the Congo", "Democratic Republic of the Congo", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Singapore", "Sierra Leone", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
var expressed = ""; //initial attribute
var csvData = "";
//global vars for SetEnums
var countriesFeature = "";
var map = "";
var pieChart = "";
var projection = "";
var colorScale = makeWorldColorLevels();
////global html elements
header = document.getElementById("header");
origin = document.getElementById("originSelect");
destination = document.getElementById("destinationSelect");
destinationSelectedBoolean = false;

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
window.onload = setWorldMap();

//set up World map
function setWorldMap(){

    //////// HEADER and INPUTS changes //////////
    header.innerHTML = "Visa Visualizer";
    header.setAttribute("width", window.innerWidth);
    header.setAttribute("position", "absolute");
    //Populate Origin Country Dropdown
    for(var i = 0; i < countryList.length; i++) {
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(countryList[i]);
        option.appendChild(txt);
        option.setAttribute("value",countryList[i]);
        origin.insertBefore(option,origin.lastChild);
    }
    //Populate Destination Country Dropdown
    for(var i = 0; i < countryList.length; i++) {
        var option = document.createElement("OPTION"),
            txt = document.createTextNode(countryList[i]);
        option.appendChild(txt);
        option.setAttribute("value",countryList[i]);
        destination.insertBefore(option,destination.lastChild);
    }

    //////// MAP, PROJECTION, PATH ////////
    //map frame - add new map svg
    map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", window.innerWidth * 0.5)
        .attr("height", 420);
    //projection
    var projection = d3.geoEquirectangular()
        .scale((window.innerWidth * 0.5 - 3) / (2 * Math.PI))
        .translate([window.innerWidth * 0.5 / 2, 420 / 2]);
    //path
    path = d3.geoPath()
        .projection(projection);

    //////// QUEUE BLOCKS ////////
    var promises = [];
    promises.push(d3.csv("data/VisaDataCSV.csv"));
    promises.push(d3.json("data/countriesTOPO.json"));
    Promise.all(promises).then(callback);

    // begin map/chart setup in callback
    function callback(data){
        countryVisaCSV = data[0];
        countries = data[1];
        setGraticule(map, path);

        //pull data from topojson
        countriesFeature = topojson.feature(countries, countries.objects.countries).features;
  
        //join csv data to JSON enum units
        countriesFeature = joinWorldData(countriesFeature, countryVisaCSV);
        console.log(countriesFeature);
        //add enum units to the map
        setWorldEnumerationUnits(countriesFeature, map, path, colorScale);

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
                    matchesFound++;
                });
            };

        };
    };
    console.log("matches: "+matchesFound);
    return countriesFeature;
};

function setWorldEnumerationUnits(countriesFeature, map, path, colorScale) {
    //add US States to map
    var countries = map.selectAll(".countries")
        .data(countriesFeature)
        .enter()
        .append("path")
        /*.attr("class", function(d){
            return d.properties.ADMIN;
        })*/
        .attr("class", "country")
        .attr("d", path)
        .style("fill", function(d){
            if(!isOriginSelected())
                return "#D3D3D3";
            else
                return colorScale[d.properties[expressed]];
        })
        .style("stroke", "#000")
        .style("stroke-width", "1px")
        .style("stroke-linecap", "round")
        .on("mouseover", function(d){
            if(origin.value == d.properties.ADMIN)
                destination.value = " -- Destination Country -- ";
            else if(isOriginSelected()) 
                destination.value = d.properties.ADMIN;
            highlight(d.properties);
        })
        .on("mouseout", function(d){
            if(!isDestinationSelected()) 
                destination.value = " -- Destination Country -- ";
            dehighlight(d.properties);
        })
        /*.on("click", function(d){
            console.log(d.which);
            origin.value = d.properties.ADMIN;
            changeOrigin(countriesFeature, map, path, colorScale, d.properties.ADMIN);
        })
        .on("dblclick", function(d){
            
            if(isOriginSelected()) {
                destination.value = d.properties.ADMIN;
                changeDestination();
            }
        })*/
        .on("mousemove", moveLabel)
        ;

        $('.country').mousedown(function(event) {
            switch (event.which) {
                case 1:
                    alert('Left Mouse button pressed.');
                    break;
                case 2:
                    alert('Middle Mouse button pressed.');
                    break;
                case 3:
                    alert('Right Mouse button pressed.');
                    break;
                default:
                    alert('You have a strange Mouse!');
            }
        });
    
    var desc = countries.append("desc")
        .text('{"stroke": "#000", "stroke-width": "1px"}');
};

//create color scale generator
function makeWorldColorLevels(skipOrigin){
    skipOrigin = skipOrigin || false;
    if (skipOrigin) {
        return ["#fef0d9",
        "#fdcc8a",
        "#fc8d59",
        "#d7301f",
        "#5A5A5A"];
    }
    else
        return ["#98FB98",
        "#fef0d9",
        "#fdcc8a",
        "#fc8d59",
        "#d7301f",
        "#5A5A5A"];
};











//////// GRATICULE ////////
function setGraticule(map, path) {
    var graticule = d3.geoGraticule()
        .step([15, 15]); //place graticule lines every 15 degrees of longitude and latitude
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


//create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#ffffd4",
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
    var selected = d3.selectAll("." + props.ADMIN)
        .style("stroke", "light-blue")
        .style("stroke-width", "2");
    setLabel(props);
};

//function to reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.ADMIN)
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
    visaNum = props[expressed];
    var labelAttribute = "Citizen from: <b>"+expressed+"</b>"
        + "<br>Visiting: <b>"+props.ADMIN+"</b>"
        + "<br><b><div id='visatext"+visaNum+"'>"+visaCode(visaNum)+"</div>"+"</b>";
    if(!expressed) {
        labelAttribute = "<h1>"+props.ADMIN+"</h1>";
    }

    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.name + "_label")
        .html(labelAttribute);

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

function getRequirements() {
    for (var a=0; a<countriesFeature.length; a++){
        if(countriesFeature[a].properties.ADMIN == destination.value)
            return countriesFeature[a].properties[origin.value];
    };
}
function visaCode(visaNum) {
    switch(visaNum) {
        case 0:
            return "Origin Country";
        case 1:
            return "Visa not required";
        case 2:
            return "eVisa";
        case 3:
            return "Visa on arrival";
        case 4:
            return "Visa required";
        case 5:
            return "Admission restricted";
        default:
            return "missing data";
    };
};

function changeOrigin(countriesFeature, map, path, colorScale, originName) {
    originName = originName || origin.value;
    console.log("changing origin to " + originName);

    expressed=originName;
    setWorldEnumerationUnits(countriesFeature, map, path, colorScale);
    destination.value=" -- Destination Country -- ";
    destinationSelectedBoolean = false;
    if(isOriginSelected()) {
        destination.disabled=false;
    }
    else
        destination.disabled=true;

    setPieChart();

};

function changeDestination(){

    if(origin.value == destination.value) {
        destination.value = " -- Destination Country -- ";
        return;
    }

    destinationSelectedBoolean = true;
    window.alert("Citizen from: "+origin.value+"\nVisiting: "+destination.value+"\nRequirements: "+visaCode(getRequirements()));
};

function isOriginSelected(){
    return (origin.value && origin.value!="Country of Citizenship");
};
function isDestinationSelected(){
    return destinationSelectedBoolean;
}










function setPieChart() {
    
    d3.select(".pieChart").remove();
    
    pieChart =  d3.select("body")
        .append("svg")
        .attr("class", "pieChart")
        .attr("width", 420)
        .attr("height", 420);

    width = pieChart.attr("width"),
    height = pieChart.attr("height"),
    radius = 200;

    // Step 1 
    var typesVisa = [];
    typesVisa[1] = 0;
    typesVisa[2] = 0;
    typesVisa[3] = 0;
    typesVisa[4] = 0;
    typesVisa[5] = 0;
    for(var country of countriesFeature) {
        switch (country.properties[expressed]) {
            case 1:
                typesVisa[1]++;
                break;
            case 2:
                typesVisa[2]++;
                break;
            case 3:
                typesVisa[3]++;
                break;
            case 4:
                typesVisa[4]++;
                break;
            case 5:
                typesVisa[5]++;
                break;
        };
    }

    var typesVisaNames = ["", "Visa not required", "eVisa", "Visa on Arrival", "Visa required", "Restricted"];
    var data = [];
    for(let i = 1; i <= 5; i++) {
        if(typesVisa[i]>0) 
            data.push({name: typesVisaNames[i], share: typesVisa[i]});
    };
    console.log(data);

    var g = pieChart.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Step 4
    var ordScale = d3.scaleOrdinal()
                        .domain(data)
                        .range(["#5A5A5A",
                        "#fef0d9",
                        "#fdcc8a",
                        "#fc8d59",
                        "#d7301f"]);

    // Step 5
    var pie = d3.pie().value(function(d) { 
            return d.share; 
        });

    var arc = g.selectAll("arc")
            .data(pie(data))
            .enter();

    // Step 6
    var path = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return ordScale(d.data.name); });

    // Step 7
    var label = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);
        
    arc.append("text")
        .attr("transform", function(d) { 
                    return "translate(" + label.centroid(d) + ")"; 
            })
        .attr("justify-content", "center")
        .text(function(d) { return d.data.name; })
        .style("font-family", "arial")
        .style("font-size", 15);
};
