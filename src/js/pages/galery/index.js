function SlidesList() {
    var slides = [];
    var activeSlideIndex = 0;

    function addElement(element) {
        slides.push(element);
    }

    function next() { 
        slides[activeSlideIndex].className = '';
        if (activeSlideIndex == (slides.length - 1)) {
            activeSlideIndex = -1;
        }
        slides[++activeSlideIndex].className = 'active';
    }

    function prev() {
        slides[activeSlideIndex].className = '';
        if (activeSlideIndex <= 0) {
            activeSlideIndex = slides.length;
        }
        slides[--activeSlideIndex].className = 'active';
    }

    function showByIndex(index) {
        slides[activeSlideIndex].className = '';
        activeSlideIndex = index;
        slides[activeSlideIndex].className = 'active';
    }

    function lastItemIndex() {
        return slides.length - 1;
    }

    function getActiveItemIndex() {
        return activeSlideIndex;
    }

    return {
        addElement: addElement,
        showPrev: prev,
        showNext: next,
        showOnPosition: showByIndex,
        lastItemIndex: lastItemIndex,
        getActiveItemIndex: getActiveItemIndex
    }
}


function loadImage(name) {
    const formData = new FormData();
    formData.append("f", "READ");
    formData.append("n", name);
    return fetch('https://fe.it-academy.by/AjaxStringStorage2.php', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
}

window.addEventListener('load', function () {
    let slider = new SlidesList();
    let array = [];
    let loading = document.getElementById("loading");
    document.getElementById("prev").getElementsByTagName("button")[0].addEventListener('click', function () {
        slider.showPrev();
    });
    document.getElementById("next").getElementsByTagName("button")[0].addEventListener('click', function () {
        if (slider.getActiveItemIndex() + 1 <= slider.lastItemIndex() || (slider.getActiveItemIndex() + 1 >= array.length)) {
            slider.showNext();
        } else {
            loading.style.display = "block";
            loadImageAndSlideToIt(slider.getActiveItemIndex() + 1)
        }
    });
    document.getElementById("paint-button").addEventListener('click', function () {
        window.location.href = "canvas.html";
    })


    let loadImageAndSlideToIt = (i) => loadImage(array[i]).then(json => { 
        // загружаем картинку и добавляем новый элемент в слайдер
        loading.style.display = "none";
        if (!json.error) {
            let li = document.createElement("li");
            let img = document.createElement("img");
            img.src = JSON.parse(json.result).image;
            li.appendChild(img);
            let slides = document.getElementById("slides");
            slides.appendChild(li);
            slider.addElement(li)
            slider.showOnPosition(i)
        } else {
            array = array.splice(i, 1);
            alert(json.error)
        }
    }).catch(() => loading.style.display = "none");


    const formData = new FormData(); // запрашиваемм список картинок
    formData.append("f", "READ");
    formData.append("n", "drsavaug_LISTPICS");
    loading.style.display = "block";

    fetch('https://fe.it-academy.by/AjaxStringStorage2.php', {
        method: 'POST',
        body: formData
    }).then(response => response.json().then(json => {
        if (!json.error) {
            array = JSON.parse(json.result);
            if (array.length > 0) loadImageAndSlideToIt(0);
            else alert("have no images yet")
        } else {
            alert(json.error);
            loading.style.display = "none";

        }
    })).catch(() => loading.style.display = "none"); // отлавливаем ошибки от сервера и тп, скрываем слой загрузки
})
