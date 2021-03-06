
function idIndex(a,id) {
      for (var i=0;i<a.length;i++) 
      {if (a[i].id == id) return i;}
      return null;
}  



function createGraph(data){
   var nodes=[], links=[];
    data.results[0].data.forEach(function (row) {
      row.graph.nodes.forEach(function (n) 
      {
        if (idIndex(nodes,n.id) == null){
            if(n.properties.name)
              nodes.push({id:n.id,label:n.labels[0],title:n.properties.name});
            else 
              nodes.push({id:n.id,label:n.labels[0],title:n.properties.content});
        }
              //nodes.push({id:n.id,label:n.labels[0],title:n.properties.name});
      });
      links = links.concat( row.graph.relationships.map(function(r) {
      return {source:idIndex(nodes,r.startNode),target:idIndex(nodes,r.endNode),type:r.type, value:1};
      }));
    });
    graph = {nodes:nodes, links:links};
}


function drawMindMap(graphData){

   var get_color = {"TextMark":"#FFFF81", "TextNode":"#FFFF81", "Map":"#F23A3A"};

  createGraph(graphData);
  var width = 960,
      height = 500

  var svg = d3.select("svg");
      //.attr("width", "100%")
      //.attr("height", "600px");

  var force = d3.layout.force()
      .gravity(0.05)
      .distance(150)
      .charge(-500)
      .size([width, height]);

  

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
      .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);
    /*
    node.append("image")
        .attr("xlink:href", "https://github.com/favicon.ico")
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16);
    */
    
    node.append("rect")
        .attr("class", function (d) { return "node "+d.label })
        .attr("r", 10)
        .attr("width",150)
        .attr("height", 20)
        .attr("fill", function (d){return get_color[d.label]})
      
    

    node.append("text")
        .attr("dx", 5)
        .attr("dy", 15)
        .text(function(d) { return d.title.substring(0,20); });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
 

}
