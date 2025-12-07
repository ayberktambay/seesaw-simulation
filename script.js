class Seesaw {
    constructor() {
        this.items = [];
        this.plank = document.getElementById('thePlank');
        this.ghost = document.getElementById('ghostBox');
        
        // Buttons
        this.resetBtn = document.getElementById('btn-reset');
        this.undoBtn = document.getElementById('btn-undo');
        this.pauseBtn = document.getElementById('btn-pause');
        this.muteBtn = document.getElementById('btn-mute');
        
        // UI Refs
        this.ui_next = document.getElementById('nextWeight');
        this.ui_left = document.getElementById('leftWeight');
        this.ui_right = document.getElementById('rightWeight');
        this.ui_angle = document.getElementById('tiltAngle');
        this.log_list = document.getElementById('actionLog');
        
        // State
        this.audioCtx = null;
        this.next_weight = this.get_random_w();
        this.isPaused = false;
        this.isMuted = false;
        
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
        this.pauseBtn.addEventListener('click', () => this.toggle_pause());
        this.muteBtn.addEventListener('click', () => this.toggle_mute());
        
        this.update_next_ui();
    }

   toggle_pause() {
        this.isPaused = !this.isPaused;
        const span = this.pauseBtn.querySelector('span') || this.pauseBtn;
        const iconPath = document.getElementById('icon-pause');
        
        // SVG Paths
        const iconPlay = "M8 5v14l11-7z";
        const iconPause = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

        if (this.isPaused) {
            span.innerText = "Resume";
            // Change to Play Icon
            if(iconPath) iconPath.setAttribute('d', iconPlay);
            
            this.pauseBtn.classList.add('active');
            this.plank.style.cursor = 'not-allowed';
            this.ghost.style.opacity = '0';
        } else {
            span.innerText = "Pause";
            // Change back to Pause Icon
            if(iconPath) iconPath.setAttribute('d', iconPause);
            
            this.pauseBtn.classList.remove('active');
            this.plank.style.cursor = 'pointer';
        }
    }

    toggle_mute() {
        this.isMuted = !this.isMuted;
        const span = this.muteBtn.querySelector('span') || this.muteBtn;
        const iconPath = document.getElementById('icon-mute');

        // SVG Paths
        const iconSoundOn = "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z";
        const iconSoundOff = "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z";

        if (this.isMuted) {
            span.innerText = "Unmute";
            // Change to Muted Icon (Slash)
            if(iconPath) iconPath.setAttribute('d', iconSoundOff);
            
            this.muteBtn.classList.add('active');
        } else {
            span.innerText = "Mute";
            // Change to Sound Icon (Waves)
            if(iconPath) iconPath.setAttribute('d', iconSoundOn);
            
            this.muteBtn.classList.remove('active');
        }
    }

    handle_hover(e) {
        // Stop if paused
        if (this.isPaused) return;

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
        // Stop if paused
        if (this.isPaused) return;

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

        if (!from_storage) {
            this.add_log(w, d);
        }

        let el = document.createElement('div');
        el.className = 'weight-box';
        el.innerText = w;
        
        let halfWidth = this.plank.offsetWidth / 2;
        el.style.left = (halfWidth + d) + 'px';
        
        let col = Math.floor(Math.random()*16777215).toString(16);
        el.style.backgroundColor = '#' + col;

        // dynamic size
        let size = this.mapRange(w, 1, 10, 24, 48);
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.lineHeight = size + 'px';
        el.style.fontSize = (size * 0.32) + 'px';
        el.style.borderRadius = (size * 0.15) + 'px';

        if (from_storage) {
            el.style.animation = 'none';
        }

        this.plank.appendChild(el);
        this.run_physics();
    }

    mapRange(value, inMin, inMax, outMin, outMax) {
        return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
    }

    add_log(w, d) {
        let side = d < 0 ? 'Left' : 'Right';
        let className = d < 0 ? 'left' : 'right';
        
        let li = document.createElement('li');
        li.innerHTML = `
            <span>Added <b>${w}kg</b></span>
            <span class="side-badge ${className}">${side}</span>
        `;
        
        this.log_list.prepend(li);
    }

    undo_last() {
        // Stop if paused (optional choice, but logical)
        if (this.isPaused) return;

        if (this.items.length === 0) return;

        this.items.pop();

        let boxes = this.plank.querySelectorAll('.weight-box');
        if (boxes.length > 0) {
            boxes[boxes.length - 1].remove();
        }

        if (this.log_list.firstElementChild) {
            this.log_list.firstElementChild.remove();
        }

        this.run_physics();
        this.save_state();
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

    save_state() {
        localStorage.setItem('seesaw_data', JSON.stringify(this.items));
        localStorage.setItem('seesaw_log', this.log_list.innerHTML);
    }

    load_state() {
        let data = localStorage.getItem('seesaw_data');
        if (data) {
            let parsed = JSON.parse(data);
            parsed.forEach(item => {
                this.add_item(item.w, item.d, true);
            });
        }

        let logData = localStorage.getItem('seesaw_log');
        if (logData) {
            this.log_list.innerHTML = logData;
        }
    }

    reset_all() {
        // Can reset even if paused, but let's unpause to be safe
        if (this.isPaused) this.toggle_pause();

        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        this.play_sound('reset');

        this.items = [];
        localStorage.removeItem('seesaw_data');
        localStorage.removeItem('seesaw_log');
        
        let boxes = document.querySelectorAll('.weight-box');
        boxes.forEach(b => b.remove());

        this.log_list.innerHTML = '';

        this.plank.style.transform = 'rotate(0deg)';
        this.run_physics();
    }

    play_sound(type) {
        // Mute check
        if (this.isMuted) return;
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        if (type === 'drop') {
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            
            osc.start(now);
            osc.stop(now + 0.1);
        } else {
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