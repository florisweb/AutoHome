
const TravelPanel = new class {
  HTML = {
    listHolder: document.querySelector('#travelPanel.panel .listHolder')
  }

  update(_travelList) {
    this.HTML.listHolder.innerHTML = '';

    for (let section of _travelList)
    {
      let element = this.#renderSection(section);
      this.HTML.listHolder.append(element);
    }
  }

  #renderSection(_section) {
    let element = document.createElement('div');
    element.classList.add('listItem');
    let color = DataManager.countryList[_section.country]?.color || [150, 150, 150];
    element.style.cssText = `--pathColor: rgb(${color.join(',')})`;

    let hours = Math.ceil((_section.end - _section.start) / 1000 / 60 / 60)
    let durationString = `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (hours > 24) durationString = `${Math.floor(hours / 24)} day${Math.floor(hours / 24) !== 1 ? 's' : ''}`;


    let startDate = new Date(_section.start);
    element.innerHTML = `
      <div class="pathIndicator"></div>
      <div class="enterDate">${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getFullYear()}</div>
      <div class="title">${CountryData.getNameFromCode(_section.country)}</div>
      <div class="durationHolder">${durationString}</div>
    `;
    return element;
  }
}