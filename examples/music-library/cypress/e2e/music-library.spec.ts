import {ArtistApi, Configuration} from "../openapi-gen";

context('Music Library API requests', () => {

    const config = new Configuration({
        basePath: 'http://127.0.0.1:4010'
    });
    
    let artistsApi: ArtistApi;
    
    beforeEach(() => {
       artistsApi = new ArtistApi(config); 
    });
    
    it('should GET all artists', () => {
        artistsApi.getArtists().then(response => {
            expect(response).not.to.be.undefined;
            expect(response).to.be.an('array');
        });
    });
});
