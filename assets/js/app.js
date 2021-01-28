var svgWidth = 1000;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

d3.select("#scatter")
  .each(function(d, i) {
    // console.log("element", this);
  });


// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//   // Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity"


d3.csv("assets/data/data.csv").then(function(stateData, err) {
    if (err) throw err;

    // parse data
      stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.obesity = +data.obesity;
      data.healthcareLow = + data.healthcareLow;
    });
  
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
      d3.max(stateData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
    

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
  
    .domain([0, d3.max(stateData, d => d[chosenYAxis])])
    .range([height, 0])
    
  
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
     .classed("y-axis", true)
     .call(leftAxis);
  
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "pink")
    .attr("opacity", ".5");

circlesGroup = updateToolTip(circlesGroup);

console.log(`stateData.abbr ${stateData[0].abbr}`)

var circleLabels =  chartGroup.selectAll(".labels")
      .data(stateData)
      .enter()
      .append("text")
      .attr("x", (d,i) => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .classed("stateText", true)
      .text(d => d.abbr)
     
      // Create group for two x-axis labels
  var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
      // Create group for two x-axis labels
  var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${-width/9} ${height/2}) rotate(270)`)
  
  var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
  
  var AgeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
  

  var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
  
  
  var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");
  
  var smokesLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");
  
  var healthLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcareLow") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

  function updateToolTip(circlesGroup) {

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([120, -70])
      .html(function(d) {
        return (`State: ${d.state}<br> Obsity rate: ${d.obesity}%<br> Under Insured: ${d.healthcareLow}% <br>Smokes: ${d.smokes}% <br>Income: ${d.poverty} %`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        d3.select(this)
              .transition()
              .duration(200)
              .ease(d3.easeLinear)
              .style("fill", "red")
              console.log("transisition line ran")
        d3.select(this).style("cursor", "pointer")
      
      circleLabels.on("mouseover", function(data) {
        toolTip.show(data, this);
        d3.select(this).style("cursor", "pointer");
      });
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        
        d3.select(this)
        .transition()
        .duration(1200)
        .ease(d3.easeLinear)
        .style("fill", "pink")

        toolTip.hide(data, this);
        d3.select(this).style("cursor", "default");
        
        circleLabels.on("mouseout", function(data) {
              
          toolTip.hide(data, this);
          d3.select(this).style("cursor", "default");
        })
      });

    return circlesGroup;
  }

  function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

      circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));
      
          return circlesGroup;
        }
  
  function renderXlables(circleLables, newXScale, chosenXAxis) {

            circleLables.transition()
                .duration(1000)
                .attr("x", d => newXScale(d[chosenXAxis]));
          
              return circleLables;
            }

  function renderYlables(circleLables, newYScale, chosenYAxis) {

    circleLables.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));
  
      return circleLables;
    }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

          circlesGroup.transition()
                .duration(1000)
                .attr("cy", d => newYScale(d[chosenYAxis]))
          
              return circlesGroup;
            }
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(stateData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          circlesGroup = updateToolTip(circlesGroup);
          circleLabels = renderXlables(circleLabels, xLinearScale, chosenXAxis);
          // function used for updating circles group with new tooltip
      
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            AgeLabel
              .classed("active", true)
              .classed("inactive", false);
              povertyLabel
              .classed("active", false)
              .classed("inactive", true);
              incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenXAxis === "poverty"){
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            AgeLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            AgeLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);

      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

      return xAxis;
    }
     // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
      var leftAxis = d3.axisLeft(newYScale);
  
      yAxis.transition()
        .duration(1000)
        .call(leftAxis);

      return yAxis;
    }

        // function used for updating x-scale var upon click on axis label
    function xScale(stateData, chosenXAxis) {
  // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
        d3.max(stateData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);

    return xLinearScale;
    }

  function yScale(stateData, chosenYAxis) {
      // create scales
        var yLinearScale = d3.scaleLinear()
          .domain([d3.min(stateData, d => d[chosenYAxis]),
            d3.max(stateData, d => d[chosenYAxis])
          ])
          .range([0, height]);
  
        return yLinearScale;
        }

       // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenXAxis with value
          chosenYAxis = value;

          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new y values
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
          circlesGroup = updateToolTip(circlesGroup);
          circleLabels = renderYlables(circleLabels, yLinearScale, chosenYAxis);

          // changes classes to change bold text
          if (chosenYAxis === "obesity") {
              obesityLabel
              .classed("active", true)
              .classed("inactive", false);
              smokesLabel
              .classed("active", false)
              .classed("inactive", true);
              healthLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if(chosenYAxis === "smokes"){
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            healthLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }

    });
  });


