customElements.define("load-file", class extends HTMLElement {
  async connectedCallback(
    src = this.getAttribute("src"),
  ) {
    this.innerHTML = await (await fetch(src)).text()
  }
})

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  var millisecsInDay = 86400000;
  const weekDay = Math.ceil((((this - onejan) / millisecsInDay) + onejan.getDay()) / 7);
  return weekDay === 53 ? 1 : weekDay
};
