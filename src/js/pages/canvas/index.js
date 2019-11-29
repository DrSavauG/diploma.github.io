window.addEventListener('load', function () {
    let canvasDOM = document.getElementById('canvas');
    let menuButtonDOM = document.getElementById('canvas-menu-button');
    let saveButtonDOM = document.getElementById('canvas-save-button');
    let undoButtonDOM = document.getElementById('canvas-undo-button');
    let menuDOM = document.getElementById('canvas-menu');
    let applyDOM = document.getElementById('apply');
    let galeryDOM = document.getElementById('galery');
    let cancelDOM = document.getElementById('cancel');
    let pencilColorPickerDOM = document.getElementById('pencil-color-picker');
    let pencilWidthPickerDOM = document.getElementById('pencil-width-picker');
    let bgColorPickerDOM = document.getElementById('bg-color-picker');
    let pencilColorViewerDOM = document.getElementById("pencil-color-viewer");
    let bgColorViewerDOM = document.getElementById("bg-color-viewer");

    let addListeners = (element, eventsMap) => { // регистрация именнованоого массива событий, ключ имя события , значение обработчик 
        for (const key in eventsMap) {
            if (eventsMap.hasOwnProperty(key)) {
                element.addEventListener(key, eventsMap[key])
            }
        }
    };

    let drawer = new Drawer(canvasDOM);
    let pencilColorPicker = new ColorPicker(pencilColorPickerDOM, 0, 0, 0, function () { // корневой элемент куда добавляем слайдеры
        // function = вставляем цвет квадратика в меню
        pencilColorViewerDOM.style.background = `rgb(${this.getR()},${this.getG()},${this.getB()})` // получаем цвета 
    });
    let pencilWidthPicker = new WidthPicker(pencilWidthPickerDOM, 0, function () {});
    let bgColorPicker = new ColorPicker(bgColorPickerDOM, 255, 255, 255, function () {
        bgColorViewerDOM.style.background = `rgb(${this.getR()},${this.getG()},${this.getB()})`
    });

    let dirty = () => { // указать что у нас были изменения
        saveButtonDOM.style.display = 'block';
        undoButtonDOM.style.display = 'block';
        window.onbeforeunload = function (e) {
            let confirmationMessage = "All changes will be lost";
            (e || window.event).returnValue = confirmationMessage;
            return confirmationMessage;
        };
    }

    let clean = () => { // ctrl+z or undo
        saveButtonDOM.style.display = 'none';
        undoButtonDOM.style.display = 'none';
        window.onbeforeunload = null;
    }

    let events = { 
        canvasEvents: {
            'mousedown': function (e) {
                drawer.down(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
                dirty();
            },
            'touchstart': function (e) {
                if (e.touches.length > 1) return;
                drawer.down(e.touches[0].pageX - this.offsetLeft, e.touches[0].pageY - this.offsetTop);
                dirty();
            },
            'mousemove': function (e) {
                drawer.move(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            },
            'touchmove': function (e) {
                if (e.touches.length > 1) return;
                drawer.move(e.touches[0].pageX - this.offsetLeft, e.touches[0].pageY - this.offsetTop)
            },
            'mouseup': function () {
                drawer.up();
            },
            'mouseleave': function () {
                drawer.up();
            },
            'touchcancel': function () {
                drawer.up();
            },
            'touchend': function () {
                drawer.up();
            },
        },

        windowEvents: {
            'resize': function () { //адаптивность к размеру и ориентации экрана
                canvasDOM.width = window.innerWidth;
                canvasDOM.height = window.innerHeight;
                drawer.redraw();
            },
            'keydown': function (e) { // ctrl + z => undo
                if (e.which === 90 && e.ctrlKey) drawer.undo();
                if (drawer.history.length == 1) clean();
            },
        },
        menuEvents: {
            'click': function () { 
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50); // вибрация в гаджетах
                pencilColorPicker.setColor(drawer.currentPencil.color.R, drawer.currentPencil.color.G, drawer.currentPencil.color.B);
                bgColorPicker.setColor(drawer.currentBackground.color.R, drawer.currentBackground.color.G, drawer.currentBackground.color.B);
                pencilWidthPicker.setWidth(drawer.currentPencil.width);
                menuDOM.style.display = "block";
            },
        },
        applyMenuEvents: { //
            'click': function () {
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
                drawer.setPencil(pencilColorPicker.getR(), pencilColorPicker.getG(), pencilColorPicker.getB(), pencilWidthPicker.getWidth())
                drawer.setBackground(bgColorPicker.getR(), bgColorPicker.getG(), bgColorPicker.getB())
                menuDOM.style.display = "none";
            }
        },
        cancelMenuEvents: {
            'click': function () {
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
                menuDOM.style.display = "none";
            }
        },
        galeryEvents: {
            'click': function () {
                window.location.href = "galery.html"; // переходим на галлерею, браузер воспринимает как переадресацию
            }
        },
        undoMenuEvents: {
            'click': function () {
                drawer.undo();
                if (drawer.history.length == 1) clean();
            }
        },
        saveMenuEvents: {
            'click': function () {
                if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
                let authorName = null;
                let loading = document.getElementById("canvas-loading")
                loading.style.display = "block";
                do {
                    authorName = prompt("Author's name:")
                    if (authorName) authorName = authorName.trim();
                } while (authorName !== null && authorName.length == 0);
                if (!authorName) {
                    loading.style.display = "none";
                    return;
                }
                let password = "drsavaug_LISTPICS_" + Date.now();
                const formData = new FormData();
                formData.append("f", "LOCKGET"); // блокирую запись drsavaug_LISTPICS для других пользователей
                formData.append("n", "drsavaug_LISTPICS");
                formData.append("p", password);

                fetch('https://fe.it-academy.by/AjaxStringStorage2.php', {
                    method: 'POST',
                    body: formData 
                }).then(response => response.json().then(json => { // преобразовываем ответ от сервера в объект,
                    if (json.error) {
                        loading.style.display = "none";
                        alert(json.error)
                        return;
                    }
                    let arr = []; // ответ, массив имен картинок,
                    if (json.result) arr = JSON.parse(json.result);

                    let newPicName = authorName + Date.now();

                    const newPickformData = new FormData(); //формируем запрос на вставку новой картинки
                    newPickformData.append("f", "INSERT");
                    newPickformData.append("n", newPicName);
                    newPickformData.append("v", JSON.stringify(ToImage(canvasDOM)));

                    fetch('https://fe.it-academy.by/AjaxStringStorage2.php', {
                        method: 'POST',
                        body: newPickformData
                    }).then(response => response.json().then(json => {
                        if (!json.error) {
                            arr.push(newPicName);
                            const listPicsUpdate = new FormData();
                            listPicsUpdate.append("f", "UPDATE"); // обновляем список соохраненных картинок
                            listPicsUpdate.append("n", "drsavaug_LISTPICS");
                            listPicsUpdate.append("p", password);
                            listPicsUpdate.append("v", JSON.stringify(arr));
                            fetch('https://fe.it-academy.by/AjaxStringStorage2.php', {
                                method: 'POST',
                                body: listPicsUpdate
                            }).then(response => response.json().then(json => {
                                if (!json.error) {
                                    clean();
                                    window.location.href = "galery.html"; // если не прищна ошибка то переходим на галерею с сохраненными картинками
                                } else {
                                    loading.style.display = "none";
                                    alert(json.error)
                                }
                            }))
                        } else {
                            loading.style.display = "none";
                            alert(json.error)
                        }
                    }))
                }))
            }
        }
    };

    canvasDOM.width = window.innerWidth; // меняем ширину доски
    canvasDOM.height = window.innerHeight;

    addListeners(canvasDOM, events.canvasEvents); // регистрируем события
    addListeners(menuButtonDOM, events.menuEvents);
    addListeners(applyDOM, events.applyMenuEvents);
    addListeners(cancelDOM, events.cancelMenuEvents);
    addListeners(galeryDOM, events.galeryEvents);
    addListeners(saveButtonDOM, events.saveMenuEvents);
    addListeners(undoButtonDOM, events.undoMenuEvents);
    addListeners(window, events.windowEvents);
});


function ToImage(canvas) {
    return {
        image: canvas.toDataURL() // преобразует рисунок в ссылку
    }
}