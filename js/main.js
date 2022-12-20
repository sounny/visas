//global variables
var countryList = ["Afghanistan","Albania","Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Republic of the Congo", "Democratic Republic of the Congo", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "North Korea", "South Korea", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Singapore", "Sierra Leone", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
var expressed = ""; //initial attribute
var csvData = "";
//global vars for SetEnums
var countriesFeature = "";
var map = "";
var path = "";
var pieChart = "";
var projection = "";
var colorScale = makeWorldColorLevels();
////global html elements
header = document.getElementById("header");
instructions = document.getElementById("instructions");
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
        setWorldEnumerationUnits();

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

function setWorldEnumerationUnits() {
    //add US States to map
    var countries = map.selectAll(".countries")
        .data(countriesFeature)
        .enter()
        .append("path")
        .attr("class", function(d){
            return d.properties.ADMIN;
        })
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
        .on("click", function(d){
            clickedCountry = d.properties.ADMIN;
            
            if(!isOriginSelected()) {
                origin.value = clickedCountry;
                changeOrigin(clickedCountry);
            } else if(isOriginSelected()) {
                if(origin.value==clickedCountry) {
                    changeOrigin(" -- Country of Citizenship -- ");
                } else {
                    destination.value = clickedCountry;
                    changeDestination();
                }
            }
        })
        .on("mousemove", moveLabel)
        ;

    var desc = countries.append("desc")
        .text('{"stroke": "#000", "stroke-width": "1px"}');

    if(!isOriginSelected()) instructions.innerHTML = "Click/Select a Country of CITIZENSHIP";
    if(isOriginSelected() && !isDestinationSelected()) instructions.innerHTML = "Click/Select a DESTINATION Country";
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
    if(!expressed || expressed==" -- Country of Citizenship -- " || props.ADMIN==origin.value) {
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

function changeOrigin(originName) {
    //console.log(origin.value);
    //originName = originName || "";

    //origin.value = originName;
    if (originName == " -- Country of Citizenship -- ")
        origin.value=originName;
    expressed=origin.value;//originName;
    setWorldEnumerationUnits();
    destination.value=" -- Destination Country -- ";
    destinationSelectedBoolean = false;
    if(isOriginSelected()) {
        destination.disabled=false;
    }
    else {

        destination.disabled=true;
    }

    setPieChart();

};

function changeDestination(){

    if(origin.value == destination.value)
        destination.value = " -- Destination Country -- ";
    if(destination.value == " -- Destination Country -- ") 
        return;

    //destinationSelectedBoolean = true;
    window.alert("Citizen from: "+origin.value+"\nVisiting: "+destination.value+"\nRequirements: "+visaCode(getRequirements()));
};

function isOriginSelected(){
    return (origin.value && origin.value!=" -- Country of Citizenship -- ");
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
        .attr("position", "absolute")
        .attr("text-align", "center")
        .text(function(d) { return d.data.name; })
        .style("font-family", "arial")
        .style("font-size", 15);
};
