
const CountryPanel = new class {
  HTML = {
    listHolder: document.querySelector('#countryList.panel .listHolder')
  }

  update(_countries) {
    this.HTML.listHolder.innerHTML = '';

    for (let country in _countries)
    {
      if (!_countries[country].color) _countries[country].color = [0, 0, 0];
      let element = this.#renderCountry(country, `rgb(${_countries[country].color.join(',')})`);
      this.HTML.listHolder.append(element);
    }
  }

  #renderCountry(_shortName, _color) {
    let element = document.createElement('div');
    element.classList.add('listItem');
    element.innerHTML = `
      <div class="colorIndicator" style='background: ${_color}'></div>
      <div class="title">${_shortName}</div>
    `;

    return element;
  }
}