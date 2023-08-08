/* global ProgressBar:false*/
import { HTMLElement, customElements } from '@environment-safe/elements';

export class ImageGallery extends HTMLElement {
    constructor() {
        super();
        this._data = [];
        this.attachShadow({ mode: 'open' });
        const link = document.getElementById('image-gallery.css');
        const CSSLink = link?link.getAttribute('href'):'/image-gallery.css';
        this._link = document.createElement('link');
        this._link.setAttribute('rel', 'stylesheet');
        this._link.setAttribute('href', CSSLink);
        const link2 = document.getElementById('animate.css');
        const CSSLink2 = link2?link2.getAttribute('href'):'/animate.css';
        this._animateLink = document.createElement('link');
        this._animateLink.setAttribute('rel', 'stylesheet');
        this._animateLink.setAttribute('href', CSSLink2);
        //load the CSS into the shadow DOM
        this.shadowRoot.appendChild(this._link);
        this.shadowRoot.appendChild(this._animateLink);
        this._timer = document.createElement('div');
        this._timer.setAttribute('id', 'timer');
        this._timer.style.position = 'absolute';
        this._timer.style.zIndex = 10;
        this._timer.style.height = '10%';
        this._timer.style.width = '10%';
        this._timer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" viewBox="0 0 100 100">
            <path fill-opacity="0" stroke-width="3" stroke="#bbb" d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"/>
            <path id="heart-path" fill-opacity="0" stroke-width="5" stroke="#ED6A5A" d="m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z"/>
        </svg>`;
        this._timer.style.visibility = 'hidden';
        this.shadowRoot.appendChild(this._timer);
        this._container = document.createElement('div');
        this._slot = document.createElement('slot');
        this._slot.setAttribute('id', 'main-slot');
        this._container.appendChild(this._slot);
        this.shadowRoot.appendChild(this._container);
        this._selected = 0;
        this.useHTMLDefinedImages();
    }
    
    connectedCallback(){
        this.render();
        this.display();
    }
    
    play(interval=5000){
        this._timer.style.visibility = 'visible';
        this._progress.stop(); 
        this.pause();
        if(this._progress){
            this._progress.set(0);
            this._progress.animate(1.0);
        }
        this._playFn = ()=>{
            this.next();
        };
        this._intervalKey = setInterval(this._playFn, interval);
    }
    
    pause(){
        clearInterval(this._intervalKey);
        this._progress.stop(); 
    }
    
    next(){
        if(this._imgs){
            this._selected++;
            this._selected = this._selected % this._imgs.length;
            this.display();
            if(this._progress){
                this._progress.set(0);
                this._progress.animate(1.0); 
            }
            this.dispatchEvent(new CustomEvent('image-changed', { 
                detail: {
                    img: this._selected
                } 
            }));
        }
    }
    
    previous(){
        this._selected--;
        this._selected = this._selected % this._imgs.length;
        this.display();
    }
    
    setImages(imageList){
        this._images = imageList;
        this.render();
        this.display();
    }
    
    static get observedAttributes() { return [ 'transitions']; }
    
    // We reflect attribute changes into property changes
    attributeChangedCallback(attr, oldVal, newVal){
        if(oldVal !== newVal){
            this[attr] = newVal;
        }
    }
    
    // Getter and setters for data
    get transitions() { return this._transitions; }
    set transitions(value) {
        const parsedValue = typeof value === 'string'?
            value.split(',').map(s=>s.trim()):
            value;
        if (parsedValue != this._transitions){
            this._transitions = parsedValue;
            this.dispatchEvent(new CustomEvent('transitions-changed', { 
                detail: parsedValue 
            }));
            this.display();
        }
    }
    
    useHTMLDefinedImages(){
        const images = this.querySelectorAll('gallery-image');
        const imageUrls = Array.from(images).map(i=>i.getAttribute('source'));
        this.setImages(imageUrls);
    }
    
    async transition(imgIn, imgOut, transition){
        return new Promise((resolve, reject)=>{
            try{
                const inTransition = 'fadeIn';
                const outTransition = 'fadeOut';
                let inDone = false;
                let outDone = false;
                if(imgIn){
                    const inEndFn = ()=>{
                        imgIn.removeEventListener('animationend', inEndFn);
                        imgIn.classList.remove(`animate__${'animated'}`);
                        imgIn.classList.remove(`animate__${inTransition}`);
                        imgIn.classList.remove(`animate__${'faster'}`);
                        inDone = true;
                        if(inDone && outDone)resolve();
                    };
                    imgIn.addEventListener('animationend', inEndFn, false);
                    imgIn.classList.add(`animate__${'animated'}`);
                    imgIn.classList.add(`animate__${inTransition}`);
                    imgIn.classList.add(`animate__${'faster'}`);
                }else{
                    inDone = true;
                }
                if(imgOut){
                    const outEndFn = ()=>{
                        imgOut.removeEventListener('animationend', outEndFn);
                        imgOut.classList.remove(`animate__${'animated'}`);
                        imgOut.classList.remove(`animate__${outTransition}`);
                        imgOut.classList.remove(`animate__${'faster'}`);
                        outDone = true;
                        if(inDone && outDone)resolve();
                    };
                    imgOut.addEventListener('animationend', outEndFn, false);
                    imgOut.classList.add(`animate__${'animated'}`);
                    imgOut.classList.add(`animate__${outTransition}`);
                    imgOut.classList.add(`animate__${'faster'}`);
                }else{
                    outDone = true;
                }
            }catch(ex){ reject(ex); }
        });
    }
    
    render(){
        this._container.innerHTML = '';
        if(this._timer){
            this._container.appendChild(this._timer);
            if(!this._progress){
                this._progress = new ProgressBar.Path('#heart-path', {
                    easing: 'easeInOut',
                    duration: 5000,
                    context: this._timer
                });
            }
        }
        this._container.style.width = this.offsetWidth+'px';
        this._container.style.height = this.offsetHeight+'px';
        this._imgs = [];
        this._images.forEach((image)=>{
            const meta = typeof image === 'string'?{url:image}:image;
            const img = document.createElement('div');
            img.setAttribute('style', `
              position:absolute;
              background: url(${meta.url}) no-repeat center center fixed; 
              -webkit-background-size: cover;
              -moz-background-size: cover;
              -o-background-size: cover;
              background-size: cover;
              height: 100%;
              width: 100%;
            `);
            this._imgs.push(img);
            img.style.visibility = 'hidden';
            this._container.appendChild(img);
        });
    }
    
    display(){
        if(this._progress){
            this._progress.set(0);
        }
        const outImg = this._selectedImg;
        this._selectedImg = this._imgs[this._selected];
        this._selectedImg.style.visibility = 'visible';
        this.transition(this._selectedImg, outImg, 'flip').then(()=>{
            outImg.style.visibility = 'hidden';
        }).catch((ex)=>{
            throw ex;
        });
    }

}
customElements.define('image-gallery', ImageGallery);