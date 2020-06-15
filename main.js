async function createChoroplethMap() {
  const eduRes = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  );
  const educations = await eduRes.json();

  const countiesRes = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  );
  const counties = await countiesRes.json();

  const width = 960;
  const height = 600;

  const path = d3.geoPath();

  const data = topojson.feature(counties, counties.objects.counties).features;

  const min = d3.min(educations, (edu) => edu.bachelorsOrHigher);
  const max = d3.max(educations, (edu) => edu.bachelorsOrHigher);

  const xScale = d3.scaleLinear().domain([min, max]).rangeRound([600, 860]);

  const colorScale = d3
    .scaleThreshold()
    .domain(d3.range(min, max, (max - min) / 8))
    .range(d3.schemeBlues[9]);

  let tooltip = d3.select(".visHolder").append("div").attr("id", "tooltip");

  const svgContainer = d3
    .select(".visHolder")
    .append("svg")
    .attr("id", "svgContainer")
    .attr("width", width)
    .attr("height", height);

  svgContainer
    .append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr(
      "data-education",
      (d) =>
        (education = educations.find((edu) => edu.fips === d.id)
          .bachelorsOrHigher)
    )
    .attr("fill", (d) =>
      colorScale(
        (education = educations.find((edu) => edu.fips === d.id)
          .bachelorsOrHigher)
      )
    )
    .attr("d", path)
    .on("mouseover", (d, i) => {
      const education = educations.find((edu) => edu.fips === d.id);

      tooltip
        .transition()
        .style("opacity", 1)
        .style("left", d3.event.pageX + 18 + "px")
        .style("top", d3.event.pageY - 20 + "px");

      tooltip
        .html(
          "<p>" +
            education.area_name +
            "</p>" +
            "<p>" +
            education.state +
            " : " +
            education.bachelorsOrHigher +
            "%"
        )
        .attr("data-education", education.bachelorsOrHigher);
    })
    .on("mouseout", () => {
      tooltip.transition().style("opacity", 0);
    });

  let legend = svgContainer
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

  legend
    .selectAll("rect")
    .data(
      colorScale.range().map((d) => {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = xScale.domain()[0];
        if (d[1] == null) d[1] = xScale.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 10)
    .attr("x", (d) => xScale(d[0]))
    .attr("width", (d) => {
      return xScale(d[1]) - xScale(d[0]);
    })
    .attr("fill", (d) => colorScale(d[0]));

  legend
    .append("text")
    .attr("x", xScale.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start");

  legend
    .call(
      d3
        .axisBottom(xScale)
        .tickSize(15)
        .tickFormat((xScale) => {
          return Math.round(xScale) + "%";
        })
        .tickValues(colorScale.domain())
    )
    .select(".domain")
    .remove();
}

createChoroplethMap();
