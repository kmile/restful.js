import { expect } from 'chai';
import fetchBackend from '../../../src/http/fetch';
import sinon from 'sinon';

describe('Fetch HTTP Backend', () => {
    let httpBackend;
    let fetch;
    let response;

    beforeEach(() => {
        response = {
            headers: {
                forEach: (cb) => {
                    cb('here', 'test');
                },
            },
            json: () => Promise.resolve({ content: 'Yes' }),
            status: 200,
        };
        fetch = sinon.stub().returns(Promise.resolve(response));
        httpBackend = fetchBackend(fetch);
    });

    it('should map config to be compatible with fetch package', () => {
        httpBackend({
            data: {
                me: 'you',
            },
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            params: {
                asc: 1,
            },
            url: '/url',
        });

        expect(fetch.getCall(0).args).to.deep.equal([
            '/url',
            {
                body: '{"me":"you"}',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                params: {
                    asc: 1,
                },
            },
        ]);

        httpBackend({
            data: {
                me: 'you',
            },
            headers: {},
            params: {
                asc: 1,
            },
            url: '/url',
        });

        expect(fetch.getCall(1).args).to.deep.equal([
            '/url',
            {
                body: {
                    me: 'you',
                },
                headers: {},
                params: {
                    asc: 1,
                },
            },
        ]);
    });

    it('should correctly format the response when it succeed', (done) => {
        httpBackend({
            data: {
                me: 'you',
            },
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            params: {
                asc: 1,
            },
            url: '/url',
        })
        .then((response) => { // eslint-disable-line no-shadow
            expect(response).to.deep.equal({
                data: {
                    content: 'Yes',
                },
                headers: {
                    test: 'here',
                },
                statusCode: 200,
            });

            done();
        })
        .catch(done);
    });

    it('should correctly format the error when it fails', (done) => {
        response.status = 404;
        response.statusText = 'Not Found';

        httpBackend({
            data: {
                me: 'you',
            },
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            params: {
                asc: 1,
            },
            url: '/url',
        })
        .then(done.bind(done, ['It should throw an error']), (error) => {
            expect(error.message).to.equal('Not Found');
            expect(error.response).to.deep.equal({
                data: {
                    content: 'Yes',
                },
                headers: {
                    test: 'here',
                },
                statusCode: 404,
            });

            done();
        })
        .catch(done);
    });
});