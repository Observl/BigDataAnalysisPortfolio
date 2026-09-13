(function () {
  function slugify(value, index) {
    return "section-" + (index + 1) + "-" + value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  }

  function resizePlots(container) {
    if (!window.Plotly) return;
    container.querySelectorAll(".plotly-graph-div").forEach(function (graph) {
      window.Plotly.Plots.resize(graph);
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
        if (!expanded) requestAnimationFrame(function () { resizePlots(content); });
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
