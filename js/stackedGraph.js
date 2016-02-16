function plotStackedGraph(canvasId,path)
{
var margin = {top: 80, right: 20, bottom: 400, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .2);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(["#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      // .html(function(d) {
      //   return "<strong>GDP:</strong> <span style='color:red'>" + d.y + "</span>";
      // })

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

d3.json(path, function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "country"; }));

  data.forEach(function(d) {
    var y0 = 0;
    d.prod = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total = d.prod[d.prod.length - 1].y1;
  });

  x.domain(data.map(function(d) { return d.country; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)" );


  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("2005 US$");

  var country = svg.selectAll(".country")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.country) + ",0)"; })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

  country.selectAll("rect")
      .data(function(d) { return d.prod; })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); })
      .on("mouseover", function(d) {
              div.transition()
                  .duration(200)
                  .style("opacity", 1);
              div .html(d.name +" : " + (parseFloat(d.y1)-parseFloat(d.y0)))
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              })
          .on("mouseout", function(d) {
              div.transition()
                  .duration(500)
                  .style("opacity", 0);});

  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width)
      .attr("y","-50px")
      .attr("width", 18)
      .attr("height", 18)

      .style("fill", color);

  legend.append("text")
      .attr("x", width - 6)
      .attr("y", 9)
      .attr("dy", "-45px")
      .style("text-anchor", "end")
      .attr("font-size", 10)
      .text(function(d) { return d; });

});
}
