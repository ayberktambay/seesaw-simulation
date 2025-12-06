class Seesaw {
    constructor() {
        this.items = [];
        this.plank = document.getElementById('thePlank');
        this.ghost = document.getElementById('ghostBox');
        
        this.ui_next = document.getElementById('nextWeight');
        this.ui_left = document.getElementById('leftWeight');
        this.ui_right = document.getElementById('rightWeight');
        this.ui_angle = document.getElementById('tiltAngle');
        
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

        this.run_physics();
    }

    run_physics() {
        let t_left = 0; 
        let t_right = 0; 
        let w_left = 0; 
        let w_right = 0; 

        for(let item of this.items) {
            let torque = item.w * Math.abs(item.d);

            if(item.d < 0) {
                t_left += torque;
                w_left += item.w;
            } else {
                t_right += torque;
                w_right += item.w;
            }
        }

        this.ui_left.innerText = w_left.toFixed(1) + ' kg';
        this.ui_right.innerText = w_right.toFixed(1) + ' kg';

        let net = t_right - t_left;
        let deg = net / 50; 

        if(deg > 30) deg = 30;
        if(deg < -30) deg = -30;

        this.ui_angle.innerText = deg.toFixed(1) + '°';
        this.plank.style.transform = `rotate(${deg}deg)`;
    }

    get_random_w() {
        return Math.floor(Math.random() * 10) + 1;
    }

    update_next_ui() {
        this.ui_next.innerText = this.next_weight + ' kg';
    }
}

const app = new Seesaw();