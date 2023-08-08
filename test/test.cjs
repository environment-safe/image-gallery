const should = require('chai').should();
const { GalleryImage, ImageGallery } = require('../dist/index.cjs');

describe('module', ()=>{
    describe('performs a simple test suite', ()=>{
        it('loads', async ()=>{
            should.exist(GalleryImage);
            should.exist(ImageGallery);
        });
    });
});
