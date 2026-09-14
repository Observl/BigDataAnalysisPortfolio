(function () {
  function slugify(value, index) {
    return "section-" + (index + 1) + "-" + value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  }

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  // Global chart rule: one Notebook output owns one Plotly container.  This
  // gives every chart (including compound figures) a distinct lifecycle and
  // prevents Plotly DOM state from leaking into the next output.
  window.renderIsolatedPlot = function (id, figure) {
    var source = document.getElementById(id);
    if (!source || !window.Plotly) return;
    var output = source.closest(".chart-output");
    if (output) output.classList.add("isolated-chart-output");
    var layout = cloneValue(figure.layout || {});
    delete layout.width;
    layout.autosize = true;
    return window.Plotly.newPlot(source, cloneValue(figure.data || []), layout, Object.assign({ responsive: true }, cloneValue(figure.config || {})));
  };

  // Older Notebook exports call this name for a three-panel figure.  It now
  // deliberately retains the original combined canvas and its original legend.
  window.renderResponsiveThreePanel = window.renderIsolatedPlot;

  function resizePlots(container) {
    if (!window.Plotly) return;
    container.querySelectorAll(".plotly-graph-div").forEach(function (graph) {
      if (!graph._fullLayout) return;
      var output = graph.closest(".chart-output");
      var width = output ? Math.round(output.getBoundingClientRect().width) : 0;
      if (width > 0 && graph.layout && Number.isFinite(graph.layout.width) && Math.round(graph.layout.width) !== width) {
        window.Plotly.relayout(graph, { width: width });
      }
      window.Plotly.Plots.resize(graph);
    });
  }

  function setTraceValue(trace, path, value) {
    var keys = path.split(".");
    var target = trace;
    keys.slice(0, -1).forEach(function (key) {
      target[key] = target[key] || {};
      target = target[key];
    });
    target[keys[keys.length - 1]] = value;
  }

  // Keep every multi-panel Plotly report in one canvas.  A separate native
  // control switches immutable per-year snapshots, so Plotly never updates a
  // subplot in place or shares its slider state with a later chart.
  window.renderResponsiveCompoundFigure = function (id, figure) {
    var source = document.getElementById(id);
    var sliderData = figure && figure.layout && figure.layout.sliders && figure.layout.sliders[0];
    if (!source || !window.Plotly || !sliderData || !Array.isArray(sliderData.steps)) return;
    var output = source.closest(".chart-output");
    if (output) output.classList.add("isolated-chart-output");

    var wrapper = document.createElement("div");
    wrapper.className = "brand-grid-wrapper";
    var controls = document.createElement("label");
    controls.className = "brand-grid-controls";
    controls.textContent = "年份：";
    var year = document.createElement("output");
    var slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = String(sliderData.steps.length - 1);
    slider.step = "1";
    slider.value = String(sliderData.active || 0);
    slider.setAttribute("aria-label", "选择年份");
    controls.appendChild(year);
    controls.appendChild(slider);
    var stage = document.createElement("div");
    stage.className = "compound-figure-stage";
    wrapper.appendChild(controls);
    wrapper.appendChild(stage);
    source.replaceWith(wrapper);

    var snapshots = sliderData.steps.map(function (step) {
      var data = cloneValue(figure.data || []);
      var layout = cloneValue(figure.layout || {});
      var dataUpdates = step.args && step.args[0] || {};
      Object.keys(dataUpdates).forEach(function (path) {
        var values = dataUpdates[path];
        if (!Array.isArray(values)) return;
        values.forEach(function (value, traceIndex) {
          if (value !== null && value !== undefined && data[traceIndex]) {
            setTraceValue(data[traceIndex], path, cloneValue(value));
          }
        });
      });
      var layoutUpdates = step.args && step.args[1] || {};
      Object.keys(layoutUpdates).forEach(function (path) {
        setTraceValue(layout, path, cloneValue(layoutUpdates[path]));
      });
      // The old Plotly slider belongs to the source figure.  The native range
      // above is intentionally the sole state controller for this chart.
      delete layout.sliders;
      delete layout.width;
      layout.autosize = true;
      return {
        label: step.label || "",
        data: data,
        layout: layout,
        config: Object.assign({ responsive: true }, cloneValue(figure.config || {}))
      };
    });
    var renderVersion = 0;

    function render(index) {
      var version = ++renderVersion;
      var snapshot = snapshots[index];
      year.textContent = snapshot.label || String(index);
      stage.querySelectorAll(".plotly-graph-div").forEach(function (graph) {
        window.Plotly.purge(graph);
      });
      stage.replaceChildren();
      var graph = document.createElement("div");
      graph.id = id + "-year-" + index;
      graph.className = "plotly-graph-div";
      graph.setAttribute("aria-label", "年度组合交互式图表");
      stage.appendChild(graph);
      window.Plotly.newPlot(graph, cloneValue(snapshot.data), cloneValue(snapshot.layout), cloneValue(snapshot.config)).then(function () {
        if (version === renderVersion) schedulePlotResize(wrapper);
      });
    }

    slider.addEventListener("input", function () {
      year.textContent = snapshots[Number(slider.value)].label || slider.value;
    });
    slider.addEventListener("change", function () { render(Number(slider.value)); });
    render(Number(slider.value));
  };

  // Backward-compatible name for pages generated before the compound renderer
  // was renamed.  It deliberately renders one complete 2×2 figure.
  window.renderResponsiveBrandGrid = window.renderResponsiveCompoundFigure;

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

  function markIsolatedChartContainers(main) {
    main.querySelectorAll(".chart-output").forEach(function (output, index) {
      output.classList.add("isolated-chart-output");
      output.setAttribute("data-chart-container", String(index + 1));
    });
  }

  function buildOutline() {
    var main = document.querySelector("main");
    if (!main) return;
    var headings = Array.prototype.slice.call(main.querySelectorAll("h1"));
    if (!headings.length) return;

    markIsolatedChartContainers(main);

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
