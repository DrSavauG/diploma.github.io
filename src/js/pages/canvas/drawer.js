function Background(color) {
    this.type = "BG";
    this.color = color;
}

function Color(r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.string = () => {
        return `rgb(${this.R},${this.G},${this.B})`
    }
}

function Pencil(color, width) {
    this.color = color;
    this.width = width;
}

function Line(pencil) {
    this.type = "LINE";
    this.points = [];
    this.pencil = pencil
    this.addPoint = (point) => this.points.push(point);
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Drawer(domElement) {
    this.currentPencil = new Pencil(new Color(0, 0, 0), 5);
    this.currentBackground = new Background(new Color(255, 255, 255));
    this.history = [this.currentBackground]; // история изменений  изображения

    let drawingContext = domElement.getContext('2d');
    let paint = false; // поднято перо
    let currentLine = new Line(this.currentPencil);



    this.addToLine = (x, y) => {
        currentLine.addPoint(new Point(x, y));
        this.drawLine(currentLine);
    }
    this.down = (mouseX, mouseY) => {
        paint = true; // опускаем перо, добавляем первую точку
        this.addToLine(mouseX, mouseY);
    }
    this.move = (mouseX, mouseY) => {
        if (paint) this.addToLine(mouseX, mouseY, true);
    }
    this.up = () => {
        if (currentLine.points.length > 0) {
            this.history.push(currentLine);
            currentLine = new Line(this.currentPencil);
        }
        paint = false;
    }
    this.drawLine = (lineToDraw) => {
        drawingContext.strokeStyle = lineToDraw.pencil.color.string();
        drawingContext.lineWidth = lineToDraw.pencil.width;
        drawingContext.lineJoin = "round"; // скругление линии
        let points = lineToDraw.points;
        for (let j = 0; j < points.length; j++) {
            drawingContext.beginPath();
            if (j) drawingContext.moveTo(points[j - 1].x, points[j - 1].y);
            else drawingContext.moveTo(points[j].x - 1, points[j].y);
            drawingContext.lineTo(points[j].x, points[j].y); // отрисовывает линию от j-1 до j
            drawingContext.closePath();
            drawingContext.stroke(); // выполнить отрисовку
        }
    }
    this.fillBackground = (background) => {
        drawingContext.clearRect(0, 0, drawingContext.canvas.width, drawingContext.canvas.height); // очищает целиком  доску, 
        drawingContext.rect(0, 0, drawingContext.canvas.width, drawingContext.canvas.height);
        drawingContext.fillStyle = background.color.string();
        drawingContext.fill();
    }
    this.redraw = () => { // полная перерисовка всей истории
        let background = null;
        for (let i = this.history.length - 1; i >= 0; i--) { // ищем последнее изменение фона
            let historyItem = this.history[i];
            if (!historyItem) continue;
            if (historyItem.type == "BG") background = historyItem;
        }
        this.fillBackground(background);//заливаем последним цветом
        for (let i = 0; i < this.history.length; i++) {
            let historyItem = this.history[i];
            if (!historyItem) continue;
            if (historyItem.type == "LINE") this.drawLine(historyItem)
        }
    };
    this.setPencil = (r, g, b, w) => {
        this.currentPencil = new Pencil(new Color(r, g, b), w);
        currentLine.pencil = this.currentPencil;
    };
    
    this.setBackground = (r, g, b) => {
        if (r == this.currentBackground.color.R && g == this.currentBackground.color.G && b == this.currentBackground.color.B) return; 
        this.currentBackground = new Background(new Color(r, g, b));
        this.history.push(this.currentBackground);
        this.redraw();
    };
    this.undo = () => {
        if (this.history.length == 1) return;
        this.history = this.history.slice(0, this.history.length - 1);
        if (this.history.length == 1) this.currentBackground = this.history[0];
        this.redraw();
    }
}
