import React, { useCallback } from 'react';
const injectFbSDKScript = () => {
    (function (d, s, id) {
        var js,
            fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
};
function statusChangeCallback(response) {
    // Called with the results from FB.getLoginStatus().
    console.log('statusChangeCallback');
    console.log(response); // The current login status of the person.
    if (response.status === 'connected') {
        console.log('loged in');
        // Logged into your webpage and Facebook.
        testAPI();
    } else {
        console.log('not loged in');
        // Not logged into your webpage or we are unable to tell.
    }
}
function testAPI() {
    // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    window.FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);
    });
}
export const useInitFbSDK = () => {
    const [isInitialized, setIsInitialized] = React.useState(false);
    // Initializes the SDK once the script has been loaded
    // https://developers.facebook.com/docs/javascript/quickstart/#loading
    window.fbAsyncInit = function () {
        console.log('before init');
        window.FB.init({
            appId: '24044447041837444',
            cookie: true, // Enable cookies to allow the server to access the session.
            xfbml: true, // Parse social plugins on this webpage.
            version: 'v18.0', // Use this Graph API version for this call.
        });
        console.log('after init');
        window.FB.AppEvents.logPageView();
        window.FB.getLoginStatus(function (response) {
            // Called after the JS SDK has been initialized.
            statusChangeCallback(response); // Returns the login status.
        });
        setIsInitialized(true);
    };

    injectFbSDKScript();

    return isInitialized;
};
