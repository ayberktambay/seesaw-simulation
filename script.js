class Seesaw {
    constructor() {
        this.items = [];
        this.plank = document.getElementById('thePlank');
        this.ghost = document.getElementById('ghostBox');
        
        this.resetBtn = document.getElementById('btn-reset');
        this.undoBtn = document.getElementById('btn-undo');

        this.ui_next = document.getElementById('nextWeight');
        this.ui_left = document.getElementById('leftWeight');
        this.ui_right = document.getElementById('rightWeight');
        this.ui_angle = document.getElementById('tiltAngle');
        
        this.audioCtx = null;
        this.next_weight = this.get_random_w();
        
        this.init();
    }

    init() {
        this.load_state();

        this.plank.addEventListener('mousemove', (e) => this.handle_hover(e));
        
        this.plank.addEventListener('mouseleave', () => {
            this.ghost.style.opacity = '0';
        });

        this.plank.addEventListener('click', (e) => this.handle_click(e));
        this.resetBtn.addEventListener('click', () => this.reset_all());
        this.undoBtn.addEventListener('click', () => this.undo_last());

        this.update_next_ui();
    }

    handle_hover(e) {
        this.ghost.style.opacity = '1';

        let rect = this.plank.getBoundingClientRect();
        let x = e.clientX - rect.left;

        let minX = 22;
        let maxX = rect.width - 22;

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;

        this.ghost.style.left = x + 'px';
        this.ghost.innerText = this.next_weight;
    }

    handle_click(e) {
        // init audio on first click (browser policy)
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        let rect = this.plank.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let center = rect.width / 2;

        let minX = 22;
        let maxX = rect.width - 22;

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;

        let dist = x - center;
        let w = this.next_weight;

        this.add_item(w, dist);
        this.play_sound('drop');

        this.next_weight = this.get_random_w();
        this.update_next_ui();
        this.ghost.innerText = this.next_weight;

        this.save_state();
    }

    add_item(w, d, from_storage = false) {
        this.items.push({ w: w, d: d });

        let el = document.createElement('div');
        el.className = 'weight-box';
        el.innerText = w;
        
        let halfWidth = this.plank.offsetWidth / 2;
        el.style.left = (halfWidth + d) + 'px';
        
        let col = Math.floor(Math.random()*16777215).toString(16);
        el.style.backgroundColor = '#' + col;

        // skip animation if loading from storage
        if (from_storage) {
            el.style.animation = 'none';
        }

        this.plank.appendChild(el);

        this.run_physics();
    }
    undo_last() {
        if (this.items.length === 0) return;

        this.items.pop();

        let boxes = this.plank.querySelectorAll('.weight-box');
        if (boxes.length > 0) {
            boxes[boxes.length - 1].remove();
        }

        this.run_physics();
        this.save_state();
    }
    run_physics() {
        let t_left = 0; 
        let t_right = 0; 
        let w_left = 0; 
        let w_right = 0; 

        // sum up torques
        for(let item of this.items) {
            let torque = item.w * Math.abs(item.d);

            if(item.d < 0) {
                // negative distance means left side
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

        // limit max tilt
        if(deg > 30) deg = 30;
        if(deg < -30) deg = -30;

        this.ui_angle.innerText = deg.toFixed(1) + '°';
        this.plank.style.transform = `rotate(${deg}deg)`;
    }

    save_state() {
        localStorage.setItem('seesaw_data', JSON.stringify(this.items));
    }

    load_state() {
        let data = localStorage.getItem('seesaw_data');
        if (data) {
            let parsed = JSON.parse(data);
            parsed.forEach(item => {
                this.add_item(item.w, item.d, true);
            });
        }
    }

    reset_all() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        this.play_sound('reset');

        this.items = [];
        localStorage.removeItem('seesaw_data');
        
        // remove only weight boxes, keep ghost
        let boxes = document.querySelectorAll('.weight-box');
        boxes.forEach(b => b.remove());

        this.plank.style.transform = 'rotate(0deg)';
        this.run_physics();
    }

    play_sound(type) {
        if(!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'drop') {
            // quick high pitch beep
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } else {
            // slide down sound
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
            
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    get_random_w() {
        return Math.floor(Math.random() * 10) + 1;
    }

    update_next_ui() {
        this.ui_next.innerText = this.next_weight + ' kg';
    }
}

const app = new Seesaw();