(function () {
  function slugify(value, index) {
    return "section-" + (index + 1) + "-" + value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  }

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  window.renderResponsiveThreePanel = function (id, figure) {
    var source = document.getElementById(id);
    if (!source || !window.Plotly) return;

    var panels = [
      { x: "x", y: "y", xaxis: "xaxis", yaxis: "yaxis", annotation: 0 },
      { x: "x2", y: "y2", xaxis: "xaxis2", yaxis: "yaxis2", annotation: 1 },
      { x: "x3", y: "y3", xaxis: "xaxis3", yaxis: "yaxis3", annotation: 2 }
    ];
    var wrapper = document.createElement("div");
    wrapper.className = "three-panel-wrapper";
    var grid = document.createElement("div");
    grid.className = "three-panel-grid";
    wrapper.appendChild(grid);
    source.replaceWith(wrapper);

    panels.forEach(function (panel, index) {
      var card = document.createElement("section");
      card.className = "three-panel-card";
      var graph = document.createElement("div");
      graph.id = id + "-panel-" + (index + 1);
      graph.className = "plotly-graph-div";
      graph.setAttribute("aria-label", "交互式图表 " + (index + 1));
      card.appendChild(graph);
      grid.appendChild(card);

      var traces = (figure.data || []).filter(function (trace) {
        return (trace.xaxis || "x") === panel.x && (trace.yaxis || "y") === panel.y;
      }).map(function (trace) {
        var copy = cloneValue(trace);
        delete copy.xaxis;
        delete copy.yaxis;
        return copy;
      });
      var xaxis = cloneValue((figure.layout || {})[panel.xaxis] || {});
      var yaxis = cloneValue((figure.layout || {})[panel.yaxis] || {});
      delete xaxis.domain;
      delete xaxis.anchor;
      delete yaxis.domain;
      delete yaxis.anchor;
      var annotation = ((figure.layout || {}).annotations || [])[panel.annotation] || {};
      var layout = {
        template: (figure.layout || {}).template,
        height: 470,
        margin: { l: 82, r: 26, t: 72, b: 76 },
        title: { text: annotation.text || "", x: 0.5, xanchor: "center", font: { size: 16 } },
        xaxis: xaxis,
        yaxis: yaxis,
        showlegend: true,
        legend: { orientation: "h", x: 0.5, xanchor: "center", y: -0.27 }
      };
      window.Plotly.newPlot(graph, traces, layout, Object.assign({ responsive: true }, figure.config || {}));
    });
  }

  function resizePlots(container) {
    if (!window.Plotly) return;
    container.querySelectorAll(".plotly-graph-div").forEach(function (graph) {
      if (!graph._fullLayout) return;
      window.Plotly.Plots.resize(graph);
    });
  }

  function schedulePlotResize(container) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        resizePlots(container);
      });
    });
  }

  function observePlotContainers(main) {
    if (!window.ResizeObserver) return;
    var frame = null;
    var widths = new WeakMap();
    var observer = new ResizeObserver(function (entries) {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        entries.forEach(function (entry) {
          var width = Math.round(entry.contentRect.width);
          if (widths.get(entry.target) === width) return;
          widths.set(entry.target, width);
          resizePlots(entry.target);
        });
      });
    });
    main.querySelectorAll(".chart-output").forEach(function (container) {
      observer.observe(container);
    });
  }

  function buildOutline() {
    var main = document.querySelector("main");
    if (!main) return;
    var headings = Array.prototype.slice.call(main.querySelectorAll("h1"));
    if (!headings.length) return;

    document.body.classList.add("has-project-outline");
    var sections = headings.map(function (heading, index) {
      var title = heading.textContent.trim();
      var id = heading.id || slugify(title, index);
      heading.id = id;
      heading.classList.add("section-toggle");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "section-toggle-button";
      button.setAttribute("aria-expanded", "true");
      button.textContent = title;
      heading.textContent = "";
      heading.appendChild(button);
      return { heading: heading, button: button, title: title, id: id, content: null };
    });

    sections.forEach(function (section, index) {
      var range = document.createRange();
      range.setStartAfter(section.heading);
      if (index + 1 < sections.length) range.setEndBefore(sections[index + 1].heading);
      else range.setEndAfter(main.lastChild);
      var content = document.createElement("div");
      content.className = "outline-section";
      content.id = section.id + "-content";
      content.appendChild(range.extractContents());
      section.heading.after(content);
      section.content = content;
      section.button.setAttribute("aria-controls", content.id);
      section.button.addEventListener("click", function () {
        var expanded = section.button.getAttribute("aria-expanded") === "true";
        section.button.setAttribute("aria-expanded", String(!expanded));
        content.hidden = expanded;
        if (!expanded) schedulePlotResize(content);
      });
    });

    var aside = document.createElement("aside");
    aside.className = "project-outline";
    aside.setAttribute("aria-label", "项目大纲");
    var details = document.createElement("details");
    details.open = true;
    var summary = document.createElement("summary");
    summary.textContent = "项目大纲";
    var nav = document.createElement("nav");
    var label = document.createElement("span");
    label.className = "project-outline-label";
    label.textContent = "项目大纲";
    nav.appendChild(label);
    var links = [];
    sections.forEach(function (section) {
      var link = document.createElement("a");
      link.href = "#" + section.id;
      link.textContent = section.title;
      link.addEventListener("click", function () {
        if (section.content.hidden) section.button.click();
      });
      links.push({ link: link, section: section });
      nav.appendChild(link);
    });
    details.appendChild(summary);
    details.appendChild(nav);
    aside.appendChild(details);
    document.body.insertBefore(aside, main);

    if (window.matchMedia("(max-width: 1050px)").matches) details.open = false;
    window.addEventListener("load", function () {
      observePlotContainers(main);
      schedulePlotResize(main);
    }, { once: true });
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; }).sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible) return;
      links.forEach(function (item) { item.link.removeAttribute("aria-current"); });
      var active = links.find(function (item) { return item.section.heading === visible.target; });
      if (active) active.link.setAttribute("aria-current", "true");
    }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, .1, .5] });
    sections.forEach(function (section) { observer.observe(section.heading); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildOutline);
  else buildOutline();
}());
