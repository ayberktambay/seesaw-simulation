class Seesaw {
    constructor() {
        this.items = [];
        this.plank = document.getElementById('thePlank');
        this.ghost = document.getElementById('ghostBox');
        this.ui_next = document.getElementById('nextWeight');
        
        this.next_weight = this.get_random_w();
        
        this.init();
    }

    init() {
        this.plank.addEventListener('click', (e) => this.handle_click(e));
        this.update_next_ui();
    }

    handle_click(e) {
        let rect = this.plank.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let center = rect.width / 2;
        let dist = x - center;

        let w = this.next_weight;

        this.add_item(w, dist);

        this.next_weight = this.get_random_w();
        this.update_next_ui();
    }

    add_item(w, d) {
        this.items.push({ w: w, d: d });

        let el = document.createElement('div');
        el.className = 'weight-box';
        el.innerText = w;
        
        el.style.left = (300 + d) + 'px';
        
        let col = Math.floor(Math.random()*16777215).toString(16);
        el.style.backgroundColor = '#' + col;

        this.plank.appendChild(el);
    }

    get_random_w() {
        return Math.floor(Math.random() * 10) + 1;
    }

    update_next_ui() {
        this.ui_next.innerText = this.next_weight + ' kg';
    }
}

const app = new Seesaw();