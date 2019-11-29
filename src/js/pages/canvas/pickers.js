function CreateSlider(min, max, value, setter, cssClass) {
    let slider = document.createElement('input');
    slider.type = 'range';//дергалка
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = 1;
    slider.classList.add("slider");
    if (cssClass) slider.classList.add(cssClass);
    slider.addEventListener("input", function (e) {
        setter(e.target.value);
    });
    return slider;
};

function WidthPicker(domElement, w, doStuffOnChange) { // ширина кисти
    let Width = w;
    this.getWidth = () => Width;
    this.setWidth = (w) => {
        Width = w;
        slider.value = w;
        doStuffOnChange.call(this); 
    }
    let slider = CreateSlider(1, 30, Width, this.setWidth, 'grey');
    domElement.appendChild(slider);
    doStuffOnChange.call(this);
}

function ColorPicker(domElement, r, g, b, doStuffOnChange) {
    let R = r;
    let G = g;
    let B = b;
    let setR = (r) => {
        R = r;
        doStuffOnChange.call(this);
    };
    let setG = (g) => {
        G = g;
        doStuffOnChange.call(this);
    };
    let setB = (b) => {
        B = b;
        doStuffOnChange.call(this);
    }

    this.getR = () => R;
    this.getG = () => G;
    this.getB = () => B;



    let fragment = document.createDocumentFragment(); // пока вставляем фрагмент мы не вызывает перерисовку dom дерева
    let redSlider = CreateSlider(0, 255, R, setR, "red");
    let greenSlider = CreateSlider(0, 255, G, setG, "green");
    let blueSlider = CreateSlider(0, 255, B, setB, "blue");
    this.setColor = (r, g, b) => { //меняем сразу 3 цвета
        R = r;
        G = g;
        B = b;
        redSlider.value = r;
        greenSlider.value = g;
        blueSlider.value = b;
        doStuffOnChange.call(this);
    }

    fragment.appendChild(redSlider);
    fragment.appendChild(greenSlider);
    fragment.appendChild(blueSlider);
    domElement.appendChild(fragment);
    doStuffOnChange.call(this); //
}