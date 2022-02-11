define(['@brightsign/bsnconnector'], function(bsnConnector) {
    function test1() {
        const { bsnGetSession } = bsnConnector;

        const session = bsnGetSession();

        session.activate('sselihov@brightsign.biz', 'GDdf#$104_54T', 'test_network_1', 'https://api.bsn.cloud')
            .then((cc) => {
                //  session.fetchOAuthToken().then((token:) => console.log('token', token));
                return session.getPresentationList();
            })
            .then((presentationList) => {
                console.log(presentationList);
            })
            .catch((e) => {
                console.log('err', e);
            });
    }

    return {
        test1
    }
});
