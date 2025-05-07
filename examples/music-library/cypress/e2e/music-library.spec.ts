import {ArtistApi, Configuration, CreateArtistRequest, SongInput} from "../openapi-gen";
import { faker } from '@faker-js/faker';

context('Music Library API requests', () => {

    let artistsApi: ArtistApi;
    
    beforeEach(() => {
       artistsApi = new ArtistApi(new Configuration({basePath: 'http://127.0.0.1:4010'})); 
    });
    
    context('API health check', () => {

        it('should HEAD health', () => {
            artistsApi.healthCheck();
        });

        it('should HEAD health raw', () => {
            artistsApi.healthCheckRaw().then((apiResponse) => {
                expect(apiResponse.raw.status).to.eq(200);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
            });
        });
    });
    
    context('Get all artists', () => {
        
        it('should GET all artists', () => {
            artistsApi.getArtists().then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.an('array');
            });
        });
    
        it('should GET all artists raw', () => {
            artistsApi.getArtistsRaw().then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(200);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.an('array');
                })
            });
        });
        
    });

    context('Create a new artist', () => {
        
        const artistInput: CreateArtistRequest = {
            artistInput: {
                name: `${faker.person.fullName()}`,
                genre: `${faker.music.genre()}`,
                profilePicture: `${Buffer.from(faker.image.avatar()).toString('base64')}`,
            }       
        };
        it('should POST new artist', () => {
            artistsApi.createArtist(artistInput).then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.an('object');
                expect(response.id).to.be.a('number');
            });
        });
        
        it('should POST new artist raw', () => {
            artistsApi.createArtistRaw(artistInput).then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(201);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.an('object');
                    expect(response.id).to.be.a('number');
                });
            });
        });
    });

    context('Delete an artist by ID', () => {
        
        it('should DELETE artist', () => {
            artistsApi.deleteArtist({ artistId: faker.number.int() });
        });
    
        it('should DELETE artist raw', () => {
            artistsApi.deleteArtistRaw({ artistId: faker.number.int() }).then((apiResponse) => {
                expect(apiResponse.raw.status).to.eq(204);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
            });
        });
        
    });
    
    context('Add a song to an artist', () => {
        
        const songInput: SongInput = {
            title: `${faker.music.songName()}`,
            duration: 3.33
        };
        
        it('should POST song', () => {
            artistsApi.createSongForArtist({ artistId: faker.number.int(), songInput: songInput }).then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.an('object');
                expect(response.id).to.be.a('number');
            })
        });

        it('should POST song raw', () => {
            artistsApi.createSongForArtistRaw({ artistId: faker.number.int(), songInput: songInput }).then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(201);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.an('object');
                    expect(response.id).to.be.a('number');
                });
            });
        });
    });
    
    context('Get all songs by an artist', () => {

        it('should GET songs of artist', () => {
            artistsApi.getSongsOfArtist({ artistId: faker.number.int() }).then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.an('array');
            });
        });

        it('should GET songs of artist raw', () => {
            artistsApi.getSongsOfArtistRaw({ artistId: faker.number.int() }).then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(200);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.an('array');
                });
            });
        });
    });

    context('Get the name of the current API release', () => {

        it('should GET release name', () => {
            artistsApi.getReleaseName().then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.an('string');
            });
        });

        it('should GET release name raw', () => {
            artistsApi.getReleaseNameRaw().then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(200);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.a('string');
                })
            });
        });

    });

    context('Get profile picture of artist', () => {

        it('should GET profile picture', () => {
            artistsApi.getProfilePictureOfArtist({ artistId: faker.number.int() }).then(response => {
                expect(response).not.to.be.undefined;
                expect(response).to.be.a('string');
            });
        });

        it('should GET profile picture raw', () => {
            artistsApi.getProfilePictureOfArtistRaw({ artistId: faker.number.int() }).then(apiResponse => {
                expect(apiResponse.raw.status).to.eq(200);
                expect(apiResponse.raw.isOkStatusCode).to.eq(true);
                expect(apiResponse.raw.headers['content-type']).to.equal('image/png');
                apiResponse.value().then(response => {
                    expect(response).not.to.be.undefined;
                    expect(response).to.be.a('string');
                });
            });
        });
    });
});
