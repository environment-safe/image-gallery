import { HTMLElement, customElements } from '@environment-safe/elements';

export class GalleryImage extends HTMLElement {
    constructor() {
        super();
        this._data = [];
        this.attachShadow({ mode: 'open' });
        const link = document.getElementById('image-gallery.css');
        const CSSLink = link?link.getAttribute('href'):'/image-gallery.css';
        this._link = document.createElement('link');
        this._link.setAttribute('rel', 'stylesheet');
        this._link.setAttribute('href', CSSLink);
        //load the CSS into the shadow DOM
        this.shadowRoot.appendChild(this._link);
        this._container = document.createElement('div');
        this.shadowRoot.appendChild(this._container);
        
    }
    
    connectedCallback(){
        this.render();
        this.display();
    }
    
    next(){
    }
    
    previous(){
    }
    
    setImages(imageList){
        this._images = imageList;
    }
    
    static get observedAttributes() { return [ 'source']; }
    
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
            this.render();
            this.display();
        }
    }
    
    render(){
        
    }
    
    display(){
        
    }

}
customElements.define('gallery-image', GalleryImage);